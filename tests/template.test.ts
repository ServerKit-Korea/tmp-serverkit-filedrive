/**
 * ----------------------------------------------------------------------------
 * tests/template.test.ts
 *
 * 테스트 파일 템플릿입니다. 테스트 파일 작성 시 참고하세요.
 * ----------------------------------------------------------------------------
 */

// Build 된 파일을 Git Action 처리하기 전 Jest 실행 시 환경 변수 초기화하는 목적입니다.
// ▼ Build 된 모듈 테스트시에는 주석을 해제해주세요. TS_JEST의 작동방식을 벗어나므로 무조건 최상단에서 초기화를 시켜줘야 합니다.
// process.env.TS_JEST = ""; 

// Logger: Info
function log(message: string) {
    console.log(`\x1b[37m ℹ️ ${message}\x1b[0m`);
}
// Logger: Success
function logSuccess(message: string) {
    console.log(`\x1b[32m✔️ [SUCCESS] ${message}\x1b[0m`);
}
// Logger: Error
function logError(message: string) {
    console.log(`\x1b[31m❌ [ERROR] ${message}\x1b[0m`);
}

describe("[00]", () => {
    it("[00-0]", async () => {
        try {
        } catch (e) {
            expect(e).toBeUndefined(); // 이 조건은 항상 실패하므로 테스트 실패로 간주
        }
    });
});
