import {
  ExecutorContext, PromiseExecutor, runExecutor,
  getProjects, getOutputsForTargetAndConfiguration, getWorkspaceLayout, readProjectConfiguration,
  workspaceLayout,
  readTargetOptions,
  detectPackageManager,

} from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { writeFile } from 'fs/promises';

const executor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  try {
    const wl = workspaceLayout();
    const to = readTargetOptions({ project: context.projectName, target: context.targetName }, context);
    const packageManager = detectPackageManager(context.root);

    await writeFile(`lee-${Date.now()}.json`, JSON.stringify({
      options,
      context,
      workspaceLayout: wl,
      packageManager,
      targetOptions: to,
    }, null, 2));

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
