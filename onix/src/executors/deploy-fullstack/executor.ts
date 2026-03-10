import { ExecutorContext, PromiseExecutor, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { extractProjectBuildOutputs } from '../../functions/extract-project-build-outputs.function';
import { extractProjectBuildAssets } from '../../functions/extract-project-build-assets.function';
import { extractProjectConfiguration } from '../../functions/extract-project-configuration.function';
import { pmxSpawn } from '../../functions/pmx.function';

const uiAssetFolderName = 'ui';

const executor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { ui, dryRun, tag = 'latest', access = 'public' } = options;
  const serverProject = context.projectName;

  try {
    // Step 1: Build the server project (browser build runs first via dependsOn)
    logger.info(`Building ${serverProject}...`);
    pmxSpawn(context, `nx build ${serverProject}`, { NODE_ENV: 'production' });

    // Step 2: Extract paths from project configurations
    const [serverAssetPath] = extractProjectBuildAssets(context, serverProject);
    const [serverOutput] = extractProjectBuildOutputs(context, serverProject);

    if (!serverOutput) {
      throw new Error(`Could not determine build output path for "${serverProject}". Ensure targets.build.options.outputPath is configured.`);
    }

    // Step 3: Build UI and copy into server assets
    if (!serverAssetPath) {
      throw new Error(`Could not determine asset path for "${serverProject}". Ensure targets.build.options.assets is configured (e.g. ["./src/assets"]).`);
    }

    const [uiOutput] = extractProjectBuildOutputs(context, ui);

    if (!uiOutput) {
      throw new Error(`Could not determine build output path for UI project "${ui}". Ensure it has a build target with outputPath configured.`);
    }

    // Build the UI project explicitly (may already be built via dependsOn, but ensure it)
    logger.info(`Building UI project ${ui}...`);
    pmxSpawn(context, `nx build ${ui}`, { NODE_ENV: 'production' });

    if (!existsSync(uiOutput)) {
      throw new Error(`UI build output directory does not exist: ${uiOutput}. The UI build may have failed.`);
    }

    // Compute destination path: {serverDist}/assets/ui/
    const serverConfig = extractProjectConfiguration(context, serverProject);
    const [distPrefix] = serverOutput.split(serverConfig.root);
    const [, assetsRelativePath] = serverAssetPath.split(serverConfig.sourceRoot);
    const uiDestination = join(distPrefix, serverConfig.root, assetsRelativePath, uiAssetFolderName);

    logger.info(`Copying UI build from ${uiOutput} to ${uiDestination}`);
    execSync(`cp -R ${uiOutput} ${uiDestination}`, { stdio: 'inherit' });

    // Verify the copy succeeded
    const indexHtml = join(uiDestination, 'index.html');
    if (!existsSync(indexHtml)) {
      throw new Error(`UI asset copy verification failed: ${indexHtml} not found.`);
    }

    logger.info(`UI assets embedded successfully.`);

    // Step 4: Publish to npm
    if (dryRun) {
      logger.info(`Dry run mode — skipping npm publish. Package is ready at: ${serverOutput}`);
    } else {
      const publishCmd = `npm publish ${serverOutput} --access ${access} --tag ${tag}`;
      logger.info(`Publishing: ${publishCmd}`);
      execSync(publishCmd, { stdio: 'inherit' });
      logger.info(`Published successfully.`);
    }

    return { success: true };
  } catch (error) {
    logger.error(error?.message || error);
    return { success: false };
  }
};

export default executor;
