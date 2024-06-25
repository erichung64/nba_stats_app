import React, { useState, useEffect, useMemo } from 'react';
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
    const [playerData, setPlayerData] = useState({
      perGameAverages: null,
      seasonStats: [],
      playerName: '',
      lastNGamesStats: [],
    });
    const [loading, setLoading] = useState({
      main: false,
      lastNGames: false,
    });
  
    useEffect(() => {
      const fetchPlayerData = async () => {
        if (!playerId) return;
  
        setLoading({ main: true, lastNGames: true });
  
        try {
          const [mainData, lastNGamesData] = await Promise.all([
            fetch(`http://localhost:8000/players/${playerId}?season=${season}&season_type=${seasonType}`).then(res => res.json()),
            fetch(`http://localhost:8000/players/${playerId}/last_n_games?last_n_games=10&season=${season}&season_type=${seasonType}`).then(res => res.json()),
          ]);
  
          setPlayerData({
            perGameAverages: mainData.per_game_averages,
            seasonStats: mainData.season_stats,
            playerName: mainData.player_name,
            lastNGamesStats: lastNGamesData,
          });
        } catch (error) {
          console.error('Error fetching player data:', error);
        } finally {
          setLoading({ main: false, lastNGames: false });
        }
      };
  
      fetchPlayerData();
    }, [playerId, season, seasonType]);
  
    const { barChartData, lineChartData } = useMemo(() => {
      if (!playerData.seasonStats.length) return { barChartData: null, lineChartData: null };
  
      const seasons = playerData.seasonStats.map(stat => stat.SEASON_ID);
      
      const barChartData = {
        labels: seasons,
        datasets: [
          { label: 'Points', data: playerData.seasonStats.map(stat => stat.PTS), backgroundColor: 'rgba(75, 192, 192, 0.6)' },
          { label: 'Assists', data: playerData.seasonStats.map(stat => stat.AST), backgroundColor: 'rgba(54, 162, 235, 0.6)' },
          { label: 'Rebounds', data: playerData.seasonStats.map(stat => stat.REB), backgroundColor: 'rgba(255, 206, 86, 0.6)' },
        ],
      };
  
      const lineChartData = {
        labels: seasons,
        datasets: [
          { label: 'Field Goal %', data: playerData.seasonStats.map(stat => stat.FG_PCT), borderColor: 'rgba(75, 192, 192, 1)', fill: false },
          { label: '3-Point %', data: playerData.seasonStats.map(stat => stat.FG3_PCT), borderColor: 'rgba(54, 162, 235, 1)', fill: false },
          { label: 'Free Throw %', data: playerData.seasonStats.map(stat => stat.FT_PCT), borderColor: 'rgba(255, 206, 86, 1)', fill: false },
        ],
      };
  
      return { barChartData, lineChartData };
    }, [playerData.seasonStats]);
  
    const renderChart = (title, chart) => (
        <Box sx={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: '16px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Typography variant="subtitle1" gutterBottom>{title}</Typography>
            <Box sx={{ height: 300, width: '100%' }}>
                {chart}
            </Box>
        </Box>
    );


    const renderTable = (title, stats) => (
        <TableContainer component={Paper} sx={{ height: '100%' }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Typography variant="subtitle2">{title}</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(stats).map(([key, value]) => (
                        <TableRow key={key}>
                            <TableCell component="th" scope="row" sx={{ padding: '4px 8px' }}>
                                <Tooltip title={lastNGamesTooltips[key] || key} placement="top">
                                    <span>{key}</span>
                                </Tooltip>
                            </TableCell>
                            <TableCell align="right" sx={{ padding: '4px 8px' }}>
                                {typeof value === 'number' ? value.toFixed(2) : value}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

  
    const renderLastNGamesTable = () => (
      <Grid item xs={12}>
        
        {loading.lastNGames ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {playerData.lastNGamesStats[0] && Object.keys(playerData.lastNGamesStats[0]).map((key) => (
                    <TableCell key={key}>
                      <Tooltip title={lastNGamesTooltips[key] || key} placement="top">
                        <span>{key}</span>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {playerData.lastNGamesStats.map((game, index) => (
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
  
    const { perGameAverages } = playerData;
  
    const statsCategories = useMemo(() => ({
      Main: {
        MIN: perGameAverages?.MIN,
        PTS: perGameAverages?.PTS,
        AST: perGameAverages?.AST,
        TOV: perGameAverages?.TOV,
        Age: perGameAverages?.PLAYER_AGE,
      },
      Shooting: {
        FGM: perGameAverages?.FGM,
        FGA: perGameAverages?.FGA,
        FG_PCT: perGameAverages?.FG_PCT,
        FG3M: perGameAverages?.FG3M,
        FG3A: perGameAverages?.FG3A,
        FG3_PCT: perGameAverages?.FG3_PCT,
        FTM: perGameAverages?.FTM,
        FTA: perGameAverages?.FTA,
        FT_PCT: perGameAverages?.FT_PCT,
      },
      Rebounding: {
        OREB: perGameAverages?.OREB,
        DREB: perGameAverages?.DREB,
        REB: perGameAverages?.REB,
      },
      Defensive: {
        STL: perGameAverages?.STL,
        BLK: perGameAverages?.BLK,
        PF: perGameAverages?.PF,
      },
    }), [perGameAverages]);
  
    return (
        <Dialog open={Boolean(playerId)} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle variant="h4">{playerData.playerName} Player Stats</DialogTitle>
            <DialogContent>
                {loading.main ? (
                    <CircularProgress />
                ) : (
                    <>
                        {perGameAverages && playerData.seasonStats.length > 0 ? (
                            <>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        {renderChart("Points, Assists, Rebounds by Season",
                                            <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
                                        )}
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        {renderChart("Shooting Percentages by Season",
                                            <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
                                        )}
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        {renderChart("Shot Chart",
                                            <ShotChart playerId={playerId} season={season} seasonType={seasonType} width={280} height={300} />
                                        )}
                                    </Grid>
                                </Grid>
                                <Typography variant="h6" gutterBottom sx={{ mt: 5, mb: 2 }}>Career Averages</Typography>
                                <Grid container spacing={2}>
                                    {Object.entries(statsCategories).map(([category, stats], index) => (
                                        <Grid item xs={12} sm={6} md={3} key={index}>
                                            {renderTable(category, stats)}
                                        </Grid>
                                    ))}
                                </Grid>
                                {playerData.lastNGamesStats.length > 0 && (
                                    <>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>Last 10 Games Stats</Typography>
                                        {renderLastNGamesTable()}
                                    </>
                                )}
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
