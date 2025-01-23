import { pushImageToECR } from './push-image-to-ecr.function';

export async function pushImageToECRWrapped(_: { ecr: string, profile: string }): Promise<void> {
  const { ecr, profile } = _;
  const [registryId, region, repoColonTag] = ecr.replace('amazonaws.com', '').replace('dkr.ecr.', '').replace('/', '').split('.');
  const [repositoryName, imageTag] = repoColonTag.split(':');

  return await pushImageToECR({ registryId, region, repositoryName, imageTag, profile });
}
