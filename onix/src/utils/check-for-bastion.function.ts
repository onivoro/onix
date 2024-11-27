import { execSync } from "child_process";

export function checkForBastion(requireBastion: boolean) {
  if (requireBastion) {
    try {
      execSync('lsof -ti :3120', { stdio: 'inherit' });
    } catch (error) {
      console.error('bastion is required for this operation but not currently running');
      console.log('run "npx nx serve app-api-bastion" and try again');
      throw error;
    }
  }
}