# Result-Use-Module

![version](https://img.shields.io/badge/version-%%VERSION%%-blue)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-brightgreen)
![build](https://img.shields.io/badge/build-%%BUILD%%)
![license](https://img.shields.io/badge/license-UNLICENSED-red)

## 소개

이 모듈(`executable-boilerplate`)은 컴파일 프로젝트에서 유저가 생성한 서버를 만들기 위한 기능들을 제공합니다.

---

# DBM 기능 소개

DBM의 경우 DB를 생성할 `dbconfig` 데이터와 테이블을 생성할 `TableInfo`의 정보가 필요합니다.

컴파일을 할 때 DB의 정보는 `dbconfig`에 맞게 데이터를 받아야 합니다.

DB를 생성할 때 필요한 정보입니다.

```tsx
const netdata: CNet_DBSet = new CNet_DBSet(IConnectionBase, ClientDbm);
netdata.PrismaSetting();
```

`IConnectionBase`는 사용하는 DB에 따라 SQLite와 PostgreSQL로 나뉩니다.

```tsx
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
```

---

# 1. 공통 부분 (Asset)

```tsx
export interface Asset {
    id: string;
    name: string;
    fileFormatVersion: string;
    ideFormatVersion: string;
    description: string;
}
```

---

## DBM 주요 인터페이스 설명

### 1. DbmAsset

```tsx
export interface DbmAsset extends Asset {
    data: ClientDbm;
}
```

### 2. ClientDbm

```tsx
export interface ClientDbm {
    tableName: string; // 테이블의 이름
    fields: SCM.IDBField; // Model을 구성하는 Field의 정보
}
```

### 3. IDBField

```tsx
export interface IDBField {
    name: string; // 컬럼 이름
    type: string; // 자료형
    attribute: IAttribute; // 제약사항
    next?: IDBField[]; // relation의 경우 추가되는 Model
    configs?: IDbConfig; // config 정보
}
```

### 4. IAttribute

```tsx
export interface IAttribute {
    canBeNull: boolean; // null 허용 여부
    isArray: boolean; // List 여부
}
```

### 5. IDbConfig

```tsx
export interface IDbConfig {
    defaultValue?: string; // 기본값
    isUnique?: boolean; // 유니크 체크 여부
}
```

# VQM 기능 소개

`executable-boilerplate`의 VQM namespace는 `.vqm` 확장자가 지정한 Visual Query를 생성하고 `동적 module`을 하기 위한 기능입니다.

```typescript
let querymanager: CVisualQueryManager = new CVisualQueryManager(IVisualQueryPhaseList[]);

// js 파일 생성
const buildList: Array<IBuildJSData> = querymanager.VQBuildJS();

for (const build of buildList) {
    fs.writeFileSync(path.join(prismapath, `${build.fileName}`), build.buildData);
}

const index_str = querymanager.VQIndexJS();
fs.writeFileSync(path.join(prismapath, "index.js"), index_str);

const global_prisma = querymanager.VQGlobalPrisma();
fs.writeFileSync(path.join(prismapath, "prisma.js"), global_prisma);
```

`CVisualQueryManager`는 VQM의 모든 상황을 담당하는 클래스입니다.

`CVisualQueryManager`의 매개변수로 `IVisualQueryPhaseList`에 대한 정보가 필요합니다. 자세한 내용은 [컴파일 인터페이스]의 VQM을 참고하세요.

## VQM 주요 함수 설명

1. **`VQIndexJS()`**

    - 위에서 생성된 모듈을 정리하여 포함하는 `index.js` 파일을 생성하는 함수입니다.

2. **`VQGlobalPrisma()`**
    - 모듈에서 사용할 Prisma를 글로벌 변수로 사용하기 위한 파일을 생성하는 함수입니다.

## VQM 주요 인터페이스 설명

### 1. VqmAsset

```tsx
export interface VqmAsset extends Asset {
    data: VQM.IVisualQueryPhaseList;
}
```

### 2. IVisualQueryPhaseList

```tsx
export interface IVisualQueryPhaseList {
    functionName: string; // 모듈 이름
    parameterRecord: Record<string, string>; // 모듈 파라미터
    returnRecord: Record<string, string>; // 모듈 반환값
    PhaseList: Array<IVisualQueryPhase>; // Phase 리스트
}
```

### 3. IVisualQueryPhase

```tsx
export interface IVisualQueryPhase {
    ModelName: string; // 사용하는 Model 이름
    Action: string; // DB Action 종류
    PhaseName: string; // Phase 이름
    FilterList?: Array<IVisualQueryFilterGroup>; // 조건문
    CreateData?: IVBisualQueryData; // 데이터 생성
    UpdateData?: IVBisualQueryData; // 데이터 업데이트
    UniqueData?: IVisualQueryUniqueData; // 유니크 키로 데이터 찾기
    Select?: Array<string>; // 조회 컬럼
    Include?: Array<string>; // 관계 연결
    Aggregate?: IVisualQueryAggregate; // 집계 함수
    GroupBy?: Array<string>; // 그룹화
    Having?: string; // 조건 연결
}
```

### 4. IVisualQueryFilterGroup

```tsx
export interface IVisualQueryFilterGroup {
    AND?: IVisualQueryFilterCondition[];
    OR?: IVisualQueryFilterCondition[];
    Filter_AND?: number[];
    Filter_OR?: number[];
}
```

### 5. IVisualQueryFilterCondition

```tsx
export interface IVisualQueryFilterCondition {
    columns: string; // 컬럼 이름
    operator: string; // 연산자
    param: string | null; // 매개변수
    types: string; // 데이터 타입
    returnPhase?: string; // 반환 Phase
}
```

### 6. IVBisualQueryData

```tsx
export interface IVBisualQueryData {
    [key: string]: IVisualQueryCreateDynamicData | string;
}
```

### 7. IVisualQueryCreateDynamicData

```tsx
export interface IVisualQueryCreateDynamicData {
    keyName: string; // 변수명
    keyType: string; // 변수 타입
    isNull?: boolean; // null 허용 여부
    data?: IVBisualQueryData | string;
}
```

### 8. IVisualQueryUniqueData

```tsx
export interface IVisualQueryUniqueData {
    uniqueName: string; // 유니크 컬럼
    valueData: string; // 매개변수 값
}
```

### 9. IVisualQueryAggregate

```tsx
export interface IVisualQueryAggregate {
    Sum?: Array<IVisualQueryAggregateDynamicData>;
    Count?: Array<IVisualQueryAggregateDynamicData>;
    Min?: Array<IVisualQueryAggregateDynamicData>;
    Max?: Array<IVisualQueryAggregateDynamicData>;
    Avg?: Array<IVisualQueryAggregateDynamicData>;
}
```

### 10. IVisualQueryAggregateDynamicData

```tsx
export interface IVisualQueryAggregateDynamicData {
    columns: string; // 컬럼 이름
    operator?: string; // 연산자
    param?: string; // 매개변수
}
```

# FileDrive

FileDrive는 파일과 관련된 모든 작업을 지원합니다. Drive 클래스를 생성하여 객체를 만들고 이를 활용해보세요.

## FileDrive 클래스 설명

```tsx
class Drive {
    constructor(
        prisma: PrismaClient,
        configs: {
            rootPath: string;
        }
    );
    get rootPath(): string;
    get multerHandler(): RequestHandler<express_serve_static_core.ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>;
    get uploadHandler(): RequestHandler<{}, IResponseFileUpload, any, qs.ParsedQs, Record<string, any>>;
    static getPrismaSettingTable(): Record<string, any>;
    mappingFileMetadata(fileId: string, documentId: string): Promise<void>;
    getFile(fileId: string): Promise<IFileMetadata | null>;
    getFiles(query: IRequestGetFileMetadata): Promise<IResponseGetFileMetadata>;
    deleteFiles(query: IRequestDeleteFile): Promise<IResponseGetFileMetadata>;
}
```

1. **`constructor(prisma, configs)`** : prisma 객체와 업로드 경로를 설정합니다. 객체 생성 시 작성해주세요.
2. **`rootPath()`** : 파일이 업로드 되는 루트 경로를 반환합니다.
3. **`multerHandler()`** : 파일을 업로드 하는 가장 기초적인 핸들러입니다. 파일 업로드를 처리하는 업로드로 주의하실 점은 파일만 업로드 할 뿐 이를 바탕으로 메타데이터를 생성하지는 않는 가장 기초적인 파일 핸들러입니다. 완전한 커스텀을 원할 경우에 사용하며 그 외에는 사용을 권장하지 않습니다.
4. **`uploadHandler()`** : 파일을 업로드하고 File 모델에 대한 메타데이터를 자동으로 저장하는 핸들러입니다. 사용 예시는 다음과 같습니다.

    ```tsx
    const app: Application = express();
    app.post("/file/upload", filedrive.uploadHandler);
    ```

5. **`Drive.getPrismaSettingTable()`** : File 메타데이터 모델을 정의하는 prisma 테이블 객체 값을 반환합니다.
6. **`getFile(fileId)`** : 파일 하나에 대한 메타데이터 정보를 가져옵니다.
7. **`getFile(query)`** : 파일을 n개 가져옵니다. `IRequestGetFileMetadata (검색 조건)`, `IResponseGetFileMetadata (검색된 메타데이터 리스트)` 인터페이스를 참고해주세요.
8. **`deleteFiles(query)`** : 파일을 삭제합니다. `IRequestDeleteFile (삭제 조건)`, `IResponseGetFileMetadata (삭제된 메타데이터)` 인터페이스를 참고해주세요.

## FileDrive 주요 인터페이스 설명

### 1. IFileMetadata

파일 메타데이터 형식입니다.

```tsx
export interface IFileMetadata {
    id: number; // 자동 생성 DB 아이디
    fileId: string; // 고유 ID
    size: number; // 파일 크기
    filename: string; // 원본 파일 이름
    mimetype: string; // MIME 타입
    path: string; // 파일 실제 경로
    isMapped: boolean; // 매핑 여부
    mappedTo?: string; // 매핑된 Document ID (다형성 지원)
    createdAt: Date; // 생성 날짜
    extends: string; // File을 확장한 모든 필드의 전용 데이터 사양들.
}
```

### 2. IRequestGetFileMetadata

FileDrive 클래스의 getFiles() 파라미터로 사용되는 인터페이스입니다.

```tsx
export interface IRequestGetFileMetadata {
    isMapped?: boolean; // mapping된 데이터인지 유무.
    startDate?: string; // 생성 시작일 (검색)
    endDate?: string; // 생성 종료일 (검색)
    sortBy?: "createdAt" | "size"; // 정렬 기준
    order?: "asc" | "desc"; // 오름/내림차순
    page?: number; // 페이지
    limit?: number; // 페이지에서 검색된 데이터를 표출할 최대 개수
}
```

### 2. IRequestDeleteFile

FileDrive 클래스의 deleteFiles() 파라미터로 사용되는 인터페이스입니다.

```tsx
export interface IRequestDeleteFile {
    fileIdList: string[]; // 삭제할 파일 정보
}
```

### 3. IResponseGetFileMetadata

FileDrive 클래스에서 File 메타데이터를 반환하는 인터페이스입니다.

```tsx
export interface IResponseGetFileMetadata {
    totalCount: number; // Query로 전달해서 검색된 전체 데이터 개수.
    data: IFileMetadata[]; // 검색 데이터.
}
```

### 4. IResponseFileUpload

FileDrive 클래스의 uploadHandler에서 response로 반환하는 데이터 인터페이스입니다.

```tsx
export interface IResponseFileUpload {
    isSucceed: boolean; // 성공 여부
    file?: IFileMetadata; // 업로드가 성공했을 경우 파일 메타데이터.
    error?: any; // 업로드가 실패했을 경우 에러 객체.
}
```
