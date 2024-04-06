import './App.css';
import React, {useState, useEffect} from "react";
import socketIOClient from 'socket.io-client'
import {LineChart, XAxis, Tooltip, CartesianGrid, Line, YAxis, ResponsiveContainer} from 'recharts'


function App() {
  const [data, setData] = useState([]);
  useEffect(()=>{
    const socket = socketIOClient("http://localhost:4000/")
    socket.on("message", newData=>{
      console.log(newData);
      setData(prevData => [...newData]);
    })
  },[])
  return (
    <div>
      <ResponsiveContainer width="100%" aspect={3}>
      <LineChart
         width={1000}
         height={500}
         data={data}
         margin={{ top: 5, right: 20, left: 10, bottom: 5}}
         >
         <XAxis dataKey="name"/>
         <YAxis />
         <Tooltip/>
         <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
         <Line type="monotone" dataKey="Gyro_x" stroke="#8884d8"/>
         <Line type="monotone" dataKey="Gyro_y" stroke="#82ca9d"/>
         <Line type="monotone" dataKey="Gyro_z" stroke="#8834d8"/>
       </LineChart> 
       </ResponsiveContainer>
    </div>
  );
}

export default App;
