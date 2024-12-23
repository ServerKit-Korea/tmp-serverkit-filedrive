/**
 * scm/validators/list/email.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [email] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { ValidatorDecorator } from "../validateBase";
import { StringValidator } from "./primitive/boolean";

/**
 * @description * email 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("email")
export class EmailValidator extends StringValidator {
    validate(data: any, restrictions: Record<string, any>): boolean {
        const parentResult: boolean = super.validate(data, restrictions);
        if (!parentResult) {
            return parentResult;
        }

        if (typeof data != "string") {
            return false;
        }

        // check restriction
        const regex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(data)) {
            return false;
        }

        const domain = data.split("@")[1]; // 이메일 도메인 추출
        if (!domain) {
            return false;
        }

        if (restrictions["indom"]) {
            const isAllowed = restrictions["indom"].some((allowedDomain: string) => domain == allowedDomain);
            if (!isAllowed) {
                return false;
            }
        }
        if (restrictions["nindom"]) {
            const isNotAllowed = restrictions["indom"].some((notAllowedDomain: string) => domain === notAllowedDomain);
            if (isNotAllowed) {
                return false;
            }
        }
        return true;
    }
}
