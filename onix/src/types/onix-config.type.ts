export type TOnixEnvironmentConfig = {
    ecr: string;
    envKey: string;
    envPath: string;
    port?: string;
    prefix: string;
    profile: string;
    ormConfigPath?: string;
    dockerfilePath?: string;
};

export type TOnixConfig = {
    moniker: string;
    apiDoxPath?: string;
    apiClientPath?: string;
    webClientPath?: string;
    environments: Record<string, TOnixEnvironmentConfig>;
};
