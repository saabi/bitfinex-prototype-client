import { createStore, Store as UnduxStore } from 'undux';

import { TickerOrder, OrderDirection } from './types';

import { Ticks, SymbolDetail } from '../bitfinex/types';

type TradeTickerModel = {
    tickers: Ticks;
    groups: { [name: string]: SymbolDetail[] };
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
