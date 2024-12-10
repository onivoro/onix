import { TargetConfiguration } from "@nx/devkit";
import { TOnixEnvironmentConfig } from "../types/onix-config.type";

export function addDockerTarget(environment: string, config: TOnixEnvironmentConfig, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
    const targetName = `onix-serve-docker-${environment}`;
    const { envPath, envKey, ecr, port } = config;
    const localPort = (Number(port) + 2000);

    if (ecr) {
        targets[targetName] = {
            command: `open http://localhost:${localPort} & docker run -p ${localPort}:${port} --env="PORT=${port}" --env-file "${envPath}" "${ecr}"`,
            options: { cwd: process.cwd() },
            cache: true,
            inputs: [],
            outputs: [],
            metadata: {
                technologies: ['Docker'],
                description: `Runs the docker image locally`,
            },
        };
    }
}