import {
    ExecutorContext,
    detectPackageManager,
    getPackageManagerCommand,
} from '@nx/devkit';

export function pm(context: ExecutorContext) {
    const packageManager = detectPackageManager(context.root);
    return getPackageManagerCommand(packageManager);
}

// {
//   "install": "bun install",
//   "ciInstall": "bun install --no-cache",
//   "updateLockFile": "bun install --frozen-lockfile",
//   "add": "bun install",
//   "addDev": "bun install -D",
//   "rm": "bun rm",
//   "exec": "bun",
//   "dlx": "bunx",
//   "list": "bun pm ls"
// },