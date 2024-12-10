import {
  CreateDependencies,
  CreateNodes,
  CreateNodesContext,
  createNodesFromFiles,
  CreateNodesV2,
  detectPackageManager,
  getPackageManagerCommand,
  joinPathFragments,
  logger,
  parseJson,
  ProjectConfiguration,
  readJsonFile,
  TargetConfiguration,
  writeJsonFile,
} from '@nx/devkit';
import { dirname, isAbsolute, join, relative } from 'path';
import { getNamedInputs } from '@nx/devkit/src/utils/get-named-inputs';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { calculateHashForCreateNodes } from '@nx/devkit/src/utils/calculate-hash-for-create-nodes';
import { workspaceDataDirectory } from 'nx/src/utils/cache-directory';
import { getLockFileName } from '@nx/js';
import { hashObject } from 'nx/src/hasher/file-hasher';
import { minimatch } from 'minimatch';
import { TOnixConfig } from '../types/onix-config.type';

const pmc = getPackageManagerCommand();

export type TOnixPluginOptions = {
  buildTargetName?: string;
  testTargetName?: string;
  serveTargetName?: string;
  previewTargetName?: string;
  serveStaticTargetName?: string;
  typecheckTargetName?: string;
};

type TOnixTargets = Pick<ProjectConfiguration, 'targets' | 'metadata'>;

function readTargetsCache(cachePath: string): Record<string, TOnixTargets> {
  return existsSync(cachePath) ? readJsonFile(cachePath) : {};
}

function writeTargetsToCache(cachePath, results?: Record<string, TOnixTargets>) {
  writeJsonFile(cachePath, results || {});
}

export const createDependencies: CreateDependencies = () => {
  return [];
};

const onixConfigGlob = '**/onix.config.{js,ts,mjs,mts,cjs,cts}';

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
  async (configFilePath, options, context) => {
    logger.warn(
      '`createNodes` is deprecated. Update your plugin to utilize createNodesV2 instead. In Nx 20, this will change to the createNodesV2 API.'
    );
    return createNodesInternal(configFilePath, options = {}, context, {});
  },
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

async function buildOnixTargets(
  configFilePath: string,
  projectRoot: string,
  options: TOnixPluginOptions,
  context: CreateNodesContext
): Promise<TOnixTargets> {
  const absoluteConfigFilePath = joinPathFragments(
    context.workspaceRoot,
    configFilePath
  );

  const projectJsonPath = join(context.workspaceRoot, projectRoot, 'project.json');
  const projectJson = parseJson(readFileSync(projectJsonPath, 'utf-8'));

  const targets: Record<string, TargetConfiguration> = {};

  logger.warn(absoluteConfigFilePath);
  const onixConfig: TOnixConfig = require(absoluteConfigFilePath);
  logger.warn(onixConfig);

  const namedInputs = getNamedInputs(projectRoot, context);

  addLocalServeTargets(onixConfig, targets, projectJson, namedInputs);
  addDockerTargets(onixConfig, targets, projectJson, namedInputs);

  const metadata = {};
  return { targets, metadata };
}

function addLocalServeTargets(onixConfig: TOnixConfig, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
  Object.entries(onixConfig.environments || {}).forEach(([environment, config]) => {
    addLocalServeTarget(environment, config, targets, projectJson, namedInputs);
  });
}

function addDockerTargets(onixConfig: TOnixConfig, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
  Object.entries(onixConfig.environments || {}).forEach(([environment, config]) => {
    addDockerTarget(environment, config, targets, projectJson, namedInputs);
  });
}

function addLocalServeTarget(environment: string, config: { ecr: string; envKey: string; envPath: string; port: string; prefix: string; profile: string; }, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
  const buildTargetName = `build`;
  const targetName = `onix-serve-${environment}`;
  const { envPath, envKey } = config;
  targets[targetName] = {
    command: `export ${envKey}=${envPath} && npx nx run ${projectJson.name}:serve`,
    options: { cwd: process.cwd() },
    cache: true,
    dependsOn: [`^${buildTargetName}`],
    inputs: [
      ...('production' in namedInputs
        ? ['production', '^production']
        : ['default', '^default']),
      {
        externalDependencies: [],
      },
    ],
    outputs: [],
    metadata: {
      technologies: ['NodeJS, Nx'],
      description: `Invokes Nx serve with config-specified environment`,
    },
  };
}

function addDockerTarget(environment: string, config: { ecr: string; envKey: string; envPath: string; port: string; prefix: string; profile: string; }, targets: Record<string, TargetConfiguration<any>>, projectJson: any, namedInputs) {
  const targetName = `onix-serve-${environment}`;
  const { envPath, envKey, ecr, port } = config;
  const localPort = (Number(port) + 2000);

  if (ecr) {

    targets[targetName] = {
      command: `open http://localhost:${localPort} & docker run -p ${localPort}:${port} --env="PORT=${port}" --env-file "${envPath}" "${ecr}"`,
      options: { cwd: process.cwd() },
      cache: true,
      inputs: [],
      outputs: [],
      metadata: {
        technologies: ['Docker'],
        description: `Runs the docker image locally`,
      },
    };
  }
}

function normalizeOutputPath(
  outputPath: string | undefined,
  projectRoot: string,
  workspaceRoot: string,
  path: string
): string | undefined {
  if (!outputPath) {
    if (projectRoot === '.') {
      return `{projectRoot}/${path}`;
    } else {
      return `{workspaceRoot}/${path}/{projectRoot}`;
    }
  } else {
    if (isAbsolute(outputPath)) {
      return `{workspaceRoot}/${relative(workspaceRoot, outputPath)}`;
    } else {
      if (outputPath.startsWith('..')) {
        return join('{workspaceRoot}', join(projectRoot, outputPath));
      } else {
        return join('{projectRoot}', outputPath);
      }
    }
  }
}

function normalizeOptions(options: TOnixPluginOptions): TOnixPluginOptions {
  options ??= {};
  options.buildTargetName ??= 'build';
  options.serveTargetName ??= 'serve';
  options.previewTargetName ??= 'preview';
  options.testTargetName ??= 'test';
  options.serveStaticTargetName ??= 'serve-static';
  options.typecheckTargetName ??= 'typecheck';
  return options;
}
