import { ExecutorContext } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { loadEnvFile } from '../../functions/load-env-file.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { execSync } from 'child_process';
import { arch } from 'os';
import { interpolateEnvironmentExpression } from '../../functions/interpolate-environment-expression.function';

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

  const http = interpolateEnvironmentExpression(httpPort);
  const literalHost = interpolateEnvironmentExpression(host);
  const resolvedHost = ['localhost', '127.0.0.1'].includes(literalHost) ? 'host.docker.internal' : literalHost;

  execSync(`docker` + ' ' + [
    'run',
    `-p ${http}:${http}`,
    `--env="DV_HOST=${interpolateEnvironmentExpression(resolvedHost)}"`,
    `--env="DV_DB=${interpolateEnvironmentExpression(db)}"`,
    `--env="DV_PASSWORD=${interpolateEnvironmentExpression(password)}"`,
    `--env="DV_PORT=${interpolateEnvironmentExpression(port)}"`,
    `--env="DV_USER=${interpolateEnvironmentExpression(user)}"`,
    `--env="DV_TYPE=${interpolateEnvironmentExpression(type)}"`,
    `--env="PORT=${http}"`,
    `icedlee337/datavore:${(arch() === 'arm64') ? 'arm64v8' : 'amd64'}`
  ].join(' '));

});