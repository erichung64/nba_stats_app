import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton, AppBar, Toolbar, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SearchBar from './components/SearchBar';
import PlayerList from './components/PlayerList';
import PlayerProfile from './components/PlayerProfile';
import './App.css';

const App = () => {
    const [players, setPlayers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [season, setSeason] = useState('2023-24');
    const [seasonType, setSeasonType] = useState('Regular Season');

    useEffect(() => {
        fetchPlayers(season, seasonType);
    }, [season, seasonType]);

    const fetchPlayers = (season, seasonType) => {
        fetch(`http://localhost:8000/players?season=${season}&season_type=${seasonType}`)
            .then(response => response.json())
            .then(data => setPlayers(data))
            .catch(error => console.error('Error fetching players:', error));
    };

    const filteredPlayers = players.filter(player => 
        player.PLAYER_NAME.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container>
            <AppBar position="static" sx={{ mb: 2, mt: 1, backgroundColor: 'white', color: 'black' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '2rem' }}>
                        NBA Player Stats
                    </Typography>
                    <IconButton edge="end" color="inherit" aria-label="menu">
                        <img src="/logo.png" alt="logo" style={{ height: '60px' }} />
                    </IconButton>
                </Toolbar>
            </AppBar>            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <InputLabel id="season-label">Season</InputLabel>
                    <Select
                        labelId="season-label"
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        label="Season"
                    >
                        {Array.from({ length: 14 }, (_, i) => (
                            <MenuItem key={i} value={`${2023 - i}-${(2024 - i).toString().slice(-2)}`}>
                                {2023 - i}-{(2024 - i).toString().slice(-2)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl variant="outlined" sx={{ minWidth: 160 }}>
                    <InputLabel id="season-type-label">Season Type</InputLabel>
                    <Select
                        labelId="season-type-label"
                        value={seasonType}
                        onChange={(e) => setSeasonType(e.target.value)}
                        label="Season Type"
                    >
                        <MenuItem value="Regular Season">Regular Season</MenuItem>
                        <MenuItem value="Playoffs">Playoffs</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div style={{ margin: '10px' }}></div>
            <PlayerList players={filteredPlayers} onSelectPlayer={setSelectedPlayerId} />
            {selectedPlayerId && (
                <PlayerProfile 
                    playerId={selectedPlayerId}
                    season={season}
                    seasonType={seasonType}
                    onClose={() => setSelectedPlayerId(null)} 
                />
            )}
        </Container>
    );
};

export default App;
