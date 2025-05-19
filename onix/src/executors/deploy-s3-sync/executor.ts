import { ExecutorContext, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { extractProjectBuildOutputs } from '../../functions/extract-project-build-outputs.function';
import { pmxSpawn } from '../../functions/pmx.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { resolve } from 'path';
import { S3Client } from '@aws-sdk/client-s3';
import { resolveAwsCredentials } from '../../functions/resolve-aws-credentials.function';
import { s3SyncDirectory } from '../../functions/s3-sync-directory.function';
import { CloudFrontClient } from '@aws-sdk/client-cloudfront'
import { invalidateCloudFront } from '../../functions/invalidate-cloud-front.function';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { region, bucket, omitAcl, profile, localDirectory = '', cloudFrontId, cloudFrontRegion, env } = options;
  const [projectOutput] = extractProjectBuildOutputs(context, context.projectName);

  const app = context.projectName;

  pmxSpawn(context, `nx build ${app}`, env);

  const resolvedLocalDirectory = resolve(projectOutput, localDirectory);

  const ACL = omitAcl ? undefined : 'public-read';

  const s3Client = new S3Client({ region, credentials: await resolveAwsCredentials(profile) });

  await s3SyncDirectory({ s3Client, bucket, localDirectory: resolvedLocalDirectory, ACL });

  if (cloudFrontId) {
    const cloudfrontClient = new CloudFrontClient({ region: cloudFrontRegion || 'us-east-1', credentials: await resolveAwsCredentials(profile) });
    await invalidateCloudFront(cloudfrontClient, cloudFrontId);
    logger.info(`Invalidated CloudFront distribution ${cloudFrontId}`);
  }
});

