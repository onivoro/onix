import { isAbsolute, join, relative } from 'path';

export function normalizeOutputPath(
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
