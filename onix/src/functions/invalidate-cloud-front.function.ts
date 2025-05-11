import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";

export async function invalidateCloudFront(cloudfront: CloudFrontClient, distributionId: string, paths: string[] = ['*']) {
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

    return await cloudfront.send(command);
}