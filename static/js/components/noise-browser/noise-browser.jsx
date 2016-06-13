"use strict";

var React = require("react");
var Plotly = require("plotly.js");
var Request = require("../../ajax/request");

require("./noise-browser.less");

class NoiseBrowser1D extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            x: [],
            y: [],
            mode: "lines",

            from: 0,
            to: 10,
            resolution: 20,
            noiseFunction: props.initialNoiseFunction,

            errors: []
        };

        this.getLayout = this.getLayout.bind(this);
        this.getPlot = this.getPlot.bind(this);
        this.getConfig = this.getConfig.bind(this);

        this.fetchNoise = this.fetchNoise.bind(this);

        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
    }

    componentDidMount () {
        Plotly.plot(this._plotArea, [this.getPlot()], this.getLayout(), this.getConfig());
        this.fetchNoise();
    }

    componentDidUpdate (previousProps, previousState) {
        if (
            previousState.from !== this.state.from
            || previousState.to !== this.state.to
            || previousState.resolution !== this.state.resolution
            || previousState.noiseFunction !== this.state.noiseFunction
        ) {
            this.fetchNoise();
        }

        if (
            previousState.x !== this.state.x
            || previousState.y !== this.state.y
            || previousState.mode !== this.state.mode
        ) {
            Plotly.deleteTraces(this._plotArea, 0);
            Plotly.addTraces(this._plotArea, this.getPlot());
        }
    }

    componentWillUnmount () {
        var cruft = document.getElementById("js-plotly-tester");
        cruft.parentNode.removeChild(cruft);
    }

    getLayout () {
        return {
            margin: {
                l: 0,
                r: 0,
                t: 0,
                b: 0
            },
            height: 300,
            width: this._plotArea.offsetWidth
        };
    }

    getConfig () {
        return {
            showLink: false,
            displayModeBar: false
        };
    }

    getPlot () {
        return {
            x: this.state.x,
            y: this.state.y,
            mode: this.state.mode
        };
    }

    fetchNoise () {
        Request.Get(Request.AddParams(this.props.endpoint, {
            from: this.state.from,
            to: this.state.to,
            resolution: this.state.resolution,
            noiseFunction: this.state.noiseFunction
        })).then(response => {
            if (response.rawNoise && response.rawNoise.value && response.rawNoise.x) {
                this.setState({
                    x: response.rawNoise.x,
                    y: response.rawNoise.value,
                    errors: []
                });
            } else {
                throw new Error("Invalid response from server: " + JSON.stringify(response));
            }
        }).catch(e => {
            this.setState({
                errors: [e.error]
            });
        });
    }

    renderErrors () {
        return this.state.errors.map(e => <span className="-error x-value">{e}</span>);
    }

    render () {
        return (
            <div className="NoiseBrowser1D">
                <div className="-title">
                    <span className="x-label">{this.props.displayName}</span>
                </div>
                <div className="-control -top">
                    <span className="x-label">From:</span>
                    <input className="x-input" onChange={e => this.setState({from: e.target.value})} type="text" value={this.state.from}/>
                    <span className="x-label">To:</span>
                    <input className="x-input" onChange={e => this.setState({to: e.target.value})} type="text" value={this.state.to}/>
                    <span className="x-label">Resolution:</span>
                    <input className="x-input" onChange={e => this.setState({resolution: e.target.value})} type="text" value={this.state.resolution}/>
                    <span className="x-label">NoiseFunction:</span>
                    <span className="x-value">{this.state.noiseFunction}</span>
                </div>
                <div className="-errors">
                    {this.renderErrors()}
                </div>
                <div className="-plotArea" ref={node => this._plotArea = node}></div>
                <div className="-control -bottom">
                    <span className="x-label">First Ten Points:</span>
                    <span className="x-value">{this.state.x.slice(0, 10).map((x, i) => "(" + x + "," + this.state.y[i] + ")").join(", ")}</span>
                </div>
            </div>
        );
    }
}

NoiseBrowser1D.displayName = "NoiseBrowser1D";

NoiseBrowser1D.propTypes = {
    displayName: React.PropTypes.string.isRequired,
    endpoint: React.PropTypes.string.isRequired,
    initialNoiseFunction: React.PropTypes.string.isRequired
};

module.exports = NoiseBrowser1D;
