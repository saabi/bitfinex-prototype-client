import * as React from 'react';
import * as Exchange from '../../stores';
import { SymbolDetail, Ticks, FundingPairTick } from '../../bitfinex/types';
import { connect, createStore, Store as UnduxStore } from 'undux';
import { OrderButton } from '../order-button';
import { TickerOrder, OrderDirection } from '../../stores/types';
import { TickerSortingModel, TickerSortingStore } from '../../stores/ticker-sorter';

interface RowProps {
    symbol: string;
    tick: FundingPairTick;
}

class FundingTickerRow extends React.Component<RowProps> {
    shouldComponentUpdate(nextProps: RowProps) {
        return nextProps.tick !== this.props.tick;
    }
    
    render() {
        let tick = this.props.tick;
        let symbol = this.props.symbol;
        return (
            <tr>
                <td>{symbol}</td>
                <td>{(100*tick.lastPrice).toFixed(6)}</td>
                <td className={tick.dailyChangePerc>0?'positive':'negative'}>{(100*tick.dailyChangePerc).toFixed(2)}%</td>
                <td>{Math.round(tick.volume).toLocaleString()}</td>
            </tr>
        )
    }
}

interface State {
    sortingStore: TickerSortingStore;
}

export class FundingTicker extends React.Component<Exchange.FundingTickerProps, State> {
    BoundOrderButton: React.ComponentClass<{
        id: string;
    }>;

    constructor(props: Exchange.FundingTickerProps) {
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
        const store = this.props.store;
        const tickers = store.get('tickers');

        const sortingStore = this.state.sortingStore;
        const column = sortingStore.get('column');
        const direction = sortingStore.get('direction');
        const sortedTickers = Object.getOwnPropertyNames(tickers).map(symbol => ({s:symbol, t:tickers[symbol] as FundingPairTick}) );
        sortedTickers.sort((a,b) => {
            if (direction !== OrderDirection.unsorted) {
                let c = a;
                let d = b;
                if ( direction === OrderDirection.down) {
                    c = b;
                    d = a;
                }
                switch (column) {
                    case 'symbol':
                        return c.s > d.s ? 1 : -1;
                    case 'last':
                        return c.t.lastPrice - d.t.lastPrice;
                    case '24hr':
                        return c.t.dailyChangePerc - d.t.dailyChangePerc;
                    case 'volume':
                        return c.t.volume - d.t.volume;
                }
            }
            return 0;
        })

        return (
            <div id='fundingticker' className='widget'>
                <h3>Funding Ticker</h3>
                <table className='ticker'>
                    <thead>
                        <tr>
                            <td>symbol<this.BoundOrderButton id='symbol' /></td>
                            <td>last<this.BoundOrderButton id='last' /></td>
                            <td>24hr<this.BoundOrderButton id='24hr' /></td>
                            <td>volume<this.BoundOrderButton id='volume' /></td>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTickers.map(a => <FundingTickerRow key={a.s} symbol={a.s} tick={a.t} />)}
                    </tbody>
                </table>
            </div>
        )
    }
}
