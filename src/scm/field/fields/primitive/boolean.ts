/**
 * scm/field/primitive/boolean.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [boolean]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractField, FieldDecorator } from "../fieldbase";

/**
 * @name FieldBoolean
 * @description * [primitive] boolean 타입의 필드에 대한 유효성 검사 및 검증 내용.
 */
@FieldDecorator("boolean")
export class FieldBoolean extends AbstractField {
    constructor() {
        super();
        this._inputType = "Boolean";
    }
}
