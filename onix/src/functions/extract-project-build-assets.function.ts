import { ExecutorContext, logger } from "@nx/devkit";
import { extractProjectConfiguration } from "./extract-project-configuration.function";

export function extractProjectBuildAssets (context: ExecutorContext, projectName: string) {
    const projectConfiguration = extractProjectConfiguration(context, projectName);

    if (projectConfiguration) {
        if(projectConfiguration.targets?.build) {
            return projectConfiguration.targets.build.options?.assets || [];
        } else {
            logger.warn(`project "${projectName}" does not have a "build" target`)
        }
    }

    return [];
}