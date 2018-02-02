import Bitfinex from './bitfinex';
import * as BF from './bitfinex/types';
import * as Exchange from './stores';
import { replaceDictionary } from './utils';

let symbols: string[];
let symbolsDetails: BF.SymbolDetail[];
let baseCoinGroups: { [name: string]: BF.SymbolDetail[] };
let tickers: BF.Ticks;

export namespace Backend {

    export async function init() {
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
        //#endregion

        tickers = await Bitfinex.V2.getTickers(symbols.map(s => 't' + s.toUpperCase()));
        //console.debug(tickers);

        Bitfinex.Stream.connect();
    }
    
    export async function bindTradeTickerStore(store: Exchange.TradeTickerStore) {
        let tickerStore = store;

        tickerStore.set('tickers')(tickers);
        tickerStore.set('groups')(baseCoinGroups);

        let subscriptions: BF.SubscriptionHandlerList = {};

        function subscribeToAllTickers() {
            console.debug('Subscribing to Tickers...');

            symbols.forEach( s => {
                let result = Bitfinex.Stream.subscribeTradeTicker(s, t => {

                    tickers = replaceDictionary(tickers, s, t);
                    tickerStore.set('tickers')(tickers);
                });
                subscriptions[result.key] = [result.handler];
            });
        }
        function unsubscribeFromAllTickers() {
            Object.getOwnPropertyNames(subscriptions).forEach( (n) => {
                Bitfinex.Stream.unsubscribe(n, subscriptions[n][0]) 
            });
            subscriptions = {};
        }
        // Resubscribes to trading tickers after connection failure.
        let tickerSubscriptions = Bitfinex.Stream.addConnectionHandler(subscribeToAllTickers)
    }
    const FundingSymbols = [
        'EUR', 'USD', 'BTC', 'ETH', 'XRP', 'EOS', 'BCH', 'NEO', 'IOT', 'LTC', 
        'OMG', 'ETC', 'XMR', 'DSH', 'ZEC', 'BTG', 'ETP', 'SAN', 'EDO'
    ]
    
    export async function bindFundingTickerStore(store: Exchange.TradeTickerStore) {
        let tickerStore = store;

        let tickers = await Bitfinex.V2.getTickers(FundingSymbols.map(s => 'f' + s.toUpperCase()));
        tickerStore.set('tickers')(tickers);

        let subscriptions: BF.SubscriptionHandlerList = {};

        function subscribeToAllTickers() {
            console.debug('Subscribing to Tickers...');
  
            FundingSymbols.forEach( s => {
                let result = Bitfinex.Stream.subscribeFundingTicker(s, t => {

                    tickers = replaceDictionary(tickers, s, t);
                    tickerStore.set('tickers')(tickers);
                });
                subscriptions[result.key] = [result.handler];
            });
        }
        function unsubscribeFromAllTickers() {
            Object.getOwnPropertyNames(subscriptions).forEach( (n) => {
                Bitfinex.Stream.unsubscribe(n, subscriptions[n][0]) 
            });
            subscriptions = {};
        }
        // Resubscribes to trading tickers after connection failure.
        let tickerSubscriptions = Bitfinex.Stream.addConnectionHandler(subscribeToAllTickers)
    }

    export async function bindOrderBookStore(store: Exchange.OrderBookStore) {
    }
    export async function bindTradesStore(store: Exchange.TradesStore) {
    }
    export async function bindCandlesStore(store: Exchange.TradesStore) {
    }
    export async function bindAppStore(store: Exchange.AppStore) {
    }
}
