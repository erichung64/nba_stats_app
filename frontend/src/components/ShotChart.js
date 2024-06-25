import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import { hexbin as d3Hexbin } from 'd3-hexbin';
import { CircularProgress, Typography, Box } from '@mui/material';

const ShotChart = ({ playerId, season, seasonType }) => {
    const [shotData, setShotData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (playerId) {
            axios.get(`http://localhost:8000/players/${playerId}/shot_chart`, {
                params: { season, season_type: seasonType }
            })
            .then(response => {
                setShotData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching shot chart data:', error);
                setError(error.response ? error.response.data.detail : error.message);
                setLoading(false);
            });
        }
    }, [playerId, season, seasonType]);

    const xScale = d3.scaleLinear().domain([-250, 250]).range([0, 340]);
    const yScale = d3.scaleLinear().domain([-47.5, 422.5]).range([320, 0]);

    useEffect(() => {
        if (shotData.length > 0) {
            const svg = d3.select('#shot-chart-svg');

            svg.selectAll('*').remove();

            svg.append('image')
                .attr('href', '/court.png')
                .attr('width', 340)
                .attr('height', 319);

            const hexbin = d3Hexbin()
                .x(d => xScale(d.LOC_X))
                .y(d => yScale(d.LOC_Y))
                .radius(5)
                .extent([[0, 0], [340, 319]]);

            const bins = hexbin(shotData);

            const color = d3.scaleSequential()
                .domain([0, d3.max(bins, d => d.length)])
                .interpolator(d3.interpolateRgbBasis(["#c0ddff", "#0a4177"]));

            svg.append('g')
                .selectAll('path')
                .data(bins)
                .enter()
                .append('path')
                .attr('d', hexbin.hexagon())
                .attr('transform', d => `translate(${d.x}, ${d.y})`)
                .attr('fill', d => color(d.length))
                .attr('stroke', '#fff')
                .attr('stroke-width', 0.5)
                .attr('opacity', 1);
        }
    }, [shotData, xScale, yScale]);

    return (
        <Box sx={{ width: '100%', height: '0', paddingBottom: '94.12%', position: 'relative' }}>
            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Typography variant="h6" color="error">{error}</Typography>
            ) : (
                <svg
                    id="shot-chart-svg"
                    viewBox="0 0 340 320"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                ></svg>
            )}
        </Box>
    );
};

export default ShotChart;
