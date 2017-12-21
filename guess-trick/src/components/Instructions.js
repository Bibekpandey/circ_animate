import React, {Component} from 'react';

import '../css/App.css';


class Instructions extends Component {
    constructor(props) {
        super(props);
        this.instructions = [
            "Choose one of the numbers from the left.",
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
        this.setState({step});
        if (step>3)
            window.location.reload();
    }

    getButtonText = () => {
        if (this.state.step<3) {
            return "Done";
        }
        return "Replay";
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
                <div className="instruction-text">
                    <h1>{this.getCurrentText()}</h1>
                </div>
                <button onClick={this.nextStep} className="instruction-button">
                    {this.getButtonText()}
                </button>
            </div>
        )
    }
}


export default Instructions;
