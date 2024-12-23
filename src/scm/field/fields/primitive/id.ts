/**
 * scm/field/primitive/id.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [id]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractField, FieldDecorator } from "../fieldbase";

/**
 * @name FieldId
 * @description * [primitive] id 타입의 필드에 대한 유효성 검사 및 검증 내용.
 */
@FieldDecorator("id")
export class FieldId extends AbstractField {
    constructor() {
        super();
        this._inputType = "String";
    }
}
