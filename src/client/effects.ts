import Bitfinex from './bitfinex';
import * as BF from './bitfinex/types';
import * as Exchange from './stores';
import { replaceDictionary, replaceManyDictionary } from './utils';
import { SubscriptionHandler, BookTick } from './bitfinex/types';

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
    
    export async function bindFundingTickerStore(store: Exchange.FundingTickerStore) {
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
        let symbol: string | null = store.get('symbol');
        let book: {[price:string]: BF.BookTick} = {};
        let result: {key: string; handler: BF.SubscriptionHandler} | null = null;

        let handler: (ts:BF.BookTick[]) => void = ts => {
            let newBook = Object.assign({}, book);
            ts.forEach( t => {
                let key = (t.amount > 0 ? 'bid' : 'ask') + t.price.toString();
                if (t.count > 0) {
                    newBook[key] = t;
                }
                else {
                    delete newBook[key];
                }
            });
            book = newBook;
            store.set('book')(book);
        }

        const subscribe = (s:string) => Bitfinex.Stream.subscribeBook(s, 'P1', 'F0', '25', handler );
        if (symbol) subscribe(symbol);

        store.on('symbol').subscribe((newSymbol:string | null) => {
            if (newSymbol && newSymbol !== symbol) {
                if (result) {
                    Bitfinex.Stream.unsubscribe(result.key, result.handler);
                    book = {};
                    store.set('book')(book);
                }
                result = subscribe(newSymbol);
                symbol = newSymbol;
            }
        });
    }
    export async function bindTradesStore(store: Exchange.TradesStore) {
        let symbol: string | null = store.get('symbol');
        let trades: BF.TradeTick[] = [];
        let result: {key: string; handler: BF.SubscriptionHandler} | null = null;

        let handler: (ts:BF.TradeTick[]) => void = ts => {
            let newTrades = trades.slice();
            newTrades.unshift(...ts);
            newTrades.pop();
            trades = newTrades;
            store.set('trades')(trades);
        }

        const subscribe = (s:string) => Bitfinex.Stream.subscribeTrades(s, handler );
        if (symbol) subscribe(symbol);

        store.on('symbol').subscribe((newSymbol:string | null) => {
            if (newSymbol && newSymbol !== symbol) {
                if (result) {
                    Bitfinex.Stream.unsubscribe(result.key, result.handler);
                    trades = [];
                    store.set('trades')(trades);
                }
                result = subscribe(newSymbol);
                symbol = newSymbol;
            }
        });
    }
    export async function bindCandlesStore(store: Exchange.CandlesStore) {
    }
    export async function bindAppStore(store: Exchange.AppStore) {
        Bitfinex.Stream.addConnectionHandler(() => {
            store.set('isConnected')(true);
        });
        Bitfinex.Stream.addDisconnectionHandler((wasClean:boolean) => {
            store.set('isConnected')(false);
        });
    }
}
