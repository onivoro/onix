import { TargetConfiguration } from "@nx/devkit";
import { TOnixEnvironmentConfig } from "../types/onix-config.type";

export function addDbTarget(targetName: string, config: TOnixEnvironmentConfig, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
  const buildTargetName = `build`;
  const { envPath, envKey, ormConfigPath } = config;
  const runOrRevert = 'figure this outt!!!!!!!!!!!!!!!!!!!!!!!!'

  if (ormConfigPath) {
    targets[targetName] = {
      command: `export ${envKey}=${envPath} && npm run typeorm -- -d ${ormConfigPath} migration:${runOrRevert} -t=false`,
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
        technologies: ['NodeJS, Nx', 'TypeORM'],
        description: `Invokes typeorm with config-specified environment`,
      },
    };
  }
}