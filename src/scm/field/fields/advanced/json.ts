/**
 * scm/field/fields/advanced/string.json.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [json]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { FieldString } from "../primitive/string";
import { FieldDecorator } from "../fieldbase";

/**
 * @name FieldJSON
 * @description * [advenced] json 타입의 필드에 대한 유효성 검사 및 검증 내용
 */
@FieldDecorator("json")
export class FieldJSON extends FieldString {
    constructor() {
        super();
    }
}
