/**
 * scm/field/fields/advanced/enum.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [enum]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { FieldString } from "../primitive/string";
import { FieldDecorator } from "../fieldbase";

/**
 * @name FieldEnum
 * @description * [advenced] enum 타입의 필드에 대한 유효성 검사 및 검증 내용
 */
@FieldDecorator("enum")
export class FieldEnum extends FieldString {
    constructor() {
        super();
    }
}
