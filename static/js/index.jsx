"use strict";
var React = require("react");
var ReactDom = require("react-dom");
var NoiseBrowserList = require("./components/noise-browser-list/noise-browser-list.jsx");

require("./index.less");

class App extends React.Component {
    constructor (props) {
        super(props);
    }

    render () {
        return (
            <div className="App">
                <NoiseBrowserList browserList={[{
                    displayName: "Sinusoidal White Noise",
                    endpoint: "http://localhost:8080/noise",
                    noiseFunction: "white:1d"
                },{
                    displayName: "Sinusoidal Red Noise",
                    endpoint: "http://localhost:8080/noise",
                    noiseFunction: "red:1d"
                }]}/>
            </div>
        );
    }
}

App.displayName = "App";

App.propTypes = {};

ReactDom.render(<App />, document.getElementById("app"));
