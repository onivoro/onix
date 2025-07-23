import { interpolateEnvironmentExpression } from "./interpolate-environment-expression.function";

export function interpolateEnvironmentObject(environment: { [key: string]: string; }): Record<string, string> {
    return Object.entries(environment)
        .map(([key, value]) => [key, interpolateEnvironmentExpression(value)])
        .reduce((_, [key, value]) => {
            _[key] = value;
            return _;
        }, {} as any);
}