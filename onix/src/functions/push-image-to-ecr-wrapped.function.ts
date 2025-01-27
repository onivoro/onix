import { pushImageToECR } from './push-image-to-ecr.function';

// TODO: DELETE THIS ABSTRACTION NOW THAT THE UNDERLYING FUNCTION ISN'T GOING TO CHANGE
export async function pushImageToECRWrapped(_: { ecr: string, profile: string }): Promise<void> {
  const { ecr, profile } = _;
  const [registryId, region, repoColonTag] = ecr.replace('amazonaws.com', '').replace('dkr.ecr.', '').replace('/', '').split('.');
  const [repositoryName, imageTag] = repoColonTag.split(':');

  return await pushImageToECR({ registryId, region, ecr, profile });
}
