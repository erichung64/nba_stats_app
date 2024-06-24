import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, CircularProgress,
    Typography, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Tooltip, Box
} from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement,
    LineElement, PointElement, Title, Tooltip as ChartTooltip, Legend
} from 'chart.js';
import ShotChart from './ShotChart'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, ChartTooltip, Legend);

const lastNGamesTooltips = {
    GROUP_VALUE: "Season",
    GP: "Games Played",
    W: "Wins",
    L: "Losses",
    W_PCT: "Win Percentage",
    MIN: "Minutes per game",
    FGM: "Field Goals Made per game",
    FGA: "Field Goals Attempted per game",
    FG_PCT: "Field Goal Percentage",
    FG3M: "Three-Point Field Goals Made per game",
    FG3A: "Three-Point Field Goals Attempted per game",
    FG3_PCT: "Three-Point Field Goal Percentage",
    FTM: "Free Throws Made per game",
    FTA: "Free Throws Attempted per game",
    FT_PCT: "Free Throw Percentage",
    OREB: "Offensive Rebounds per game",
    DREB: "Defensive Rebounds per game",
    REB: "Total Rebounds per game",
    AST: "Assists per game",
    TOV: "Turnovers per game",
    STL: "Steals per game",
    BLK: "Blocks per game",
    BLKA: "Blocked Attempts",
    PF: "Personal Fouls",
    PFD: "Personal Fouls Drawn",
    PTS: "Points per game",
    PLUS_MINUS: "Plus/Minus",
};


const PlayerProfile = ({ playerId, season, seasonType, onClose }) => {
    const [perGameAverages, setPerGameAverages] = useState(null);
    const [seasonStats, setSeasonStats] = useState([]);
    const [playerName, setPlayerName] = useState([]);
    const [lastNGamesStats, setLastNGamesStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingLastNGames, setLoadingLastNGames] = useState(false);

    useEffect(() => {
        if (playerId) {
            setLoading(true);
            fetch(`http://localhost:8000/players/${playerId}?season=${season}&season_type=${seasonType}`)
                .then(response => response.json())
                .then(data => {
                    setPlayerName(data.player_name);  // Set the player's name
                    setPerGameAverages(data.per_game_averages);
                    setSeasonStats(data.season_stats);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching player stats:', error);
                    setLoading(false);
                });
    
            setLoadingLastNGames(true);
            fetch(`http://localhost:8000/players/${playerId}/last_n_games?last_n_games=10&season=${season}&season_type=${seasonType}`)
                .then(response => response.json())
                .then(data => {
                    setLastNGamesStats(data);
                    setLoadingLastNGames(false);
                })
                .catch(error => {
                    console.error('Error fetching player last n games stats:', error);
                    setLoadingLastNGames(false);
                });
        }
    }, [playerId, season, seasonType]);

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

    const renderTable = (title, stats) => (
        <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
                {title}
            </Typography>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableBody>
                        {Object.entries(stats).map(([key, value]) => (
                            <TableRow key={key}>
                                <TableCell component="th" scope="row">
                                    <span>{key}</span>
                                </TableCell>
                                <TableCell align="right">{typeof value === 'number' ? value.toFixed(2) : value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
    

    const renderLastNGamesTable = (stats) => (
        <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
                Last 10 Games Stats
            </Typography>
            {loadingLastNGames ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {Object.keys(stats[0]).map((key) => (
                                    <TableCell key={key}>
                                        <Tooltip title={lastNGamesTooltips[key] || key} placement="top">
                                            <span>{key}</span>
                                        </Tooltip>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats.map((game, index) => (
                                <TableRow key={index}>
                                    {Object.entries(game).map(([key, value]) => (
                                        <TableCell key={key}>
                                            <Tooltip title={lastNGamesTooltips[key] || key} placement="top">
                                                <span>{value}</span>
                                            </Tooltip>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Grid>
    );
    
    
    const shootingStats = {
        FM: perGameAverages?.FGM,
        FGA: perGameAverages?.FGA,
        FG_PCT: perGameAverages?.FG_PCT,
        FG3M: perGameAverages?.FG3M,
        FG3A: perGameAverages?.FG3A,
        FG3_PCT: perGameAverages?.FG3_PCT,
        FTM: perGameAverages?.FTM,
        FTA: perGameAverages?.FTA,
        FT_PCT: perGameAverages?.FT_PCT,
    };

    const reboundingStats = {
        OREB: perGameAverages?.OREB,
        DREB: perGameAverages?.DREB,
        REB: perGameAverages?.REB,
    };

    const defensiveStats = {
        STL: perGameAverages?.STL,
        BLK: perGameAverages?.BLK,
        PF: perGameAverages?.PF,
    };

    const miscStats = {
        MIN: perGameAverages?.MIN,
        PTS: perGameAverages?.PTS,
        AST: perGameAverages?.AST,
        TOV: perGameAverages?.TOV,
        Age: perGameAverages?.PLAYER_AGE,
    };

    return (
        <Dialog open={Boolean(playerId)} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>{playerName} Player Stats</DialogTitle>
            <DialogContent>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <>
                        {perGameAverages && seasonStats.length > 0 ? (
                            <>
                            <Grid container spacing={1}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Points, Assists, Rebounds by Season
                                    </Typography>
                                    <Box sx={{ height: 300, padding: 0 }}>
                                        <Bar key={`bar-${playerId}`} data={getBarChartData()} options={{ maintainAspectRatio: false }} />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Shooting Percentages by Season
                                    </Typography>
                                    <Box sx={{ height: 300, padding: 0 }}>
                                        <Line key={`line-${playerId}`} data={getLineChartData()} options={{ maintainAspectRatio: false }} />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Shot Chart
                                    </Typography>
                                    <Box sx={{ height: 300, width: 250, padding: 0 }}>
                                        <ShotChart playerId={playerId} season={season} seasonType={seasonType} width={250} height={300} />
                                    </Box>
                                </Grid>
                            </Grid>

                                {lastNGamesStats.length > 0 && (
                                    <>
                                        <hr style={{ margin: '10px 0' }} />
                                        {renderLastNGamesTable(lastNGamesStats)}
                                    </>
                                )}
                                <hr style={{ margin: '10px 0' }} />
                                <Typography variant="h6" gutterBottom>
                                    Career Averages
                                </Typography>
                                <Grid container spacing={1}>
                                    {renderTable('Shooting Stats', shootingStats)}
                                    {renderTable('Overall Stats', miscStats)}
                                    {renderTable('Defensive Stats', defensiveStats)}
                                    {renderTable('Rebounding Stats', reboundingStats)}
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
