/**
 * scm/validators/list/primitive/boolean.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [boolean] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractBaseValidator, ValidatorDecorator } from "../../validateBase";

/**
 * @description * boolean 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("boolean")
export class StringValidator extends AbstractBaseValidator {
    validate(data: any, restrictions: Record<string, any>): boolean {
        if (typeof data != "boolean") {
            return false;
        }

        return true;
    }
}
