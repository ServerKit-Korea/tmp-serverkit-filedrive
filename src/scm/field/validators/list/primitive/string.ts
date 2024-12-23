/**
 * scm/validators/list/string.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [string] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractBaseValidator, ValidatorDecorator } from "../../validateBase";

/**
 * @description * string 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("string")
export class StringValidator extends AbstractBaseValidator {
    validate(data: any, restrictions: Record<string, any>): boolean {
        if (typeof data != "string") {
            return false;
        }

        // check restriction
        if (restrictions["gte"]) {
            const gte: number = restrictions["gte"];
            if (gte > data.length) return false;
        }
        if (restrictions["lte"]) {
            const lte: number = restrictions["lte"];
            if (lte < data.length) return false;
        }
        if (restrictions["like"]) {
            const like: string = restrictions["like"];
            if (!like.includes(data)) return false;
        }
        if (restrictions["regex"]) {
            const regex: string = restrictions["regex"];
            const r: RegExp = new RegExp(regex);
            if (!r.test(data)) {
                return false;
            }
        }
        return true;
    }
}
