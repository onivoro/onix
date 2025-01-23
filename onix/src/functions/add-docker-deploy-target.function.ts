import { TargetConfiguration } from "@nx/devkit";
import { TOnixEnvironmentConfig } from "../types/onix-config.type";

export function addDockerDeployTarget(environment: string, config: TOnixEnvironmentConfig, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
    const targetName = `onix-deploy-docker-${environment}`;
    const { envPath, envKey, ecr, port, dockerfilePath } = config;
    const localPort = (Number(port) + 2000);

    const command = `docker build -t ${ecr} -f ${dockerfilePath} . && docker push ${ecr}`;

    if (ecr && dockerfilePath) {
        targets[targetName] = {
            command: ``,
            options: { cwd: process.cwd() },
            cache: true,
            inputs: [],
            outputs: [],
            metadata: {
                technologies: ['Docker'],
                description: `Builds the docker image locally and deploys it to the registry`,
            },
        };
    }
}