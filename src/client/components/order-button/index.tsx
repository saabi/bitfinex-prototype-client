import * as React from 'react';
import { OrderDirection, TickerOrder } from '../../stores/types';
import { TickerSortingStore } from '../../stores/ticker-sorter';

interface TradeSortingProps {
    id: string;
    store: TickerSortingStore;
}

export class OrderButton extends React.Component<TradeSortingProps> {
    constructor(props:TradeSortingProps) {
        super(props);
    }
    render() {
        const store = this.props.store;
        const id = this.props.id;
        let handleClick = () => {
            const column = store.get('column');
            let d = store.get('direction');    
            if (column !== id) {
                store.set('column')(this.props.id as TickerOrder);
                if (d === OrderDirection.unsorted)
                    store.set('direction')( (d + 1) % 3 );
            } else
                store.set('direction')( (d + 1) % 3 );
        };
        let d = store.get('direction');
        let isThisButton = store.get('column') === id;
        let label = isThisButton ? (d===OrderDirection.up?'▴':d===OrderDirection.down?'▾':'') : '';
        return (
            <button onClick={handleClick}>{label}</button>
        )
    }
}
