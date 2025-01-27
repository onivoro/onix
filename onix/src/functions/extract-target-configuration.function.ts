import { ExecutorContext } from "@nx/devkit";

export function extractTargetConfiguration(
    context: ExecutorContext
) {
    return (context?.target?.configurations || {})[context?.configurationName || 'N/A'];
}