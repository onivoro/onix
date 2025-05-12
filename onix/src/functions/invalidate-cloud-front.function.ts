import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { logger } from "@nx/devkit";

export async function invalidateCloudFront(cloudfront: CloudFrontClient, distributionId: string, paths: string[] = ['/*']) {
    const command = new CreateInvalidationCommand({
        DistributionId: distributionId,
        InvalidationBatch: {
            CallerReference: `${Date.now()}`,
            Paths: {
                Quantity: paths.length,
                Items: paths
            }
        }
    });

    logger.info(`Invalidating CloudFront distribution ${distributionId} for paths: ${paths.join(', ')}`);

    return await cloudfront.send(command);
}