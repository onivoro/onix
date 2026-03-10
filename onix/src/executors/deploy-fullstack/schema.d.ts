export interface ExecutorSchema {
    ui: string;
    dryRun?: boolean;
    tag?: string;
    access?: 'public' | 'restricted';
}
