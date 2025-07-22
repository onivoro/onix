import { ExecutorContext } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { loadEnvFile } from '../../functions/load-env-file.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { execSync } from 'child_process';
import { arch } from 'os';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const {
    envFile,
    host,
    db,
    password,
    port,
    user,
    type,
    httpPort
  } = options || {};

  if (envFile) {
    loadEnvFile(envFile);
  }

  const http = env(httpPort);

  execSync(`docker` + ' ' + [
    'run',
    `-p ${http}:${http}`,
    `--env="DV_HOST=${env(host)}"`,
    `--env="DV_DB=${env(db)}"`,
    `--env="DV_PASSWORD=${env(password)}"`,
    `--env="DV_PORT=${env(port)}"`,
    `--env="DV_USER=${env(user)}"`,
    `--env="DV_TYPE=${env(type)}"`,
    `--env="PORT=${http}"`,
    `icedlee337/datavore:${(arch() === 'arm64') ? 'arm64v8' : 'amd64'}`
  ].join(' '));

});

function env(value: string) {
  if(!value) {
    return value;
  }

  if(value.toString().includes('process.env')) {
    return eval(value);
  }
}
