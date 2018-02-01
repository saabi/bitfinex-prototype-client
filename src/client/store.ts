import { createStore, Store as UnduxStore} from 'undux';

import * as BF from './bitfinex/types';

export namespace Exchange {

    type AppModel = {
        tickers: BF.Ticks;
        groups: {[name:string]: BF.SymbolDetail[]};
        tickerOrderColumn: TickerOrder;
        tickerOrderDirection: OrderDirection;
    }
    export type AppStore = UnduxStore<AppModel>;
    export const AppStore = createStore<AppModel>({
        tickers: {},
        groups: {},
        tickerOrderColumn: 'symbol',
        tickerOrderDirection: 'unsorted'
    });


    export type AppProps = {
        store: AppStore
    }

    type OrderDirection = 'up' | 'down' | 'unsorted';

    type TickerOrder = 'symbol' | 'last' | '24hr' | 'volume';

    export type TickerProps = {
        tickers: BF.Ticks;
        groups: {[name:string]: BF.SymbolDetail[]};
        orderColumn: TickerOrder;
        orderDirection: OrderDirection;
    }

    export type BookProps = {
    }

    export type TradesProps = {
    }
}
