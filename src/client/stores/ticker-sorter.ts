import { createStore, Store as UnduxStore } from 'undux';
import { BookTick } from '../bitfinex/types';
import { OrderDirection, TickerOrder } from '.';


export type TickerSortingModel = {
    direction: OrderDirection;
    column: TickerOrder;
}

export type TickerSortingStore = UnduxStore<TickerSortingModel>;
