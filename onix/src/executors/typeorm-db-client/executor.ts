import { ExecutorContext } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { loadEnvFile } from '../../functions/load-env-file.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { interpolateEnvironmentExpression } from '../../functions/interpolate-environment-expression.function';
import { pmxSpawn } from '../../functions/pmx.function';

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

  const env = {
    DV_HOST: interpolateEnvironmentExpression(literalHost),
    DV_DB: interpolateEnvironmentExpression(db),
    DV_PASSWORD: interpolateEnvironmentExpression(password),
    DV_PORT: interpolateEnvironmentExpression(port),
    DV_USER: interpolateEnvironmentExpression(user),
    DV_TYPE: interpolateEnvironmentExpression(type),
    PORT: http,
  };

  Object.entries(env)
    .forEach(([key, value]) => {
      process.env[key] = value;
    });

  pmxSpawn(context, '--yes @onivoro/app-server-datavore@latest', env);
});