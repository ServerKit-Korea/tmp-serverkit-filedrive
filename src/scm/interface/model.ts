/**
 * scm/interface/model.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * .scm에서 사용되는 구조 정보가 작성된 파일입니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

/**
 * ## IDBField
 * DB에서 사용할 scm의 DB Field 인터페이스.
 */
export interface IDBField {
    name: string; // 컬럼의 이름.
    type: string; // 필드 타입 지정.
    attribute: IAttribute; // 컬럼의 속성 데이터.
    next?: IDBField[]; // 하위 구조.
    configs?: IDbConfig; // .dbm에서 설정한 db 세팅 정보.
}

/**
 * ## IDbConfig
 * .dbm 애셋에서 설정한 필드의 DB 속성 정보를 저장한 인터페이스.
 */
export interface IDbConfig {
    defaultValue?: string; // 디폴트 값.
    isUnique?: boolean; // 유니크 값인지 여부.
}

/**
 * ## IField
 * 하나의 데이터 구조를 구성하는 최소 요소를 표현하는 인터페이스.
 * 필드 내에서는 1개의 속성과 1개의 제약사항 값(키, 메타데이터)이 포함된다.
 */
export interface IField {
    name: string; // 컬럼의 이름.
    description: string; // 컬럼의 설명문.
    type: string; // 필드 타입 지정.
    attribute: IAttribute; // 컬럼의 속성 데이터.
    restrictions: Record<string, any>; // 제약사항 데이터. 특정 타입에 대한 적용 가능한 제약사항은 Field.getRestriction(type)을 사용한다.
    next?: IField[]; // 하위 구조.
    idx: number; // 정렬 순서 (낮을 수록 빠름).
}

/**
 * ## IAttribute
 * 필드의 속성을 정의하는 인터페이스.
 */
export interface IAttribute {
    canBeNull: boolean; // 필드의 데이터에 null 값을 허용할지 여부를 지정.
    isArray: boolean; // 필드의 데이터값이 Array인지 여부를 지정.
}
