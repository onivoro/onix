import { ExecutorContext, logger } from "@nx/devkit";
import { extractProjectConfiguration } from "./extract-project-configuration.function";
import { interpolate } from "./interpolate.function";

export function extractProjectBuildOutputs(context: ExecutorContext, projectName: string): string[] {
    const projectConfiguration = extractProjectConfiguration(context, projectName);

    if (projectConfiguration) {
        if (projectConfiguration?.targets?.build) {
            const output = projectConfiguration.targets.build.options?.outputPath || projectConfiguration.targets.build.outputs || [];

            return (output instanceof Array ? output : [output]).map((_: string) => interpolate(context, _));
        } else {
            logger.warn(`project "${projectName}" does not have a "build" target`)
        }
    }

    return [];
}