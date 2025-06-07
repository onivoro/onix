import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { homedir } from 'os';
import { dirname } from 'path';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { resolveAwsCredentials } from './resolve-aws-credentials.function';

// the "key" is the s3 file path which may contain "s3://" or not
// the "value", which is the local file path, may contain "~" which should resolved to the home directory
export type TCopyFromS3Config = {profile: string, files: Record<string, string>};


export async function copyFromS3(config: TCopyFromS3Config) {
  const s3Client = new S3Client({ credentials: await resolveAwsCredentials(config.profile)});

  const promises = Object.entries(config.files).map(async ([s3Path, localPath]) => {
    try {
      // Normalize S3 path - remove s3:// prefix if present and split bucket/key
      const cleanS3Path = s3Path.replace(/^s3:\/\//, '');
      const [bucket, ...keyParts] = cleanS3Path.split('/');
      const key = keyParts.join('/');

      if (!bucket || !key) {
        throw new Error(`Invalid S3 path: ${s3Path}. Expected format: s3://bucket/key or bucket/key`);
      }

      // Resolve local path - replace ~ with home directory
      const resolvedLocalPath = localPath.startsWith('~')
        ? localPath.replace('~', homedir())
        : localPath;

      // Ensure the local directory exists
      const localDir = dirname(resolvedLocalPath);
      if (!existsSync(localDir)) {
        mkdirSync(localDir, { recursive: true });
      }

      // Get object from S3
      console.log(`Copying s3://${bucket}/${key} to ${resolvedLocalPath}...`);

      const getObjectCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await s3Client.send(getObjectCommand);

      if (!response.Body) {
        throw new Error(`No body in S3 response for ${s3Path}`);
      }

      // Stream the file to local disk
      const writeStream = createWriteStream(resolvedLocalPath);
      await pipeline(response.Body as NodeJS.ReadableStream, writeStream);

      console.log(`✓ Successfully copied s3://${bucket}/${key} to ${resolvedLocalPath}`);

    } catch (error) {
      console.error(`✗ Failed to copy ${s3Path} to ${localPath}:`, error);
      throw error;
    }
  });

  return await Promise.all(promises);
}