import * as BF from './types';

export namespace Stream {

    //#region Public functions

    /**
     * Return `true` if conected.
     */
    export function isConnected() {
        return connected;
    }

    export function simulateDisconnection() {
        disconnectionTest = true;
        wSocket.close();
    }
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
     * Adds a handler that will be called everytime a connection is established.
     * @param handler The handler.
     */
    export function addReconnectionHandler(handler: () => void) {
        reconnectionHandlers.push(handler);
    }
    /**
     * Removes a handler.
     * @param handler The handler.
     */
    export function removeReconnectionHandler(handler: () => void) {
        reconnectionHandlers = reconnectionHandlers.filter((h) => h !== handler);
    }


    /**
     * Adds a handler that will be called everytime the connection is closed.
     * @param handler The handler.
     */
    export function addDisconnectionHandler(handler: (wasClean:boolean) => void) {
        disconnectionHandlers.push(handler);
    }
    /**
     * Removes a handler.
     * @param handler The handler.
     */
    export function removeDisconnectionHandler(handler: (wasClean:boolean) => void) {
        disconnectionHandlers = disconnectionHandlers.filter((h) => h !== handler);
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
    export function subscribe(key: string, payload: any, handler: BF.SubscriptionHandler) : BF.Ticket {
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
        return {key, handler};
    }

    /**
     * Unsubscribes from a channel.
     * @param channel 
     */
    export function unsubscribe(t: BF.Ticket) {
        let sub = subscriptions[t.key];
        if (!sub || sub.length === 0)
            throw new Error('Not subscribed.');

        let i = sub.indexOf(t.handler);
        if (i >= 0)
            sub.splice(i, 1);
        if (sub.length === 0) {
            let chanId = idMap[t.key];
            wSocket.send(JSON.stringify({
                event: "unsubscribe",
                chanId
            }));
        }
        delete keyMap[idMap[t.key]];
        delete subscriptions[t.key];
        delete idMap[t.key];
    }

    /**
     * Subscribes to a ticker channel.
     * @param symbol The symbol pair name
     * @param handler A handler that receives new ticks.
     */ 
    export function subscribeTradeTicker(symbol: string, handler: (o:BF.TradingPairTick) => void) {
        let channel = 'ticker';
        symbol = symbol.toUpperCase();
        return subscribe(channel + ':' + symbol, {
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
        let channel = 'ticker';
        symbol = symbol.toUpperCase();
        return subscribe(channel + ':' + symbol, {
            channel,
            symbol
        }, handler);
    }

    /**
     * Subscribes to a ticker channel.
     * @param symbol The symbol pair name
     * @param handler A handler that receives new ticks.
     */
    export function subscribeTrades(symbol: string, handler: (o:BF.TradeTick[]) => void) {
        let channel = 'trades';
        symbol = symbol.toUpperCase();
        return subscribe(channel + ':' + symbol, {
            channel,
            symbol
        }, handler);
    }
    /**
     * Subscribes to a ticker channel.
     * @param symbol The symbol pair name
     * @param handler A handler that receives new ticks.
     */
    export function subscribeBook(symbol: string, prec: BF.Precision, freq: BF.Frequency, len: BF.Length, handler: (o:BF.BookTick[]) => void) {
        let channel = 'book';
        symbol = symbol.toUpperCase();
        return subscribe(channel + ':' + symbol, {
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
    export function subscribeRawBook(symbol: string, len: number, handler: (o:BF.BookTick[]) => void) {
        let channel = 'book';
        symbol = symbol.toUpperCase();
        return subscribe(channel + ':' + symbol, {
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
    export function subscribeCandles(key: string, handler: (o:BF.CandleTick) => void) {
        let channel = 'candles';
        //symbol = symbol.toUpperCase();
        return subscribe(channel + ':' + key, {
            channel,
            key
        }, handler);
    }

    //#endregion

}

//#region Private code

var wSocket: WebSocket;
var connectionHandlers: (() => void)[] = [];
var reconnectionHandlers: (() => void)[] = [];
var disconnectionHandlers: ((wasClean:boolean) => void)[] = [];
var connected = false;
var subscriptions: BF.SubscriptionHandlerList = {};
var idMap: { [key: string]: number } = {};
var keyMap: { [id: number]: string } = {};
var disconnectionTest = false;

Stream.addConnectionHandler(() => connected = true);

function reconnect() {
    if (connected) 
        return;
    Stream.connect();
    // check if connection succesful in 10 seconds.
    setTimeout(reconnect, 10000);
}

function connectionHandler(ev: Event): any {
    console.log('Connected to Bitfinex.');
    subscriptions = {};
    idMap = {};
    keyMap = {};
    //console.debug(ev);
    connectionHandlers.forEach((handler) => handler());
}

function disconnectionHandler(ev: CloseEvent) {
    connected = false;
    disconnectionHandlers.forEach((handler) => handler(ev.wasClean));
    if (ev.wasClean && !disconnectionTest) {
        disconnectionTest = false;
        console.log('Bitfinex connection closed.');
        console.debug(ev);
    }
    else {
        console.error('Bitfinex connection closed unexcpectedly.');
        console.debug(ev);
        reconnectionHandlers.forEach((handler) => handler());
        reconnect();
    }
}

function errorHandler(msg: ErrorEvent | Event) {
    console.error(msg)
}

type KeyGenerator =
    ((r: BF.TickerSubscription) => string) |
    ((r: BF.TradeSubscription) => string) |
    ((r: BF.BookSubscription) => string) |
    ((r: BF.CandleSubscription) => string)

const subscribedJumpTable: {
    [name: string]: KeyGenerator;
} = {
        ticker: (r: BF.TickerSubscription) => (r.channel + ':' + (r.pair? r.pair : r.currency)) as string,
        trades: (r: BF.TradeSubscription) => r.channel + ':' + r.pair,
        book: (r: BF.BookSubscription) => r.channel + ':' + r.pair,
        candles: (r: BF.CandleSubscription) => r.channel + ':' + r.key
    }

const eventJumpTable: {
    [name: string]: (r: BF.BitfinexResponse) => void;
} = {
        info: (r: BF.BitfinexResponse) => {
            console.debug(r);
        },
        auth: (r: BF.BitfinexResponse) => { throw new Error('Not Implenented!') },
        subscribed: (r: BF.BitfinexResponse) => {
            let key = (<Function>subscribedJumpTable[r.channel]) (r);  // casting to supress compiler error
            idMap[key] = r.chanId;
            keyMap[r.chanId] = key;
        },
        unsubscribed: (r: BF.BitfinexResponse) => {
            console.debug(r);
            let key = keyMap[r.chanId];
        },
        error: (r: BF.BitfinexResponse) => {
            console.error(r);
            debugger;
        }
    };

const channelJumpTable: {
    [name: string]: (r: any[]) => any;
} = {
        ticker: (r: any[]) : BF.TradingPairTick | BF.FundingPairTick => {
            if (r.length === 10) {
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
            }
            else {
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
            }
        },
        trades: (r: any[]) : BF.TradeTick[] => {
            //console.log(r);
            if (Array.isArray(r[0])) {
                let a = r as [number,number,number,number][];
                return a.map( (i:[number,number,number,number]) => {
                    return {
                        id: i[0],
                        mts: i[1],
                        amount: i[2],
                        price: i[3]
                    };
                })
            } else {
                return [{
                    id: r[0],
                    mts: r[1],
                    amount: r[2],
                    price: r[3]
            }]
            }
        },
        book: (r: any[] | any[][]) : BF.BookTick[] => {
            if (Array.isArray(r[0])) {
                let a = r as [number,number,number][];
                return a.map( (i:[number,number,number]) => {
                    return {
                        price: i[0],
                        count: i[1],
                        amount: i[2]
                    };
                })
            } else {
                return [{
                    price: r[0],
                    count: r[1],
                    amount: r[2]
                }]
            }
        },
        candles: (r: any[]) => r
    };

function messageHandler(msg: MessageEvent) {
    let json = JSON.parse(msg.data);
    //console.debug(json);
    if (Array.isArray(json)) {
        let chanId = json[0];
        let payload = json[1];
        if (payload === 'te')
            return;
        if (payload === 'tu')
            payload = json[2]
        if (Array.isArray(payload)) {
            let key = keyMap[chanId];
            let sub = subscriptions[key];

            let [channel, k1, k2] = key.split(':');
            let o = channelJumpTable[channel](payload);

            let subkey = k2 ? k1 + ':' + k2 : k1;
            //console.debug(`Message on ${channel} - ${subkey}`);

            sub.forEach( s => (<Function>s)(o) ); // casting to suppress compiler error
        }
        else if (payload === 'hb') {
            //console.debug('hb');
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

