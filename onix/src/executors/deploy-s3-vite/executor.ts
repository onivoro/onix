import { ExecutorContext, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { extractProjectBuildOutputs } from '../../functions/extract-project-build-outputs.function';
import { pmxSpawn } from '../../functions/pmx.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { parse, resolve } from 'path';
import { toCdnPath } from '../../functions/to-cdn-path.function';
import { createReadStream } from 'fs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { resolveAwsCredentials } from '../../functions/resolve-aws-credentials.function';
import { asS3AppKey } from '../../functions/as-s3-app-key.function';
import { getAssetListFromDirectory } from '../../functions/get-asset-list-from-directory.function';
import { getIndexHtmlContent } from '../../functions/get-index-html-content.function';

const hashDelimiter = '-';
const assetsFolder = 'assets'

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { region, bucket, omitAcl, version, profile } = options;
  const [projectOutput] = extractProjectBuildOutputs(context, context.projectName);

  const app = context.projectName;

  pmxSpawn(context, `nx build ${context.projectName}`);

  const assetRoot = resolve(projectOutput, assetsFolder);

  const jsAndCssAssets = await getAssetListFromDirectory(assetRoot);

  const indexHtml = await getIndexHtmlContent(projectOutput);

  const fileMappings = jsAndCssAssets.map(original => {
    const {name: nameWithHash, ext } = parse(original);
    const [name, hash] = nameWithHash.split(hashDelimiter);
    const key = asS3AppKey({app, version, name, ext});
    const modified = toCdnPath(bucket, region, key);

    return {
      original,
      modified,
      key,
      ext,
      contentType: (ext === '.js' ? 'text/javascript' : 'text/css') as any
    };
  });

  let html = fileMappings.reduce((acc, { modified, original }) => acc.replace(`/${assetsFolder}/${original}`, modified), indexHtml);

  const ACL = omitAcl ? undefined : 'public-read';

  const s3Client = new S3Client({ region, credentials: await resolveAwsCredentials(profile) });

  await Promise.all(fileMappings.map(async ({ contentType, original, key }) =>
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      ContentType: contentType,
      Body: createReadStream(`${assetRoot}/${original}`, 'utf-8'),
      Key: key,
      ACL
    }))
  ));

  logger.log(html);

  await s3Client.send(new PutObjectCommand({
    Bucket: bucket,
    ContentType: 'text/html',
    Body: indexHtml,
    Key: asS3AppKey({ app, version, name: 'index', ext: '.html' }),
    ACL
  }));
});
