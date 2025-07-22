import { ExecutorContext } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { loadEnvFile } from '../../functions/load-env-file.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { execSync } from 'child_process';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const {
    envFile,
    host = 'DV_HOST',
    database = 'DV_DB',
    password = 'DV_PASSWORD',
    port = 'DV_PORT',
    username = 'DV_USER',
    type = 'DV_TYPE',
    httpPort
  } = options || {};

  if (envFile) {
    loadEnvFile(envFile);
  }

  execSync(`docker` + ' ' + [
    'run',
    `-p ${httpPort}:${httpPort}`,
    `--env="DV_HOST=${process.env[host]}"`,
    `--env="DV_DB=${process.env[database]}"`,
    `--env="DV_PASSWORD=${process.env[password]}"`,
    `--env="DV_PORT=${process.env[port]}"`,
    `--env="DV_USER=${process.env[username]}"`,
    `--env="DV_TYPE=${process.env[type]}"`,
    `--env="PORT=${httpPort}"`,
    'icedlee337/datavore:arm64v8'
  ].join(' '));

});
