import React from 'react';
import '../css/App.css';

const symbols = '!@#$%^&*_)';

const getSymbol = (index, seed) => {
    if ((index+1) %9 === 0) return symbols[seed];
    let a = parseInt(Math.random() * 10, 10);
    return symbols[a];
}

export const Block = ({index, seed}) => (
    <div className="block">
        <span className="block-number"> {index+1}</span>
        <span className="block-symbol"> {getSymbol(index, seed)}</span>
    </div>
)

const BlockRow = ({index, columns, seed}) => (
    <div className="blocks-row">
        {
            Array.from(Array(columns)).map((e,ind) =>
                <Block seed={seed} key={ind} index={index*columns+ ind} />
            )
        }
    </div>
)

export class BlocksContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount = () => {
        const seed = parseInt(Math.random() * 10, 10);
        this.setState({seed});
        this.props.setSymbol(symbols[seed]);
    }

    render() {
        return (
            <div className="blocks-container">
                {
                    Array.from(Array(this.props.rows)).map((e,i) => (
                        <BlockRow
                            seed={this.state.seed}
                            key={i}
                            columns={this.props.columns}
                            index={i}
                            totalRows={this.props.rows}
                        />
                    ))
                }
            </div>
        )
    }
}

export default Block;
