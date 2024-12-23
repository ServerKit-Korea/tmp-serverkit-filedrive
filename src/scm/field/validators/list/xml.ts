/**
 * scm/validators/list/xml.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [xml] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { ValidatorDecorator } from "../validateBase";
import { StringValidator } from "./primitive/boolean";

/**
 * @description * xml 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("xml")
export class XmlValidator extends StringValidator {
    validate(data: any, restrictions: Record<string, any>): boolean {
        if (typeof data != "string") {
            return false;
        }

        // check restriction
        try {
            const parser = new DOMParser();
            const parsed = parser.parseFromString(data, "application/xml");
            return parsed.getElementsByTagName("parsererror").length === 0;
        } catch (e) {
            return false;
        }
    }
}
