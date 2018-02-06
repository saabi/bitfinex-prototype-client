export type Status = 'operative' | 'maintenance';

export type Precision = 'P0' | 'P1' | 'P2' | 'P3';

export type Frequency = 'F0' | 'F1';

export type Length = '25' | '100';

export type Channel = "ticker" | 'fticker' | 'trades' | 'book' | 'candles';

export type EventType = 'auth' | 'subscribed' | 'unsubscribed' | 'info' | 'conf' | 'error';

export interface BitfinexErrorMessage {
    error: string;
}

export interface SymbolDetail {
    pair: string;
    price_precision: number;
    initial_margin: number;
    minimum_margin: number;
    maximum_order_size: number;
    minimum_order_size: number;
    expiration: string;
    margin: boolean;
}

export interface TradingPairTick {
    bid: number;
    bidSize: number;
    ask: number;
    askSize: number;
    dailyChange: number;
    dailyChangePerc: number;
    lastPrice: number;
    volume: number;
    high: number;
    low: number;
}

export interface FundingPairTick extends TradingPairTick {
    frr: number;
    bidPeriod: number;
    askPeriod: number;
}

export interface BookTick {
    price: number;
    count: number;
    amount: number;
}

export interface TradeTick {
    id: number;
    mts: number;
    amount: number;
    price: number;
    rate?: number;
    perion?: number;
}

export interface CandleTick {
    mts: number;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
}

export interface Ticks {
    [symbol: string]: TradingPairTick | FundingPairTick;
}

export interface BitfinexResponse {
    event: EventType;
    channel: Channel;
    chanId: number;
}

export interface Subscription extends BitfinexResponse {
    event: 'subscribed';
}

export interface TickerSubscription extends Subscription {
    channel: "ticker";
    symbol: string;
    pair?: string;
    currency?: string;
}

export interface TradeSubscription extends Subscription {
    channel: "ticker";
    symbol: string;
    pair: string;
}

export interface FundingTradeSubscription extends Subscription {
    channel: 'fticker';
    symbol: string;
}

export interface RawBookSubscription extends Subscription {
    channel: "book";
    symbol: string;
    pair: string;
    prec: Precision;
    len: '25' | '100';
}

export interface BookSubscription extends RawBookSubscription {
    prec: Precision;
}

export interface CandleSubscription extends Subscription {
    channel: 'candles';
    key: string;
}    

export type SubscriptionHandler =
    ((r: TradingPairTick) => void) |
    ((r: FundingPairTick) => void) |
    ((r: TradeTick[]) => void) |
    ((r: BookTick[]) => void) |
    ((r: CandleTick) => void);

export interface SubscriptionHandlerList {
    [key: string]: SubscriptionHandler[];
}

export interface Ticket {
    key: string;
    handler: SubscriptionHandler;
}