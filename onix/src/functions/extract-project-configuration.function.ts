import { ExecutorContext, logger } from "@nx/devkit";

export function extractProjectConfiguration(context: ExecutorContext, projectName: string) {
    const projectConfiguration = context.projectsConfigurations.projects[projectName];

    if (projectConfiguration) {
        return projectConfiguration;
    } else {
        logger.warn(`cannot locate project configuration for specified projectName "${projectName}" among ${Object.keys(context.projectsConfigurations.projects).map(_ => `"${_}"`).join(', ')}`);
    }
}