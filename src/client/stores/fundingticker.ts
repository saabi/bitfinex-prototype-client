import { createStore, Store as UnduxStore } from 'undux';

import { TickerOrder, OrderDirection } from './types';

import { Ticks, SymbolDetail } from '../bitfinex/types';

type FundingTickerModel = {
    tickers: Ticks;
    groups: { [name: string]: SymbolDetail[] };
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
