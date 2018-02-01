import { createStore, Store as UnduxStore } from 'undux';

import * as BF from './bitfinex/types';

type OrderDirection = 'up' | 'down' | 'unsorted';
type TickerOrder = 'symbol' | 'last' | '24hr' | 'volume';

export namespace Exchange {

    type TickerModel = {
        tickers: BF.Ticks;
        groups: { [name: string]: BF.SymbolDetail[] };
        orderColumn: TickerOrder;
        orderDirection: OrderDirection;
    }
    export type TickerStore = UnduxStore<TickerModel>;
    export const TickerStore = createStore<TickerModel>({
        tickers: {},
        groups: {},
        orderColumn: 'symbol',
        orderDirection: 'unsorted'
    });
    export type TickerProps = {
        store: TickerStore;
    }


    type BookModel = {
    }
    export type BookStore = UnduxStore<BookModel>;
    export const BookStore = createStore<BookModel>({
    });
    export type BookProps = {
        store: BookStore;
    }


    type TradesModel = {
    }
    export type TradesStore = UnduxStore<TradesModel>;
    export const TradesStore = createStore<TradesModel>({
    });
    export type TradesProps = {
        store: TradesStore;
    }


    type AppModel = {
        currentSymbol: string;
    }
    export type AppStore = UnduxStore<AppModel>;
    export const AppStore = createStore<AppModel>({
        currentSymbol: 'BTCUSD'
    });
    export type AppProps = {
        store: AppStore;
    }
}
