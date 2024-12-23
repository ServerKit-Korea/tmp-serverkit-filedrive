/**
 * scm/field/primitive/date.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [date]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractField, FieldDecorator } from "../fieldbase";

/**
 * @name FieldDate
 * @description * [primitive] date 타입의 필드에 대한 유효성 검사 및 검증 내용.
 */
@FieldDecorator("date")
export class FieldDate extends AbstractField {
    constructor() {
        super();
        this._inputType = "DateTime";
    }
}
