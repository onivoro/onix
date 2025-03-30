export function addCdnPrefixToKey(bucket: string, region: string, key: string) {
    return bucket.includes('.')
        ? `https://s3.${region}.amazonaws.com/${bucket}/${key}`
        : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}