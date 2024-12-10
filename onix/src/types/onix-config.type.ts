export type TOnixEnvironmentConfig = {
    ecr: string;
    envKey: string;
    envPath: string;
    port: string;
    prefix: string;
    profile: string;
    ormConfigPath?: string;
};

export type TOnixConfig = {
    moniker: string;
    environments: Record<string, TOnixEnvironmentConfig>;
};
