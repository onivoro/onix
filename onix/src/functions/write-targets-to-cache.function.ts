import { writeJsonFile } from "@nx/devkit";
import { TOnixTargets } from "../types/onix-targets.type";

export function writeTargetsToCache(cachePath, results?: Record<string, TOnixTargets>) {
    writeJsonFile(cachePath, results || {});
};