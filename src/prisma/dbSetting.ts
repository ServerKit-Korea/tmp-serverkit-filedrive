// 큐와 관련된 라이브러리 및 테이블 정보 클래스를 가져옵니다.
import { Queue } from "../common/queue"; // 큐 자료구조 클래스
import { CTableInfo } from "./tableInfo"; // 테이블 정보 클래스

// 데이터베이스 설정 및 테이블 관리 클래스
export class CNet_DBSet {
    dbconfig: CDBConfig; // 데이터베이스 설정 객체
    tableQueue: Queue<CTableInfo>; // 테이블 정보를 관리하는 큐
    tableList: CTableInfo[]; // 순수 처음 받은 데이터.
    prismaClassName: string;
    fileTable: CTableInfo | null;
    //classTableQueue: Queue<CTableInfo>;

    // CNet_DBSet 클래스의 생성자
    constructor(_dbconfig: IConnectionBase, _tableList: any, _prismaClassName = "ServerKit") {
        // 데이터베이스 설정 객체를 생성합니다.
        // _provider: 데이터베이스 제공자 식별자 (e.g., 0: SQLite, 1: PostgreSQL)
        // _connectData: 데이터베이스 연결에 필요한 데이터
        this.dbconfig = new CDBConfig(_dbconfig);

        // 테이블 정보를 관리하기 위한 큐를 초기화합니다.
        this.tableQueue = new Queue<CTableInfo>();

        this.fileTable = null;

        // 전달받은 테이블 리스트를 CTableInfo 배열로 변환합니다.
        // _tableList는 문자열로 전달되므로, 이를 적절히 변환하여 CTableInfo 객체로 매핑합니다.
        this.tableList = _tableList as unknown as CTableInfo[];

        this.prismaClassName = _prismaClassName;
        //this.classTableQueue = new Queue<CTableInfo>();

        // 변환된 테이블 리스트를 순회하며 큐에 추가합니다.
        for (const table of this.tableList) this.tableQueue.enqueue(new CTableInfo(this, table.tableName, table.fields));
    }

    // 데이터베이스 제공자 (Provider)를 반환합니다.
    // e.g., 0: SQLite, 1: PostgreSQL
    get Provider(): DBProvider {
        return this.dbconfig.connectionData.provider;
    }

    // 새로운 테이블을 큐에 추가합니다.
    // _table: 추가할 테이블 정보 객체
    SetTable(_table: CTableInfo) {
        this.tableQueue.enqueue(_table);
    }

    PrismaSetting(output?: string): string {
        let model_str = this.ModelSetting(output);
        //let class_str = this.ClassSetting();
        try {
            return model_str;
            //fs.writeFileSync(path.join(prismaPath, `${this.prismaClassName}_Class.ts`), class_str);
        } catch (e) {
            throw e;
        }
    }

    // 데이터베이스 설정 문자열을 생성합니다 (Prisma 스키마 정의).
    private DBSetting(output?: string): string {
        // Prisma 클라이언트 생성기 설정을 추가합니다.
        let str = output
            ? `generator client {
                    provider = "prisma-client-js"
                    output = "${output}"
                }\n`
            : `generator client {
                    provider = "prisma-client-js"
                }\n`;

        // 데이터베이스 제공자에 따라 설정을 추가합니다.
        switch (this.dbconfig.connectionData.provider) {
            case 0: // SQLite 데이터베이스 설정
                const sqliteConnection = this.dbconfig.connectionData as IConnectionSqlite;
                str += `datasource db {
                    provider = "sqlite" // SQLite 사용
                    url      = "file:./${sqliteConnection.fileName}" // SQLite 파일 경로
                }\n`;
                break;
            case 1: // PostgreSQL 데이터베이스 설정
                const postgreConnection = this.dbconfig.connectionData as IConnectionPostgreSql;
                str += `datasource db {
                    provider = "postgresql" // PostgreSQL 사용
                    url      = "postgresql://${postgreConnection.id}:${postgreConnection.password}@${postgreConnection.url}:${postgreConnection.port}/${postgreConnection.database}" // 연결 URL
                }\n`;
                break;
            default:
                // 제공자를 식별할 수 없을 경우 에러를 발생시킵니다.
                throw new Error("Unknown database provider");
        }

        return str;
    }

    // 모든 테이블의 Prisma 모델 설정 문자열을 생성합니다.
    private ModelSetting(output?: string): string {
        // 데이터베이스 설정 문자열을 시작 부분에 추가합니다.
        let str = this.DBSetting(output);

        // 큐에 저장된 모든 테이블 정보를 처리합니다.
        while (!this.tableQueue.isEmpty()) {
            const table = this.tableQueue.dequeue();
            // 테이블 정보가 없으면 에러를 발생시킵니다.
            if (table == undefined) throw new Error("Table queue is in an invalid state");

            // 각 테이블의 모델 설정을 추가합니다.
            str += `${this.ReadModel(table)} \n\n`;

            //this.classTableQueue.enqueue(table);
        }

        if (this.fileTable != null) str += `${this.ReadModel(this.fileTable)} \n\n`;

        return str;
    }

    // 특정 테이블의 Prisma 모델 정의를 생성합니다.
    // _table: 모델 정의를 생성할 테이블 정보
    private ReadModel(_table: CTableInfo): string {
        // 모델 정의 시작
        let str = `model ${_table.tableName} {\n`;
        // 테이블 필드 설정 문자열을 생성하여 추가합니다.
        str += `${_table.FieldSetting()} }\n`;
        return str;
    }

    // private ClassSetting(): string {
    //     let str = "";

    //     while (!this.classTableQueue.isEmpty()) {
    //         const table = this.classTableQueue.dequeue();
    //         // 테이블 정보가 없으면 에러를 발생시킵니다.
    //         if (table == undefined) throw new Error("Table queue is in an invalid state");
    //         str += `${this.ClassRead(table)} \n\n`;
    //     }

    //     return str;
    // }

    // private ClassRead(_table: CTableInfo): string {
    //     let str = `export interface ${_table.tableName} {\n`;

    //     str += `${Object.entries(_table.interfaceRecord)
    //         .map(([key, value]) => `\t${key}:${value}`)
    //         .join("\n")} \n }\n`;
    //     return str;
    // }
}

// 데이터베이스 연결 설정을 나타내는 클래스
export class CDBConfig {
    connectionData!: IConnectionBase; // 연결 정보 객체

    constructor(_dbconfig: IConnectionBase) {
        switch (_dbconfig.provider) {
            case DBProvider.SQLite:
                if (this.isIConnectionSqlite(_dbconfig)) {
                    this.connectionData = _dbconfig; // SQLite로 타입 안전한 할당
                }
                break;

            case DBProvider.PostgreSQL:
                if (this.isIConnectionPostgreSql(_dbconfig)) {
                    this.connectionData = _dbconfig; // PostgreSQL로 타입 안전한 할당
                }
                break;

            default:
                throw new Error("Unsupported provider type");
        }
    }

    private isIConnectionSqlite(config: IConnectionBase): config is IConnectionSqlite {
        return config.provider === DBProvider.SQLite;
    }

    private isIConnectionPostgreSql(config: IConnectionBase): config is IConnectionPostgreSql {
        return config.provider === DBProvider.PostgreSQL;
    }
}

export enum DBProvider {
    SQLite = 0,
    PostgreSQL = 1
}

// 데이터베이스 연결 정보를 나타내는 기본 인터페이스
export interface IConnectionBase {
    provider: DBProvider; // 데이터베이스 제공자 (e.g., 0: SQLite, 1: PostgreSQL)
}

// SQLite 데이터베이스 연결 정보를 나타내는 인터페이스
export interface IConnectionSqlite extends IConnectionBase {
    fileName: string; // SQLite 데이터베이스 파일 이름
}

// PostgreSQL 데이터베이스 연결 정보를 나타내는 인터페이스
export interface IConnectionPostgreSql extends IConnectionBase {
    id: string; // PostgreSQL 사용자 ID
    password: string; // PostgreSQL 비밀번호
    url: string; // PostgreSQL 호스트 URL
    port: number; // PostgreSQL 포트
    database: string; // PostgreSQL 데이터베이스 이름
}
