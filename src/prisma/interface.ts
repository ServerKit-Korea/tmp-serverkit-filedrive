import { IDBField } from "../scm/interface/model";

export interface IServerField extends IDBField {
    /* 사용자가 정의하지 않은 제약사항에 대해서는 따로 관리를 한다. */
    server_restrictions: Record<string, any>;
}
