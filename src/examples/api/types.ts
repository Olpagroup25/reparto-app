export interface OdooConfig {
    baseUrl: string;
    db: string;
}

export interface OdooSession {
    uid: number;
    password: string; // or apiKey
}

