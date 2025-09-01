export interface ExecutorSchema {
    envFile?: string;
    terraformRoot: string;
    terraformCommand: 'plan' | 'apply' | 'show';
    filterRegex?: string;
}
