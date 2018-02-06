import Bitfinex from './bitfinex';
import * as BF from './bitfinex/types';
import * as Exchange from './stores';
import { replaceDictionary, replaceManyDictionary } from './utils';
import { SubscriptionHandler, BookTick } from './bitfinex/types';

let symbols: string[];
let symbolsDetails: BF.SymbolDetail[];
let baseCoinGroups: { [name: string]: BF.SymbolDetail[] };

async function getBaseCoinGroups() {
    symbolsDetails = await Bitfinex.V1.getSymbolsDetails();

    let baseCoinGroups: { [name: string]: BF.SymbolDetail[] } = {};
    for (let i = 0; i < symbolsDetails.length; i++) {
        let s = symbolsDetails[i];
        let baseCoinName = s.pair.substr(0, 3);
        let baseCoin = baseCoinGroups[baseCoinName];
        if (!baseCoin) {
            baseCoinGroups[baseCoinName] = baseCoin = [];
        }
        baseCoin.push(s);
    }
    return baseCoinGroups;
}

export namespace Backend {

    /** 
     * Connects to the Bitfinex data stream.
    */
    export async function init() {
        let status = await Bitfinex.V2.getStatus();
        if (status === 'maintenance') {
            throw new Error('Bitfinex is in maintenance right now. Please try again later.');
        }
    
        symbols = await Bitfinex.V1.getSymbols();
        symbolsDetails = await Bitfinex.V1.getSymbolsDetails();
        baseCoinGroups = await getBaseCoinGroups();

        Bitfinex.Stream.connect();
    }

    export async function bindTradeTickerStore(store: Exchange.TradeTickerStore) {
        let tickers = await Bitfinex.V2.getTickers(symbols.map(s => 't' + s.toUpperCase()));
        let nextTickers = Object.assign({}, tickers);

        store.set('tickers')(tickers);
        store.set('groups')(baseCoinGroups);

        let waiting = 0;
        function repaint() {
            if (waiting === 0)
                return;

            tickers = nextTickers;
            store.set('tickers')(tickers);
            nextTickers = Object.assign({}, tickers);
            waiting = 0;
        }
        setInterval(repaint, 66);

        let subscriptions: BF.Ticket[] = [];
        function subscribeToAllTickers() {
            symbols.forEach( s => {
                let result = Bitfinex.Stream.subscribeTradeTicker(s, t => {
                    waiting++;
                    nextTickers[s] = t;               
                });
                subscriptions.push(result);
            });
        }
        // Resubscribes to trading tickers after connection failure.
        let tickerSubscriptions = Bitfinex.Stream.addConnectionHandler(subscribeToAllTickers)
        Bitfinex.Stream.addDisconnectionHandler( () => {
            subscriptions = [];
        });
    }

    const FundingSymbols = [
        'EUR', 'USD', 'BTC', 'ETH', 'XRP', 'EOS', 'BCH', 'NEO', 'IOT', 'LTC', 
        'OMG', 'ETC', 'XMR', 'DSH', 'ZEC', 'BTG', 'ETP', 'SAN', 'EDO'
    ]
    
    export async function bindFundingTickerStore(store: Exchange.FundingTickerStore) {
        let tickers = await Bitfinex.V2.getTickers(FundingSymbols.map(s => 'f' + s.toUpperCase()));
        store.set('tickers')(tickers);

        let subscriptions: BF.Ticket[] = [];

        function subscribeToAllTickers() {
            console.debug('Subscribing to Tickers...');
  
            FundingSymbols.forEach( s => {
                let ticket = Bitfinex.Stream.subscribeFundingTicker(s, t => {

                    tickers = replaceDictionary(tickers, s, t);
                    store.set('tickers')(tickers);
                });
                subscriptions.push(ticket);
            });
        }

        let tickerSubscriptions = Bitfinex.Stream.addConnectionHandler(subscribeToAllTickers)
        Bitfinex.Stream.addDisconnectionHandler( () => {
            subscriptions = [];
        });
    }

    export async function bindOrderBookStore(store: Exchange.OrderBookStore) {
        let book: {[price:string]: BF.BookTick} = {};
        store.set('book')(book);
        let nextBook = Object.assign({}, book);

        let additions = 0;
        function repaint() {
            if (additions === 0)
                return;

            book = nextBook;
            store.set('book')(book);
            nextBook = Object.assign({}, book);
            additions = 0;
        }
        setInterval(repaint, 66);

        const subscribe = (s:string) => Bitfinex.Stream.subscribeBook(s, 'P1', 'F0', '25', ts => {
            additions++;
            ts.forEach( t => {
                let key = (t.amount > 0 ? 'bid' : 'ask') + t.price.toString();
                if (t.count > 0) {
                    nextBook[key] = t;
                }
                else {
                    delete nextBook[key];
                }
            });
        } );

        let symbol: string | null = store.get('symbol');
        if (symbol) subscribe(symbol);

        let ticket: BF.Ticket | null = null;

        store.on('symbol')
            .distinctUntilChanged()
            .subscribe((newSymbol:string | null) => {
                if (ticket) {
                    Bitfinex.Stream.unsubscribe(ticket);
                    ticket = null;
                    book = {};
                    store.set('book')(book);
                    nextBook = Object.assign({}, book);
                }
                if (newSymbol) {
                    ticket = subscribe(newSymbol);
                    symbol = newSymbol;
                }
            });
    }

    export async function bindTradesStore(store: Exchange.TradesStore) {
        let symbol: string | null = store.get('symbol');
        let trades: BF.TradeTick[] = [];
        store.set('trades')(trades);
        let ticket: BF.Ticket | null = null;

        const subscribe = (s:string) => Bitfinex.Stream.subscribeTrades(s, ts => {
            trades = ts.concat(trades);
            trades.length = 30;
            store.set('trades')(trades);
        });

        if (symbol) subscribe(symbol);

        store.on('symbol')
            .distinctUntilChanged()
            .subscribe((symbol:string | null) => {
                if (ticket) {
                    Bitfinex.Stream.unsubscribe(ticket);
                    ticket = null;
                    trades = [];
                    store.set('trades')(trades);
                }
                if (symbol) {
                    ticket = subscribe(symbol);
                    symbol = symbol;
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
