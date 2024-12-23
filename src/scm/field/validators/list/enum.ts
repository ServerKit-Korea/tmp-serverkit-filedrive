/**
 * scm/validators/list/enum.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [enum] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { ValidatorDecorator } from "../validateBase";
import { StringValidator } from "./primitive/boolean";

/**
 * @description * enum 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("enum")
export class EnumValidator extends StringValidator {
    validate(data: any, restrictions: Record<string, any>): boolean {
        if (typeof data != "string") {
            return false;
        }

        if (restrictions["in"]) {
            const _in: string[] = restrictions["in"];
            if (!_in.includes(data)) {
                return false;
            }
        }
        if (restrictions["nin"]) {
            const _nin: string[] = restrictions["nin"];
            if (_nin.includes(data)) {
                return false;
            }
        }
        return true;
    }
}
