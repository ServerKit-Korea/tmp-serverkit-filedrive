import express, { Application } from "express";
import fs from "fs";
import path from "path";

// 안전하게 디렉토리 삭제 함수
export function safeDeleteDirectory(dirPath: string) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const fullPath = path.join(dirPath, file);

            // 파일 또는 디렉토리 확인
            if (fs.lstatSync(fullPath).isDirectory()) {
                safeDeleteDirectory(fullPath); // 재귀적으로 디렉토리 삭제
            } else {
                fs.unlinkSync(fullPath); // 파일 삭제
            }
        });
        fs.rmdirSync(dirPath); // 디렉토리 삭제
    }
}

// 특정 경로의 폴더가 존재하지 않거나 존재해도 하위에 파일이 0개인지 검사한다.
export function isDirectoryNotEmpty(dirPath: string): boolean {
    if (!fs.existsSync(dirPath)) {
        return true;
    }
    return fs.readdirSync(dirPath).length <= 0;
}

// 딜레이 함수
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// 권한 끊고 강제로 파일 닫기
export function forceCloseFile(filePath: string) {
    try {
        const fd = fs.openSync(filePath, "r+");
        fs.closeSync(fd); // 강제 닫기
    } catch (error) {
        console.error(`Error closing file: ${filePath}`, error);
    }
}


/**
* ### getPrismaSettingTableWithFiledrive
* * filedrive 테스트에서 사용가능한 데이터 세팅을 연동할 수 있도록 테이블 정의를 반환한다.
*/
export function getPrismaSettingTableWithFiledrive() {
    return {
        tableName: "Data",
        fields: [
            {
                name: "name",
                description: "일반 데이터 1",
                type: "string",
                attribute: {
                    canBeNull: false,
                    isArray: false
                },
            },
            {
                name: "file",
                description: "파일",
                type: "file",
                attribute: {
                    canBeNull: false,
                    isArray: false
                }
            },
        ]
    }
}