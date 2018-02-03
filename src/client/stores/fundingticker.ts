import { createStore, Store as UnduxStore } from 'undux';

import { TickerOrder, OrderDirection } from './types';

import { Ticks, SymbolDetail } from '../bitfinex/types';

type FundingTickerModel = {
    tickers: Ticks;
}

export type FundingTickerStore = UnduxStore<FundingTickerModel>;

export const FundingTickerStore = createStore<FundingTickerModel>({
    tickers: {}
});

export type FundingTickerProps = {
    store: FundingTickerStore;
}
