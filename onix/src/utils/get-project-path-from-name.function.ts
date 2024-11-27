const platforms = ['app', 'test'];

// TODO: THIS IS RIDICULOUS... FIX/REMOVE... USE NATIVE TECHNIQUE BY LOOKING AT CONTEXT/OPTIONS
export function getProjectPathFromName(projectName: string) {
    const slashedInsteadOfDashed = projectName!.split('-').join('/');
    return platforms.reduce((_, platform) => _
        .replace(platform, `${platform}s`)
        .replace(`${platform}ss`, `${platform}s`) // smh lol
        , slashedInsteadOfDashed);
}