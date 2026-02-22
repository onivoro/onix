export interface ExecutorSchema {
    flavor?: string;
    version?: string;
    additionalProperties?: string;
    openapiJsonPath: string;
    outputPath: string;
}
