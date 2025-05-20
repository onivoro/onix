export function objectToEnvExports(env: Record<string, any> = {}): string {
    return Object.entries(env).map(__ => `export ${__[0]}='${__[1]}'`).join(' && ');
}