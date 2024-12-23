/**
 * scm/validators/list/yaml.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [yaml] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */
import yaml from "js-yaml";

import { ValidatorDecorator } from "../validateBase";
import { StringValidator } from "./primitive/boolean";

/**
 * @description * yaml 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("yaml")
export class YamlValidator extends StringValidator {
    validate(data: any, restrictions: Record<string, any>): boolean {
        if (typeof data != "string") {
            return false;
        }

        // check restriction
        try {
            yaml.load(data); // YAML 파싱 시도
            return true;
        } catch (e) {
            return false;
        }
    }
}
