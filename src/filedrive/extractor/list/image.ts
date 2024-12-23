/**
 * filedrive/extractor/list/image.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [image] 키에 대한 추가적인 메타데이터 추출 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */
import sharp from "sharp";
import { BaseExtractor, FileExtractorDecorator } from "../fileExtendsBase";

/**
 * @description * image 파일에 대한 추가 메타데이터 추출 클래스.
 */
@FileExtractorDecorator("image")
export class ImageExtractor extends BaseExtractor {
    async extract(filePath: string): Promise<string | null> {
        try {
            const metadata: sharp.Metadata = await sharp(filePath).metadata();
            return JSON.stringify(metadata);
        } catch (e) {
            return null;
        }
    }
}
