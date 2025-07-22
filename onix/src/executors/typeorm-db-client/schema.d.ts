export interface ExecutorSchema {
    envFile?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    type?: string;
    httpPort: number;
}
