from fastapi import APIRouter, HTTPException, Query
from nba_api.stats.endpoints import playercareerstats, leaguedashplayerbiostats, playerdashboardbylastngames, commonplayerinfo, shotchartdetail
import pandas as pd

router = APIRouter()

def calculate_per_game_stats(stats):
    per_game_stats = {}
    gp = stats.get('GP', 1)  # Guard against division by zero
    per_game_stats['MIN'] = stats['MIN'] / gp
    per_game_stats['FGM'] = stats['FGM'] / gp
    per_game_stats['FGA'] = stats['FGA'] / gp
    per_game_stats['FG3M'] = stats['FG3M'] / gp
    per_game_stats['FG3A'] = stats['FG3A'] / gp
    per_game_stats['FTM'] = stats['FTM'] / gp
    per_game_stats['FTA'] = stats['FTA'] / gp
    per_game_stats['OREB'] = stats['OREB'] / gp
    per_game_stats['DREB'] = stats['DREB'] / gp
    per_game_stats['REB'] = stats['REB'] / gp
    per_game_stats['AST'] = stats['AST'] / gp
    per_game_stats['STL'] = stats['STL'] / gp
    per_game_stats['BLK'] = stats['BLK'] / gp
    per_game_stats['TOV'] = stats['TOV'] / gp
    per_game_stats['PF'] = stats['PF'] / gp
    per_game_stats['PTS'] = stats['PTS'] / gp
    per_game_stats['FG_PCT'] = stats['FG_PCT']
    per_game_stats['FG3_PCT'] = stats['FG3_PCT']
    per_game_stats['FT_PCT'] = stats['FT_PCT']
    per_game_stats['PLAYER_AGE'] = stats['PLAYER_AGE']
    return per_game_stats

@router.get("/players/{player_id}")
async def get_player_stats(player_id: int, season: str, season_type: str):
    try:
        # Get player details
        player_info = commonplayerinfo.CommonPlayerInfo(player_id=player_id).get_data_frames()[0]
        player_name = f"{player_info['FIRST_NAME'][0]} {player_info['LAST_NAME'][0]}"
        
        career = playercareerstats.PlayerCareerStats(player_id=player_id)
        df = career.get_data_frames()[0]
        # Calculate career averages
        career_averages = df.mean(numeric_only=True).to_dict()
        career_averages["SEASON_ID"] = "Career Averages"
        per_game_averages = calculate_per_game_stats(career_averages)

        return {
            "player_name": player_name,
            "career_averages": career_averages,
            "per_game_averages": per_game_averages,
            "season_stats": df.to_dict(orient='records')
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/players")
async def get_all_players(
    season: str = Query(..., description="The NBA season in the format YYYY-YY."),
    season_type: str = Query(..., description="The type of NBA season.", regex="^(Regular Season|Playoffs)$")
):
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

@router.get("/players/{player_id}/last_n_games")
async def get_player_last_n_games(
    player_id: int,
    last_n_games: int = 10,
    season: str = Query(..., description="The NBA season in the format YYYY-YY."),
    season_type: str = Query(..., description="The type of NBA season.", regex="^(Regular Season|Playoffs)$")
):
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
        df = df[fields]
        return df.to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/players/{player_id}/shot_chart")
async def get_player_shot_chart(player_id: int, season: str, season_type: str):
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
