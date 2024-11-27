import {
  ExecutorContext,
  PromiseExecutor,
} from '@nx/devkit';
import { execSync } from 'child_process';
import { ExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  console.log('Running custom serve executor');

  const { envKey, envPath } = options;

  try {
    const inspectStatement = options.port ? `--port=${options.port}` : '';
    const command = `export ${envKey}=${envPath} && npx nx run ${context.projectName}:serve ${inspectStatement}`;
    console.log(command);
    execSync(command, { stdio: 'inherit' });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
}

export default runExecutor;