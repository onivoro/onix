import { readdir } from "fs/promises";
import { parse } from "path";

export async function getAssetListFromDirectory(assetDirectory: string): Promise<string[]> {
    const allAssets = await readdir(assetDirectory);
    const assets = allAssets.filter(a => ['.js', '.css'].includes(parse(a).ext));

    return assets;
}