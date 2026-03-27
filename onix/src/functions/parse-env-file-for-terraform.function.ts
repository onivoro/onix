import { readFileSync } from 'fs';

const encoding = 'utf-8';

export function parseEnvFileForTerraform({ file, filterRegex }: { filterRegex?: RegExp, file: string }) {
  if (!file) {
    return {};
  }

  try {
    const raw: string = readFileSync(file, { encoding });

    const lines = raw.split('\n').filter(Boolean).map(l => l.trim()).filter(Boolean);

    const applicableLines = lines.filter(l => l.includes('=') && l[0] !== '#');

    const filteredLines = applicableLines.filter(_ => !filterRegex || filterRegex.test(_));

    const keysAndValues = filteredLines.map((_) => {
      const idx = _.indexOf('=');
      return [_.slice(0, idx), _.slice(idx + 1)];
    });

    return keysAndValues.reduce((_, [key, value]) => {
      _[`TF_VAR_${key}`] = value.replace(/^(['"])(.*)\1$/, '$2');
      return _;
    }, {} as any);

  } catch (error) {
    console.log(error);
    return process.exit(1);
  }

}