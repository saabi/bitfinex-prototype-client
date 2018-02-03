import { createStore, Store as UnduxStore } from 'undux';
import { TradeTick } from '../bitfinex/types';


type TradesModel = {
    symbol: string | null;
    trades: TradeTick[];
}

export type TradesStore = UnduxStore<TradesModel>;

export const TradesStore = createStore<TradesModel>({
    symbol: null,
    trades: []
});

export type TradesProps = {
    store: TradesStore;
}
