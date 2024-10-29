import { PromiseExecutor } from '@nx/devkit';
import { XxxxExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<XxxxExecutorSchema> = async (options) => {
  console.log('Executor ran for Xxxx', options);
  return {
    success: true,
  };
};

export default runExecutor;
