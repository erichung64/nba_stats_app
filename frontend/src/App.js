// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton } from '@mui/material';
import SearchBar from './components/SearchBar';
import PlayerList from './components/PlayerList';
import PlayerProfile from './components/PlayerProfile';
import './App.css';

const App = () => {
    const [players, setPlayers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/players')
            .then(response => response.json())
            .then(data => setPlayers(data))
            .catch(error => console.error('Error fetching players:', error));
    }, []);

    const filteredPlayers = players.filter(player => 
        player.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container>
            <IconButton edge="end" color="inherit" aria-label="menu">
              <img src="/logo.png" alt="logo" style={{ height: '60px' }} />
            </IconButton>
            <Typography variant="h4" gutterBottom>
                NBA Player Stats
            </Typography>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
            <div style={{margin: '10px'}}></div>
            <PlayerList players={filteredPlayers} onSelectPlayer={setSelectedPlayerId} />
            <PlayerProfile playerId={selectedPlayerId} onClose={() => setSelectedPlayerId(null)} />
        </Container>
    );
};

export default App;
