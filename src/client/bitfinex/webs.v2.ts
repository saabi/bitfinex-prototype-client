import * as BF from './types';
import { FundingPairTick } from './types';

export namespace Stream {

    //#region Public functions

    /**
     * Adds a handler that will be called everytime a connection is established.
     * @param handler The handler.
     */
    export function addConnectionHandler(handler: () => void) {
        connectionHandlers.push(handler);
    }
    /**
     * Removes a handler.
     * @param handler The handler.
     */
    export function removeConnectionHandler(handler: () => void) {
        connectionHandlers = connectionHandlers.filter((h) => h !== handler);
    }

    /**
     * Connects to the Bitfinex v2 API server.
     */
    export function connect() {
        wSocket = new WebSocket('wss://api.bitfinex.com/ws/2');
        wSocket.onopen = connectionHandler;
        wSocket.onclose = disconnectionHandler;
        wSocket.onerror = errorHandler;
        wSocket.onmessage = messageHandler;
    }

    /**
     * Subscribes to an arbitrary channel.
     * @param symbol The symbol pair name
     * @param handler A handler that receives new ticks.
     */
    export function subscribe(key: string, payload: any, handler: (o:BF.TradingPairTick) => void) {
        let sub = subscriptions[key];
        if (!sub) {
            subscriptions[key] = sub = [];
            payload.event = 'subscribe';
            wSocket.send(JSON.stringify(payload));
        }
        let i = sub.indexOf(handler);
        if (i >= 0)
            throw new Error('Already subscribed.');
        sub.push(handler);
    }

    /**
     * Unsubscribes from a channel.
     * @param channel 
     */
    export function unsubscribe(key: string, handler: (o:BF.TradingPairTick) => void) {
        let sub = subscriptions[key];
        if (!sub || sub.length === 0)
            throw new Error('Not subscribed.');

        let i = sub.indexOf(handler);
        if (i >= 0)
            sub.splice(i, 1);
        if (sub.length === 0) {
            let chanId = idMap[key];
            wSocket.send(JSON.stringify({
                event: "unsubscribe",
                chanId
            }));
        }
    }

    /**
     * Subscribes to a ticker channel.
     * @param symbol The symbol pair name
     * @param handler A handler that receives new ticks.
     */
    export function subscribeTicker(symbol: string, handler: (o:BF.TradingPairTick) => void) {
        let channel = 'ticker';
        symbol = symbol.toUpperCase();
        subscribe(channel + ':' + symbol, {
            channel,
            symbol
        }, handler);
    }

    /**
     * Subscribes to a funding ticker channel.
     * @param symbol The symbol pair name
     * @param handler A handler that receives new ticks.
     */
    export function subscribeFundingTicker(symbol: string, handler: (o:BF.FundingPairTick) => void) {
        let channel = 'fticker';
        symbol = symbol.toUpperCase();
        subscribe(channel + ':' + symbol, {
            channel,
            symbol
        }, handler);
    }

    /**
     * Subscribes to a ticker channel.
     * @param symbol The symbol pair name
     * @param handler A handler that receives new ticks.
     */
    export function subscribeTrades(symbol: string, handler: (o:any) => void) {
        let channel = 'trades';
        symbol = symbol.toUpperCase();
        subscribe(channel + ':' + symbol, {
            channel,
            symbol
        }, handler);
    }
    /**
     * Subscribes to a ticker channel.
     * @param symbol The symbol pair name
     * @param handler A handler that receives new ticks.
     */
    export function subscribeBook(symbol: string, prec: BF.Precision, freq: number, len: number, handler: (o:any) => void) {
        let channel = 'book';
        symbol = symbol.toUpperCase();
        subscribe(channel + ':' + symbol, {
            channel,
            symbol,
            prec,
            freq,
            len
        }, handler);
    }
    /**
     * Subscribes to a ticker channel.
     * @param symbol The symbol pair name
     * @param handler A handler that receives new ticks.
     */
    export function subscribeRawBook(symbol: string, len: number, handler: (o:any) => void) {
        let channel = 'book';
        symbol = symbol.toUpperCase();
        subscribe(channel + ':' + symbol, {
            channel,
            symbol,
            prec: 'RO',
            len
        }, handler);
    }

    /**
     * Subscribes to a ticker channel.
     * @param symbol The symbol pair name
     * @param handler A handler that receives new ticks.
     */
    export function subscribeCandles(key: string, handler: (o:any) => void) {
        let channel = 'candles';
        //symbol = symbol.toUpperCase();
        subscribe(channel + ':' + key, {
            channel,
            key
        }, handler);
    }

    //#endregion

}

//#region Private Types and Interfaces

type SubscriptionHandler = (msg: any) => void;

interface SubscriptionHandlerList {
    [key: string]: SubscriptionHandler[];
}

//#endregion

//#region Private code

var wSocket: WebSocket;
var connectionHandlers: (() => void)[] = [];
var connected = false;
var subscriptions: SubscriptionHandlerList = {};
var idMap: { [key: string]: number } = {};
var keyMap: { [id: number]: string } = {};

Stream.addConnectionHandler(() => connected = true);

function reconnect() {
    if (!connected)
        setTimeout(reconnect, 10000);
    Stream.connect();
}

function connectionHandler(ev: Event): any {
    console.log('Connected to Bitfinex.');
    console.info(ev);
    connectionHandlers.forEach((handler) => handler());
}

function disconnectionHandler(ev: CloseEvent) {
    connected = false;
    if (ev.wasClean) {
        console.log('Bitfinex connection closed.');
        console.info(ev);
    }
    else {
        console.log('Bitfinex connection closed unexcpectedly.');
        console.info(ev);
        setTimeout(reconnect, 10000);
    }
}

function errorHandler(msg: ErrorEvent) {
    console.error(msg)
}

const subscribedJumpTable: {
    [name: string]: (r: BF.Subscription) => string;
} = {
        ticker: (r: BF.TradeTickerSubscription) => r.channel + ':' + r.pair,
        fticker: (r: BF.FundingTickerSubscription) => r.channel + ':' + r.symbol,
        trades: (r: BF.TradeSubscription) => r.channel + ':' + r.pair,
        book: (r: BF.BookSubscription) => r.channel + ':' + r.pair,
        candles: (r: BF.CandleSubscription) => r.channel + ':' + r.key
    }

const eventJumpTable: {
    [name: string]: (r: BF.BitfinexResponse) => void;
} = {
        info: (r: BF.BitfinexResponse) => {
            console.info(r);
        },
        auth: (r: BF.BitfinexResponse) => { throw new Error('Not Implenented!') },
        subscribed: (r: BF.BitfinexResponse) => {
            let key = subscribedJumpTable[r.channel](r as BF.Subscription);
            idMap[key] = r.chanId;
            keyMap[r.chanId] = key;
        },
        unsubscribed: (r: BF.BitfinexResponse) => {
            console.log(r);
            idMap = {};
            keyMap = {};
            subscriptions = {};
        },
        error: (r: BF.BitfinexResponse) => {
            console.error(r);
            debugger;
        }
    };

const channelJumpTable: {
    [name: string]: (r: any[]) => any;
} = {
        ticker: (r: any[]) : BF.TradingPairTick => {
            return {
                bid: r[0],
                bidSize: r[1],
                ask: r[2],
                askSize: r[3],
                dailyChange: r[4],
                dailyChangePerc: r[5],
                lastPrice: r[6],
                volume: r[7],
                high: r[8],
                low: r[9]
            }
        },
        fticker: (r: any[]) : FundingPairTick => {
            return {
                frr: r[0],
                bid: r[1],
                bidSize: r[2],
                bidPeriod: r[3],
                ask: r[4],
                askSize: r[5],
                askPeriod: r[6],
                dailyChange: r[7],
                dailyChangePerc: r[8],
                lastPrice: r[9],
                volume: r[10],
                high: r[11],
                low: r[12]
            }
        },
        trades: (r: any[]) => r,
        book: (r: any[]) => r,
        candles: (r: any[]) => r
    };

function messageHandler(msg: MessageEvent) {
    let json = JSON.parse(msg.data);
    if (Array.isArray(json)) {
        let chanId = json[0];
        let payload = json[1];
        if (Array.isArray(payload)) {
            let key = keyMap[chanId];
            let sub = subscriptions[key];

            let [channel, k1, k2] = key.split(':');
            let o = channelJumpTable[channel](payload);

            let subkey = k2 ? k1 + ':' + k2 : k1;
            console.log(`Message on ${channel} - ${subkey}`);

            sub.forEach( s => s(o) );
        }
        else if (payload === 'hb') {
            console.log('hb');
        }
    }
    else if ('event' in json) {
        let response = json as BF.BitfinexResponse;
        eventJumpTable[response.event](response);
    }
    else {
        console.error(msg);
        throw new Error('Unidentified message received.');
    }
}

//#endregion

