import { TargetConfiguration } from "@nx/devkit";
import { TOnixConfig } from "../types/onix-config.type";
import { addDbTarget } from "./add-db-target.function";

export function addDbTargets(onixConfig: TOnixConfig, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
    Object.entries(onixConfig.environments || {}).forEach(([environment, config]) => {
        addDbTarget(environment, config, targets, projectJson, namedInputs);
    });
}