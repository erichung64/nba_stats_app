// frontend/src/components/PlayerProfile.js
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, CircularProgress,
    Typography, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement,
    LineElement, PointElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const PlayerProfile = ({ playerId, onClose }) => {
    const [careerAverages, setCareerAverages] = useState(null);
    const [seasonStats, setSeasonStats] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (playerId) {
            setLoading(true);
            fetch(`http://localhost:8000/players/${playerId}`)
                .then(response => response.json())
                .then(data => {
                    setCareerAverages(data.career_averages);
                    setSeasonStats(data.season_stats);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching player stats:', error);
                    setLoading(false);
                });
        }
    }, [playerId]);

    const getBarChartData = () => {
        const seasons = seasonStats.map(stat => stat.SEASON_ID);
        const points = seasonStats.map(stat => stat.PTS);
        const assists = seasonStats.map(stat => stat.AST);
        const rebounds = seasonStats.map(stat => stat.REB);
        return {
            labels: seasons,
            datasets: [
                {
                    label: 'Points',
                    data: points,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
                {
                    label: 'Assists',
                    data: assists,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
                {
                    label: 'Rebounds',
                    data: rebounds,
                    backgroundColor: 'rgba(255, 206, 86, 0.6)',
                }
            ],
        };
    };

    const getLineChartData = () => {
        const seasons = seasonStats.map(stat => stat.SEASON_ID);
        const fieldGoals = seasonStats.map(stat => stat.FG_PCT);
        const threePoints = seasonStats.map(stat => stat.FG3_PCT);
        const freeThrows = seasonStats.map(stat => stat.FT_PCT);
        return {
            labels: seasons,
            datasets: [
                {
                    label: 'Field Goal %',
                    data: fieldGoals,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                },
                {
                    label: '3-Point %',
                    data: threePoints,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: false,
                },
                {
                    label: 'Free Throw %',
                    data: freeThrows,
                    borderColor: 'rgba(255, 206, 86, 1)',
                    fill: false,
                }
            ],
        };
    };

    return (
        <Dialog open={Boolean(playerId)} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Player Stats</DialogTitle>
            <DialogContent>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <>
                        {careerAverages && seasonStats.length > 0 ? (
                            <>
                                <Typography variant="h6" gutterBottom>
                                    {seasonStats[0].PLAYER_NAME} Career Stats
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Points, Assists, Rebounds by Season
                                        </Typography>
                                        <Bar key={`bar-${playerId}`} data={getBarChartData()} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Shooting Percentages by Season
                                        </Typography>
                                        <Line key={`line-${playerId}`} data={getLineChartData()} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Career Averages
                                        </Typography>
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Category</TableCell>
                                                        <TableCell align="right">Value</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {Object.entries(careerAverages).map(([key, value]) => (
                                                        <TableRow key={key}>
                                                            <TableCell component="th" scope="row">
                                                                {key}
                                                            </TableCell>
                                                            <TableCell align="right">{value}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                </Grid>
                            </>
                        ) : (
                            <Typography>No stats available</Typography>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PlayerProfile;
