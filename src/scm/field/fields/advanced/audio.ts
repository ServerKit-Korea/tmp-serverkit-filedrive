/**
 * scm/field/fields/advanced/file.audio.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * Field Type : [file/audio]에 대한 유효성 검증 및 Operator 객체 parsing을 제공합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { FieldFile } from "../primitive/file";
import { FieldDecorator } from "../fieldbase";

/**
 * @name FieldFileAudio
 * @description * [advenced] File/audio 타입의 필드에 대한 유효성 검사 및 검증 내용
 */
@FieldDecorator("audio")
export class FieldFileAudio extends FieldFile {
    constructor() {
        super();
    }
}
