/**
 * filedrive/extractor/list/ms.powerpoint.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [ms.powerpoint] 키에 대한 추가적인 메타데이터 추출 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */
import { BaseExtractor, FileExtractorDecorator } from "../fileExtendsBase";

/**
 * @description * ms.powerpoint 파일에 대한 추가 메타데이터 추출 클래스.
 */
@FileExtractorDecorator("ms.powerpoint")
export class PowerpointExtractor extends BaseExtractor {
    async extract(filePath: string): Promise<string | null> {
        return null;
    }
}
