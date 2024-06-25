from fastapi import APIRouter, HTTPException, Query
from nba_api.stats.endpoints import (
    playercareerstats,
    leaguedashplayerbiostats,
    playerdashboardbylastngames,
    commonplayerinfo,
    shotchartdetail
)
import pandas as pd
from typing import Dict, Any

router = APIRouter()

# Utility Functions
def calculate_per_game_stats(stats: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculate per-game statistics from total statistics.
    
    :param stats: Dictionary of total statistics
    :return: Dictionary of per-game statistics
    """
    gp = stats.get('GP', 1)  # Guard against division by zero
    per_game_stats = {
        stat: stats[stat] / gp 
        for stat in ['MIN', 'FGM', 'FGA', 'FG3M', 'FG3A', 'FTM', 'FTA', 'OREB', 'DREB', 'REB', 'AST', 'STL', 'BLK', 'TOV', 'PF', 'PTS']
    }
    per_game_stats.update({
        'FG_PCT': stats['FG_PCT'],
        'FG3_PCT': stats['FG3_PCT'],
        'FT_PCT': stats['FT_PCT'],
        'PLAYER_AGE': stats['PLAYER_AGE']
    })
    return per_game_stats

def get_player_info(player_id: int) -> Dict[str, str]:
    """
    Get basic information about a player.
    
    :param player_id: NBA player ID
    :return: Dictionary containing player's name, team, and position
    """
    player_info = commonplayerinfo.CommonPlayerInfo(player_id=player_id).get_data_frames()[0]
    return {
        'player_name': f"{player_info['FIRST_NAME'][0]} {player_info['LAST_NAME'][0]}",
        'team_name': player_info['TEAM_NAME'][0],
        'position': player_info['POSITION'][0]
    }

def get_career_stats(player_id: int) -> pd.DataFrame:
    """
    Get career statistics for a player.
    
    :param player_id: NBA player ID
    :return: DataFrame of career statistics
    """
    career = playercareerstats.PlayerCareerStats(player_id=player_id)
    return career.get_data_frames()[0]

# Route: Get Player Stats

@router.get("/players/{player_id}")
async def get_player_stats(player_id: int, season: str, season_type: str):
    """
    Get comprehensive stats for a specific player.
    
    :param player_id: NBA player ID
    :param season: NBA season in format YYYY-YY
    :param season_type: Type of season (Regular Season or Playoffs)
    :return: Dictionary containing player info, career averages, per-game averages, and season stats
    """
    try:
        player_info = get_player_info(player_id)
        df = get_career_stats(player_id)
        
        career_averages = df.mean(numeric_only=True).to_dict()
        career_averages["SEASON_ID"] = "Career Averages"
        per_game_averages = calculate_per_game_stats(career_averages)

        return {
            "player_info": player_info,
            "career_averages": career_averages,
            "per_game_averages": per_game_averages,
            "season_stats": df.to_dict(orient='records')
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

# Route: Get All Players

@router.get("/players")
async def get_all_players(season: str, season_type: str):
    """
    Get a list of all players and their basic stats for a given season.
    
    :param season: NBA season in format YYYY-YY
    :param season_type: Type of season (Regular Season or Playoffs)
    :return: List of dictionaries containing player stats
    """
    try:
        stats = leaguedashplayerbiostats.LeagueDashPlayerBioStats(
            season=season,
            per_mode_simple='PerGame',
            season_type_all_star=season_type
        )
        df = stats.get_data_frames()[0]
        return df.to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route: Get Player's Last N Games

@router.get("/players/{player_id}/last_n_games")
async def get_player_last_n_games(player_id: int, last_n_games: int = 10, season: str = None, season_type: str = None):
    """
    Get stats for a player's last N games.
    
    :param player_id: NBA player ID
    :param last_n_games: Number of recent games to retrieve (default 10)
    :param season: NBA season in format YYYY-YY
    :param season_type: Type of season (Regular Season or Playoffs)
    :return: List of dictionaries containing game stats
    """
    try:
        stats = playerdashboardbylastngames.PlayerDashboardByLastNGames(
            player_id=player_id,
            last_n_games=last_n_games,
            measure_type_detailed="Base",
            per_mode_detailed="PerGame",
            season=season,
            season_type_playoffs=season_type
        )
        df = stats.get_data_frames()[1]  # GameNumberPlayerDashboard is the second dataframe
        fields = [
            'GROUP_VALUE', 'GP', 'W', 'L', 'W_PCT', 'MIN', 'FGM', 'FGA', 'FG_PCT', 'FG3M', 'FG3A', 'FG3_PCT', 'FTM',
            'FTA', 'FT_PCT', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'BLKA', 'PF', 'PFD', 'PTS', 'PLUS_MINUS'
        ]
        return df[fields].to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route: Get Player's Shot Chart

@router.get("/players/{player_id}/shot_chart")
async def get_player_shot_chart(player_id: int, season: str, season_type: str):
    """
    Get shot chart data for a player in a specific season.
    
    :param player_id: NBA player ID
    :param season: NBA season in format YYYY-YY
    :param season_type: Type of season (Regular Season or Playoffs)
    :return: List of dictionaries containing shot chart data
    """
    try:
        response = shotchartdetail.ShotChartDetail(
            team_id=0,  # Setting to 0 to get shots for all teams
            player_id=player_id,
            season_nullable=season,
            season_type_all_star=season_type
        )
        data = response.get_data_frames()[0]
        return data.to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))