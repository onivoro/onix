import { ExecutorContext } from "@nx/devkit";

export function interpolate (context: ExecutorContext, expression: string) {
    const replacements = {workspaceRoot: context.root};

    return Object.entries(replacements).reduce((_, [find, replace]) => _.replace(find, replace), expression || '');
}