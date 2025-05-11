import { ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { logger } from '@nx/devkit';
import { readdir, stat, readFile } from 'fs/promises';
import { join, relative, posix } from 'path';
import { getContentType } from './get-content-type.function';

export async function s3SyncDirectory({
  s3Client,
  bucket,
  localDirectory,
  s3Prefix = '',
  ACL
}: {
  s3Client: S3Client,
  bucket: string,
  localDirectory: string,
  s3Prefix?: string,
  ACL?: ObjectCannedACL
}) {
  async function walk(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map(async entry => {
      const res = join(dir, entry.name);
      return entry.isDirectory() ? await walk(res) : res;
    }));
    return files.flat();
  }

  const files = await walk(localDirectory);

  for (const filePath of files) {
    const fileContent = await readFile(filePath);
    const key = posix.join(
      s3Prefix,
      relative(localDirectory, filePath).split('\\').join('/')
    );
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileContent,
      ACL,
      ContentType: getContentType(filePath)
    }));

    logger.info(`Uploaded ${filePath} to s3://${bucket}/${key}`);
  }
}