import { createStore, Store as UnduxStore } from 'undux';


type CandlesModel = {
}

export type CandlesStore = UnduxStore<CandlesModel>;

export const CandlesStore = createStore<CandlesModel>({
});

export type CandlesProps = {
    store: CandlesStore;
}
