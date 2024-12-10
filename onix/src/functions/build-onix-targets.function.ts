import { CreateNodesContext, joinPathFragments, logger, parseJson, TargetConfiguration } from "@nx/devkit";
import { TOnixPluginOptions } from "../types/onix-plugin-options.type";
import { TOnixTargets } from "../types/onix-targets.type";
import { readFileSync } from "fs";
import { TOnixConfig } from "../types/onix-config.type";
import { getNamedInputs } from '@nx/devkit/src/utils/get-named-inputs';
import { join } from "path";
import { addServeTargets } from "./add-serve-targets.function";
import { addDockerTargets } from "./add-docker-targets.function";
import { addDbTargets } from "./add-db-targets.function";

export async function buildOnixTargets(
    configFilePath: string,
    projectRoot: string,
    options: TOnixPluginOptions,
    context: CreateNodesContext
): Promise<TOnixTargets> {
    const absoluteConfigFilePath = joinPathFragments(
        context.workspaceRoot,
        configFilePath
    );

    const projectJsonPath = join(context.workspaceRoot, projectRoot, 'project.json');
    const projectJson = parseJson(readFileSync(projectJsonPath, 'utf-8'));

    const targets: Record<string, TargetConfiguration> = {};

    logger.warn(absoluteConfigFilePath);

    const onixConfig: TOnixConfig = require(absoluteConfigFilePath);

    logger.warn(onixConfig);

    const namedInputs = getNamedInputs(projectRoot, context);

    addServeTargets(onixConfig, targets, projectJson, namedInputs);
    addDockerTargets(onixConfig, targets, projectJson, namedInputs);
    addDbTargets(onixConfig, targets, projectJson, namedInputs);

    const metadata = {};
    return { targets, metadata };
}
