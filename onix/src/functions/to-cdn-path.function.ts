import { addCdnPrefixToKey } from "./add-cdn-prefix-to-key.function";

export function toCdnPath(bucket: string, region: string, key: string) {
    return addCdnPrefixToKey(bucket, region, key)
}