/**
 * scm/field/fields/advanced/file.ms.excel.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [file/ms/excel]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { FieldFile } from "../primitive/file";
import { FieldDecorator } from "../fieldbase";

/**
 * @name FieldFileMSExcel
 * @description * [advenced] file/ms/excel 타입의 필드에 대한 유효성 검사 및 검증 내용
 */
@FieldDecorator("ms.excel")
export class FieldFileMSExcel extends FieldFile {
    constructor() {
        super();
    }
}
