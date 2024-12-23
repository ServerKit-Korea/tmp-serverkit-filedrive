/**
 * scm/field/fields/advanced/file.ms.word.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [file/ms/word]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { FieldFile } from "../primitive/file";
import { FieldDecorator } from "../fieldbase";

/**
 * @name FieldFileMSWord
 * @description * [advenced] file/ms/word 타입의 필드에 대한 유효성 검사 및 검증 내용
 */
@FieldDecorator("ms.word")
export class FieldFileMSWord extends FieldFile {
    constructor() {
        super();
    }
}
