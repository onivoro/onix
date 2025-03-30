import { fromIni } from "@aws-sdk/credential-providers";
import { logger } from "@nx/devkit";

const AWS_ACCESS_KEY_ID = 'AWS_ACCESS_KEY_ID';
const AWS_SECRET_ACCESS_KEY = 'AWS_SECRET_ACCESS_KEY';

export function resolveAwsCredentials(profile?: string | undefined) {
    if (profile) {
        logger.warn(`using profile "${profile}"... ensure that ${[AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY].map(_ => `"${_.toLowerCase()}"`).join(' and ')} are lowercase in your ~/.aws/credentials file`);

        return fromIni({ profile });
    }

    if (
        (process.env[AWS_ACCESS_KEY_ID] && process.env[AWS_SECRET_ACCESS_KEY])
        ||
        (process.env[AWS_ACCESS_KEY_ID.toLowerCase()] && process.env[AWS_SECRET_ACCESS_KEY.toLowerCase()])
    ) {
        return undefined;
    }
}