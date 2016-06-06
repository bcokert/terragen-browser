import React from 'react';
import ReactDom from 'react-dom';

require('./index.less');

class App extends React.Component {
    render () {
        return <p>Hello!</p>;
    }
}

ReactDom.render(<App/>, document.getElementById('app'));
