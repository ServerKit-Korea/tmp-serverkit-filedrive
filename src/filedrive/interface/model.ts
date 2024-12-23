/**
 * filedrive/interface/model.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * 파일드라이브에서 사용되는 구조 정보가 작성된 파일입니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

/**
 * ### IFileMetadata
 * file 타입을 가지는 필드의 공통적인 메타데이터 구조.
 */
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

/**
 * ### IImageExtendsMetadata
 * 이미지 파일 추가(extends) 인터페이스
 */
export interface IImageExtendsMetadata {
    format: number; // 이미지 포맷
    width: number; // 가로 픽셀 길이
    height: number; // 세로 픽셀 길이
    space: string; // 색상 영역
    channels: number; // 색상 채널 (RGB, +alpha)
    depth: string; // 픽셀 당 색상 깊이로 채널당 비트 표현
    density: number; // 해상도(DPI)
    chromaSubsampling: string; // 이미지 색상 채널의 샘플링 방식 (4:2:0 -> 절반만 샘플링, 4:4:4 -> 무손실)
    isProgressive: boolean; // 점진적 로딩 방식 사용 여부
    hasProfile: boolean; // 색상 프로파일 정보 포함 여부
    hasAlpha: boolean; // 알파 채널 여부.
}

/**
 * ### IMediaExtendsMetadata
 * 비디오, 오디오 기본 파일 추가(extends) 인터페이스
 */
export interface IVideoFileMetadata extends IFileMetadata {
    format: string; // 포맷
    formatLong: string; // 포맷 전체 이름
    duration: number; // 재생 길이 (초)
    bitRate: number; // 초당 bit(bps)
    sampleRate: number; // 샘플링 레이트 (Hz)
    channels: number; // 채널 수. (1: 모노, 2: 스테레오)
    codec: string; // 코덱
}
