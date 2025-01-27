import { TargetConfiguration } from "@nx/devkit";
import { TOnixConfig } from "../types/onix-config.type";
import { addDockerDeployTarget } from "./add-docker-deploy-target.function";

export function addDockerDeployTargets(onixConfig: TOnixConfig, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
    Object.entries(onixConfig.environments || {}).forEach(([environment, config]) => {
      addDockerDeployTarget(environment, config, targets, projectJson, namedInputs);
    });
  }