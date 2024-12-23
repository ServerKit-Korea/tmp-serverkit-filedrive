/**
 * scm/validators/list/ms.powerpoint.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [ms.powerpoint] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 * File 하위 메서드로써 유효성 검사 로직은 validateFile을 구현하시기 바랍니다.
 *  - (tmi.) 기본 File 유효성 검사일 경우 mimetype을 통한 파일 구분 로직만 작성해주세요.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { ValidatorDecorator } from "../validateBase";
import { FileValidator } from "./primitive/file";

/**
 * @description * ms.powerpoint 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("ms.powerpoint")
export class MsPowerpointValidator extends FileValidator {
    async validateFile(data: any, restrictions: Record<string, any>): Promise<boolean> {
        const isValid = await super.validateFile(data, restrictions);
        if (!isValid || !this.fileMetadata) {
            return false;
        }

        const powerpointMimeTypes = [
            "application/vnd.ms-powerpoint", // Legacy PowerPoint (.ppt)
            "application/vnd.openxmlformats-officedocument.presentationml.presentation" // Modern PowerPoint (.pptx)
        ];

        // 기초 파일 형태 검사.
        if (!powerpointMimeTypes.includes(this.fileMetadata.mimetype)) {
            return false;
        }

        return true;
    }
}
