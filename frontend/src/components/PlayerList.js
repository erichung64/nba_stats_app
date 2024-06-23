import React, { useState, useMemo, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { List, ListItem, ListItemButton, ListItemText, Button, ButtonGroup, Container, Typography, Box } from '@mui/material';

const PlayerList = ({ players, onSelectPlayer }) => {
    const [filter, setFilter] = useState('all');
    const [displayedPlayers, setDisplayedPlayers] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const itemsPerPage = 20;

    const filteredPlayers = useMemo(() => {
        return players.filter(player => {
            if (filter === 'active') return player.is_active;
            if (filter === 'inactive') return !player.is_active;
            return true;
        });
    }, [players, filter]);

    useEffect(() => {
        setDisplayedPlayers(filteredPlayers.slice(0, itemsPerPage));
        setPage(1);
        setHasMore(filteredPlayers.length > itemsPerPage);
    }, [filter, filteredPlayers]);

    const fetchMoreData = () => {
        if (displayedPlayers.length >= filteredPlayers.length) {
            setHasMore(false);
            return;
        }

        setDisplayedPlayers(prevDisplayedPlayers => [
            ...prevDisplayedPlayers,
            ...filteredPlayers.slice(page * itemsPerPage, (page + 1) * itemsPerPage)
        ]);
        setPage(prevPage => prevPage + 1);
    };

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <ButtonGroup variant="contained" aria-label="outlined primary button group">
                    <Button onClick={() => setFilter('all')}>All</Button>
                    <Button onClick={() => setFilter('active')}>Active</Button>
                    <Button onClick={() => setFilter('inactive')}>Inactive</Button>
                </ButtonGroup>
            </Box>
            <InfiniteScroll
                dataLength={displayedPlayers.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<Typography variant="h6" align="center">Loading...</Typography>}
                endMessage={
                    <Typography variant="h6" align="center">
                        No more players
                    </Typography>
                }
            >
                <List>
                    {displayedPlayers.map(player => (
                        <ListItem key={player.id}>
                            <ListItemButton onClick={() => onSelectPlayer(player.id)}>
                                <ListItemText primary={player.full_name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </InfiniteScroll>
        </Container>
    );
};

export default PlayerList;
