export interface ExecutorSchema {
    envFile: string;
    ecr: string;
    port: number;
    environment?: {
        [key: string]: string;
    };
}
