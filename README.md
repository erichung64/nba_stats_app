# NBA Stats App

## Overview
This application fetches, processes, and displays NBA player statistics. Users can search for players, filter by active or inactive status, and view detailed career statistics and season-by-season performance in various visual formats.

## Setup and Run

### Prerequisites
- Docker
- Docker Compose

### Running the Application
1. Clone the repository.
2. Navigate to the project root directory.
3. Build and start the Docker containers:

    ```sh
    docker-compose up --build
    ```

4. Access the backend API at `http://localhost:8000`.
5. Access the frontend at `http://localhost:3000`.

## API Endpoints
- `GET /players`: Fetches all players.
- `GET /players/{player_id}`: Fetches career statistics for a specific player by player ID.

## Frontend Features
- **Search and Filter**: Users can search for players by name and filter by active or inactive status.
- **Player List**: Displays a list of players with clickable names.
- **Player Profile**: Shows detailed career and season statistics in a modal dialog with bar and line charts.
- **Responsive Design**: The application is designed to be responsive and user-friendly.

## Technical Details

### Backend
The backend is built using FastAPI and the `nba_api` library. It serves player data and statistics fetched from the NBA API.

- **Endpoints**:
  - `/players`: Returns a list of all players.
  - `/players/{player_id}`: Returns career statistics for a specified player.

### Frontend
The frontend is built using React and Material-UI for the UI components, and Chart.js via `react-chartjs-2` for data visualization.

- **Components**:
  - `App.js`: Main application component.
  - `SearchBar.js`: Component for searching players.
  - `PlayerList.js`: Component for displaying the list of players.
  - `PlayerProfile.js`: Component for displaying detailed player statistics and visualizations.
  - `ShotChart.js`: Component for displaying shot distribution data per season.

- **Styles**: Custom styles are applied using Material-UI's theming capabilities and CSS.

### Docker
The application is containerized using Docker, with a separate container for the frontend and backend services.

- **Dockerfile (backend)**:
  - Builds the FastAPI application.
- **Dockerfile (frontend)**:
  - Builds the React application.
- **docker-compose.yml**:
  - Configures the multi-container Docker application.

## Assumptions and Trade-offs
- **Rate Limits**: The application uses the `nba_api` library, which may have rate limits.
- **Local Development**: The app is designed for local development and testing.

## Future Enhancements
- **Unit and Integration Tests**: Implement comprehensive testing for reliability.
- **Performance Optimization**: Improve performance for large datasets.
- **Additional Features**: Add more detailed player metrics and comparison features.

