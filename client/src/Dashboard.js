import React, {useState, useEffect} from "react"
import {LineChart, XAxis, Tooltip, CartesianGrid, Line, YAxis, ResponsiveContainer} from 'recharts'
import {Box, Typography, Paper, Grid} from '@mui/material'

const Dashboard = ({ socket }) => {
    const [imuData, setImuData] = useState([]);


    useEffect(() =>{
        socket.on("imuData", data => {
            console.log("Recieved IMU Data")
            setImuData(data)
        });
        return () => {
            socket.off("imuData");
        };
    }, [socket]);

    return (
        <Box sx={{ padding: 4 }}>
            <Box sx={{ marginBottom: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1">
                    Telemetry Dashboard
                </Typography>
            </Box>

            {/* Main Content */}
            <Grid container spacing={2}>
                {/* Angular Acceleration Graph */}
                <Grid item xs={6} md={6}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Angular Acceleration (Gyro)</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={imuData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="Time" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="Rollspeed" stroke="red" />
                                <Line type="monotone" dataKey="Pitchspeed" stroke="green" />
                                <Line type="monotone" dataKey="Yawspeed" stroke="blue" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Angle Graph */}
                <Grid item xs={6} md={6}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Angles (Yaw, Pitch, Roll)</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={imuData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="Time" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="Yaw" stroke="red" />
                                <Line type="monotone" dataKey="Pitch" stroke="green" />
                                <Line type="monotone" dataKey="Roll" stroke="blue" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Error Messages */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Error Messages</Typography>
                        <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                        </Box>
                    </Paper>
                </Grid>

                {/* Drone Status */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Drone Status</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;