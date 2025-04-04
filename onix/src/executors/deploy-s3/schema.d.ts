export interface ExecutorSchema {
    bucket: string,
    region: string,
    prefix?: string,
    omitAcl?: boolean,
    profile?: string,
}