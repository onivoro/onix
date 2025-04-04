import { readFile } from "fs/promises";
import { resolve } from "path";

export async function getIndexHtmlContent(projectOutput: string): Promise<string> {
    return await readFile(resolve(projectOutput, 'index.html'), { encoding: 'utf-8' });
}