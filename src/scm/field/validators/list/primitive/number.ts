/**
 * scm/validators/list/number.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [number] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractBaseValidator, ValidatorDecorator } from "../../validateBase";

/**
 * @description * number 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("number")
export class NumberValidator extends AbstractBaseValidator {
    validate(data: any, restrictions: Record<string, any>): boolean {
        if (typeof data != "number") {
            return false;
        }

        // check restriction
        if (restrictions["gte"]) {
            const gte: number = restrictions["gte"];
            if (gte > data) return false;
        }
        if (restrictions["lte"]) {
            const lte: number = restrictions["lte"];
            if (lte < data) return false;
        }
        return true;
    }
}
