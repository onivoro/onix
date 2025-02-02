import {
  ExecutorContext,
  workspaceLayout,
  readTargetOptions,
  detectPackageManager,

} from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { writeFile } from 'fs/promises';
import { executorFactory } from '../../functions/executor-factory.function';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const wl = workspaceLayout();
  const to = readTargetOptions({ project: context.projectName, target: context.targetName }, context);
  const packageManager = detectPackageManager(context.root);

  await writeFile(`xray-${Date.now()}.json`, JSON.stringify({
    options,
    context,
    workspaceLayout: wl,
    packageManager,
    targetOptions: to,
  }, null, 2));
});
