// frontend/src/components/PlayerList.js
import React, { useState } from 'react';
import { List, ListItem, ListItemButton, ListItemText, Button, ButtonGroup, Container, Typography } from '@mui/material';

const PlayerList = ({ players, onSelectPlayer }) => {
    const [filter, setFilter] = useState('all');

    const filteredPlayers = players.filter(player => {
        if (filter === 'active') return player.is_active;
        if (filter === 'inactive') return !player.is_active;
        return true;
    });

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                NBA Player Stats
            </Typography>
            <ButtonGroup variant="contained" aria-label="outlined primary button group" sx={{ mb: 2 }}>
                <Button onClick={() => setFilter('all')}>All</Button>
                <Button onClick={() => setFilter('active')}>Active</Button>
                <Button onClick={() => setFilter('inactive')}>Inactive</Button>
            </ButtonGroup>
            <List>
                {filteredPlayers.map(player => (
                    <ListItem key={player.id}>
                        <ListItemButton onClick={() => onSelectPlayer(player.id)}>
                            <ListItemText primary={player.full_name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default PlayerList;
