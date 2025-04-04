import { ExecutorContext } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { extractProjectBuildOutputs } from '../../functions/extract-project-build-outputs.function';
import { pmxSpawn } from '../../functions/pmx.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { S3Client } from '@aws-sdk/client-s3';
import { resolveAwsCredentials } from '../../functions/resolve-aws-credentials.function';
import { uploadDirectoryToS3 } from '../../functions/upload-directory-to-s3.function';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { region, bucket, omitAcl, prefix, profile } = options;
  const [projectOutput] = extractProjectBuildOutputs(context, context.projectName);

  pmxSpawn(context, `nx build ${context.projectName}`);

  const ACL = omitAcl ? undefined : 'public-read';

  const s3Client = new S3Client({ region, credentials: await resolveAwsCredentials(profile) });

  await uploadDirectoryToS3({ directoryPath: projectOutput, bucketName: bucket, ACL }, s3Client);
});
