import { TCopyFromS3Config } from "../../functions/copy-from-s3.function";

export interface ExecutorSchema {
    debugPort?: number;
    envFile?: string;
    copyFromS3?: TCopyFromS3Config
}
