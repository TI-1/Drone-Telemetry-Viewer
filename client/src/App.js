import './App.css';
import React, {useEffect} from "react";
import socketIOClient from 'socket.io-client'
import Dashboard from './Dashboard';

const socket = socketIOClient("http://localhost:4000/")

  function App() {

  return (
    <div className = "App">
      <Dashboard socket={socket}/>
    </div>
  );
}

export default App;
