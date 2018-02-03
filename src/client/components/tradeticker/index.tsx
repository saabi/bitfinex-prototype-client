import * as React from 'react';
import * as Exchange from '../../stores';
import { OrderButton } from '../order-button';
import { TickerOrder, OrderDirection } from '../../stores/types';
import { SymbolDetail, Ticks, TradingPairTick } from '../../bitfinex/types';
import { TradeTickerStore } from '../../stores';

interface State {
    direction: OrderDirection;
    column: TickerOrder;
}

interface RowProps {
    first: boolean;
    selected: boolean;
    groupLength: number;
    //detail: SymbolDetail;
    symbol: string;
    pair: string;
    tick: TradingPairTick;
    store: TradeTickerStore;
}
class TradeTickerRow extends React.Component<RowProps> {

    shouldComponentUpdate(nextProps: RowProps) {
        return nextProps.tick !== this.props.tick;
    }

    render() {
        const pair = this.props.pair;
        const tick = this.props.tick;
        const store = this.props.store;
        const selected = this.props.selected;
        const first = this.props.first;
        const gLength = this.props.groupLength;
        const symbol = this.props.symbol;
        let lpF = (tick.lastPrice).toFixed(6);
        let lpP = (tick.lastPrice).toPrecision(6);
        return (
            <tr onClick={() => store.set('selectedSymbol')(pair)} className={selected?'selected':''}>
                {first ? <td rowSpan={gLength}>{symbol}</td> : null}
                <td>{lpF.length < lpP.length ? lpF : lpP}&nbsp;{pair.substr(3,3)}</td>
                <td className={tick.dailyChangePerc>0?'positive':'negative'}>{(100*tick.dailyChangePerc).toFixed(2)}%</td>
                <td>{Math.round(tick.volume).toLocaleString()}</td>
            </tr>
        )
    }
}

interface GroupProps {
    symbol: string;
    group: SymbolDetail[];
    tickers: Ticks;
    store: TradeTickerStore;
}
class TradeTickerRowGroup extends React.Component<GroupProps> {
    render() {
        const symbol = this.props.symbol;
        const group = this.props.group;
        const tickers = this.props.tickers;
        const store = this.props.store;
        const sel = this.props.store.get('selectedSymbol');
        let c = 0;
        return (
            <tbody key={symbol}>
                {group.map(gi => {
                    c++;
                    let i = tickers[gi.pair] as TradingPairTick;
                    return (
                        <TradeTickerRow key={gi.pair} symbol={symbol} pair={gi.pair} first={c===1} selected={sel===gi.pair} tick={i} store={store} groupLength={group.length}/>
                    )}
                )}
            </tbody>
        )
    }
}

export class TradeTicker extends React.Component<Exchange.TradeTickerProps, State> {
    constructor(props:Exchange.TradeTickerProps) {
        super(props);
        this.state = {
            direction: OrderDirection.unsorted,
            column: 'symbol'
        }
    }
    render() {
        const handleSorting = (id: string, direction: OrderDirection) => {
        }
        const store = this.props.store;
        const tickers = store.get('tickers');
        const groups = store.get('groups');

        let groupNames = Object.getOwnPropertyNames(groups);

        return (
            <div id='tradesticker' className='widget'>
                <h3>Ticker</h3>
                <table className='ticker'>
                    <thead>
                        <tr>
                            <td>symbol<OrderButton id='symbol' onDirection={handleSorting} /></td>
                            <td>last<OrderButton id='last' onDirection={handleSorting} /></td>
                            <td>24hr<OrderButton id='24hr' onDirection={handleSorting} /></td>
                            <td>volume<OrderButton id='volume' onDirection={handleSorting} /></td>
                        </tr>
                    </thead>
                    {groupNames.map(symbol => <TradeTickerRowGroup group={groups[symbol]} symbol={symbol} tickers={tickers} store={store} />)}
                </table>
            </div>
        )
    }
}
