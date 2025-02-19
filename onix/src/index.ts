export { playwrightConfig } from './utils/playwright.config';

export * from './types/onix-config.type';

export * from './plugins/plugin';

export * from './functions/executor-factory.function';
export * from './functions/extract-project-build-outputs.function';
export * from './functions/extract-project-configuration.function';
export * from './functions/load-env-file.function';
export * from './functions/normalize-output-path.function';
export * from './functions/pm.function';
export * from './functions/pmx.function';

export * from './inference/add-docker-target.function';
export * from './inference/add-docker-targets.function';
export * from './inference/add-serve-target.function';
export * from './inference/add-serve-targets.function';
export * from './inference/build-onix-targets.function';
export * from './inference/read-targets-cache.function';
export * from './inference/write-targets-to-cache.function';

export * from './webpack/patch-nx-source-map-paths.function';
export * from './webpack/patch-nx-source-maps.plugin';