import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { LambdaClient, UpdateFunctionCodeCommand, GetFunctionCommand } from "@aws-sdk/client-lambda";
import * as AdmZip from 'adm-zip';
import { resolveAwsCredentials } from "./resolve-aws-credentials.function";

export interface IDeployLambdaConfig {
    functionName: string;
    sourcePath: string;
    region: string;
    bucket: string;
    profile?: string | undefined;
}

export async function deployLambda({
    functionName,
    sourcePath,
    region,
    bucket,
    profile
}: IDeployLambdaConfig): Promise<void> {
    const s3Client = new S3Client({ region });
    const lambdaClient = new LambdaClient({ region, credentials: resolveAwsCredentials(profile) });

    const zip = new AdmZip();
    zip.addLocalFolder(sourcePath);
    const zipBuffer = zip.toBuffer();

    const Key = `${functionName}-${Date.now()}.zip`;
    await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key,
        Body: zipBuffer
    }));

    try {
        await lambdaClient.send(new GetFunctionCommand({
            FunctionName: functionName
        }));

        await lambdaClient.send(new UpdateFunctionCodeCommand({
            FunctionName: functionName,
            S3Bucket: bucket,
            S3Key: Key
        }));
    } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
            throw new Error(`Lambda function ${functionName} does not exist. Please create it first.`);
        }
        throw error;
    }
}