import * as React from 'react';
import * as Exchange from '../../stores';
import { TradeTickerStore } from '../../stores';
import { connect, createStore, Store as UnduxStore } from 'undux';
import { OrderButton } from '../order-button';
import { TickerOrder, OrderDirection } from '../../stores/types';
import { SymbolDetail, Ticks, TradingPairTick } from '../../bitfinex/types';
import { TickerSortingModel, TickerSortingStore } from '../../stores/ticker-sorter';
import * as style from './style.css';

interface RowProps1 {
    symbol: string;
    tick: TradingPairTick;
    selected: boolean;
    onClick: () => void ;
}
class TradeTickerRow1 extends React.Component<RowProps1> {

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
                <td>{props.symbol}</td>
                <td>{lpF.length < lpP.length ? lpF : lpP}</td>
                <td className={dailyChangePerc>0?'positive':'negative'}>{(100*dailyChangePerc).toFixed(2)}%</td>
                <td>{Math.round(tick.volume).toLocaleString()}</td>
            </tr>
        )
    }
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
            <tbody className={style.rowGroup}>
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

interface State {
    sortingStore: TickerSortingStore;
}

export class TradeTicker extends React.Component<Exchange.TradeTickerProps, State> {
    BoundOrderButton: React.ComponentClass<{
        id: string;
    }>;

    constructor(props: Exchange.TradeTickerProps) {
        super(props);
        const sortingStore = createStore<TickerSortingModel>({
            direction: OrderDirection.unsorted,
            column: 'symbol'
        });
        this.state = {
            sortingStore: sortingStore
        };
        this.BoundOrderButton = connect(sortingStore) ('direction','column') (OrderButton);
    
        const self = this;
        sortingStore.on('direction')
            .subscribe(v => { self.forceUpdate() }  );
        sortingStore.on('column')
            .subscribe(v => { self.forceUpdate() }  );
    }
    render() {
        const handleSorting = (id: string, direction: OrderDirection) => {
        }
        const store = this.props.store;
        const tickers = store.get('tickers');
        const groups = store.get('groups');
        const selectedSymbol = store.get('selectedSymbol');

        let groupNames = Object.getOwnPropertyNames(groups);


        const sortingStore = this.state.sortingStore;
        const column = sortingStore.get('column');
        const direction = sortingStore.get('direction');
        const sortedTickers = Object.getOwnPropertyNames(tickers).map(symbol => ({s:symbol, t:tickers[symbol] as TradingPairTick}) );
        let rows: JSX.Element[];
        if (column === 'symbol' && direction !== OrderDirection.unsorted) {
            const sortedGroupNames = groupNames.slice();
            sortedGroupNames.sort((a,b) => {
                let c = a;
                let d = b;
                if ( direction === OrderDirection.down) {
                    c = b;
                    d = a;
                }
                return c > d ? 1 : -1;
            });
            rows = sortedGroupNames.map(symbol => <TradeTickerRowGroup key={symbol} group={groups[symbol]} symbol={symbol} tickers={tickers} store={store} selectedSymbol={selectedSymbol as string} />);
        }
        else if (direction !== OrderDirection.unsorted) {
            sortedTickers.sort((a,b) => {
                let c = a;
                let d = b;
                if ( direction === OrderDirection.down) {
                    c = b;
                    d = a;
                }
                switch (column) {
                    case 'last':
                        return c.t.lastPrice - d.t.lastPrice;
                    case '24hr':
                        return c.t.dailyChangePerc - d.t.dailyChangePerc;
                    case 'volume':
                        return c.t.volume - d.t.volume;
                }
                return 0;
            });
            rows = sortedTickers.map(a => <TradeTickerRow1 key={a.s} symbol={a.s} tick={a.t} selected={selectedSymbol! === a.s} onClick={() => store.set('selectedSymbol')(a.s)}/>);
        }
        else {
            rows = groupNames.map(symbol => <TradeTickerRowGroup key={symbol} group={groups[symbol]} symbol={symbol} tickers={tickers} store={store} selectedSymbol={selectedSymbol as string} />);
        }

        return (
            <div id='tradesticker' className='widget'>
                <h3>Ticker</h3>
                <table className='ticker'>
                    <thead>
                        <tr>
                            <td>symbol<this.BoundOrderButton id='symbol' /></td>
                            <td>last<this.BoundOrderButton id='last' /></td>
                            <td>24hr<this.BoundOrderButton id='24hr' /></td>
                            <td>volume<this.BoundOrderButton id='volume' /></td>
                        </tr>
                    </thead>
                    {rows}
                </table>
            </div>
        )
    }
}
