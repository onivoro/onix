import { PromiseExecutor } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';

const runExecutor: PromiseExecutor<ExecutorSchema> = async ({ moniker }) => {
  try {
    execSync(`rm -rf libs/axios/${moniker}/src/lib`, { stdio: 'inherit' });
    execSync(`mkdir -p libs/axios/${moniker}`, { stdio: 'inherit' });
    execSync(`docker run --rm -v .:/local openapitools/openapi-generator-cli:v6.3.0 generate -i local/api-dox/app-api-${moniker}.json -g typescript-axios -o local/libs/axios/${moniker}/src/lib`, { stdio: 'inherit' });

    return {
      success: true,
    };
  } catch (error) {
    return { success: false };
  }
};

export default runExecutor;
