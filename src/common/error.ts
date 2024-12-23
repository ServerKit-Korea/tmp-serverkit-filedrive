/**
 * ----------------------------------------------------------------------------
 * common/error.ts
 *
 * 이 패키징의 기초 에러 클래스를 정의합니다.
 * 모든 function에서 이 에러 클래스를 이용하여 에러를 공유합니다.
 * ----------------------------------------------------------------------------
 */

interface BaseErrorInterface {
    service: string;
    message: string;
    code: string;
    timestamp: Date;
}

/**
 * @name BaseError
 * @description * ES Error 클래스를 상속한 IDE 기초 에러 클래스.
 *              * 이를 상속하여 각 서비스(function)에 맞는 에러를 구현하여 사용합니다.
 */
export class BaseError extends Error implements BaseErrorInterface {
    public readonly service: string;
    public readonly code: string;
    public readonly timestamp: Date;

    constructor(service: string, code: string, message?: string) {
        super(message);
        this.service = service;
        this.code = code;
        this.timestamp = new Date();
    }

    get info(): BaseErrorInterface {
        return {
            service: this.service,
            message: this.message,
            code: this.code,
            timestamp: this.timestamp
        };
    }
}