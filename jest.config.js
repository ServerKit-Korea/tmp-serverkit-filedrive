const { readFileSync } = require("fs");
const { parse } = require("jsonc-parser");

const { pathsToModuleNameMapper } = require("ts-jest");
const tsconfigContent = readFileSync("./tsconfig.json", "utf8");
const tsconfig = parse(tsconfigContent);

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"], // .ts 파일만 ESM으로 처리
    moduleFileExtensions: ["js", "cjs", "ts", "json", "node"],
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.json"
        }
    },
    transform: {}, // 추가적인 변환 없이 ESM 처리
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths || {}, {
        prefix: "<rootDir>/"
    }),
    testTimeout: 15000 // 모든 테스트의 기본 타임아웃을 15초로 설정
};
