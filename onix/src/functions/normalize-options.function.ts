import { TOnixPluginOptions } from "../types/onix-plugin-options.type";

export function normalizeOptions(options: TOnixPluginOptions): TOnixPluginOptions {
    options ??= {};
    options.buildTargetName ??= 'build';
    options.serveTargetName ??= 'serve';
    options.previewTargetName ??= 'preview';
    options.testTargetName ??= 'test';
    options.serveStaticTargetName ??= 'serve-static';
    options.typecheckTargetName ??= 'typecheck';
    return options;
}
