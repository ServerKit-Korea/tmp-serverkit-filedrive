import { Queue } from "../common/queue"; // 큐 자료구조를 관리하는 라이브러리
import { getFieldTypeToInputType } from "../scm";
import { IDBField } from "../scm/interface/model";
import { IServerField } from "./interface"; // 서버에서 사용하는 필드 인터페이스
import { CNet_DBSet } from "./dbSetting"; // 데이터베이스 설정 및 테이블 관리 클래스
import { Drive } from "../filedrive";

// 테이블 정보를 관리하는 클래스
export class CTableInfo {
    dbSet: CNet_DBSet;
    tableName: string; // 테이블 이름
    fields: IServerField[]; // 테이블 필드 배열
    //interfaceRecord: Record<string, string>;

    private pkstr: string = "id"; // 기본 프라이머리 키 이름
    private fieldQueue: Queue<IServerField>; // 필드 정보를 처리할 큐
    private fileDrive: Record<string, any> | null;

    // CTableInfo 클래스 생성자
    constructor(_dbSet: CNet_DBSet, _tableName: string, _fields: IDBField[]) {
        // 테이블 이름의 첫 글자를 대문자로 변경하여 저장
        this.tableName = this.capitalizeFirstLetter(_tableName);

        // IDBField 배열을 IServerField 배열로 변환하여 저장
        this.fields = _fields.map((field) => field as IServerField);

        // 디비에 대한 기본 정보
        this.dbSet = _dbSet;

        // class 생성 할 때 필요한 Record
        //this.interfaceRecord = {};

        this.fileDrive = null;

        // 필드 큐를 초기화
        this.fieldQueue = new Queue<IServerField>();
    }

    // 테이블 필드 설정을 위한 Prisma 모델 문자열 생성
    FieldSetting(): string {
        // 프라이머리 키를 설정
        this.SetPkIndex();

        // 모든 필드를 큐에 추가
        this.fieldQueue.enqueue(this.fields);

        let str: string = "";

        // 큐에서 필드를 하나씩 꺼내 테이블 컬럼 정의 문자열 생성
        while (!this.fieldQueue.isEmpty()) {
            let field = this.fieldQueue.dequeue();
            if (!field) throw new Error("Field queue is in an invalid state");
            str += this.TableCollum(field);
        }

        return str;
    }

    // 새로 테이블을 생성하고 관계를 추가
    NewTable(_field: IServerField): string {
        if (!_field.next) throw new Error("Next field information is missing");
        let tableInfo: CTableInfo = new CTableInfo(this.dbSet, _field.name, _field.next);
        tableInfo.SetRelationMany(this.tableName, `${this.tableName}_${_field.name}`, _field.attribute.isArray); // 관계 설정
        this.dbSet.SetTable(tableInfo); // 테이블 추가

        // 1:1 관계에서 Null값 체크를 하지 않을 경우 순환 참조에 관한 문제가 생겨서 Model이 생성될 때 오류가 남.
        if (!_field.attribute.isArray) _field.attribute.canBeNull = true;

        return tableInfo.tableName;
    }

    // Prisma 모델에서 테이블 컬럼 정의를 생성
    private TableCollum(field: IServerField): string {
        let str = ""; // 결과 문자열
        let type = ""; // 필드 타입

        // 필드 타입에 따른 처리
        //TODO FieldType이라는 것을 정한 것을 사용하므로 이 부분에 대해서는 scm에서 정리가 다 되면은 type에 대한 정보를 준다고 했음.
        //console.log(`type: ${field.type} // name: ${field.name}`);
        switch (field.type) {
            case "object": // 객체 타입의 경우 서브 테이블 생성
                type = this.NewTable(field);
                break;
            default:
                type = getFieldTypeToInputType(field.type);
                break;
        }

        if (type == "File") {
            if (this.dbSet.fileTable == null) {
                const fileTableData = Drive.getPrismaSettingTable();
                this.dbSet.fileTable = new CTableInfo(this.dbSet, fileTableData.tableName, fileTableData.fields);
            }
            field.attribute.canBeNull = true;
            this.GetRelation(field);

            this.dbSet.fileTable.SetRelationMany(this.tableName, `${this.tableName}_${field.name}`, field.attribute.isArray, true);
        }

        // 컬럼 이름 및 속성 추가
        str += `${field.name} \t ${this.ColumnAttribute(field, type)}`;
        if (field.configs) str += this.ColumnConfigs(field.configs); // 제약 조건 추가
        str += this.ColumnServerRestriction(field); // 서버 제약 조건 추가

        return `${str}\n`;
    }

    // Prisma 컬럼 속성을 정의
    private ColumnAttribute(_field: IServerField, _type: string): string {
        let str = _type;

        if (_field.type == "object") {
            this.GetRelation(_field);
        }

        // 필드가 nullable인 경우 처리
        if (_field.attribute.canBeNull) {
            str += "?";
            return str;
        }

        // 필드가 배열인 경우 처리
        if (_field.attribute.isArray) {
            if (this.dbSet.Provider == 0) {
                // SQLite 처리
                switch (_type) {
                    case "String":
                    case "Int":
                    case "Boolean":
                        // SQLite는 기본적으로 배열을 지원하지 않으므로 별도 테이블 생성
                        _field.next = [
                            {
                                name: _field.name,
                                attribute: {
                                    canBeNull: false,
                                    isArray: false
                                },
                                type: _type
                            }
                        ];
                        str = this.NewTable(_field);
                        this.GetRelation(_field);
                        break;
                }
                str += "[]";
            } else if (this.dbSet.Provider == 1) {
                // PostgreSQL 처리
                str += "[]";
            }

            return str;
        }

        return str;
    }

    // 필드 제약 조건 정의 (e.g., unique)
    private ColumnConfigs(_configs: Record<string, any>): string {
        let str = "";

        for (const key in _configs) {
            if (key == "isUnique") str += "\t @unique";
            if (key == "defaultValue") str += `\t @default(${_configs[key]})`;
        }

        return str;
    }

    // 서버에서 적용할 필드 제약 조건 정의
    // TODO: 필드의 제약 조건의 정의가 더 되면은 정리할 예정.
    private ColumnServerRestriction(_field: IServerField): string {
        let str = "";

        const _restrictions = _field.server_restrictions;
        let isClass = true;

        for (const key in _restrictions) {
            if (key == "unique") {
                str += "\t @unique";
                continue;
            }
            if (key == "pk") {
                // 프라이머리 키 설정
                str += "\t @id";
                if (_restrictions[key] == true) str += "\t @default(autoincrement())"; // 자동 증가 옵션
                continue;
            }
            if (key == "target_relation") {
                // 관계 설정
                const relation: Record<string, string> = _restrictions[key];
                str += `\t @relation("${relation.alias}", fields: [${relation.fields}], references: [${relation.references}], onDelete: ${relation.onDelete})`;
                continue;
            }
            if (key == "map") {
                str += `\t @map("${_restrictions[key]}")`; // 매핑 정보 추가
                continue;
            }
            if (key == "notClass") {
                isClass = false;
                continue;
            }
            if (key == "relation") {
                str += `\t @relation("${_restrictions[key]}")`;
                continue;
            }
        }

        return str;
    }

    // 기본 프라이머리 키 필드를 설정
    private SetPkIndex() {
        this.fields.unshift({
            name: this.pkstr,
            attribute: {
                canBeNull: false,
                isArray: false
            },
            type: "number",
            server_restrictions: { pk: true, map: "_id", notClass: true }
        });
    }

    // 다대다 또는 일대다 관계를 설정
    private SetRelationMany(_referencesType: string, _aliasd: string, _isArray: boolean = false, _canBeNull = false) {
        let lowerTableName = _aliasd.toLocaleLowerCase();
        let fieldName = `${lowerTableName}${this.pkstr}`;

        const target_relation: Record<string, string> = {
            fields: fieldName,
            references: this.pkstr,
            onDelete: "Cascade",
            alias: _aliasd
        };

        let server_restriction: { notClass: boolean; [key: string]: boolean } = { notClass: true };
        if (!_isArray) server_restriction.unique = true;
        //else server_restriction = { notClass: true };

        const relationField: IServerField[] = [
            {
                name: lowerTableName,
                attribute: {
                    canBeNull: _canBeNull,
                    isArray: false
                },
                type: _referencesType,
                server_restrictions: { target_relation }
            },
            {
                name: fieldName,
                attribute: {
                    canBeNull: _canBeNull,
                    isArray: false
                },
                type: "number",
                server_restrictions: server_restriction
            }
        ];

        this.fields.push(...relationField);
    }

    // 문자열의 첫 글자를 대문자로 변경
    private capitalizeFirstLetter(text: string): string {
        if (text.length === 0) return text; // 빈 문자열 처리
        return text[0].toUpperCase() + text.slice(1);
    }

    private GetRelation(_field: IServerField) {
        _field.server_restrictions = {
            relation: `${this.tableName}_${_field.name}`
        };
    }
}
