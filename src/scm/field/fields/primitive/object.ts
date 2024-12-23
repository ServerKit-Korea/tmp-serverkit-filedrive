/**
 * scm/field/primitive/object.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [object]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractField, FieldDecorator } from "../fieldbase";

/**
 * @name FieldObject
 * @description * [primitive] object 타입의 필드에 대한 유효성 검사 및 검증 내용.
 */
@FieldDecorator("object")
export class FieldObject extends AbstractField {
    constructor() {
        super();
    }
}
