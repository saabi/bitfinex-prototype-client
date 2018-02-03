import * as React from 'react';
import { OrderDirection } from '../../stores/types';

interface Props {
    id: string;
    onDirection?: (id: string, direction: OrderDirection) => void;
}

interface State {
    direction: OrderDirection;
}

export class OrderButton extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {direction:OrderDirection.unsorted};
    }
    render() {
        let handleClick = () => {
            this.setState( (previous: State) => {
                return {direction: (previous.direction + 1) % 3} }
            );
            if (this.props.onDirection)
                this.props.onDirection(this.props.id, this.state.direction);
        };
        let d = this.state.direction;
        let label = d===OrderDirection.up?'▴':d===OrderDirection.down?'▾':''
        return (
            <button onClick={handleClick}>{label}</button>
        )
    }
}
