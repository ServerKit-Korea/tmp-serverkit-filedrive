/**
 * filedrive/extractor/list/video.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * [video] 키에 대한 추가적인 메타데이터 추출 클래스가 저장되어 있습니다.
 *
 * -----------------------------------------------------------------------------------------------
 */
import { promisify } from "util";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "@ffprobe-installer/ffprobe";
import { BaseExtractor, FileExtractorDecorator } from "../fileExtendsBase";

ffmpeg.setFfmpegPath(ffmpegPath as string);
ffmpeg.setFfprobePath(ffprobe.path);

// ffprobe를 프로미스 기반으로 변환
const ffprobeAsync: (filePath: string) => Promise<ffmpeg.FfprobeData> = promisify(ffmpeg.ffprobe);

/**
 * @description * video 파일에 대한 추가 메타데이터 추출 클래스.
 */
@FileExtractorDecorator("video")
export class VideoExtractor extends BaseExtractor {
    async extract(filePath: string): Promise<string | null> {
        try {
            const metadata = await ffprobeAsync(filePath);

            // streams 배열의 첫 번째 스트림을 캐싱
            const stream = metadata.streams[0];
            if (!stream) {
                return null;
            }
            const json: any = {
                format: metadata.format.format_name,
                formatLong: metadata.format.format_long_name,
                duration: metadata.format.duration,
                bitRate: metadata.format.bit_rate,
                sampleRate: stream.sample_rate,
                channels: stream.channels,
                codec: stream.codec_long_name
            };
            return JSON.stringify(json);
        } catch (e) {
            return null;
        }
    }
}
