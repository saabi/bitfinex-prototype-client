import { createStore, Store as UnduxStore } from 'undux';
import { BookTick } from '../bitfinex/types';


type OrderBookModel = {
    symbol: string | null;
    book: {[price:string]: BookTick};
}

export type OrderBookStore = UnduxStore<OrderBookModel>;

export const OrderBookStore = createStore<OrderBookModel>({
    symbol: null,
    book: {}
});

export type OrderBookProps = {
    store: OrderBookStore;
}
