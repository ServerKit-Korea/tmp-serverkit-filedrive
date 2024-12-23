/**
 * ----------------------------------------------------------------------------
 * tests/filedrive.test.ts
 *
 * filedrive와 관련된 테스트 파일입니다.
 * ----------------------------------------------------------------------------
 */
import axios from "axios";
import { execSync } from "child_process";
import express, { Application } from "express";
import fs from "fs";
import FormData from "form-data";
import http from "http";
import path from "path";

import { CNet_DBSet } from "../src/prisma/dbSetting";
import { BaseError } from "../src/common/error";
import { Drive } from "../src/filedrive/drive";
import { getPrismaSettingTableWithFiledrive, isDirectoryNotEmpty } from "./utility";
import { IResponseFileUpload, IResponseGetFileMetadata } from "../src/filedrive/interface/handler";

// Logger: Info
function log(message: string) {
    console.log(`\x1b[34m ℹ️ ${message}\x1b[0m`);
}
// Logger: Success
function logSuccess(message: string) {
    console.log(`\x1b[32m✔️ [SUCCESS] ${message}\x1b[0m`);
}
// Logger: Error
function logError(message: string) {
    console.log(`\x1b[31m❌ [ERROR] ${message}\x1b[0m`);
}


interface ITest_Model {
    name: string;
    file: any;
}

describe("FileDrive 테스트", () => {
    const tmpPrismaPath = path.join(__dirname, "filedriveTemp").replaceAll("\\", "/");
    let prisma: any;
    let filedrive: Drive = {} as Drive;

    let app: Application;
    let server: http.Server;
    const baseURL: string = `http://localhost:3333`;

    beforeAll(async () => {
        // 임시 디렉토리 생성
        if (!fs.existsSync(tmpPrismaPath)) {
            fs.mkdirSync(tmpPrismaPath);
        }

        // 테스트마다 새로운 Express 앱 초기화
        app = express();
        app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 처리
        app.use(express.json());
        app.use((err: any, req: any, res: any, next: any) => {
            console.error("Global Error Handler:", err);
            res.status(500).json({
                error: err.message || "Internal Server Error",
                details: err.details || "No additional details",
                stack: err.stack || "No stack trace available"
            });
        });

        server = app.listen(3333, () => {
            log(`Test server running at ${baseURL}`);
        });

        const connectionData: any = {
            provider: 0,
            connectionData: {
                fileName: "dev.db"
            }
        };
        const generatedPath: string = path.resolve(tmpPrismaPath, "generated").replaceAll("\\", "/");
        const schemaPath: string = path.resolve(tmpPrismaPath, "schema.prisma").replaceAll("\\", "/");

        // 환경 변수 설정
        process.env.JEST_TEST_GENERATE = `${generatedPath}`;

        // prisma 초기화 및 데이터 생성 (로컬 테스트용)
        if (isDirectoryNotEmpty(generatedPath)) {

            // (추가) 파일과 같이 테스트 가능한 데이터 셋을 생성한다.
            const dbSet: CNet_DBSet = new CNet_DBSet(connectionData, [getPrismaSettingTableWithFiledrive()]);
            const prismaData: string = dbSet.PrismaSetting(generatedPath);
            await fs.promises.writeFile(schemaPath, prismaData);

            fs.mkdirSync(generatedPath);
            try {
                execSync(`npx prisma generate --schema="${schemaPath}"`, { stdio: "inherit" });
                log("Prisma Client generated successfully.");
                execSync(`npx prisma db push --schema="${schemaPath}"`, { stdio: "inherit" });
                log("Database schema pushed successfully.");
            } catch (error) {
                logError(`Prisma command failed: ${JSON.stringify(error, null, 2)} `);
                throw error;
            }

            if (!fs.existsSync(path.join(generatedPath, "index.js"))) {
                logError(`Prisma Client not found at: ${generatedPath}`);
                throw new Error("Prisma Client not generated.");
            }
        }

        // 데이터 세팅. 만약 데이터를 변경해야 한다면 tests/schema/prisma 폴더를 제거하고 테스트 코드를 다시 실행한다.
        const { PrismaClient: GeneratedPrismaClient } = require(`${generatedPath}`);
        prisma = new GeneratedPrismaClient();

        const fileFolderPath: string = path.resolve(tmpPrismaPath, "blob");
        if (!fs.existsSync(fileFolderPath)) {
            fs.mkdirSync(fileFolderPath);
        }

        // 파일 드라이브 객체 초기화. 내부에서 $prisma에 대한 미들웨어가 자동 추가됨.
        filedrive = new Drive(prisma, { rootPath: fileFolderPath });

        // express 메서드 추가
        app.get("/file", async (req: express.Request, res: express.Response) => {
            try {
                const files: IResponseGetFileMetadata = await filedrive.getFiles({});
                res.json(files);
            } catch (error) {
                res.status(500).json(error);
            }
        });
        app.post("/file/upload", filedrive.uploadHandler);
    });

    afterAll(async () => {
        // Prisma 연결 종료
        if (prisma) {
            await prisma.$disconnect();
            prisma = null;
        }

        // 테스트마다 서버 종료
        if (server) {
            server.close();
        }
    });

    it("[Filedrive P0-1] 파일 업로드, 메타데이터 가져오기 테스트", async () => {
        try {
            // 준비된 파일을 읽고 이를 임시로 만든 서버에 업로드를 시도한다.
            // const filePath = path.resolve(__dirname, "data", "sample.txt"); // 일반 파일
            // const filePath = path.resolve(__dirname, "data", "sample.jpg"); // 이미지
            const filePath = path.resolve(__dirname, "data", "sample.mp4"); // 동영상
            // const filePath = path.resolve(__dirname, "data", "sample.mp3"); // 오디오

            const form: FormData = new FormData();
            form.append("file", fs.createReadStream(filePath), path.basename(filePath));

            // 업로드 테스트 요청
            const response = await axios.post(`${baseURL}/file/upload`, form, {
                headers: form.getHeaders() // FormData에서 자동 생성된 헤더 사용
            });

            const uploadResult: IResponseFileUpload = response.data;
            if (!uploadResult.isSucceed) {
                throw new BaseError("test", "test_failed", "업로드에 실패했습니다.");
            } else if (!uploadResult.file) {
                throw new BaseError("test", "test_failed", "업로드에 이후 추가된 파일 메타데이터를 찾을 수 없습니다.");
            }

            const fileData = await axios.get(`${baseURL}/file`);
            logSuccess(`검증에 성공했습니다 : ${JSON.stringify(fileData.data, null, 2)}`);
        } catch (e) {
            if (e instanceof BaseError) {
                logError(`검증에 실패했습니다. Code: ${e.code}, Message : ${e.message}`);
            }
            else {
                logError(`ERROR : ${JSON.stringify(e, null, 2)}`)
            }
            expect(e).toBeUndefined(); // 이 조건은 항상 실패하므로 테스트 실패로 간주
        }
    });

    it("[Filedrive P0-2] 파일 업로드 후 연동된 Document 데이터 추가 테스트", async () => {
        try {
            // 준비된 파일을 읽고 이를 임시로 만든 서버에 업로드를 시도한다.
            // const filePath = path.resolve(__dirname, "data", "sample.txt"); // 일반 파일
            // const filePath = path.resolve(__dirname, "data", "sample.jpg"); // 이미지
            const filePath = path.resolve(__dirname, "data", "sample.mp4"); // 동영상
            // const filePath = path.resolve(__dirname, "data", "sample.mp3"); // 오디오

            const form: FormData = new FormData();
            form.append("file", fs.createReadStream(filePath), path.basename(filePath));

            // 업로드 테스트 요청
            const response = await axios.post(`${baseURL}/file/upload`, form, {
                headers: form.getHeaders() // FormData에서 자동 생성된 헤더 사용
            });

            const uploadResult: IResponseFileUpload = response.data;
            if (!uploadResult.isSucceed) {
                throw new BaseError("test", "test_failed", "업로드에 실패했습니다.");
            } else if (!uploadResult.file) {
                throw new BaseError("test", "test_failed", "업로드에 이후 추가된 파일 메타데이터를 찾을 수 없습니다.");
            }

            const insertData: ITest_Model = {
                name: "test1",
                file: {
                    connect: { id: uploadResult.file.id },
                },
            }
            const savedFile = await prisma.data.create({
                data: insertData
            });

            logSuccess(`추가에 성공했습니다 : ${JSON.stringify(savedFile, null, 2)}`);
        } catch (e) {
            if (e instanceof BaseError) {
                logError(`검증에 실패했습니다. Code: ${e.code}, Message : ${e.message}`);
            }
            else {
                logError(`ERROR : ${JSON.stringify(e, null, 2)}`)
            }
            expect(e).toBeUndefined(); // 이 조건은 항상 실패하므로 테스트 실패로 간주
        }
    });

    it("[Filedrive P0-3] 파일 업로드 후 연동된 Document 데이터 추가 후 삭제 테스트", async () => {
        try {
            // 준비된 파일을 읽고 이를 임시로 만든 서버에 업로드를 시도한다.
            // const filePath = path.resolve(__dirname, "data", "sample.txt"); // 일반 파일
            // const filePath = path.resolve(__dirname, "data", "sample.jpg"); // 이미지
            const filePath = path.resolve(__dirname, "data", "sample.mp4"); // 동영상
            // const filePath = path.resolve(__dirname, "data", "sample.mp3"); // 오디오

            const form: FormData = new FormData();
            form.append("file", fs.createReadStream(filePath), path.basename(filePath));

            // 업로드 테스트 요청
            const response = await axios.post(`${baseURL}/file/upload`, form, {
                headers: form.getHeaders() // FormData에서 자동 생성된 헤더 사용
            });

            const uploadResult: IResponseFileUpload = response.data;
            if (!uploadResult.isSucceed) {
                throw new BaseError("test", "test_failed", "업로드에 실패했습니다.");
            } else if (!uploadResult.file) {
                throw new BaseError("test", "test_failed", "업로드에 이후 추가된 파일 메타데이터를 찾을 수 없습니다.");
            }

            log(`step 1. 파일 업로드에 성공했습니다 : ${JSON.stringify(uploadResult, null, 2)}`);
            const insertData: ITest_Model = {
                name: "test1",
                file: {
                    connect: { id: uploadResult.file.id },
                },
            }
            const savedFile = await prisma.data.create({
                data: insertData
            });
            log(`step 2. 데이터 추가에 성공했습니다 : ${JSON.stringify(savedFile, null, 2)}`);

            const deleteResult = await prisma.data.deleteMany({
                where: {
                    name: "test1"
                }
            });
            log(`step 3. 데이터 삭제에 성공했습니다 : ${JSON.stringify(deleteResult, null, 2)}`);
            logSuccess("전 과정에 성공했습니다.")
        } catch (e) {
            if (e instanceof BaseError) {
                logError(`삭제에 실패했습니다. Code: ${e.code}, Message : ${e.message}`);
            }
            else {
                logError(`ERROR : ${JSON.stringify(e, null, 2)}`)
            }
            expect(e).toBeUndefined(); // 이 조건은 항상 실패하므로 테스트 실패로 간주
        }
    });

    it("[Filedrive P0-4] 특정 Document 단독 삭제 테스트", async () => {
        try {
            const deleteResult = await prisma.data.deleteMany({
                where: {
                    name: "test1"
                }
            });
            log(`데이터 삭제에 성공했습니다 : ${JSON.stringify(deleteResult, null, 2)}`);
        } catch (e) {
            if (e instanceof BaseError) {
                logError(`삭제에 실패했습니다. Code: ${e.code}, Message : ${e.message}`);
            }
            else {
                logError(`ERROR : ${JSON.stringify(e, null, 2)}`)
            }
            expect(e).toBeUndefined(); // 이 조건은 항상 실패하므로 테스트 실패로 간주
        }
    });

    it("[Filedrive P0-5] 기능 테스트. cronAutoFileDelete를 호출해 실제 파일 삭제 테스트", async () => {
        try {
            await filedrive.cronAutoFileDelete();
            log(`실제 파일 삭제에 성공했습니다`);
        } catch (e) {
            if (e instanceof BaseError) {
                logError(`실제 파일 삭제에 실패했습니다. Code: ${e.code}, Message : ${e.message}`);
            }
            else {
                logError(`ERROR : ${JSON.stringify(e, null, 2)}`)
            }
            expect(e).toBeUndefined(); // 이 조건은 항상 실패하므로 테스트 실패로 간주
        }
    });
});
