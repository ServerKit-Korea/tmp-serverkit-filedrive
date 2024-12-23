/**
 * scm/validators/list/id.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [id] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractBaseValidator, ValidatorDecorator } from "../../validateBase";

/**
 * @description * id 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("id")
export class IdValidator extends AbstractBaseValidator {
    validate(data: any, restrictions: Record<string, any>): boolean {
        if (typeof data != "string") {
            return false;
        }

        // check restriction

        return true;
    }
}
