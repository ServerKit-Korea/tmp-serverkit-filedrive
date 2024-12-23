/**
 * scm/validators/list/file.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [file] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractBaseValidator, ValidatorDecorator } from "../../validateBase";
import { SCMError } from "../../../../interface/error";
import { IFileMetadata } from "../../../../../filedrive/interface/model";

/**
 * @description * file 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("file")
export class FileValidator extends AbstractBaseValidator {
    private prisma: any; // Lazy initialization을 위한 변수

    // validateFile에서 super.validateFile()를 호출하면 적용되는 멤버변수.
    protected fileMetadata: IFileMetadata | null;

    constructor() {
        super();
        this.fileMetadata = null;
    }

    // 파일을 통한 메타데이터를 가져와야 하므로 validateFile을 사용한다.
    async validateFile(data: any, restrictions: Record<string, any>): Promise<boolean> {
        // 기존 fileMetadata 초기화
        this.fileMetadata = null;

        if (typeof data !== "string") return false;

        // DB에서 파일 메타데이터 조회
        this.fileMetadata = await this.getFileMetadataFromPrisma(data);
        if (!this.fileMetadata) {
            return false;
        }

        if (restrictions["gte"]) {
            const gte: number = restrictions["gte"];
            if (this.fileMetadata.size < gte) return false;
        }
        if (restrictions["lte"]) {
            const lte: number = restrictions["lte"];
            if (this.fileMetadata.size > lte) return false;
        }
        if (restrictions["in"]) {
            const _in: string[] = restrictions["in"];
            if (!_in.includes(this.fileMetadata.mimetype)) {
                return false;
            }
        }
        if (restrictions["nin"]) {
            const _nin: string[] = restrictions["nin"];
            if (_nin.includes(this.fileMetadata.mimetype)) {
                return false;
            }
        }
        return true;
    }

    /**
     * @function getFileMetadataFromDB
     * @description * fileId를 통한 파일 기본 메타데이터를 가져온다.
     * @param {string} fileId - 파일 키
     */
    protected async getFileMetadataFromPrisma(fileId: string): Promise<IFileMetadata | null> {
        try {
            // Lazy initialization
            if (!this.prisma) {
                // 일반 테스트 코드 실행(jest)일 경우에만 .ts로 로드한다.
                const isTestCodeRun: boolean = process.env.TS_JEST ? true : false;
                const prismaUrl: string = process.env.JEST_TEST_GENERATE ?? "";
                if (isTestCodeRun && prismaUrl) {
                    const { PrismaClient } = await import(`${prismaUrl}`);

                    this.prisma = new PrismaClient();
                } else {
                    const { PrismaClient } = await import("@prisma/client");
                    this.prisma = new PrismaClient();
                }
            }

            if (!this.prisma.file) {
                throw new SCMError("prisma_not_init", "Prisma Client is not properly initialized. Ensure 'prisma generate' has been executed.");
            }

            const file = await this.prisma.file.findUnique({
                where: { fileId },
                include: {
                    extends: true // 관계 데이터를 포함
                }
            });

            // Key-Value 데이터를 객체로 변환
            if (file && file.extends) {
                const metadata = file.extends.reduce(
                    (acc: any, entry: any) => {
                        try {
                            // Array 파싱
                            const parsedValue = JSON.parse(entry.value);
                            acc[entry.key] = Array.isArray(parsedValue) ? parsedValue : parsedValue;
                        } catch {
                            // JSON 파싱 실패 시 기본 처리 (문자열 또는 숫자 변환)
                            acc[entry.key] = isNaN(Number(entry.value)) ? entry.value : Number(entry.value);
                        }
                        return acc;
                    },
                    {} as Record<string, string | number | any[]>
                );
                file.extends = metadata;
            }
            return file;
        } catch (e) {
            if (e instanceof Error) {
                throw new SCMError("file_notFound", e.message);
            } else {
                throw e;
            }
        }
    }

    /**
     * @function validateExtendsKey
     * @description * extends 된 File 하위 타입에 대한 extends 키 검사 보조 메서드.
     * @param {string} restrictionKey - 제약사항 및 extends 키
     * @param {Record<string, any>} restrictions - 제약사항 객체
     * @param {{(metadataValue: any, restrictionValue: any): boolean}} comparator - 유효성 검사 메서드 조건
     * @param {Record<string, string>} keyMapping - 매핑 키
     * @throw SCMError
     */
    protected validateExtendsKey(
        restrictionKey: string,
        restrictions: Record<string, any>,
        comparator: (metadataValue: any, restrictionValue: any) => boolean,
        keyMapping: Record<string, string>
    ): boolean {
        if (!this.fileMetadata) {
            throw new SCMError("file_not_ready_validation_fail", `로직을 점검하세요. getFileMetadataFromPrisma가 먼저 호출되어야 합니다.`);
        }

        const mappedKey = keyMapping[restrictionKey]; // extends에서 사용할 키 가져오기
        const restrictionValue = restrictions[restrictionKey]; // 제약사항 데이터 가져오기
        if (this.fileMetadata.extends != null) {
            const metadataValue = JSON.parse(this.fileMetadata.extends); // string된 extends 데이터를 객체로 변환.
            const value = metadataValue[mappedKey];
            return comparator(value, restrictionValue);
        }
        return true;
    }
}
