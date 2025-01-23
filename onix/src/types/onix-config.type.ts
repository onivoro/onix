export type TOnixEnvironmentConfig = {
    ecr: string;
    envKey: string;
    envPath: string;
    port?: string;
    prefix: string;
    profile: string;
    ormConfigPath?: string;
    dockerfilePath?: string;
    webClientProjectPath?: string;
};

export type TOnixConfig = {
    moniker: string;
    apiDoxPath?: string;
    apiClientPath?: string;
    environments: Record<string, TOnixEnvironmentConfig>;
};
