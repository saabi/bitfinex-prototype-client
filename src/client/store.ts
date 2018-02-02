import { createStore, Store as UnduxStore } from 'undux';

import * as BF from './bitfinex/types';

type OrderDirection = 'up' | 'down' | 'unsorted';
type TickerOrder = 'symbol' | 'last' | '24hr' | 'volume';

export namespace Exchange {

    type TradeTickerModel = {
        tickers: BF.Ticks;
        groups: { [name: string]: BF.SymbolDetail[] };
        orderColumn: TickerOrder;
        orderDirection: OrderDirection;
    }
    export type TradeTickerStore = UnduxStore<TradeTickerModel>;
    export const TradeTickerStore = createStore<TradeTickerModel>({
        tickers: {},
        groups: {},
        orderColumn: 'symbol',
        orderDirection: 'unsorted'
    });
    export type TradeTickerProps = {
        store: TradeTickerStore;
    }

    type FundingTickerModel = {
        tickers: BF.Ticks;
        groups: { [name: string]: BF.SymbolDetail[] };
        orderColumn: TickerOrder;
        orderDirection: OrderDirection;
    }
    export type FundingTickerStore = UnduxStore<FundingTickerModel>;
    export const FundingTickerStore = createStore<FundingTickerModel>({
        tickers: {},
        groups: {},
        orderColumn: 'symbol',
        orderDirection: 'unsorted'
    });
    export type FundingTickerProps = {
        store: FundingTickerStore;
    }


    type OrderBookModel = {
    }
    export type OrderBookStore = UnduxStore<OrderBookModel>;
    export const OrderBookStore = createStore<OrderBookModel>({
    });
    export type OrderBookProps = {
        store: OrderBookStore;
    }


    type TradesModel = {
    }
    export type TradesStore = UnduxStore<TradesModel>;
    export const TradesStore = createStore<TradesModel>({
    });
    export type TradesProps = {
        store: TradesStore;
    }

    type CandlesModel = {
    }
    export type CandlesStore = UnduxStore<TradesModel>;
    export const CandlesStore = createStore<TradesModel>({
    });
    export type CandlesProps = {
        store: CandlesStore;
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
