import { EchoExecutorSchema } from './schema';

export default async function runExecutor(options: EchoExecutorSchema) {
  console.log('Executor ran for deployImage', options);
  return {
    success: true,
  };
}
