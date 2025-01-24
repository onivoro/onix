import { ExecutorContext, logger } from "@nx/devkit";
import { extractProjectConfiguration } from "./extract-project-configuration.function";

export function extractProjectBuildOutputs (context: ExecutorContext, projectName: string) {
    const projectConfiguration = extractProjectConfiguration(context, projectName);

    if (projectConfiguration) {
        if(projectConfiguration.targets?.build) {
            return projectConfiguration.targets.build.options?.outputPath || projectConfiguration.targets.build.outputs || [];
        } else {
            logger.warn(`project "${projectName}" does not have a "build" target`)
        }
    }

    return [];
}