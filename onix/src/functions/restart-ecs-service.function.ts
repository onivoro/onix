import { ECSClient, UpdateServiceCommand, UpdateServiceCommandInput } from "@aws-sdk/client-ecs";
import { fromIni } from "@aws-sdk/credential-provider-ini";
import { logger } from "@nx/devkit";

export async function updateEcsService(_: { profile: string, cluster: string, service: string, region: string }) {
    const { profile, cluster, service, region } = _;

    try {
        const client = new ECSClient({
            region,
            credentials: profile ? fromIni({ profile }) : undefined
        });

        const response = await client.send(new UpdateServiceCommand({
            cluster,
            service,
            forceNewDeployment: true
        }));

        logger.info("Service update initiated successfully");

        if (response.service?.serviceArn) {
            logger.info(`Service ARN: "${response.service.serviceArn}"`);
        }

        return response;
    } catch (error) {
        logger.error(`Error updating ECS service: ${error?.message || error}`);

        throw error;
    }
}
