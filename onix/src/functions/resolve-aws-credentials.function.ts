import { fromIni } from "@aws-sdk/credential-providers";
import { logger } from "@nx/devkit";

const AWS_ACCESS_KEY_ID = 'AWS_ACCESS_KEY_ID';
const AWS_SECRET_ACCESS_KEY = 'AWS_SECRET_ACCESS_KEY';

export function resolveAwsCredentials(profile?: string | undefined) {
    if (profile) {
        try {
            logger.warn(`using AWS profile "${profile}"`);

            const resolved = fromIni({ profile });

            if (resolved) {
                return resolved;
            }
        } catch (error) {
            logger.warn(`failed to load AWS profile "${profile}"... ensure that ${[AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY].map(_ => `"${_.toLowerCase()}"`).join(' and ')} are lowercase in your ~/.aws/credentials file`);
        }
    }

    if (
        (process.env[AWS_ACCESS_KEY_ID] && process.env[AWS_SECRET_ACCESS_KEY])
        ||
        (process.env[AWS_ACCESS_KEY_ID.toLowerCase()] && process.env[AWS_SECRET_ACCESS_KEY.toLowerCase()])
    ) {
        return undefined;
    }
}