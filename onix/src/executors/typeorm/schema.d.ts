export interface ExecutorSchema {
    envPath: string;
    ormConfigPath: string;
    runOrRevert: 'run' | 'revert';
}
