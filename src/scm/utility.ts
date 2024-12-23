/**
 * scm/utility.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * 공통으로 활용 가능한 메서드가 포함되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { ValidatorRegistry } from "./field/validators/validateBase";
import { SCMError } from "./interface/error";
import { IField } from "./interface/model";

/**
 * @function dataFullValidation
 * @description * 전체 데이터 기준으로 유효성을 검사한다.
 * @param {any} data - 검증할 데이터 객체
 * @param {Field[]} fields - 해당하는 필드 목록
 */
export async function dataFullValidation(data: any, fields: IField[], pName: string = ""): Promise<void> {
    const failFieldList: string[] = [];
    for (const field of fields) {
        const displayFieldName: string = pName ? `${pName}.${field.name}` : field.name;
        const value: any = data[field.name];

        if (field.attribute.canBeNull) {
            if (value == null) {
                continue;
            }
        } else {
            if (value == null) {
                failFieldList.push(displayFieldName);
                continue;
            }
        }

        // #1. data == array
        if (field.attribute.isArray) {
            if (!Array.isArray(value)) {
                failFieldList.push(displayFieldName);
                continue;
            }
            for (const v of value) {
                if (field.type == "object") {
                    try {
                        dataFullValidation(v, field.next ?? [], displayFieldName); // recursive
                    } catch (e) {
                        if (e instanceof SCMError) {
                            failFieldList.push(...(e.fields ?? []));
                        }
                        break;
                    }
                } else {
                    const r: boolean = await dataClassValidation(v, field.type, field.restrictions);
                    if (!r) {
                        failFieldList.push(displayFieldName);
                        break;
                    }
                }
            }
        }
        // #2. data != array
        else {
            if (field.type == "object") {
                try {
                    dataFullValidation(value, field.next ?? [], displayFieldName); // recursive
                } catch (e) {
                    if (e instanceof SCMError) {
                        failFieldList.push(...(e.fields ?? []));
                    }
                }
            } else {
                const r: boolean = await dataClassValidation(value, field.type, field.restrictions);
                if (!r) {
                    failFieldList.push(displayFieldName);
                }
            }
        }
    }

    if (failFieldList.length > 0) {
        throw new SCMError("data_validation_fail", "필드 Full Validation에 실패", failFieldList);
    }
}

/**
 * @function dataPartedValidation
 * @description * 일부 데이터 기준으로 유효성을 검사한다.
 * @param {any} data - 검증할 데이터 객체
 * @param {Field[]} fields - 해당하는 필드 목록
 */
export async function dataPartedValidation(data: any, fields: IField[], pName: string = ""): Promise<void> {
    const failFieldList: string[] = [];
    for (const field of fields) {
        const displayFieldName: string = pName ? `${pName}.${field.name}` : field.name;
        const value: any = data[field.name];

        if (value == undefined) {
            continue;
        }

        if (!field.attribute.canBeNull) {
            if (value == null) {
                failFieldList.push(displayFieldName);
                continue;
            }
        }

        // #1. data == array
        if (field.attribute.isArray) {
            if (!Array.isArray(value)) {
                failFieldList.push(displayFieldName);
                continue;
            }
            for (const v of value) {
                if (field.type == "object") {
                    try {
                        dataFullValidation(v, field.next ?? [], displayFieldName); // recursive (Full을 쓰는 이유는 하위 relation 데이터 구조는 모든 데이터가 올바른 조건을 가져야 하기 때문이다.)
                    } catch (e) {
                        if (e instanceof SCMError) {
                            failFieldList.push(...(e.fields ?? []));
                        }
                        break;
                    }
                } else {
                    const r: boolean = await dataClassValidation(v, field.type, field.restrictions);
                    if (!r) {
                        failFieldList.push(displayFieldName);
                        break;
                    }
                }
            }
        }
        // #2. data != array
        else {
            if (field.type == "object") {
                try {
                    dataFullValidation(value, field.next ?? [], displayFieldName); // recursive
                } catch (e) {
                    if (e instanceof SCMError) {
                        failFieldList.push(...(e.fields ?? []));
                    }
                }
            } else {
                const r: boolean = await dataClassValidation(value, field.type, field.restrictions);
                if (!r) {
                    failFieldList.push(displayFieldName);
                }
            }
        }
    }

    if (failFieldList.length > 0) {
        throw new SCMError("data_validation_fail", "필드 Parted Validation에 실패", failFieldList);
    }
}

/**
 * @function parsedVqmParamData
 * @description * VQM 모듈에서 제공하는 파라미터에 대한 파싱 처리.
 *              * IField와 연동해 Validation이 가능하도록 처리한다.
 * @param {any} data - 파싱할 데이터 객체
 * @param {IField[]} fields - 해당하는 필드 목록
 */
export function parsedVqmParamData(data: any, fields: IField[]): any {
    const parsedVqmParam: any = {};

    // vqm에서 설정한 객체 기준으로 돌면서 내부적으로 data validation 처리가 가능한 형식으로 변경한다.
    for (const key of Object.keys(data)) {
        const value: any = data[key];
        if (value == undefined) {
            parsedVqmParam[key] = null;
            continue;
        }

        const field: IField | undefined = fields.find((f) => f.name == key);
        if (!field) {
            parsedVqmParam[key] = value;
            continue;
        }

        if (field.type == "object") {
            const checkMemberData: string = value["create"] || value["update"];
            if (field.attribute.isArray) {
                const members: any[] = [];
                for (const member of checkMemberData) {
                    const v = parsedVqmParamData(member, field.next ?? []);
                    members.push(v);
                }
                parsedVqmParam[key] = members;
            } else {
                const v = parsedVqmParamData(checkMemberData, field.next ?? []);
                parsedVqmParam[key] = v;
            }
        } else {
            if (field.attribute.isArray) {
                parsedVqmParam[key] = value["create"] || value["update"];
            } else {
                parsedVqmParam[key] = value;
            }
        }
    }

    return parsedVqmParam;
}

/**
 * @function dataClassValidation
 * @description * 실제 데이터베이스에 반영할 데이터의 유효성을 검사한다.
 *              * 이 내용은 각 타입에 따른 ValidatorClass를 사용해 처리한다.
 * @param {any} data - 검사할 데이터.
 * @param {string} type - 필드의 타입.
 */
async function dataClassValidation(data: any, type: string, restrictions: Record<string, any> = {}): Promise<boolean> {
    const ValidatorClass = ValidatorRegistry.getValidator(type);
    if (ValidatorClass == null) {
        return false;
    }
    const validator = new ValidatorClass();
    if (validator) {
        // 1. 동기 Validator
        if (validator.validate) {
            return validator.validate(data, restrictions);
        }

        // 2. 비동기 Validator
        if (validator.validateFile) {
            return await validator.validateFile(data, restrictions);
        }
    }
    return false;
}
