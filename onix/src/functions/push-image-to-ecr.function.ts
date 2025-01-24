import { ECRClient, GetAuthorizationTokenCommand, ECRClientConfig } from '@aws-sdk/client-ecr';
import { fromIni } from "@aws-sdk/credential-providers";
import { execSync } from 'child_process';

export interface PushImageConfig {
  region: string;
  repositoryName: string;
  imageTag: string;
  registryId: string;
  profile: string;
}

export async function pushImageToECR({
  region,
  repositoryName,
  imageTag,
  registryId,
  profile
}: PushImageConfig): Promise<void> {
  try {
    const config: ECRClientConfig = { region, credentials: profile ? fromIni({ profile }) : undefined };
    const ecrClient = new ECRClient(config);

    const authCommand = new GetAuthorizationTokenCommand({
      registryIds: registryId ? [registryId] : undefined
    });
    const authResponse = await ecrClient.send(authCommand);

    if (!authResponse.authorizationData?.[0]?.authorizationToken) {
      throw new Error('Failed to get authorization token');
    }

    const authToken = Buffer.from(
      authResponse.authorizationData[0].authorizationToken,
      'base64'
    ).toString('utf-8');
    const [username, password] = authToken.split(':');

    const registryEndpoint = authResponse.authorizationData[0].proxyEndpoint;
    if (!registryEndpoint) {
      throw new Error('Failed to get registry endpoint');
    }

    execSync('docker login ' +
      `-u ${username} ` +
      `-p ${password} ` +
      registryEndpoint,
      { stdio: 'inherit' }
    );

    // Tag image
    const remoteImage = `${registryEndpoint.replace('https://', '')}/${repositoryName}:${imageTag}`;
    execSync(`docker tag ${repositoryName}:${imageTag} ${remoteImage}`,
      { stdio: 'inherit' }
    );

    // Push image
    execSync(`docker push ${remoteImage}`,
      { stdio: 'inherit' }
    );

    console.log('Successfully pushed image to ECR');
  } catch (error) {
    console.error('Error pushing image to ECR:', error);
    throw error;
  }
}
