import { ExecutorContext, logger, PromiseExecutor } from "@nx/devkit";

export type TOnixPromiseExecutor<TExecutorSchema = any> = (
    options: TExecutorSchema, context: ExecutorContext) => Promise<void | {
        success: boolean;
    }>;

export function executorFactory<TExecutorSchema>(executor: TOnixPromiseExecutor<TExecutorSchema>): PromiseExecutor<TExecutorSchema> {

    const runExecutor: PromiseExecutor<TExecutorSchema> = async (
        options: TExecutorSchema,
        context: ExecutorContext
    ) => {
        try {
            return (await executor(options, context)) || { success: true };
        } catch (error) {
            logger.error(error?.message || error);

            return {
                success: false,
            };
        }
    }

    return runExecutor;
}