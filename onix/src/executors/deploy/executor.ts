import { ExecutorContext, PromiseExecutor, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { pushImageToECRWrapped } from '../../functions/push-image-to-ecr-wrapped.function';
import { extractProjectBuildOutputs } from '../../functions/extract-project-build-outputs.function';
import { extractProjectBuildAssets } from '../../functions/extract-project-build-assets.function';

const stdio = 'inherit';

const executor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { ecr, profile, dockerfile, ui } = options;

  try {
    const [apiProjectAssetPath] = extractProjectBuildAssets(context, context.projectName);

    execSync(`npx nx build ${context.projectName}`, { stdio });

    if (ui) {
      if (apiProjectAssetPath) {
        const webProjectOutputs = extractProjectBuildOutputs(context, ui);

        if (webProjectOutputs?.length) {
          execSync(`npx nx build ${ui}`, { stdio });

          webProjectOutputs.forEach(element => {
            execSync(`cp -R ${element} ${apiProjectAssetPath}`, { stdio });
          });
        } else {
          logger.warn(`unable to locate target "build" outputs within project configuration for specified webProjectName "${ui}"`);
        }
      } else {
        logger.warn(`unable to locate target "build" asset path (expecting targets.build.options.assets -> ["things/and/stuff"]) within project configuration for project "${context.projectName}"`);
      }
    }
    const [projectOutput] = extractProjectBuildOutputs(context, context.projectName);

    logger.debug({projectOutput});

    const dockerCommand = `docker build --build-arg="APP_DIST=${projectOutput}" -f ${dockerfile} -t ${ecr} .`;

    logger.debug({dockerCommand});

    try {
      execSync(dockerCommand, { stdio });
    } catch (error) {
      logger.error({error, detail: 'docker build failed'});
    }

    await pushImageToECRWrapped({ ecr, profile });

    // restart cluster service by converting this to use '@aws-sdk' instead of cli as shown =>>>>> aws ecs update-service --cluster ${prefix}-cluster --service ${prefix}-service --force-new-deployment --profile ${profile} --region us-east-2`;

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
