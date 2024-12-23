/**
 * scm/validators/list/json.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [json] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { ValidatorDecorator } from "../validateBase";
import { StringValidator } from "./primitive/boolean";

/**
 * @description * json 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("json")
export class JsonValidator extends StringValidator {
    validate(data: any, restrictions: Record<string, any>): boolean {
        if (typeof data != "string") {
            return false;
        }

        // check restriction
        try {
            JSON.parse(data);
            return true;
        } catch (e) {
            return false;
        }
    }
}
