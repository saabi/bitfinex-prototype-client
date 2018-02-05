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
    symbol: string;
    pair: string;
    tick: TradingPairTick;
    onClick: () => void ;
}
class TradeTickerRow extends React.Component<RowProps> {

    shouldComponentUpdate(nextProps: RowProps) {
        return nextProps.tick !== this.props.tick || this.props.selected !== nextProps.selected;
    }

    render() {
        const props = this.props;
        const tick = props.tick;
        let lpF = (tick.lastPrice).toFixed(6);
        let lpP = (tick.lastPrice).toPrecision(6);
        const dailyChangePerc = tick.dailyChangePerc;
        return (
            <tr className={props.selected?'selected':''} onClick={props.onClick}>
                {props.first ? <td rowSpan={props.groupLength}>{props.symbol}</td> : null}
                <td>{lpF.length < lpP.length ? lpF : lpP}&nbsp;{props.pair.substr(3,3)}</td>
                <td className={dailyChangePerc>0?'positive':'negative'}>{(100*dailyChangePerc).toFixed(2)}%</td>
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
    selectedSymbol: string;
}
class TradeTickerRowGroup extends React.Component<GroupProps> {
    shouldComponentUpdate(nextProps: GroupProps) {
        const g = this.props.group;
        const t = this.props.tickers;
        const nt = nextProps.tickers;
        let changed=false;
        for (let i in g) {
            let pair = g[i].pair
            changed = changed || t[pair] !== nt[pair] || (this.props.selectedSymbol !== nextProps.selectedSymbol && (this.props.selectedSymbol === pair || nextProps.selectedSymbol === pair));
        }
        return changed;
    }
    render() {
        const props = this.props;
        const group = props.group;
        let c = 0;
        return (
            <tbody>
                {group.map(gi => {
                    c++;
                    const pair = gi.pair;
                    let tick = props.tickers[gi.pair] as TradingPairTick;
                    return (
                        <TradeTickerRow key={pair} tick={tick} symbol={props.symbol} pair={pair} onClick={() => props.store.set('selectedSymbol')(pair)} first={c===1} selected={props.selectedSymbol===pair} groupLength={group.length}/>
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
        const selectedSymbol = store.get('selectedSymbol');

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
                    {groupNames.map(symbol => <TradeTickerRowGroup key={symbol} group={groups[symbol]} symbol={symbol} tickers={tickers} store={store} selectedSymbol={selectedSymbol as string} />)}
                </table>
            </div>
        )
    }
}
