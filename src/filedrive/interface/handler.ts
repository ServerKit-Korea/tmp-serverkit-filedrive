/**
 * filedrive/interface/handler.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * filedrive의 기능을 호출하기 위한 인터페이스를 정의합니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import { IFileMetadata } from "./model";

/**
 * ### IRequestGetFileMetadata
 * FileDrive 클래스의 getFiles() 파라미터로 사용되는 인터페이스
 */
export interface IRequestGetFileMetadata {
    isMapped?: boolean; // mapping된 데이터인지 유무.
    startDate?: string; // 생성 시작일 (검색)
    endDate?: string; // 생성 종료일 (검색)
    sortBy?: "createdAt" | "size"; // 정렬 기준
    order?: "asc" | "desc"; // 오름/내림차순
    page?: number; // 페이지
    limit?: number; // 페이지에서 검색된 데이터를 표출할 최대 개수
}

/**
 * ### IRequestDeleteFile
 * FileDrive 클래스의 deleteFiles() 파라미터로 사용되는 인터페이스
 */
export interface IRequestDeleteFile {
    fileIdList: string[];
}

/**
 * ### IResponseGetFileMetadata
 * FileDrive 클래스에서 File 메타데이터를 반환하는 인터페이스
 */
export interface IResponseGetFileMetadata {
    totalCount: number; // Query로 전달해서 검색된 전체 데이터 개수.
    data: IFileMetadata[]; // 검색 데이터.
}

/**
 * ### IResponseFileUpload
 * FileDrive 클래스의 uploadHandler에서 반환하는 데이터 인터페이스
 */
export interface IResponseFileUpload {
    isSucceed: boolean; // 성공 여부
    file?: IFileMetadata;  // 업로드가 성공했을 경우 파일 메타데이터.
    error?: any;  // 업로드가 실패했을 경우 에러 객체.
}