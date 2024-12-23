/**
 * scm/field/fields/advanced/string.yaml.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [yaml]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { FieldString } from "../primitive/string";
import { FieldDecorator } from "../fieldbase";

/**
 * @name FieldYAML
 * @description * [advenced] yaml 타입의 필드에 대한 유효성 검사 및 검증 내용
 */
@FieldDecorator("yaml")
export class FieldYAML extends FieldString {
    constructor() {
        super();
    }
}
