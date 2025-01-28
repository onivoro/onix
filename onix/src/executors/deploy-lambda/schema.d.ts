import { DeployLambdaConfig } from "onix/src/functions/deploy-lambda.function";

export interface ExecutorSchema extends Omit<DeployLambdaConfig, 'sourcePath'> { }
