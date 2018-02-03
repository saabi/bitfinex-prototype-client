import * as BF from './types';
import { getJSON } from './util';

export namespace V1 {
    const apiUrl = '/v1/';  // The web service proxy URL


    /**
     * Gets the list of symbols from the Bitfinex API server.
     */
    export async function getSymbols() {
        let result = await getJSON<string[]>(apiUrl + 'symbols');
        for (let i = 0; i < result.length; i++) 
            result[i] = result[i].toUpperCase();
        return result;
    }

    /**
     * Gets the list of symbols with details from the Bitfinex API server.
     */
    export async function getSymbolsDetails() {
        let result = await getJSON<BF.SymbolDetail[]>(apiUrl + 'symbols_details');
        for (let i = 0; i < result.length; i++) 
            result[i].pair = result[i].pair.toUpperCase();
        return result;
    }
}

