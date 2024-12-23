/**
 * scm/validators/list/integer.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [integer] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { ValidatorDecorator } from "../validateBase";
import { NumberValidator } from "./primitive/number";

/**
 * @description * integer 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("integer")
export class IntegerValidator extends NumberValidator {
    validate(data: any, restrictions: Record<string, any>): boolean {
        if (typeof data != "number") {
            return false;
        }

        // check restriction
        return true;
    }
}
