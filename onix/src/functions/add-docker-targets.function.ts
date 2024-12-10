import { TargetConfiguration } from "@nx/devkit";
import { TOnixConfig } from "../types/onix-config.type";
import { addDockerTarget } from "./add-docker-target.function";

export function addDockerTargets(onixConfig: TOnixConfig, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
    Object.entries(onixConfig.environments || {}).forEach(([environment, config]) => {
      addDockerTarget(environment, config, targets, projectJson, namedInputs);
    });
  }