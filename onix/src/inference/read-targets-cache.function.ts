import { readJsonFile } from "@nx/devkit";
import { existsSync } from "fs";
import { TOnixTargets } from "../types/onix-targets.type";

export function readTargetsCache(cachePath: string): Record<string, TOnixTargets> {
  return existsSync(cachePath) ? readJsonFile(cachePath) : {};
}