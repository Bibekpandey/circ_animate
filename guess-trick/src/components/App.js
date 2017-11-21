import React, { Component } from 'react';
import {BlocksContainer} from './Block';
import Instructions from './Instructions';
import '../css/App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {symbol: null};
    }

    getSymbol = (symbol) => {
        this.setState({symbol})
    }

    render() {
        return (
        <div className="App">
            <div className="App-header">
            <h2>Guessing Game</h2>
            </div>
            <BlocksContainer rows={7} columns={12} setSymbol={this.getSymbol} />
            <Instructions  symbol={this.state.symbol} />
        </div>
        );
    }
}

export default App;
