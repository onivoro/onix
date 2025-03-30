import { ExecutorContext, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { extractProjectBuildOutputs } from '../../functions/extract-project-build-outputs.function';
import { pmxSpawn } from '../../functions/pmx.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { parse, resolve } from 'path';
import { readdir, readFile } from 'fs/promises';
import { toCdnPath } from '../../functions/to-cdn-path.function';
import { createReadStream } from 'fs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { resolveAwsCredentials } from '../../functions/resolve-aws-credentials.function';

const hashDelimiter = '-';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { region, bucket, omitAcl, version, profile } = options;
  const [projectOutput] = extractProjectBuildOutputs(context, context.projectName);

  const app = context.projectName;

  pmxSpawn(context, `nx build ${context.projectName}`);

  const assetRoot = resolve(projectOutput, 'assets');

  const jsAndCssAssets = await getAssetListFromDirectory(assetRoot);

  const indexHtml = await getIndexHtmlContent(projectOutput);

  const fileMappings = jsAndCssAssets.map(original => {
    const {name: nameWithHash, ext } = parse(original);
    const [name, hash] = nameWithHash.split(hashDelimiter);
    const key = `${app}/${version}/${name}${ext}`;
    const modified = toCdnPath(bucket, region, key);

    return {
      original,
      modified,
      key,
      ext,
      contentType: (ext === '.js' ? 'text/javascript' : 'text/css') as any
    };
  });  

  let html = fileMappings.reduce((acc, { modified, original }) => acc.replace(original, modified), indexHtml);

  const ACL = omitAcl ? undefined : 'public-read';

  const s3Client = new S3Client({ region, credentials: resolveAwsCredentials(profile) });

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

});

async function getAssetListFromDirectory(assetDirectory: string): Promise<string[]> {  
  const allAssets = await readdir(assetDirectory);
  const assets = allAssets.filter(a => ['.js', '.css'].includes(parse(a).ext));

  return assets;
}

async function getIndexHtmlContent(projectOutput: string): Promise<string> {
  return await readFile(resolve(projectOutput, 'index.html'), { encoding: 'utf-8' });
}
