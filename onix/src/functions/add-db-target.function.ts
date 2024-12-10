import { TargetConfiguration } from "@nx/devkit";
import { TOnixEnvironmentConfig } from "../types/onix-config.type";
import { buildTargetName } from "../constants/build-target-name.constant";

export function addDbTarget(environment: string, config: TOnixEnvironmentConfig, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
  const { envKey, envPath, ormConfigPath } = config;

  if (ormConfigPath) {
    ['run', 'revert'].forEach(runOrRevert => {
      const targetName = `onix-db-${(runOrRevert === 'run') ? 'migrate' : runOrRevert}-${environment}`;

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
        metadata: {
          technologies: ['TypeORM, ts-node', 'npm'],
          description: `Runs the docker image locally`,
        },
      };
    });
  }
}