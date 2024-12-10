import { TargetConfiguration } from "@nx/devkit";
import { TOnixEnvironmentConfig } from "../types/onix-config.type";

export function addDbTargets(environment: string, config: TOnixEnvironmentConfig, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
    const buildTargetName = `build`;
    const targetName = `onix-serve-${environment}`;
    const { envPath, envKey } = config;
    targets[targetName] = {
      command: `export ${envKey}=${envPath} && npx nx run ${projectJson.name}:serve`,
      options: { cwd: process.cwd() },
      cache: true,
      dependsOn: [`^${buildTargetName}`],
      inputs: [
        ...('production' in namedInputs
          ? ['production', '^production']
          : ['default', '^default']),
        {
          externalDependencies: [],
        },
      ],
      outputs: [],
      metadata: {
        technologies: ['NodeJS, Nx'],
        description: `Invokes Nx serve with config-specified environment`,
      },
    };
  }