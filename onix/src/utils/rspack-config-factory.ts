const { composePlugins, withNx } = require('@nx/rspack');
export type TOnixRsPackConfig = {outputPath: string, entryMain?: string};

module.exports = composePlugins(withNx(), ({outputPath, entryMain = './src/main.ts'}: TOnixRsPackConfig, config: any) => {
  return {
    entry: {
      main: entryMain
    },
    output: {
      filename: '[name].js',
      path: outputPath
    },
    target: 'node',
    experiments: {
      topLevelAwait: true,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'builtin:swc-loader',
          options: {
            sourceMap: true,
            jsc: {
              parser: {
                syntax: 'typescript',
                decorators: true,
              },
              transform: {
                legacyDecorator: true,
                decoratorMetadata: true,
              },
            },
          },
        },
      ],
    },
    ...config,
  };
});