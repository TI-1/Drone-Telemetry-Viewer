import React, { useState, useEffect } from "react";
import { LineChart, XAxis, Tooltip, CartesianGrid, Line, YAxis, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper, Grid, Slider, Button, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const Dashboard = ({ socket }) => {
    const [imuData, setImuData] = useState([]);
    const [pidGains, setPidGains] = useState({
        roll: { P: 0.5, I: 0.1, D: 0.01 },
        pitch: { P: 0.5, I: 0.1, D: 0.01 },
        yaw: { P: 0.5, I: 0.1, D: 0.01 },
    });
    const [darkMode, setDarkMode] = useState(true); // Toggle state for dark mode

    // Define themes
    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#90caf9',
            },
            secondary: {
                main: '#f48fb1',
            },
        },
    });

    const lightTheme = createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#1976d2',
            },
            secondary: {
                main: '#d32f2f',
            },
        },
    });

    useEffect(() => {
        socket.on("imuData", data => {
            console.log("Received IMU Data");
            setImuData(data);
        });
        return () => {
            socket.off("imuData");
        };
    }, [socket]);

    const handleSliderChange = (axis, gainType, newValue) => {
        setPidGains(prev => ({
            ...prev,
            [axis]: {
                ...prev[axis],
                [gainType]: newValue
            }
        }));
    };

    const sendPidGains = () => {
        socket.emit("PidGains", pidGains);
        console.log("Sent PID Gains:", pidGains);
    };

    return (
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <CssBaseline /> {/* Ensures the global dark mode styling */}
            <Box sx={{ padding: 4 }}>
                <Box sx={{ marginBottom: 4, textAlign: 'center' }}>
                    <Typography variant="h4" component="h1">
                        Telemetry Dashboard
                    </Typography>
                </Box>
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setDarkMode(!darkMode)}
                        sx={{
                            padding: 1,
                            minWidth: 'auto',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            fontSize: '0.75rem'
                        }}
                    >
                        {darkMode ? "☀️" : "🌙"}
                    </Button>
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

                    {/* PID Gains Tuning Sliders */}
                    <Grid item xs={12}>
                        <Paper elevation={3} sx={{ padding: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                PID Gains Tuning
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 4 }}>
                                {['roll', 'pitch', 'yaw'].map(axis => (
                                    <Box key={axis} sx={{ flex: 1, textAlign: 'center' }}>
                                        <Typography variant="h6" gutterBottom>
                                            {axis.charAt(0).toUpperCase() + axis.slice(1)}
                                        </Typography>
                                        {['P', 'I', 'D'].map(gainType => (
                                            <Box key={gainType} sx={{ marginBottom: 2 }}>
                                                <Typography gutterBottom>{gainType} Gain</Typography>
                                                <Slider
                                                    value={pidGains[axis][gainType]}
                                                    onChange={(e, value) => handleSliderChange(axis, gainType, value)}
                                                    step={0.01}
                                                    min={0}
                                                    max={1}
                                                    valueLabelDisplay="auto"
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={{ textAlign: 'center', marginTop: 4 }}>
                                <Button variant="contained" color="primary" onClick={sendPidGains}>
                                    Update PID Gains
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                     {/* Error Messages */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ padding: 2 }}>
                            <Typography variant="h6">Error Messages</Typography>
                            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}></Box>
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
        </ThemeProvider>
    );
};

export default Dashboard;