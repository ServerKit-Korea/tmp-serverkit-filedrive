/**
 * filedrive/drive.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * 외부에서 파일 관련 작업을 처리할 수 있는 Drive 클래스를 정의합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { PrismaClient } from "@prisma/client";
import { CronJob } from "cron";
import { RequestHandler } from "express";
import fs from "fs";
import multer, { StorageEngine } from "multer";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { getFileExtractData } from "./utility";
import { IRequestGetFileMetadata, IResponseGetFileMetadata, IResponseFileUpload, IRequestDeleteFile } from "./interface/handler";

import "./extractor";
import { IFileMetadata } from "./interface/model";

const BASE_FOLDER: string = "FILE_ROOT"; // 파일 업로드를 위한 폴더명
const CRON_DELETE_LIST_PATH: string = path.resolve(os.tmpdir(), "serverkit_filedrive_deleted_files_by_cron.log"); // 매 00시에 삭제될 파일 path를 저장한 파일 위치.
const CRON_DELETE_FAILED_PATH: string = path.resolve(os.tmpdir(), "serverkit_filedrive_deleted_files_by_cron_failed.log"); // 매 00시 실패한 작업에 대해 저장된 파일 위치.

// Prisma Middleware의 파라미터 타입 정의
type MiddlewareParams = {
    model?: string;
    action: string;
    args: any;
    dataPath: string[];
    runInTransaction: boolean;
};

/**
 * ##  Drive ᵗˢ
 *
 * 파일 드라이브의 모든 기능을 사용할 수 있는 클래스로 모든 파일 관련 작업을 원하면 이 클래스를 객체로 만들어 작업하세요.
 * @param {PrismaClient} prisma - prisma Client
 * @example
 * ```
 * const filedrive = new FileDrive(prisma, { rootPath: "..." })
 * ```
 */
export class Drive {
    private readonly prisma: PrismaClient;
    private _rootPath: string;
    private _multerHandler: RequestHandler;
    private cron: CronJob;

    constructor(
        prisma: PrismaClient,
        configs: {
            rootPath: string;
        }
    ) {
        this.prisma = prisma;
        this._rootPath = configs.rootPath;
        this._multerHandler = multer({
            storage: this.createMulterStorage(path.resolve(this._rootPath, BASE_FOLDER)),
            fileFilter: (req, file, callback) => {
                callback(null, true);
            }
        }).single("file"); // "file"은 필드명

        // 실제 File 삭제를 위한 prisma 미들웨어 추가
        prisma.$use(this.getFiledriveDeleteMiddleware());

        // 매일 0시 Deleted 파일 목록에 대한 실제 파일 삭제 처리.
        this.cron = new CronJob("0 * * * *", () => {
            console.log(`[File Auto Cleaner] Scheduled task executed at ${new Date().toISOString()}`);
            this.cronAutoFileDelete();
        });
    }

    get rootPath() {
        return this._rootPath;
    }

    get multerHandler() {
        return this._multerHandler;
    }

    get uploadHandler() {
        return this._uploadHandler();
    }

    /**
     * ### getPrismaSettingTable
     * * prisma 세팅에 필요한 FileDrive의 File 모델 테이블 정의를 반환한다.
     */
    static getPrismaSettingTable(): Record<string, any> {
        return {
            tableName: "File",
            fields: [
                {
                    name: "fileId",
                    description: "파일 고유 아이디",
                    type: "string",
                    attribute: {
                        canBeNull: false,
                        isArray: false
                    },
                    configs: {
                        isUnique: true
                    }
                },
                {
                    name: "size",
                    description: "파일 크기",
                    type: "number",
                    attribute: {
                        canBeNull: false,
                        isArray: false
                    }
                },
                {
                    name: "filename",
                    description: "원본 파일 이름",
                    type: "string",
                    attribute: {
                        canBeNull: false,
                        isArray: false
                    }
                },
                {
                    name: "mimetype",
                    description: "MIME 타입",
                    type: "string",
                    attribute: {
                        canBeNull: false,
                        isArray: false
                    }
                },
                {
                    name: "path",
                    description: "파일 실제 경로",
                    type: "string",
                    attribute: {
                        canBeNull: false,
                        isArray: false
                    }
                },
                {
                    name: "isMapped",
                    description: "데이터와 매핑 여부",
                    type: "boolean",
                    attribute: {
                        canBeNull: false,
                        isArray: false
                    }
                },
                {
                    name: "mappedTo",
                    description: "매핑된 데이터의 고유 ID",
                    type: "string",
                    attribute: {
                        canBeNull: true,
                        isArray: false
                    }
                },
                {
                    name: "createdAt",
                    description: "생성 날짜",
                    type: "string",
                    attribute: {
                        canBeNull: false,
                        isArray: false
                    }
                },
                {
                    name: "extends",
                    description: "File 확장 데이터 (JSON 형식)",
                    type: "string",
                    attribute: {
                        canBeNull: true,
                        isArray: false
                    }
                }
            ]
        };
    }

    /**
     * ### createFileMetadata
     * Document 생성과 File 매핑 로직
     * @param documentData - 문서 데이터 (title, content)
     * @param {string} fileId - 매핑할 파일 ID
     * @returns 생성된 Document 객체
     */
    async mappingFileMetadata(fileId: string, documentId: string): Promise<void> {
        return this.prisma.$transaction(async (tx: any) => {
            // 매핑하려는 파일 확인
            const file = await tx.file.findUnique({
                where: { id: fileId }
            });

            // 파일이 없거나 매핑된 경우라면 없앤다.
            if (!file) {
                throw new Error(`File with ID ${fileId} not found`);
            }
            if (file.isMapped) {
                return;
            }

            // File 업데이트 (isMapped: true)
            await tx.file.update({
                where: { id: fileId },
                data: {
                    isMapped: true,
                    mappedTo: documentId // mappedTo에 문서 ID 설정
                }
            });
        });
    }

    /**
     * ### getFile
     * fileID를 만족하는 단 하나의 파일을 리턴하는 함수.
     */
    async getFile(fileId: string): Promise<IFileMetadata | null> {
        const files = await this.prisma.file.findMany({
            where: {
                fileId: fileId
            }
        });
        if (files.length <= 0) {
            return null;
        }
        return files[0];
    }

    /**
     * ### getFiles
     * 조건에 따라 파일 검색 및 페이징 처리.
     * 단, isMapped가 false인 파일에 한정한다. 그 외 데이터는 각 Document에 귀속되어 있으므로 해당 Document의 검색과 동기화 된다.
     */
    async getFiles(query: IRequestGetFileMetadata): Promise<IResponseGetFileMetadata> {
        const { startDate, endDate, sortBy = "createdAt", order = "asc", page = 1, limit = 10 } = query;

        // 동적 필터링 조건 생성
        const where: any = {
            isMapped: true
        };

        if (startDate && !isNaN(Date.parse(startDate))) {
            where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
        }
        if (endDate && !isNaN(Date.parse(endDate))) {
            where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
        }

        // 전체 데이터 개수 및 데이터 검색, 페이징 처리
        const totalCount = await this.prisma.file.count({ where });
        const files = await this.prisma.file.findMany({
            where,
            orderBy: { [sortBy]: order },
            skip: (page - 1) * limit,
            take: limit
        });

        return { totalCount, data: files };
    }

    /**
     * ### deleteFiles
     * 조건에 따라 파일 삭제.
     * 단, isMapped가 false인 파일에 한정한다. 그 외 데이터는 각 Document에 귀속되어 있으므로 해당 Document의 생명주기와 동기화 된다.
     */
    async deleteFiles(query: IRequestDeleteFile): Promise<IResponseGetFileMetadata> {
        try {
            const filesToDelete = await this.prisma.file.findMany({
                where: {
                    isMapped: false
                },
                select: {
                    id: true,
                    path: true
                }
            });

            if (query.fileIdList.length == 0) {
                return { totalCount: 0, data: [] };
            }

            // 삭제 실행
            const deletedIds: any[] = filesToDelete.map((file: IFileMetadata) => file.id);
            await this.prisma.file.deleteMany({
                where: {
                    id: { in: deletedIds }
                }
            });

            // 삭제 대상의 파일 추가 작업
            const deletedPathList = filesToDelete.map((file: IFileMetadata) => file.path);
            for (const p of deletedPathList) {
                await fs.promises.appendFile(CRON_DELETE_LIST_PATH, p + "\n", "utf-8");
            }
            return { totalCount: deletedIds.length, data: filesToDelete };
        } catch (error) {
            throw error;
        }
    }

    /**
     * ### getFiledriveDeleteMiddleware
     * FileDrive의 Prisma 미들웨어 반환 함수. deleteMany 액션과 File 모델이 감지된 경우 실제 파일을 제거하기 위한 path를 추출하는 과정.
     * path는 CRON_DELETE_FILE_LIST_PATH이 가리키는 파일에 저장되며 매일 00시에 일괄 정리된다.
     */
    private getFiledriveDeleteMiddleware() {
        return async (params: MiddlewareParams, next: (params: MiddlewareParams) => Promise<any>) => {
            if (params.model == "File") {
                return next(params); // 다음 단계 진행
            }
            if (params.action === "delete" || params.action === "deleteMany") {
                const model: string = params.model ?? "";
                if (model == "") {
                    return next(params); // 다음 단계 진행
                }
                if (params.args.where) {
                    try {
                        // 삭제 조건에 해당하는 Data를 조회 (연동된 File의 path만 가져오기)
                        const relatedData = await this.prisma.data.findMany({
                            where: params.args.where,
                            select: { file: { select: { path: true } } } // File의 path만 가져옴
                        });

                        // 실제 파일 일괄 삭제를 위한 삭제 대상 path 기록
                        const deletePathList: string[] = relatedData
                            .filter((data: any) => data.file !== null) // File이 있는 경우만 필터링
                            .map((data: any) => data.file!.path);

                        if (deletePathList.length > 0) {
                            for (const p of deletePathList) {
                                await fs.promises.appendFile(CRON_DELETE_LIST_PATH, p + "\n", "utf-8");
                            }
                        }
                    } catch (error) {
                        console.error("Error while fetching files for deleteMany:", error);
                    }
                }
            }
            return next(params); // 다음 단계 진행
        };
    }

    /**
     * ### createMulterStorage
     * Multer Storage 설정
     * @param {string} basePath - 업로드될 파일의 기본 경로
     * @returns Multer의 StorageEngine
     */
    private createMulterStorage(basePath: string): StorageEngine {
        return {
            _handleFile: (req, file, callback) => {
                try {
                    const fullPath = path.resolve(basePath);
                    if (!fs.existsSync(fullPath)) {
                        fs.mkdirSync(fullPath, { recursive: true });
                    }

                    const filePath = path.join(fullPath, `${Date.now()}-${file.originalname}`);
                    const outStream = fs.createWriteStream(filePath);

                    outStream.on("error", callback);
                    outStream.on("finish", () => {
                        callback(null, {
                            path: filePath,
                            size: outStream.bytesWritten
                        });
                    });
                    file.stream.pipe(outStream);
                } catch (err) {
                    callback(err);
                }
            },
            _removeFile: (req, file, callback) => {
                fs.unlink(file.path, callback);
            }
        };
    }

    /**
     * ### uploadFile
     * 파일 업로드 처리를 하는 multer Handler를 반환한다.
     * 이 Handler에서 response는 IResponseFileUpload 형태를 반환한다.
     */
    private _uploadHandler(): RequestHandler<{}, IResponseFileUpload> {
        return (req, res) => {
            this.multerHandler(req, res, async (err: any) => {
                if (err) {
                    res.status(500).json({ isSucceed: false, error: err });
                    return;
                }
                const file = req.file;
                if (!file) {
                    res.status(400).json({ isSucceed: false, error: new Error("No file uploaded") });
                    return;
                }
                try {
                    // MIME 타입 검증 및 세부 데이터 추출
                    const fileExtendsData: string | null = await getFileExtractData(file.mimetype, file.path);

                    // 파일 메타데이터 저장
                    const savedFile = await this.prisma.file.create({
                        data: {
                            fileId: uuidv4(),
                            filename: file.originalname,
                            size: file.size,
                            mimetype: file.mimetype,
                            createdAt: new Date().toISOString(),
                            path: file.path,
                            isMapped: false,
                            extends: fileExtendsData
                        }
                    });
                    res.status(201).json({ isSucceed: true, file: savedFile });
                } catch (e: any) {
                    // 파일 메타데이터 저장 실패 시 파일 삭제
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                    res.status(500).json({ isSucceed: false, error: e });
                }
            });
        };
    }

    /**
     * TODO: 테스트가 끝나면 private로 변경한다.
     * ### cronAutoFileDelete
     * 삭제 예정인 파일을 실제로 삭제한다.
     */
    public async cronAutoFileDelete() {
        if (!fs.existsSync(CRON_DELETE_LIST_PATH)) {
            return;
        }
        const fileContent: string = fs.readFileSync(CRON_DELETE_LIST_PATH, "utf-8").trim();
        const filePaths: string[] = fileContent.split("\n");
        for (const targetPath of filePaths) {
            try {
                // 파일 존재 여부 확인 후 삭제
                if (fs.existsSync(targetPath)) {
                    await fs.promises.unlink(targetPath);
                }
            } catch (error) {
                console.error(`[ERROR] Failed to delete: ${targetPath}`, error);
                await fs.promises.appendFile(CRON_DELETE_FAILED_PATH, targetPath);
            }
        }
        await fs.promises.writeFile(CRON_DELETE_LIST_PATH, "", "utf-8");
        console.log(`[INFO] File deletion completed at ${new Date().toISOString()}`);
    }
}
