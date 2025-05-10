export interface ExecutorSchema {
    bucket: string,
    region: string,
    omitAcl?: boolean,
    profile?: string,
    localDirectory: string,
}