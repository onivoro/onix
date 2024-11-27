import { ExecutorContext, logger, PromiseExecutor } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { build } from '../../utils/build';
import { resolve } from 'path';
import { execSync } from 'child_process';

const executor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { } = options;

  try {
    const projectRoot = context.projectsConfigurations.projects[context.projectName!].root;
    const mainFilePath = `${projectRoot}/src/main.ts`;
    const outfile = `${mainFilePath.replace('.ts', '.js').replace('src', 'extension')}`;
    const vsixPath = outfile.replace('.js', '.vsix');
    const cwd = resolve(projectRoot);
    const distVsixPath = 'main.vsix';

    logger.log({ cwd, outfile, vsixPath, projectRoot })

    await build(mainFilePath, outfile);

    execSync(`vsce package --allow-missing-repository -o ${distVsixPath}`, { cwd, stdio: 'inherit' });

    try {
      const installedExtensions = execSync('code --list-extensions').toString().split('\n').map(_ => _.trim()).filter(Boolean);

      if (installedExtensions.includes('undefined_publisher.ivsc')) {
        execSync(`code --uninstall-extension undefined_publisher.ivsc`, { stdio: 'inherit' });
      }

      execSync(`code --install-extension ${distVsixPath}`, { cwd, stdio: 'inherit' });

      logger.log(`built ${context.projectName} as VSIX to ${distVsixPath} and installed in VS Code`);
    } catch (error) {
      logger.error('unable to automatically install extension because "code" not sourced in terminal');
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
};

export default executor;
