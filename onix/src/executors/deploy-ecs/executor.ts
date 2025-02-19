import { ExecutorContext, PromiseExecutor, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { pushImageToECRWrapped } from '../../functions/push-image-to-ecr-wrapped.function';
import { extractProjectBuildOutputs } from '../../functions/extract-project-build-outputs.function';
import { extractProjectBuildAssets } from '../../functions/extract-project-build-assets.function';
import { join } from 'path';
import { extractProjectConfiguration } from '../../functions/extract-project-configuration.function';
import { updateEcsService } from '../../functions/restart-ecs-service.function';
import { pmxSpawn } from '../../functions/pmx.function';

const stdio = 'inherit';
const uiAssetFolderName = 'ui';

const executor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { ecr, profile, dockerfile, ui, region, cluster, service } = options;

  pmxSpawn(context, `nx build ${context.projectName}`);

  try {
    const [apiProjectAssetPath] = extractProjectBuildAssets(context, context.projectName);
    const [apiProjectOutput] = extractProjectBuildOutputs(context, context.projectName);

    if (ui) {
      if (apiProjectAssetPath) {
        const [webProjectOutputs] = extractProjectBuildOutputs(context, ui);

        if (webProjectOutputs?.length) {
          pmxSpawn(context, `nx build ${ui}`);

          const projectConfiguration = extractProjectConfiguration(context, context.projectName);

          const [projectDist] = apiProjectOutput.split(projectConfiguration.root);
          const [__, projectAssetsPath] = apiProjectAssetPath.split(projectConfiguration.sourceRoot);

          const projectDistAssetPathForUi = join(projectDist, projectConfiguration.root, projectAssetsPath, uiAssetFolderName);

          [webProjectOutputs].forEach(output => {
            execSync(`cp -R ${output} ${projectDistAssetPathForUi}`);
          });

        } else {
          logger.warn(`unable to locate target "build" outputs within project configuration for specified webProjectName "${ui}"`);
        }
      } else {
        logger.warn(`unable to locate target "build" asset path (expecting targets.build.options.assets -> ["things/and/stuff"]) within project configuration for project "${context.projectName}"`);
      }
    }

    const [projectOutput] = extractProjectBuildOutputs(context, context.projectName);

    logger.warn({ projectOutput });

    const dockerCommand = `docker build --build-arg="APP_DIST=${projectOutput}" -f ${dockerfile} -t ${ecr} .`;

    logger.warn({ dockerCommand });

    try {
      execSync(dockerCommand, { stdio });
    } catch (error) {
      logger.error({ error, detail: 'docker build failed' });
      throw error;
    }

    try {
      await pushImageToECRWrapped({ ecr, profile });
    } catch (error) {
      logger.error({ error, detail: 'docker push failed' });
      throw error;
    }

    if (region && cluster && service) {
      try {
        await updateEcsService({ profile, region, cluster, service });
      } catch (error) {
        logger.error({ error, detail: 'ECS service update failed' });
        throw error;
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    logger.error(error?.message);
    logger.error({ error });
    return {
      success: false,
    };
  }
};

export default executor;
