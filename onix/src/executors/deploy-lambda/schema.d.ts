import { DeployLambdaConfig } from "../../functions/deploy-lambda.function";

export interface ExecutorSchema extends Omit<DeployLambdaConfig, 'sourcePath'> { }
