import { CreateDependencies, CreateNodes, CreateNodesContext, createNodesFromFiles, CreateNodesV2, detectPackageManager, logger, ProjectConfiguration,
} from '@nx/devkit';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import { calculateHashForCreateNodes } from '@nx/devkit/src/utils/calculate-hash-for-create-nodes';
import { workspaceDataDirectory } from 'nx/src/utils/cache-directory';
import { getLockFileName } from '@nx/js';
import { hashObject } from 'nx/src/hasher/file-hasher';
import { TOnixPluginOptions } from '../types/onix-plugin-options.type';
import { readTargetsCache } from '../functions/read-targets-cache.function';
import { writeTargetsToCache } from '../functions/write-targets-to-cache.function';
import { TOnixTargets } from '../types/onix-targets.type';
import { normalizeOptions } from '../functions/normalize-options.function';
import { onixConfigGlob } from '../constants/onix-config-glob.constant';
import { buildOnixTargets } from '../functions/build-onix-targets.function';

export const createDependencies: CreateDependencies = () => [];

export const createNodesV2: CreateNodesV2<TOnixPluginOptions> = [
  onixConfigGlob,
  async (configFilePaths, options = {}, context) => {
    const optionsHash = hashObject(options);
    const cachePath = join(workspaceDataDirectory, `vite-${optionsHash}.hash`);
    const targetsCache = readTargetsCache(cachePath);
    try {
      return await createNodesFromFiles(
        (configFile, options = {}, context) =>
          createNodesInternal(configFile, options, context, targetsCache),
        configFilePaths,
        options,
        context
      );
    } finally {
      writeTargetsToCache(cachePath, targetsCache);
    }
  },
];

export const createNodes: CreateNodes<TOnixPluginOptions> = [
  onixConfigGlob,
  async (configFilePath, options, context) => createNodesInternal(configFilePath, options = {}, context, {})
];

async function createNodesInternal(
  configFilePath: string,
  options: TOnixPluginOptions,
  context: CreateNodesContext,
  targetsCache: Record<string, TOnixTargets>
) {
  const projectRoot = dirname(configFilePath);
  const siblingFiles = readdirSync(join(context.workspaceRoot, projectRoot));
  if (
    !siblingFiles.includes('package.json') &&
    !siblingFiles.includes('project.json')
  ) {
    return {};
  }

  const normalizedOptions = normalizeOptions(options);

  const hash =
    (await calculateHashForCreateNodes(
      projectRoot,
      normalizedOptions,
      context,
      [getLockFileName(detectPackageManager(context.workspaceRoot))]
    )) + configFilePath;

  const onixTargets = await buildOnixTargets(
    configFilePath,
    projectRoot,
    normalizedOptions,
    context
  );

  targetsCache[hash] ??= onixTargets;

  const { targets, metadata } = targetsCache[hash];
  const project: ProjectConfiguration = {
    root: projectRoot,
    targets,
    metadata,
  };

  return {
    projects: {
      [projectRoot]: project,
    },
  };
}
