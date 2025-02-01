export interface ExecutorSchema {
    envFile: string;
    ormConfigPath: string;
    runOrRevert: 'run' | 'revert';
}
