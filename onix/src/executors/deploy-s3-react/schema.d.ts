export interface ExecutorSchema {    
    bucket: string,
    region: string,
    version: string,
    omitAcl?: boolean,
    profile?: string,
}