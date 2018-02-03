import { createStore, Store as UnduxStore } from 'undux';


type CandlesModel = {
    symbol: string | null;
}

export type CandlesStore = UnduxStore<CandlesModel>;

export const CandlesStore = createStore<CandlesModel>({
    symbol: null
});

export type CandlesProps = {
    store: CandlesStore;
}
