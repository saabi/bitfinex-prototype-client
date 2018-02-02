import { createStore, Store as UnduxStore } from 'undux';


type TradesModel = {
}

export type TradesStore = UnduxStore<TradesModel>;

export const TradesStore = createStore<TradesModel>({
});

export type TradesProps = {
    store: TradesStore;
}
