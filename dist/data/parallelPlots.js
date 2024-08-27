"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderParallelCoordinatesD3Canvas = renderParallelCoordinatesD3Canvas;
const d3 = __importStar(require("d3"));
function renderParallelCoordinatesD3Canvas(data) {
    const canvas = document.getElementById('parallelCanvas');
    const ctx = canvas.getContext('2d');
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const headerHeight = 600;
    const attributeCount = data[0].length - 1; // Subtracting one for the class column
    // Dynamically adjust the width of the canvas based on the number of attributes
    const plotWidth = Math.max(1000, 150 * attributeCount);
    const plotHeight = headerHeight - margin.top - margin.bottom;
    // Adjust the canvas width
    canvas.width = plotWidth + margin.left + margin.right;
    canvas.height = headerHeight;
    const headers = data[0].filter(header => header.toLowerCase() !== 'class'); // Filter out the class column
    const rows = data.slice(1);
    // Identify the class column and create a color mapping
    const classIndex = data[0].findIndex(header => header.toLowerCase() === 'class');
    const uniqueClasses = Array.from(new Set(rows.map(row => row[classIndex])));
    const classColors = generateClassColors(uniqueClasses.length);
    const classColorMap = new Map(uniqueClasses.map((cls, i) => [cls, classColors[i]]));
    // Set up scales
    const yScales = headers.map((header, i) => {
        return d3.scaleLinear()
            .domain(d3.extent(rows, (row) => parseFloat(row[i])))
            .range([plotHeight, 0]);
    });
    const xScale = d3.scalePoint()
        .domain(d3.range(headers.length))
        .range([0, plotWidth]);
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw axes
    headers.forEach((header, i) => {
        const x = xScale(i) + margin.left;
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, headerHeight - margin.bottom);
        ctx.stroke();
    });
    // Draw lines with color based on class
    rows.forEach(row => {
        const classValue = row[classIndex];
        const lineColor = classColorMap.get(classValue) || "rgba(0, 0, 0, 0.5)"; // Fallback to a default color
        ctx.beginPath();
        headers.forEach((header, i) => {
            const x = xScale(i) + margin.left;
            const y = yScales[i](parseFloat(row[data[0].indexOf(header)])) + margin.top;
            if (i === 0) {
                ctx.moveTo(x, y);
            }
            else {
                ctx.lineTo(x, y);
            }
        });
        ctx.strokeStyle = lineColor;
        ctx.stroke();
    });
    // Apply horizontal scrolling
    const parallelView = document.getElementById('parallel-view');
    parallelView.style.overflowX = "auto";
    parallelView.style.width = "100%";
    canvas.style.width = `${plotWidth + margin.left + margin.right}px`;
}
function generateClassColors(numClasses) {
    return Array.from({ length: numClasses }, (_, i) => {
        const hue = i / numClasses;
        const rgb = HSVtoRGB(hue, 1, 1);
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    });
}
function HSVtoRGB(h, s, v) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r = 0, g = 0, b = 0; // Initialize with default values
    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
