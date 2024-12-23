/**
 * scm/field/validators/validateBase.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * 제약사항을 토대로 validation을 처리하는 기본 클래스 및 등록 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */
import { SCMError } from "../../interface/error";

const REFLECT_KEY: string = "FIELD_VALIDATOR";
type ValidatorType = {
    validate?: (data: any, restrictions: Record<string, any>) => boolean;
    validateFile?: (data: any, restrictions: Record<string, any>) => Promise<boolean>;
};

/**
 * @description 데이터의 유효성 검사 클래스를 구현하기 위한 기본 클래스.
 */
export abstract class AbstractBaseValidator implements ValidatorType {
    /**
     * @description 데이터베이스에 저장할 데이터 메서드.
     * @param data - 검사 대상 값.
     * @param restrictions - 사용자가 입력한 모든 데이터 제약사항.
     */
    validate?(data: any, restrictions: Record<string, any>): boolean;

    /**
     * @description 데이터를 비동기적으로 검증 (file 타입 전용).
     * @param data - 검사 대상 값.
     * @param restrictions - 사용자가 입력한 모든 데이터 제약사항.
     */
    async validateFile?(data: any, restrictions: Record<string, any>): Promise<boolean>;
}

/**
 * @description Data Validator들의 등록자.
 */
export class ValidatorRegistry {
    private static validators: Record<string, new () => AbstractBaseValidator> = {};

    /**
     * @function register
     * @description Rescriction 클래스를 레지스트리에 등록.
     * @param {string} key - 제약사항 키.
     * @param {any} validatorClass - Validator 클래스.
     */
    public static register(key: string, VALIDATOR: new () => AbstractBaseValidator): void {
        if (this.validators[key]) {
            throw new SCMError("dec_init_load_duplicate_Key", `Restriction 초기화에서 중복된 키를 감지했습니다 (key : ${key})`);
        }

        // 최소 하나의 메서드 구현 확인
        const v = new VALIDATOR();
        if (!v.validate && !v.validateFile) {
            throw new SCMError(
                "dec_init_load_no_validator_method",
                `Validator 클래스는 validate 또는 validateFile 메서드 중 하나를 구현해야 합니다. (key : ${key})`
            );
        } else if (v.validate && v.validateFile) {
            throw new SCMError(
                "dec_init_load_double_validator_method",
                `Validator 클래스는 validate 또는 validateFile 메서드 중 하나만을 구현해야 합니다. (key : ${key})`
            );
        }

        this.validators[key] = VALIDATOR;
    }

    /**
     * @function getValidator
     * @description 제약사항 키에 해당하는 Validator를 반환.
     * @param {string} key - 제약사항 키.
     * @returns {any | null} - Validator 클래스.
     */
    public static getValidator(key: string): new () => AbstractBaseValidator | null {
        return this.validators[key] || null;
    }
}

/**
 * @decorator
 * @function ValidatorDecorator
 * @description * Validator 클래스를 자동 등록하는 데코레이터.
 *              * 특정 키 값을 사용할 경우 자동으로 해당 {키 값:클래스}로 등록된다.
 * @param {string} key - 제약사항 키값.
 * @example
 *      @Validator("gte")
 *      export class GteValidator {}
 */
export function ValidatorDecorator(key: string) {
    return function <T extends { new (...args: any[]): any }>(validatorClass: T) {
        // Reflect.defineMetadata(REFLECT_KEY, key, validatorClass);
        ValidatorRegistry.register(key, validatorClass);
        return validatorClass;
    };
}
