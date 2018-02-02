import { createStore, Store as UnduxStore } from 'undux';


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
