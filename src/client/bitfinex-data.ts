export namespace Bitfinex {

    export namespace V1 {
        interface SymbolDetail {
            pair: string;
            price_precision: number;
            initial_margin: number;
            minimum_margin: number;
            maximum_order_size: number;
            minimum_order_size: number;
            expiration: string;
            margin: boolean;
        }

        const apiUrl = 'http://localhost:8080/v1/';

        async function getJSON<T>(path: string): Promise<T> {
            let r = await fetch(apiUrl + path);
            let json = await r.json() as T;
            if (r.status === 200)
                return json;
            throw json;
        }

        export async function getSymbols() {
            return await getJSON<string[]>('symbols');
        }
        export async function getSymbolsDetails() {
            return await getJSON<SymbolDetail[]>('symbols_details');
        }
    }

    export namespace V2 {
        type Status = 'operative' | 'maintenance';

        const apiUrl = 'https://api.bitfinex.com/v2/';

        async function getJSON<T>(path: string): Promise<T> {
            let r = await fetch(apiUrl + path);
            let json = await r.json() as T;
            if (r.status === 200)
                return json;
            throw json;
        }

        export async function getStatus() : Promise<Status> {
            let response = await getJSON<[number]>('platform/status');
            return response[0] === 1 ? 'operative' : 'maintenance';
        }
    }

    export namespace Stream {
        var wSocket: WebSocket;
        var connectionHandlers: (() => void)[] = [];

        function connectionHandler(msg: any) {
            console.log('Connected to Bitfinex.');
            console.info(msg);
            connectionHandlers.forEach((handler) => handler());
        }

        function disconnectionHandler(msg: any) {
            console.log('Bitfinex Connection Closed.');
            console.info(msg);
        }

        function errorHandler(msg: any) {
            console.error(msg)
        }

        function messageHandler(msg: any) {
            console.log(msg);
        }

        export function addConnectionHandler(handler: () => void) {
            connectionHandlers.push(handler);
        }
        export function removeConnectionHandler(handler: () => void) {
            connectionHandlers = connectionHandlers.filter((h) => h !== handler);
        }

        export function connect() {
            wSocket = new WebSocket('wss://api.bitfinex.com/ws/2');
            wSocket.onopen = connectionHandler;
            wSocket.onclose = disconnectionHandler;
            wSocket.onerror = errorHandler;
            wSocket.onmessage = messageHandler;
        }

        export function subscribe(channelName: string, pairName: string, handler: () => void) {
            wSocket.send(JSON.stringify({
                event: "subscribe",
                channel: channelName,
                pair: pairName
            }));
        }

        export function unsubscribe(channelName: string) {

        }

    }
}
