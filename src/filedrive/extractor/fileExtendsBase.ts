/**
 * filedrive/extractor/extendsBase.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * 특정 파일을 로드하고 extends 데이터를 리턴하는 클래스를 정의하기 위한 기초 클래스 및
 * 이를 등록하고 관리하는 Reflect 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */
import "reflect-metadata";
import { BaseError } from "../../common/error";

/**
 * 파일의 extends 데이터의 리턴 처리를 위한 기본 클래스.
 */
type FileExtractor = {
    extract: (filePath: string) => Promise<string | null>;
};

/**
 * ### BaseExtractor
 * @abstract
 * 파일의 extends 데이터의 리턴 처리를 위한 기본 클래스.
 */
export abstract class BaseExtractor implements FileExtractor {
    /**
     * @description 데이터베이스에 저장할 데이터 메서드.
     * @param {string} filePath - 파일 경로.
     */
    abstract extract(filePath: string): Promise<string | null>;
}

/**
 * ### FileExtractorRegistry
 * File Extractor들의 등록자를 담당하는 클래스.
 */
export class FileExtractorRegistry {
    private static fileExtractors: Record<string, new () => BaseExtractor> = {};

    /**
     * #### register
     * 제약사항 키와 해당 Extractor 클래스를 레지스트리에 등록합니다.
     * @param {string} key - 제약사항 키.
     * @param {new () => BaseExtractor} EXTRACTOR - 등록할 Extractor 클래스.
     * @throws {BaseError} 중복된 키가 존재할 경우 예외 발생.
     */
    public static register(key: string, EXTRACTOR: new () => BaseExtractor): void {
        if (this.fileExtractors[key]) {
            throw new BaseError("dec_init_load_duplicate_Key", `File Extends 초기화에서 중복된 키를 감지했습니다 (key : ${key})`);
        }
        this.fileExtractors[key] = EXTRACTOR;
    }

    /**
     * #### getExtractor
     * 키에 해당하는 extractor를 반환합니다.
     * @param {string} key - 키.
     * @returns {new () => BaseExtractor | null} - BaseExtractor 클래스.
     */
    public static getExtractor(key: string): new () => BaseExtractor | null {
        return this.fileExtractors[key] || null;
    }
}

/**
 * ### FileExtractorDecorator
 * File의 Extractor 클래스를 자동 등록하는 데코레이터.
 * @param {string} key - 제약사항 키값.
 * @example
 * ```
 * @FileExtractorDecorator("image")
 * export class ExtendsDecorator {}
 * ```
 */
export function FileExtractorDecorator(key: string) {
    return function <T extends { new (...args: any[]): any }>(extendsClass: T) {
        Reflect.defineMetadata(key, true, extendsClass);
        FileExtractorRegistry.register(key, extendsClass);
        return extendsClass;
    };
}
