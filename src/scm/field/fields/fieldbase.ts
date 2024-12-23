/**
 * scm/field/fields/index.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * 필드에 대한 공통으로 활용 가능한 메서드가 포함되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { SCMError } from "../../interface/error";

const REFLECT_KEY: string = "FIELD_CLASS";

/**
 * @interface AbstractField
 * @description * 필드 정의 및 validation에 대한 추상화 클래스.
 *              * 모든 타입의 필터는 해당 구조를 extends 하고 클래스를 구현한다.
 */
export abstract class AbstractField {
    protected _inputType: string;
    // protected _isFile: boolean;
    constructor() {
        this._inputType = "";
        //this._isFile = false;
    }

    get inputType() {
        return this._inputType;
    }

    // get isFile() {
    //     return this._isFile;
    // }
}

/**
 * @description * 모든 필드 클래스를 자동으로 저장하기 위한 static 클래스
 *              * 이 클래스 자동 저장은 FieldDecorator가 적용된 모든 클래스에 한정한다.
 */
export class FieldRegistry {
    private static fields: Record<string, typeof AbstractField> = {};

    /**
     * @function registerField
     * @description 구체적인 필드 클래스를 레지스트리에 등록.
     * @param {string} fieldname - 필드 타입 이름.
     * @param {typeof AbstractField} fieldClass - 필드 클래스.
     */
    public static registerField(fieldname: string, fieldClass: typeof AbstractField): void {
        if (this.fields[fieldname]) {
            throw new SCMError("dec_init_load_duplicate_Key", `Field 초기화에서 중복된 키를 감지했습니다 (Fieldname : ${fieldname})`, [fieldname]);
        }
        this.fields[fieldname] = fieldClass;
    }

    /**
     * @function getFieldClass
     * @description 필드 타입에 해당하는 클래스를 반환.
     * @param {string} fieldname - 필드 타입 이름.
     * @returns {AbstractField | null} - 필드에 해당하는 클래스.
     */
    public static getFieldClass(fieldname: string): any {
        return this.fields[fieldname] || null;
    }
}

/**
 * @decorator
 * @function FieldDecorator
 * @description FieldRegistry에 필드 클래스를 자동으로 등록하기 위해 사용될 데코레이터.
 * @param {string} fieldname - 필드 타입 이름.
 */
export function FieldDecorator(fieldname: string) {
    return function <T extends typeof AbstractField>(fieldClass: T) {
        // Reflect.defineMetadata(REFLECT_KEY, fieldname, fieldClass);
        FieldRegistry.registerField(fieldname, fieldClass);
        return fieldClass;
    };
}
