import React, {Component} from 'react';

import '../css/App.css';


class Instructions extends Component {
    constructor(props) {
        super(props);
        this.instructions = [
            "Choose one of the 2-digit numbers on the right side.",
            "Sum the digits of the number.",
            "Subtract the sum from the original number.",
            " is the symbol you got, ain't it?",
        ];
        this.state = {step:0};
    }

    componentWillReceiveProps = ({symbol}) => {
        this.setState({symbol})
    }

    nextStep = () => {
        const step = this.state.step + 1;
        console.log('next step');
        this.setState({step});
    }

    getCurrentText = () => {
        if (this.state.step<3) {
            return this.instructions[this.state.step];
        }
        return this.state.symbol + this.instructions[this.state.step];
    }

    render () {
        return (
            <div className="instructions">
                <div className="">
                    <h3>{this.getCurrentText()}</h3>
                </div>
                <button onClick={this.nextStep} className="app-button">
                    Done
                </button>
            </div>
        )
    }
}


export default Instructions;
