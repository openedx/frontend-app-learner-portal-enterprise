import React from 'react';
import '@testing-library/jest-dom/extend-expect';

import Plotly from 'plotly.js-dist';
import * as hooks from '../data/hooks';

jest.spyOn(React, 'useEffect').mockImplementation(f => f());

/* eslint-disable */
const categories = {
    id: 27,
    name: 'Applications developer',
    skillCategories: [
        {
            id: 1,
            name: 'Information Technology',
            skills: [
                { id: 78, name: 'Query Languages', score: null },
                { id: 79, name: 'MongoDB', score: null },
                { id: 81, name: 'Technology Roadmap', score: null },
                { id: 83, name: 'Sprint Planning', score: null },
                { id: 84, name: 'Blocker Resolution', score: null },
                { id: 85, name: 'Technical Communication', score: null },
            ],
            skillsSubcategories: [
                {
                    id: 1,
                    name: 'Databases',
                    skills: [
                        { id: 78, name: 'Query Languages', score: null },
                        { id: 79, name: 'MongoDB', score: null },
                    ],
                },
                {
                    id: 2,
                    name: 'IT Management',
                    skills: [
                        { id: 81, name: 'Technology Roadmap', score: null },
                        { id: 83, name: 'Sprint Planning', score: null },
                        { id: 84, name: 'Blocker Resolution', score: null },
                        { id: 85, name: 'Technical Communication', score: null },
                    ],
                },
            ],
            userScore: 0,
            edxAverageScore: null,
        },
    ],
};

jest.mock('plotly.js-dist', () => ({
    newPlot: jest.fn(),
}));

describe('usePlotlySpiderChart hook', () => {
    window.HTMLCanvasElement.prototype.getContext = function () { return null; };
    window.URL.createObjectURL = jest.fn();

    it('when called with valid categories', () => {
        hooks.usePlotlySpiderChart(categories);
        expect(Plotly.newPlot).toHaveBeenCalled();
    });
});
