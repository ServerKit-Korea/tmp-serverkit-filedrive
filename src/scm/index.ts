/**
 * scm/index.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * 이곳에 export 된 function, interface 등이 사용 가능한 private npm 모듈로서 공개됩니다.
 *
 * -----------------------------------------------------------------------------------------------
 */
import { BaseError } from "../common/error";
import { FieldRegistry } from "./field/fields/fieldbase";
import { dataFullValidation, dataPartedValidation, parsedVqmParamData } from "./utility";

// DecoratorLoader Load
import "./field/fields";
import "./field/validators";

// interface Export
export * from "./interface/error";
export * from "./interface/model";

/**
 * ## insertDataValidation
 * VQM 모듈에서 사용하는 Insert 대상의 데이터 Validation 메서드.
 * DB작업 전에 호출해야 하며 Validation이 실패하면 SCMError 객체가 반환된다.
 * @param {any} data - 검증할 데이터 객체.
 * @param {string} dbmId - dbm 애셋 아이디.
 * @throw SCMError
 */
export async function insertDataValidation(data: any, dbmId: string, jsonData: Record<string, any>): Promise<void> {
    const json: any = jsonData;

    const findDbm = json["dbm"].find((v: any) => v.id == dbmId);
    if (findDbm == undefined) {
        throw new BaseError("schema", "not_found_dbmId", "dbmId로 dummy_compile_assets.json에서 데이터를 뽑아낼 수 없습니다.");
    }
    const findScm = json["scm"].find((v: any) => v.id == findDbm.scmId);
    if (findScm == undefined) {
        throw new BaseError("schema", "not_found_scmId", "scmId로 scm 데이터를 찾을 수 없습니다.");
    }

    const checkParsedData: any = parsedVqmParamData(data, findScm.fields);
    await dataFullValidation(checkParsedData, findScm.fields);
}

/**
 * ## updateDataValidation
 * VQM 모듈에서 사용하는 Update 대상의 데이터 Validation 메서드.
 * DB작업 전에 호출해야 하며 Validation이 실패하면 SCMError 객체가 반환된다.
 * @param {any} data - 검증할 데이터 객체.
 * @param {string} dbmId - dbm 애셋 아이디.
 * @throw SCMError
 */
export async function updateDataValidation(data: any, dbmId: string, jsonData: Record<string, any>): Promise<void> {
    const json: any = jsonData;

    const findDbm = json["dbm"].find((v: any) => v.id == dbmId);
    if (findDbm == undefined) {
        throw new BaseError("schema", "not_found_dbmId", "dbmId로 dummy_compile_assets.json에서 데이터를 뽑아낼 수 없습니다.");
    }
    const findScm = json["scm"].find((v: any) => v.id == findDbm.scmId);
    if (findScm == undefined) {
        throw new BaseError("schema", "not_found_scmId", "scmId로 scm 데이터를 찾을 수 없습니다.");
    }

    const checkParsedData: any = parsedVqmParamData(data, findScm.fields);
    await dataPartedValidation(checkParsedData, findScm.fields);
}

/**
 * ## getFieldTypeToInputType
 * 필드 타입을 바탕으로 데이터베이스의 Input Type을 반환한다.
 * @param {string} fieldType - 데이터베이스 Input Type을 반환시킬 타입
 */
export function getFieldTypeToInputType(fieldType: string): string {
    const FieldClass = FieldRegistry.getFieldClass(fieldType);
    if (FieldClass != null) {
        const field = new FieldClass();
        return field.inputType;
    }
    return fieldType;
}
