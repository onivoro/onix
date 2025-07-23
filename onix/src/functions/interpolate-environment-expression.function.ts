export function interpolateEnvironmentExpression(value: string) {
    if (!value || !value.toString().includes('process.env')) {
        return value;
    }

    return eval(value);
}