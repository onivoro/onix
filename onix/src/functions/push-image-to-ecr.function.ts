import { ECRClient, GetAuthorizationTokenCommand, ECRClientConfig } from '@aws-sdk/client-ecr';
import { logger } from '@nx/devkit';
import { execSync } from 'child_process';
import { resolveAwsCredentials } from './resolve-aws-credentials.function';

export interface PushImageConfig {
  region: string;
  ecr: string;
  registryId: string;
  profile: string;
}

export async function pushImageToECR({
  region,
  ecr,
  registryId,
  profile
}: PushImageConfig): Promise<void> {
  try {
    const config: ECRClientConfig = { region, credentials: await resolveAwsCredentials(profile) };
    const ecrClient = new ECRClient(config);

    const authCommand = new GetAuthorizationTokenCommand({
      registryIds: registryId ? [registryId] : undefined
    });

    const authResponse = await ecrClient.send(authCommand);

    if (!authResponse.authorizationData?.[0]?.authorizationToken) {
      throw new Error('Failed to get authorization token');
    }

    let username: string;
    let password: string;
    let registryEndpoint: string;

    try {
      const authToken = Buffer.from(
        authResponse.authorizationData[0].authorizationToken,
        'base64'
      ).toString('utf-8');
      const [u, p] = authToken.split(':');

      username = u;
      password = p;

      registryEndpoint = authResponse.authorizationData[0].proxyEndpoint;

      if (!registryEndpoint) {
        throw new Error('Failed to get registry endpoint and auth credentials');
      }
    } catch (error) {
      logger.error('Failed to get registry endpoint and auth credentials');
      throw error;
    }

    try {
      execSync('docker login ' +
        `-u ${username} ` +
        `-p ${password} ` +
        registryEndpoint,
        { stdio: 'inherit' }
      );
    } catch (error) {
      throw new Error(`Docker login failed with username "${username}"`);
    }

    const pushCommand = `docker push ${ecr}`;
    try {
      execSync(pushCommand, { stdio: 'inherit' });
    } catch (error) {
      logger.error(`Docker push command failed: ${pushCommand}`);
      throw error;
    }

    console.log('Successfully pushed image to ECR');
  } catch (error) {
    logger.error('Error pushing image to ECR:');
    logger.error(error?.message);

    throw error;
  }
}
