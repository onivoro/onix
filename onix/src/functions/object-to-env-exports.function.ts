export function objectToEnvExports(env: Record<string, any> = {}): string {
    if(Object.keys(env)?.length) {
        return Object.entries(env).map(__ => `${__[0]}='${__[1]}'`).join(' ');
    }

    return '';
}