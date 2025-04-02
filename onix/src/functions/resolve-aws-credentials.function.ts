import { fromIni } from "@aws-sdk/credential-providers";
import { logger } from "@nx/devkit";

const AWS_ACCESS_KEY_ID = 'AWS_ACCESS_KEY_ID';
const AWS_SECRET_ACCESS_KEY = 'AWS_SECRET_ACCESS_KEY';

export async function resolveAwsCredentials(profile?: string | undefined): Promise<{ accessKeyId: string, secretAccessKey: string }> {
    if (profile) {
        try {
            logger.warn(`attempting to use AWS profile "${profile}" for AWS authentication`);

            const credentialResolver = fromIni({ profile });

            return await credentialResolver();
        } catch (error) {
            logger.warn(`failed to load AWS profile "${profile}"... ensure that ${[AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY].map(_ => `"${_.toLowerCase()}"`).join(' and ')} are lowercase in your ~/.aws/credentials file`);

            if (
                (process.env[AWS_ACCESS_KEY_ID] && process.env[AWS_SECRET_ACCESS_KEY])
            ) {
                logger.log(`using UPPERCASE AWS_* environment variables for AWS authentication`);

                return {
                    accessKeyId: process.env[AWS_ACCESS_KEY_ID],
                    secretAccessKey: process.env[AWS_SECRET_ACCESS_KEY],
                };
            }

            if (
                (process.env[AWS_ACCESS_KEY_ID.toLowerCase()] && process.env[AWS_SECRET_ACCESS_KEY.toLowerCase()])
            ) {
                logger.log(`using lowercase aws_* environment variables for AWS authentication`);

                return {
                    accessKeyId: process.env[AWS_ACCESS_KEY_ID.toLowerCase()],
                    secretAccessKey: process.env[AWS_SECRET_ACCESS_KEY.toLowerCase()],
                };
            }
        }
    }
}