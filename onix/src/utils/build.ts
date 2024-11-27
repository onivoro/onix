import * as esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

const baseConfig = {
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: 'node' as any,
  target: ['node14.16'],
  format: 'cjs' as any,
  external: ['vscode'],
  plugins: [
    nodeExternalsPlugin() // Helps exclude node_modules
  ]
};

export async function build(mainFilePath: string, outfile: string, watchMode = false) {
  const extensionConfig = {
    ...baseConfig,
    entryPoints: [mainFilePath],
    outfile
  };

  try {
    if (watchMode) {
      const context = await esbuild.context({
        ...extensionConfig,
        sourcemap: true
      });
      console.log('Watching 😍');
      await context.watch();
    } else {
      await esbuild.build(extensionConfig);
      console.log('Build complete ✅');
    }
  } catch (error) {
    console.error('Build failed ❌', error);
    process.exit(1);
  }
}
