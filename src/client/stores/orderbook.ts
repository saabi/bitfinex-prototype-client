import { createStore, Store as UnduxStore } from 'undux';


type OrderBookModel = {
}

export type OrderBookStore = UnduxStore<OrderBookModel>;

export const OrderBookStore = createStore<OrderBookModel>({
});

export type OrderBookProps = {
    store: OrderBookStore;
}
