from fastapi import APIRouter, HTTPException
from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.static import players
import pandas as pd

router = APIRouter()

@router.get("/players/{player_id}")
async def get_player_stats(player_id: int):
    try:
        career = playercareerstats.PlayerCareerStats(player_id=player_id)
        df = career.get_data_frames()[0]
        # Calculate career averages
        career_averages = df.mean(numeric_only=True).to_dict()
        career_averages["SEASON_ID"] = "Career Averages"
        return {
            "career_averages": career_averages,
            "season_stats": df.to_dict(orient='records')
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/players")
async def get_all_players():
    try:
        all_players = players.get_players()
        return all_players
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
