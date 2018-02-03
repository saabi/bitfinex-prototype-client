import { createStore, Store as UnduxStore } from 'undux';


type OrderBookModel = {
    symbol: string | null;
}

export type OrderBookStore = UnduxStore<OrderBookModel>;

export const OrderBookStore = createStore<OrderBookModel>({
    symbol: null
});

export type OrderBookProps = {
    store: OrderBookStore;
}
