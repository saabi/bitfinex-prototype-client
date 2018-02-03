import * as React from 'react';

export type HeaderProps = {
    isConnected: boolean;
    currentSymbol: string | null;
}

export class Header extends React.Component<HeaderProps> {
    render() {
        let symbol = this.props.currentSymbol || 'no symbol selected';
        return (
            <div id='header'>
                <h1>Bitfinex</h1>
                <h2>Prototype Client</h2>
                <p id="currentSymbol">{symbol}</p>
                <p id='connectionStatus'>{this.props.isConnected ? 'Connected' : 'Disconnected'}</p>
            </div>
        )
    }
}
