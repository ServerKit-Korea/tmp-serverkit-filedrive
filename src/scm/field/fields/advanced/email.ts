/**
 * scm/field/fields/advanced/email.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [email]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { FieldString } from "../primitive/string";
import { FieldDecorator } from "../fieldbase";

/**
 * @name FieldEmail
 * @description * [advenced] email 타입의 필드에 대한 유효성 검사 및 검증 내용
 */
@FieldDecorator("email")
export class FieldEmail extends FieldString {
    constructor() {
        super();
    }
}
