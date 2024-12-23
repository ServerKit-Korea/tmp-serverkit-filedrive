/**
 * scm/field/primitive/number.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [number]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractField, FieldDecorator } from "../fieldbase";

/**
 * @name FieldNumber
 * @description * [primitive] number 타입의 필드에 대한 유효성 검사 및 검증 내용.
 */
@FieldDecorator("number")
export class FieldNumber extends AbstractField {
    constructor() {
        super();
        this._inputType = "Int";
    }
}
