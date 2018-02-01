import * as BF from './types';

export namespace V2 {

    const apiUrl = 'https://api.bitfinex.com/v2/';

    async function getJSON<T>(path: string): Promise<T> {
        let r = await fetch(apiUrl + path);
        let json = await r.json() as T;
        if (r.status === 200)
            return json;
        throw json;
    }

    /**
     * Returns the Bitfinex API server status.
     */
    export async function getStatus(): Promise<BF.Status> {
        let response = await getJSON<[number]>('platform/status');
        return response[0] === 1 ? 'operative' : 'maintenance';
    }

    /**
     * Returns a high level view of requested tickers.
     */
    export async function getTickers(tickerList: string[]): Promise<BF.Tickers> {
        let response = await getJSON<any[][]>('tickers?symbols=' + tickerList.join(','));
        let tickers: BF.Tickers = {};
        response.forEach((ticker) => {
            let symbol = (<string>ticker[0]).substr(1,6).toUpperCase();
            if (ticker.length === 11) {
                tickers[symbol] = {
                    bid: ticker[1],
                    bidSize: ticker[2],
                    ask: ticker[3],
                    askSize: ticker[4],
                    dailyChange: ticker[5],
                    dailyChangePerc: ticker[6],
                    lastPrice: ticker[7],
                    volume: ticker[8],
                    high: ticker[9],
                    low: ticker[10]
                }
            }
            else {
                tickers[symbol] = {
                    frr: ticker[1],
                    bid: ticker[2],
                    bidSize: ticker[3],
                    bidPeriod: ticker[4],
                    ask: ticker[5],
                    askSize: ticker[6],
                    askPeriod: ticker[7],
                    dailyChange: ticker[8],
                    dailyChangePerc: ticker[9],
                    lastPrice: ticker[10],
                    volume: ticker[11],
                    high: ticker[12],
                    low: ticker[13]
                }
            }
        });
        return tickers;
    }
}
