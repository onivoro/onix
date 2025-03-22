export interface ExecutorSchema {
    cluster?: string;
    dockerfile: string;
    ecr: string;
    platform?: string;
    profile?: string;
    region?: string;
    service?: string
    ui?: string;
}
