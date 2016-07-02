"use strict";

var React = require("react");
var Plotly = require("plotly.js");
var Ajax = require("../../ajax/ajax");
var TextField = require("../control/text-field/text-field.jsx");

require("./noise-browser.less");

class NoiseBrowser1D extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            x: [],
            y: [],
            mode: "lines",

            from: "0",
            to: "5",
            resolution: "40",
            noiseFunction: props.initialNoiseFunction,

            errors: []
        };

        this.getLayout = this.getLayout.bind(this);
        this.getPlot = this.getPlot.bind(this);
        this.getConfig = this.getConfig.bind(this);

        this.fetchNoise = this.fetchNoise.bind(this);

        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
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
        Ajax.request({
            url: this.props.endpoint,
            method: "GET",
            queryParams: {
                from: this.state.from,
                to: this.state.to,
                resolution: this.state.resolution,
                noiseFunction: this.state.noiseFunction
            }
        }).then(response => {
            if (response.rawNoise && response.rawNoise.value && response.rawNoise.t1) {
                this.setState({
                    x: response.rawNoise.t1,
                    y: response.rawNoise.value,
                    errors: []
                });
            } else {
                throw new Error("Invalid response from server: " + JSON.stringify(response));
            }
        }).catch(e => {
            this.setState({ 
                errors: [e.message]
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
                    <TextField label="From" onChange={v => this.setState({from: v})} validate={v => !isNaN(v) && String(parseFloat(v)).length === v.length} value={this.state.from}/>
                    <TextField label="To" onChange={v => this.setState({to: v})} validate={v => !isNaN(v) && String(parseFloat(v)).length === v.length} value={this.state.to}/>
                    <TextField label="Resolution" onChange={v => this.setState({resolution: v})} validate={v => !isNaN(v) && String(parseInt(v)).length === v.length} value={this.state.resolution}/>
                    <TextField label="NoiseFunction" readOnly value={this.state.noiseFunction}/>
                </div>
                <div className="-errors">
                    {this.renderErrors()}
                </div>
                <div className="-plotArea" ref={node => this._plotArea = node}></div>
                <div className="-control -bottom"></div>
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
