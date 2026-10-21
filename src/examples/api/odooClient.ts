import Constants from "expo-constants";
import { OdooConfig, OdooSession } from "./types";

class OdooClient {
    private config: OdooConfig;
    private session: OdooSession | null = null;

    constructor(config: OdooConfig) {
        this.config = config;
    }

    /*
        Makes a JSON-RPC call to the Odoo server.
    */
    private async jsonRpcCall<T>(service: string, method: string, args: any[]): Promise<T> {
        const response = await fetch(`${this.config.baseUrl}/jsonrpc`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: { service, method, args },
                id: Math.floor(Math.random() * 1000000)
            })
        }
        );

        const json = await response.json();

        if (json.error) {
            throw new OdooError(json.error);
        }

        return json.result as T;
    }

    /*
      Login to the Odoo server and establish a session.
    */
    async login(login: string, password: string): Promise<number> {
        const uid = await this.jsonRpcCall<number>("common", "login", [
            this.config.db, login, password
        ]);

        if (!uid) {
            throw new Error("Authentication failed. Please check your credentials.");
        }

        this.session = { uid, password };

        return uid;
    }

    /*
      Search and Read records from the Odoo server.
    */
    async searchRead<T = any>(model: string, domain: any[] = [], fields: string[] = [], opts: {
        limit?: number;
        offset?: number;
        order?: string;
    } = {}): Promise<T[]> {
        this.assertAuthenticated();

        return this.jsonRpcCall<T[]>("object", "execute_kw", [
            this.config.db,
            this.session!.uid,
            this.session!.password,
            model,
            "search_read",
            [domain, fields],
            opts
        ]);
    }
    // Critical: business actions go through model methods, not raw write
    async callMethod<T = any>(
        model: string, method: string, args: any[] = [], kwargs: Record<string, any> = {}
    ): Promise<T> {
        this.assertAuthenticated();
        return this.jsonRpcCall<T>('object', 'execute_kw', [
            this.config.db, this.session!.uid, this.session!.password,
            model, method, args, kwargs,
        ]);
    }

    async create(model: string, values: Record<string, any>): Promise<number> {
        return this.callMethod<number>(model, 'create', [values]);
    }

    // Plain field edits (form saves), as opposed to callMethod's workflow/business actions.
    async write(model: string, id: number, values: Record<string, any>): Promise<boolean> {
        return this.callMethod<boolean>(model, 'write', [[id], values]);
    }

    async unlink(model: string, ids: number[]): Promise<boolean> {
        return this.callMethod<boolean>(model, 'unlink', [ids]);
    }

    // Fetch specific records by id (vs. searchRead's domain-filtered search).
    async read<T = any>(model: string, ids: number[], fields: string[] = []): Promise<T[]> {
        return this.callMethod<T[]>(model, 'read', [ids, fields]);
    }

    logout() {
        this.session = null;
    }

    private assertAuthenticated() {
        if (!this.session) throw new Error('Not authenticated. Call login() first.');
    }
}

class OdooError extends Error {
    data: any;
    constructor(errorObj: any) {
        super(errorObj.data?.message || errorObj.message || 'Odoo RPC error');
        this.data = errorObj.data;
    }
}

// baseUrl/db come from app.json's `expo.extra` (see README) — NOT localhost on
// device/emulator, use your machine's LAN IP (or 10.0.2.2 on Android emulator).
export const odooClient = new OdooClient({
    baseUrl: Constants.expoConfig?.extra?.odooBaseUrl,
    db: Constants.expoConfig?.extra?.odooDb,
});