import { addCdnPrefixToKey } from "./add-cdn-prefix-to-key.function";

export function toCdnPath(bucket: string, region: string, folder: string, name: string, ext: string) {
    return addCdnPrefixToKey(bucket, region, `${folder}/${name}.${ext}`)
}