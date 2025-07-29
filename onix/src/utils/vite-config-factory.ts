import { defineConfig, LibraryFormats, UserConfig } from 'vite';
import { ExternalOption } from 'rollup';
import dts from 'vite-plugin-dts';
import { parse } from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export type TOnixViteConfig = { cacheDir: string, tsconfigPath: string, entryRoot?: string, entryFileName?: string, name?: string, outDir: string, root: string, external?: ExternalOption };

export const viteConfigFactory = (_: TOnixViteConfig, overrides: UserConfig = {}) => {
    const { cacheDir, tsconfigPath, entryRoot = 'src', entryFileName = 'index.ts', name, outDir, root, external } = _;
    const baseFormats: LibraryFormats[] = ['es', 'cjs'];
    const { name: fileName } = parse(entryFileName)
    return defineConfig({
        root,
        cacheDir,

        plugins: [
            nxViteTsPaths(),
            dts({
                entryRoot,
                tsconfigPath,
            }),
        ],

        // Uncomment this if you are using workers.
        // worker: {
        //  plugins: [ nxViteTsPaths() ],
        // },

        // Configuration for building your library.
        // See: https://vitejs.dev/guide/build.html#library-mode
        build: {
            outDir,
            reportCompressedSize: true,
            commonjsOptions: { transformMixedEsModules: true },
            emptyOutDir: true,
            lib: {
                // Could also be a dictionary or array of multiple entry points.
                entry: `${entryRoot}/${entryFileName}`,
                name,
                fileName,
                // Change this to the formats you want to support.
                // Don't forget to update your package.json as well.
                formats: name ? [...baseFormats, 'umd'] : baseFormats,
            },
            rollupOptions: {
                // External packages that should not be bundled into your library.
                external: external || [],
            },
        },
        ...overrides
    });
}
