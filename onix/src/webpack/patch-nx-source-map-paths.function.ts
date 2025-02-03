import { relative } from 'node:path';

export type TFilenameTemplater = (info: { absoluteResourcePath: string }) => string;
export type TWebpackConfig = { output: { devtoolModuleFilenameTemplate: TFilenameTemplater } };

export function patchNxSourceMapPaths(config: TWebpackConfig) {
    config.output.devtoolModuleFilenameTemplate = function (info) {
        const rel = relative(process.cwd(), info.absoluteResourcePath);
        return `webpack:///./${rel}`;
    };
    return config;
};