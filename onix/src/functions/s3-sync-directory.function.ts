import { ObjectCannedACL, PutObjectCommand, S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { logger } from '@nx/devkit';
import { readdir, stat, readFile } from 'fs/promises';
import { join, relative, posix } from 'path';
import { getContentType } from './get-content-type.function';

export async function s3SyncDirectory({
  s3Client,
  bucket,
  localDirectory,
  s3Prefix = '',
  ACL,
  emptyDirectory = false
}: {
  s3Client: S3Client,
  bucket: string,
  localDirectory: string,
  s3Prefix?: string,
  ACL?: ObjectCannedACL,
  emptyDirectory?: boolean
}) {
  if (emptyDirectory) {
    logger.info(`Emptying directory s3://${bucket}/${s3Prefix}`);
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: s3Prefix
    });

    let isTruncated = true;
    let continuationToken: string | undefined;

    while (isTruncated) {
      const listResponse = await s3Client.send(listCommand);

      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: listResponse.Contents.map(({ Key }) => ({ Key }))
          }
        });

        await s3Client.send(deleteCommand);
        logger.info(`Deleted ${listResponse.Contents.length} objects`);
      }

      isTruncated = !!listResponse.IsTruncated;
      continuationToken = listResponse.NextContinuationToken;
      if (continuationToken) {
        listCommand.input.ContinuationToken = continuationToken;
      }
    }
  }

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