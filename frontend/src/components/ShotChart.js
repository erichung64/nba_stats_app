import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import { hexbin as d3Hexbin } from 'd3-hexbin';
import { CircularProgress, Typography } from '@mui/material';

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

    const courtWidth = 300;
    const courtHeight = 282;
    const xScale = d3.scaleLinear().domain([-250, 250]).range([0, courtWidth]);
    const yScale = d3.scaleLinear().domain([-47.5, 422.5]).range([courtHeight, 0]);

    useEffect(() => {
        if (shotData.length > 0) {
            const svg = d3.select('#shot-chart-svg');

            svg.selectAll('*').remove();

            svg.append('image')
                .attr('href', '/court.png')
                .attr('width', courtWidth)
                .attr('height', courtHeight);

            const hexbin = d3Hexbin()
                .x(d => xScale(d.LOC_X))
                .y(d => yScale(d.LOC_Y))
                .radius(5)
                .extent([[0, 0], [courtWidth, courtHeight]]);

            const bins = hexbin(shotData);

            const color = d3.scaleSequential()
                .domain([0, d3.max(bins, d => d.length)])
                .interpolator(d3.interpolateRgbBasis(["#dfefff", "#0a4177"])); // Define a custom interpolator with darker blues

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
                .attr('opacity', 100);
        }
    }, [shotData, xScale, yScale]);

    return (
        <>
            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Typography variant="h6" color="error">{error}</Typography>
            ) : (
                <svg id="shot-chart-svg" width={courtWidth} height={courtHeight}></svg>
            )}
        </>
    );
};

export default ShotChart;
