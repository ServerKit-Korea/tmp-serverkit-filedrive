/**
 * scm/field/fields/advanced/integer.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [integer]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { FieldNumber } from "../primitive/number";
import { FieldDecorator } from "../fieldbase";

/**
 * @name FieldInteger
 * @description * [advenced] integer 타입의 필드에 대한 유효성 검사 및 검증 내용
 */
@FieldDecorator("integer")
export class FieldInteger extends FieldNumber {
    constructor() {
        super();
    }
}
