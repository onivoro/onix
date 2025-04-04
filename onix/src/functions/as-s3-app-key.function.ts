export function asS3AppKey (_: {
    app: string,
    version: string,
    name: string,
    ext: string,
  }) {
    const {
      app,
      version,
      name,
      ext,
    } = _;

    return `${app}/${version}/${name}${ext}`;
  }