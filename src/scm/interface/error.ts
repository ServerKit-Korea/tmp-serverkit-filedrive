/**
 * scm/interface/error.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * SCM에서 사용되는 공통 인터페이스 데이터가 정의된 파일입니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { BaseError } from "../../common/error";

export const SERVICE_NAME: string = "scm";

/**
 * @description * .scm에서 사용 가능한 모든 에러 코드 타입
 */
export type SCMErrorCode =
    | "load_failed" // .scm 파일 로드에 실패
    | "dec_init_load_duplicate_Key" // decorator 초기화에서 키가 중복됨을 확인
    | "name_cant_use" // 특정 이름을 사용할 수 없음
    | "regex_failed" // 정규식이 올바르지 않음
    | "version_not_supported" // 파일 버전 값이 올바르지 않음
    | "ide_not_supported" // IDE 버전 값이 올바르지 않음
    | "length_zero" // 값이 0개
    | "file_ext_unvalidated" // 확장자가 유효하지 않음
    | "file_already" // 파일이 이미 존재
    | "file_notFound" // 파일이 존재하지 않음
    | "field_name_not_supported" // 지원하지 않는 필드 이름
    | "field_validation_failed" // 유효하지 않는 필드
    | "field_type_not_supported" // 지원하지 않는 필드 타입
    | "field_restrictions_not_supported" // 지원하지 않는 필드의 제약사항 값
    | "data_validation_fail" // 데이터 Validation에 실패
    | "data_parted_validation_fail" // 데이터(일부) Validation에 실패
    | "file_not_ready_validation_fail" // 아직 파일 Validation 처리를 할 준비가 안 된 경우 (getFileMetadataFromPrisma를 호출 안 했을 때)
    | "file_not_extends_key_validation_fail" // 데이터 Validation에 실패 - File 타입 하위의 Validation 중에 파일 extends가 없는 경우
    | "dec_init_load_no_validator_method" // decorator를 통한 최초 validator 등록 시 validator 메서드를 최소 1개 이상 등록하지 않음
    | "dec_init_load_double_validator_method" // decorator를 통한 최초 validator 등록 시 validator 메서드를 양쪽을 모두 구현한 경우
    | "prisma_not_init"; // prisma init가 되지 않아 file을 찾을 수 없음.

/**
 * ## SCMError ᵗˢ
 *
 * SCM의 전용 에러 클래스.
 * @param {SCMErrorCode} code - 에러 코드
 * @param {string} message - 메서드
 * @param {string[]?} fields - 문제가 생긴 필드를 표현
 * @example
 * ```
 * const error = new SCMError("length_zero", "필드가 0개입니다.")
 * ```
 */
export class SCMError extends BaseError {
    fields?: string[];

    constructor(code: SCMErrorCode, message: string, fields?: string[]) {
        super(SERVICE_NAME, code, message);
        this.fields = fields;
    }

    get info() {
        return {
            service: this.service,
            message: this.message,
            code: this.code,
            timestamp: this.timestamp,
            fields: this.fields
        };
    }
}
