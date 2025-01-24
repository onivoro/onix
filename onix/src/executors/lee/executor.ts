import {
  ExecutorContext, PromiseExecutor, runExecutor,
  getProjects, getOutputsForTargetAndConfiguration, getWorkspaceLayout, readProjectConfiguration,
  workspaceLayout,
  readTargetOptions,

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

    await writeFile(`lee-${Date.now()}`, JSON.stringify({
      options,
      context,
      workspaceLayout: wl,
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
