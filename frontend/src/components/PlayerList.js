import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { List, ListItem, ListItemButton, ListItemText, Container, Typography } from '@mui/material';

const PlayerList = ({ players, onSelectPlayer }) => {
    const [displayedPlayers, setDisplayedPlayers] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const itemsPerPage = 20;

    useEffect(() => {
        setDisplayedPlayers(players.slice(0, itemsPerPage));
        setPage(1);
        setHasMore(players.length > itemsPerPage);
    }, [players]);

    const fetchMoreData = () => {
        if (displayedPlayers.length >= players.length) {
            setHasMore(false);
            return;
        }

        setDisplayedPlayers(prevDisplayedPlayers => [
            ...prevDisplayedPlayers,
            ...players.slice(page * itemsPerPage, (page + 1) * itemsPerPage)
        ]);
        setPage(prevPage => prevPage + 1);
    };

    return (
        <Container>
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
                        <ListItem key={player.PLAYER_ID}>
                            <ListItemButton onClick={() => onSelectPlayer(player.PLAYER_ID)}>
                                <ListItemText
                                    primary={player.PLAYER_NAME}
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2" color="textPrimary">
                                                {player.TEAM_ABBREVIATION} - Age: {player.AGE} - Height: {player.PLAYER_HEIGHT} - Weight: {player.PLAYER_WEIGHT}
                                            </Typography>
                                            <Typography component="span" variant="body2" color="textSecondary">
                                                {} College: {player.COLLEGE} - Draft Year: {player.DRAFT_YEAR}
                                            </Typography>
                                            <Typography component="span" variant="body2" color="textSecondary">
                                                {} PTS: {player.PTS} - REB: {player.REB} - AST: {player.AST}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </InfiniteScroll>
        </Container>
    );
};

export default PlayerList;
