'use strict';
var React =  require('react');
var ReactDom = require('react-dom');
var Plotly = require('plotly.js');
var _ = require('underscore');

require('./index.less');

class App extends React.Component {
    constructor(props) {
        super(props);

        this._layout = {
            title: 'Test Noise'
        };

        this._config = {
            showLink: false,
            displayModeBar: true
        };

        this.onClickRandomize = this.onClickRandomize.bind(this);
    }

    componentDidMount() {
        Plotly.plot(this._node, [this.props.plot], this._layout, this._config);
    }

    componentDidUpdate() {
        Plotly.redraw(this._node);
    }

    componentWillUnmount() {
        var cruft = document.getElementById('js-plotly-tester');
        cruft.parentNode.removeChild(cruft);
    }

    onClickRandomize() {
        fakeData.y = _.range(0,100).map(x => Math.random());
        this.forceUpdate();
    }

    render () {
        return <div className='App' onClick={this.onClickRandomize} ref={node => this._node = node}></div>;
    }
}

App.displayName = 'App';

App.propTypes = {
    plot: React.PropTypes.shape({
        x: React.PropTypes.arrayOf(React.PropTypes.number),
        y: React.PropTypes.arrayOf(React.PropTypes.number),
        mode: React.PropTypes.string,
        name: React.PropTypes.string
    })
};

let fakeData = {
    x: _.range(0,100),
    y: _.range(0,100).map(x => Math.random()),
    mode: 'lines',
    name: 'noise 1'
};

ReactDom.render(<App plot={fakeData}/>, document.getElementById('app'));
