/**
 * scm/validators/list/date.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [date] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractBaseValidator, ValidatorDecorator } from "../../validateBase";

/**
 * @description * date 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("date")
export class DateValidator extends AbstractBaseValidator {
    validate(data: any, restrictions: Record<string, any>): boolean {
        if (typeof data != "string") {
            return false;
        }

        // check restriction
        const dateDate: Date = new Date(data);
        if (restrictions["gte"]) {
            const gte: string = restrictions["gte"];
            const gteDate: Date = new Date(gte);
            if (gteDate.getTime() > dateDate.getTime()) return false;
        }
        if (restrictions["lte"]) {
            const lte: string = restrictions["lte"];
            const lteDate: Date = new Date(lte);
            if (lteDate.getTime() < dateDate.getTime()) return false;
        }
        return true;
    }
}
