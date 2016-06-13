"use strict";

var React = require("react");
var NoiseBrowser1D = require("../noise-browser/noise-browser.jsx");

require("./noise-browser-list.less");

class NoiseBrowserList extends React.Component {
    constructor (props) {
        super(props);
    }

    renderNoiseBrowsers () {
        return this.props.browserList.map((browserData, i) => <NoiseBrowser1D displayName={browserData.displayName} endpoint={browserData.endpoint} initialNoiseFunction={browserData.noiseFunction} key={"NoiseBrowser1D_" + i}/>);
    }

    render () {
        return (
            <div className="NoiseBrowserList">
                {this.renderNoiseBrowsers()}
            </div>
        );
    }
}

NoiseBrowserList.displayName = "NoiseBrowserList";

NoiseBrowserList.propTypes = {
    browserList: React.PropTypes.arrayOf(React.PropTypes.shape({
        displayName: React.PropTypes.string.isRequired,
        endpoint: React.PropTypes.string.isRequired,
        noiseFunction: React.PropTypes.string.isRequired
    })).isRequired
};

module.exports = NoiseBrowserList;
