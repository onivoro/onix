export function objectToEnvExports(env: Record<string, any>): string {
    return Object.entries(env).reduce((_, __) => `${_} export ${__[0]}='${__[1]}'`, '');
}