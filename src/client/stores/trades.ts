import { createStore, Store as UnduxStore } from 'undux';


type TradesModel = {
    symbol: string | null;
}

export type TradesStore = UnduxStore<TradesModel>;

export const TradesStore = createStore<TradesModel>({
    symbol: null
});

export type TradesProps = {
    store: TradesStore;
}
