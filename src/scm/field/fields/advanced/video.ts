/**
 * scm/field/fields/advanced/file.video.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [file/video]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { FieldFile } from "../primitive/file";
import { FieldDecorator } from "../fieldbase";

/**
 * @name FieldFileVideo
 * @description * [advenced] File/video 타입의 필드에 대한 유효성 검사 및 검증 내용
 */
@FieldDecorator("video")
export class FieldFileVideo extends FieldFile {
    constructor() {
        super();
    }
}
