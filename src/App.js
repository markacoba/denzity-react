import React from 'react';
import logo from './logo.svg';
import axios from "axios";
import './App.css';

const NODE_URL = (process.env.REACT_APP_NODE_BASE_URL) ? process.env.REACT_APP_NODE_BASE_URL : '';

function App() {

  React.useEffect(() => {
    axios({
      url: NODE_URL + `/api/project-properties/1`,
      method: 'get'
    }).then(res => {
      console.log(res)
    }).catch(e => console.log(e));
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
