import * as BF from './types';

export namespace V1 {
    const apiUrl = 'http://localhost:8080/v1/';  // The web service proxy URL

    async function getJSON<T>(path: string): Promise<T> {
        let r = await fetch(apiUrl + path);
        let json = await r.json() as T;
        if (r.status === 200)
            return json;
        throw json;
    }

    /**
     * Gets the list of symbols from the Bitfinex API server.
     */
    export async function getSymbols() {
        return await getJSON<string[]>('symbols');
    }

    /**
     * Gets the list of symbols with details from the Bitfinex API server.
     */
    export async function getSymbolsDetails() {
        return await getJSON<BF.SymbolDetail[]>('symbols_details');
    }
}

