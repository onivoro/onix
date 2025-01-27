import { fromIni } from "@aws-sdk/credential-providers";

const AWS_ACCESS_KEY_ID = 'AWS_ACCESS_KEY_ID';
const AWS_SECRET_ACCESS_KEY = 'AWS_SECRET_ACCESS_KEY';

export function resolveAwsCredentials(profile?: string | undefined) {
    if (
        (process.env[AWS_ACCESS_KEY_ID] && process.env[AWS_SECRET_ACCESS_KEY])
        ||
        (process.env[AWS_ACCESS_KEY_ID.toLowerCase()] && process.env[AWS_SECRET_ACCESS_KEY.toLowerCase()])
    ) {
        return undefined;
    }

    return profile ? fromIni({ profile }) : undefined;
}