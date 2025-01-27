import { TargetConfiguration } from "@nx/devkit";
import { TOnixConfig } from "../types/onix-config.type";
import { addServeTarget } from "../inference/add-serve-target.function";

export function addServeTargets(onixConfig: TOnixConfig, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
  Object.entries(onixConfig.environments || {}).forEach(([environment, config]) => {
    addServeTarget(environment, config, targets, projectJson, namedInputs);
  });
}
