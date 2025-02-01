export interface ExecutorSchema {
    envFile: string;
    ecr: string;
    localPort?: number;
    port: number;
}
