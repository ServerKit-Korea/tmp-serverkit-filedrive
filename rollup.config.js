import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import { dts } from "rollup-plugin-dts"; // 타입 선언 병합 플러그인

import pkg from "./package.json" assert { type: "json" };

const isRelease = process.env.BUILD_ENV !== "release";

export default [
    {
        input: "src/index.ts", // 번들링 시작 파일 (entry)
        output: [
            {
                file: "build/index.mjs",
                format: "esm", // esnext
                sourcemap: isRelease
            },
            {
                file: "build/index.cjs",
                format: "cjs", // CommonJS
                sourcemap: isRelease
            }
        ],
        plugins: [
            del({ targets: "build/*", hook: "buildStart" }), // build 폴더 삭제
            resolve(), // Node.js 스타일 모듈 해석
            typescript({
                tsconfig: "./tsconfig.json",
                declaration: false, // Rollup에서 .d.ts 파일 생성 비활성화
                sourceMap: isRelease
            }),
            terser({
                format: {
                    comments: false // Release에서 주석 제거
                }
            }),
            copy({
                targets: [
                    {
                        src: "README.module.md",
                        dest: "build",
                        rename: "README.md",
                        transform(contents) {
                            // contents를 문자열로 변환한 후 %%VERSION%% 및 %%BUILD%%를 실제 버전, 빌드 종류로 치환
                            return contents
                                .toString()
                                .replace(/%%VERSION%%/g, pkg.version)
                                .replace(/%%BUILD%%/g, isProduction ? "Release-brightgreen" : "Debug-blue");
                        }
                    }
                ]
            })
        ],
        external: [...Object.keys(pkg.dependencies || {})]
    },
    {
        input: "src/index.ts",
        output: {
            file: "build/index.d.ts",
            format: "es"
        }, // 병합된 단일 .d.ts 출력
        plugins: [dts()]
    }
];
