import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
    LambdaClient,
    UpdateFunctionCodeCommand,
    GetFunctionCommand,
    UpdateFunctionConfigurationCommand,
    CreateFunctionCommand,
    FunctionConfiguration,
    Runtime,
    Environment,
} from "@aws-sdk/client-lambda";
import * as AdmZip from 'adm-zip';
import { resolveAwsCredentials } from "./resolve-aws-credentials.function";

export interface DeployLambdaConfig {
    bucket: string;
    functionName: string;
    profile?: string;
    region: string;
    sourcePath: string;
    roleArn: string;
    runtime?: Runtime;
    handler?: string;
    memorySize?: number;
    delayMs?: number;
    environment?: {
        [key: string]: string;
    };
}

export async function deployLambda({
    functionName,
    sourcePath,
    region,
    bucket,
    roleArn,
    runtime = Runtime.nodejs22x,
    handler = 'index.handler',
    memorySize = 128,
    environment,
    delayMs = 5000,
    profile,
}: DeployLambdaConfig): Promise<void> {
    const s3Client = new S3Client({ region, credentials: await resolveAwsCredentials(profile) });
    const lambdaClient = new LambdaClient({ region, credentials: await resolveAwsCredentials(profile) });

    const zip = new AdmZip();
    zip.addLocalFolder(sourcePath);
    const zipBuffer = zip.toBuffer();

    const key = `${functionName}.zip`;
    await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: zipBuffer
    }));

    const envVars: Environment | undefined = environment ? {
        Variables: environment
    } : undefined;

    let functionExists = true;
    let currentConfig: FunctionConfiguration | undefined;

    try {
        const response = await lambdaClient.send(new GetFunctionCommand({
            FunctionName: functionName
        }));
        currentConfig = response.Configuration;
    } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
            functionExists = false;
        } else {
            throw error;
        }
    }

    if (!functionExists) {
        await lambdaClient.send(new CreateFunctionCommand({
            FunctionName: functionName,
            Runtime: runtime,
            Role: roleArn,
            Handler: handler,
            Code: {
                S3Bucket: bucket,
                S3Key: key
            },
            MemorySize: memorySize,
            Environment: envVars
        }));
    } else {
        let updatedEnvVars = envVars;

        await lambdaClient.send(new UpdateFunctionConfigurationCommand({
            FunctionName: functionName,
            Role: roleArn,
            Handler: handler,
            Runtime: runtime,
            MemorySize: memorySize,
            Environment: updatedEnvVars,
        }));

        await new Promise(resolve => setTimeout(resolve, delayMs));

        await lambdaClient.send(new UpdateFunctionCodeCommand({
            FunctionName: functionName,
            S3Bucket: bucket,
            S3Key: key
        }));
    }
}