import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { List, ListItem, ListItemButton, ListItemText, Container, Typography, Divider, Avatar, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PlayerAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(7),
  height: theme.spacing(7),
  marginRight: theme.spacing(2),
}));

const StatsChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

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

  const getPlayerAvatarUrl = (playerId) => {
    return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`;
  };

  const handleError = (e) => {
    e.target.src = 'https://via.placeholder.com/260x190?text=No+Image';
  };

  return (
    <Container maxWidth="md">
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
          {displayedPlayers.map((player, index) => (
            <React.Fragment key={player.PLAYER_ID}>
              {index > 0 && <Divider variant="fullWidth" component="li" />}
              <StyledListItem disablePadding>
                <ListItemButton onClick={() => onSelectPlayer(player.PLAYER_ID)}>
                  <PlayerAvatar
                    src={getPlayerAvatarUrl(player.PLAYER_ID)}
                    alt={player.PLAYER_NAME}
                    onError={handleError}
                  >
                    {player.PLAYER_NAME.split(' ').map(n => n[0]).join('')}
                  </PlayerAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="div">
                        {player.PLAYER_NAME}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary">
                          {player.TEAM_ABBREVIATION} - Age: {player.AGE} - {player.PLAYER_HEIGHT} / {player.PLAYER_WEIGHT} lbs
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          College: {player.COLLEGE || 'N/A'} - Draft: {player.DRAFT_YEAR || 'Undrafted'}
                        </Typography>
                        <Box mt={1}>
                          <StatsChip label={`PTS: ${player.PTS}`} color="primary" variant="outlined" size="small" />
                          <StatsChip label={`REB: ${player.REB}`} color="secondary" variant="outlined" size="small" />
                          <StatsChip label={`AST: ${player.AST}`} color="success" variant="outlined" size="small" />
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
              </StyledListItem>
            </React.Fragment>
          ))}
          <Divider variant="fullWidth" component="li" />
        </List>
      </InfiniteScroll>
    </Container>
  );
};

export default PlayerList;
