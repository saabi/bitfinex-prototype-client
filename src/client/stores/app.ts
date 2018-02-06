import { createStore, Store as UnduxStore } from 'undux';


type AppModel = {
    isConnected: boolean;
    isConnecting: boolean;
    isRateLimited: boolean;
    currentSymbol: string | null;
    testDisconnection: boolean;
}

export type AppStore = UnduxStore<AppModel>;

export const AppStore = createStore<AppModel>({
    isConnected: false,
    isConnecting: false,
    isRateLimited: false,
    currentSymbol: null,
    testDisconnection: false
});

export type AppProps = {
    store: AppStore;
}