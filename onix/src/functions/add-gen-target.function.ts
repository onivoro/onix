import { TargetConfiguration } from "@nx/devkit";
import { TOnixConfig } from "../types/onix-config.type";
import { buildTargetName } from "../constants/build-target-name.constant";

export function addGenTarget(onixConfig: TOnixConfig, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
    const { apiClientPath, apiDoxPath } = onixConfig;

    if (apiClientPath && apiDoxPath) {
        const targetName = `onix-generate-axios`;

        const command = `rm -rf ${apiClientPath}/src/lib && mkdir -p ${apiClientPath}/src/lib && docker run --rm -v .:/local openapitools/openapi-generator-cli:v6.3.0 generate -i local/${apiDoxPath} -g typescript-axios -o local/${apiClientPath}`;

        targets[targetName] = {
          command,
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
            technologies: ['openapi', 'docker'],
            description: `Generates the openapi client`,
          },
        };
    }
}