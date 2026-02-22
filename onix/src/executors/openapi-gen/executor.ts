import { execSync } from 'child_process';
import { executorFactory } from '../../functions/executor-factory.function';
import { ExecutorSchema } from './schema';

const DEFAULT_OPENAPI_GENERATOR_VERSION = 'v6.3.0';

export default executorFactory(async ({ flavor = 'typescript-axios', version = DEFAULT_OPENAPI_GENERATOR_VERSION, additionalProperties, openapiJsonPath, outputPath }: ExecutorSchema) => {
  execSync(`rm -rf ${outputPath}`, { stdio: 'inherit' });
  execSync(`mkdir -p ${outputPath}`, { stdio: 'inherit' });
  const additionalPropertiesArg = additionalProperties
    ? ` --additional-properties ${additionalProperties}`
    : '';

  execSync(`docker run --rm -v .:/local openapitools/openapi-generator-cli:${version} generate -i local/${openapiJsonPath} -g ${flavor} -o local/${outputPath}${additionalPropertiesArg}`, { stdio: 'inherit' });
});
