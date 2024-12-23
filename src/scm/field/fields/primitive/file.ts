/**
 * scm/field/primitive/file.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [file]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { AbstractField, FieldDecorator } from "../fieldbase";

/**
 * @name FieldFile
 * @description * [primitive] file 타입의 필드에 대한 유효성 검사 및 검증 내용.
 */
@FieldDecorator("file")
export class FieldFile extends AbstractField {
    constructor() {
        super();
        this._inputType = "File";
    }
}
