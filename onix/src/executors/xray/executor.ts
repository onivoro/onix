import {
  ExecutorContext,
  workspaceLayout,
  readTargetOptions,
  detectPackageManager,
  getPackageManagerCommand

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
  const packageManagerCommand = getPackageManagerCommand(packageManager);

  await writeFile(`xray-${Date.now()}.json`, JSON.stringify({
    packageManager,
    packageManagerCommand,
    options,
    context,
    workspaceLayout: wl,
    targetOptions: to,
  }, null, 2));
});
