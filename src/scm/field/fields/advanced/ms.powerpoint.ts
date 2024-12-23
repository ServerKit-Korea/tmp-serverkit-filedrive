/**
 * scm/field/fields/advanced/file.ms.powerpoint.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [file/ms/powerpoint]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { FieldFile } from "../primitive/file";
import { FieldDecorator } from "../fieldbase";

/**
 * @name FieldFileMSPowerpoint
 * @description * [advenced] file/ms/powerpoint 타입의 필드에 대한 유효성 검사 및 검증 내용
 */
@FieldDecorator("ms.powerpoint")
export class FieldFileMSPowerpoint extends FieldFile {
    constructor() {
        super();
    }
}
