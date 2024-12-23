/**
 * scm/validators/list/image.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [image] 타입에 대한 데이터 유효성 검사 클래스가 저장되어 있습니다.
 * File 하위 메서드로써 유효성 검사 로직은 validateFile을 구현하시기 바랍니다.
 *  - (tmi.) 기본 File 유효성 검사일 경우 mimetype을 통한 파일 구분 로직만 작성해주세요.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { ValidatorDecorator } from "../validateBase";
import { FileValidator } from "./primitive/file";

/**
 * @description * image 필드에 대한 데이터 유효성 검사 및 검증 클래스.
 */
@ValidatorDecorator("image")
export class ImageValidator extends FileValidator {
    async validateFile(data: any, restrictions: Record<string, any>): Promise<boolean> {
        const isValid = await super.validateFile(data, restrictions);
        if (!isValid || !this.fileMetadata) {
            return false;
        }

        // 기초 파일 형태 검사.
        if (!this.fileMetadata.mimetype.startsWith("image/")) {
            return false;
        }

        // image 타입인 파일의 extends에 들어가는 정보는 wPx, hPx, colorProfile
        const keyMapping: Record<string, string> = {
            gte_wPx: "wPx",
            lte_wPx: "wPx",
            gte_hPx: "hPx",
            lte_hPx: "hPx",
            in_colorProfile: "colorProfile",
            nin_colorProfile: "colorProfile"
        };

        // 키 별로 유효성 검사 내용을 지정한다
        const comparators: any = {
            gte_wPx: (meta: number, restr: number) => meta >= restr,
            gte_hPx: (meta: number, restr: number) => meta >= restr,
            lte_wPx: (meta: number, restr: number) => meta <= restr,
            lte_hPx: (meta: number, restr: number) => meta <= restr,
            in_colorProfile: (meta: string, restr: string[]) => restr.includes(meta),
            nin_colorProfile: (meta: string, restr: string[]) => !restr.includes(meta)
        };

        // compareators를 순회하며 restrictions이 설정된 키에 따라 유효성 검사 발동.
        for (const key of Object.keys(comparators)) {
            if (restrictions[key]) {
                const comparator = comparators[key];
                if (!this.validateExtendsKey(key, restrictions, comparator, keyMapping)) {
                    return false;
                }
            }
        }
        return true;
    }
}
