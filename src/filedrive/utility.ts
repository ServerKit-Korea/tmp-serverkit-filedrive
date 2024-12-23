/**
 * filedrive/utility.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * FileDrive 클래스에서 사용 가능한 메서드들이 포함되어 있습니다.
 * Decorator Class를 타입에 따라 호출 하도록 Strange Pattern으로 구현.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { FileExtractorRegistry } from "./extractor/fileExtendsBase";
import { BaseError } from "../common/error";

/**
 * @function getFileExtractData
 * @param {string} mimetype - 파일 타입
 * @param {string} filePath - 파일 경로
 */
export async function getFileExtractData(mimetype: string, filePath: string): Promise<string | null> {
    const extractorKey: string = mimetype.split("/")[0]; // '/' 앞의 첫 번째 값 추출
    const ExtractorClass = FileExtractorRegistry.getExtractor(extractorKey);
    if (ExtractorClass == null) {
        throw new BaseError("Extractor class not found", `File Extractor 클래스를 찾을 수 없습니다. (extractorKey : ${extractorKey})`);
    }
    const extractor = new ExtractorClass();
    if (extractor) {
        return extractor.extract(filePath);
    } else {
        return null;
    }
}
