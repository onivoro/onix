import { ExecutorContext, PromiseExecutor, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';

const executor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { envPath, ecr, prefix, profile } = options;

  // TODO: THROW IF AWS PROFILE HAS SPECIFIED PROFILE

  try {
    const webProjectName = context.projectName!.replace('api', 'web');
    const apiProjectPath = context.projectName!.split('-').join('/').replace('app', 'apps').replace('appss', 'apps');
    const webProjectPath = apiProjectPath.replace('api', 'web').replace('app', 'apps').replace('appss', 'apps');

    const command = `export OSO_ENV=${envPath} && oso DeployImageAndUi -a ${context.projectName} -t production -p ${profile} -r us-east-2 -e ${ecr} -o ${apiProjectPath} -u ${webProjectName} -d dist/${webProjectPath} -f docker/prod/api/Dockerfile -g asdf && aws ecs update-service --cluster ${prefix}-cluster --service ${prefix}-service --force-new-deployment --profile ${profile} --region us-east-2`;

    logger.info(command);

    execSync(command, { stdio: 'inherit' });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
};

export default executor;
