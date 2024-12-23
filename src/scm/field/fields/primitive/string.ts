/**
 * scm/field/primitive/string.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [string]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractField, FieldDecorator } from "../fieldbase";

/**
 * @name FieldString
 * @description * [primitive] string 타입의 필드에 대한 유효성 검사 및 검증 내용.
 */
@FieldDecorator("string")
export class FieldString extends AbstractField {
    constructor() {
        super();
        this._inputType = "String";
    }
}
