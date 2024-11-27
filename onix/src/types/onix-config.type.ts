export type TOnixConfig = {
    "moniker": string;
    "environments": Record<string, {
            "ecr": string;
            "envKey": string;
            "envPath": string;
            "port": string;
            "prefix": string;
            "profile": string;
    }>;
};
