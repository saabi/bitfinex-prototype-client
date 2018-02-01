import Bitfinex from './bitfinex';
import * as BF from './bitfinex/types';
import { Exchange } from './store';
import { replaceDictionary } from './utils';

let boundStore: Exchange.AppStore;
let symbols: string[];
let symbolsDetails: BF.SymbolDetail[];
let baseCoinGroups: { [name: string]: BF.SymbolDetail[] };
let tickers: BF.Ticks;

function onBitfinexConnection() {
    console.debug('Subscribing to Tickers...');
    symbols.forEach(s => Bitfinex.Stream.subscribeTicker(s, t => {
        //console.debug({s,t});
        tickers = replaceDictionary(tickers, s, t);
        boundStore.set('tickers')(tickers);
    }));
}

async function init() {
    let status = await Bitfinex.V2.getStatus();
    if (status === 'maintenance') {
        throw new Error('Bitfinex is in maintenance right now. Please try again later.');
    }

    symbols = await Bitfinex.V1.getSymbols();
    symbolsDetails = await Bitfinex.V1.getSymbolsDetails();

    //#region Group symbols by base coin.
    baseCoinGroups = {};
    for (let i = 0; i < symbolsDetails.length; i++) {
        let s = symbolsDetails[i];
        let baseCoinName = s.pair.substr(0, 3);
        let baseCoin = baseCoinGroups[baseCoinName];
        if (!baseCoin) {
            baseCoinGroups[baseCoinName] = baseCoin = [];
        }
        baseCoin.push(s);
    }
    /* // Alternative implementation.
    baseCoinGroups = symbolsDetails.reduce((groups, v) => {
        let baseCoinName = v.pair.substr(0, 3);
        let baseCoin = groups[baseCoinName];
        if (!baseCoin) {
            groups[baseCoinName] = baseCoin = [];
        }
        baseCoin.push(v);
        return groups;
    }, {} as { [name: string]: BF.SymbolDetail[] });
    */
    //#endregion

    tickers = await Bitfinex.V2.getTickers(symbols.map(s => 't' + s.toUpperCase()));
    //console.debug(tickers);

    boundStore.set('tickers')(tickers);
    boundStore.set('groups')(baseCoinGroups);
    
    Bitfinex.Stream.addConnectionHandler(onBitfinexConnection)
    Bitfinex.Stream.connect();
}

export namespace Bindings {
    
    export async function bindStore(store: Exchange.AppStore) {
        boundStore = store;
        await init();
    }

}
