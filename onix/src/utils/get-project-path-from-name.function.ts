const platforms = ['app', 'test'];

export function getProjectPathFromName(projectName: string) {
    const slashedInsteadOfDashed = projectName!.split('-').join('/');
    return platforms.reduce((_, platform) => _
        .replace(platform, `${platform}s`)
        .replace(`${platform}ss`, `${platform}s`) // smh lol
        , slashedInsteadOfDashed);
}