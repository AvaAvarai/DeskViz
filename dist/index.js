import { toggleStartMenu } from './ui/startMenu.js';
import { makeDraggable } from './ui/draggable.js';
import { showStatsPanel } from './ui/statsPanel.js';
import { generateClassColors } from './data/colorUtils.js';
import { calculateStats } from './data/dataProcessing.js';
import { handleFileInput } from './data/fileHandler.js';
document.addEventListener("DOMContentLoaded", () => {
    // Get elements
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const about = document.getElementById('about');
    const seeCode = document.getElementById('see-code');
    const loadCsv = document.getElementById('load-csv');
    const openTableView = document.getElementById('open-table-view');
    const fileInput = document.getElementById('file-input');
    const statsPanel = document.getElementById('stats-panel');
    const tableView = document.getElementById('table-view');
    const tableWindow = document.getElementById('table-window');
    const closeBtn = document.getElementById('close-btn');
    const aboutWindow = document.getElementById('about-window');
    const aboutCloseBtn = document.getElementById('about-close-btn');
    const openParallelView = document.getElementById('open-parallel-view');
    const parallelWindow = document.getElementById('parallel-window');
    const parallelView = document.getElementById('parallel-view');
    const parallelCloseBtn = document.getElementById('parallel-close-btn');
    let highestZIndex = 1;
    let parsedData;
    function bringToForeground(windowElement) {
        highestZIndex += 1;
        windowElement.style.zIndex = highestZIndex.toString();
    }
    [tableWindow, parallelWindow, aboutWindow].forEach(window => {
        window.addEventListener('mousedown', () => bringToForeground(window));
    });
    toggleStartMenu(startButton, startMenu);
    about.addEventListener('click', () => {
        aboutWindow.classList.remove('hidden');
        bringToForeground(aboutWindow);
        startMenu.classList.add('hidden');
    });
    aboutCloseBtn.addEventListener('click', () => {
        aboutWindow.classList.add('hidden');
    });
    seeCode.addEventListener('click', () => {
        window.open('https://github.com/AvaAvarai/VizDesk', '_blank');
        startMenu.classList.add('hidden');
    });
    loadCsv.addEventListener('click', () => {
        fileInput.click();
        startMenu.classList.add('hidden');
    });
    openTableView.addEventListener('click', () => {
        tableWindow.classList.remove('hidden');
        startMenu.classList.add('hidden');
        bringToForeground(tableWindow);
    });
    closeBtn.addEventListener('click', () => {
        tableWindow.classList.add('hidden');
    });
    openParallelView.addEventListener('click', () => {
        if (parsedData && parsedData.length > 0) {
            parallelWindow.classList.remove('hidden');
            renderParallelCoordinatesD3Canvas(parsedData);
            bringToForeground(parallelWindow);
        }
        else {
            console.warn("No data loaded yet!");
        }
        startMenu.classList.add('hidden');
    });
    parallelCloseBtn.addEventListener('click', () => {
        parallelWindow.classList.add('hidden');
    });
    makeDraggable(tableWindow.querySelector('.window-header'), tableWindow);
    makeDraggable(parallelWindow.querySelector('.window-header'), parallelWindow);
    makeDraggable(aboutWindow.querySelector('.window-header'), aboutWindow);
    handleFileInput(fileInput, (data) => {
        parsedData = data;
        const stats = calculateStats(data, fileInput.files[0].name, fileInput.files[0].size);
        const classIndex = data[0].findIndex(header => header.toLowerCase() === 'class');
        const rows = data.slice(1);
        const uniqueClasses = Array.from(new Set(rows.map(row => row[classIndex])));
        const classColors = generateClassColors(uniqueClasses.length);
        const classColorMap = new Map(uniqueClasses.map((cls, i) => [cls, classColors[i]]));
        showStatsPanel(stats, classColorMap, uniqueClasses, statsPanel);
        renderTable(parsedData);
        tableWindow.classList.remove('hidden');
        bringToForeground(tableWindow);
    });
    function renderTable(data) {
        const table = document.createElement('table');
        const headerRow = document.createElement('tr');
        data[0].forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        data.slice(1).forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
        tableView.innerHTML = '';
        tableView.appendChild(table);
        tableView.classList.remove('hidden');
    }
    function renderParallelCoordinatesD3Canvas(data) {
        const canvas = document.getElementById('parallelCanvas');
        const ctx = canvas.getContext('2d');
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const headerHeight = 600;
        const attributeCount = data[0].length - 1;
        const plotWidth = Math.max(1000, 150 * attributeCount);
        const plotHeight = headerHeight - margin.top - margin.bottom;
        canvas.width = plotWidth + margin.left + margin.right;
        canvas.height = headerHeight;
        const headers = data[0].filter(header => header.toLowerCase() !== 'class');
        const rows = data.slice(1);
        const classIndex = data[0].findIndex(header => header.toLowerCase() === 'class');
        const uniqueClasses = Array.from(new Set(rows.map(row => row[classIndex])));
        const classColors = generateClassColors(uniqueClasses.length);
        const classColorMap = new Map(uniqueClasses.map((cls, i) => [cls, classColors[i]]));
        const yScales = headers.map((header, i) => {
            return d3.scaleLinear()
                .domain(d3.extent(rows, (row) => parseFloat(row[i])))
                .range([plotHeight, 0]);
        });
        const xScale = d3.scalePoint()
            .domain(d3.range(headers.length))
            .range([0, plotWidth]);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        headers.forEach((header, i) => {
            const x = xScale(i) + margin.left;
            ctx.beginPath();
            ctx.moveTo(x, margin.top);
            ctx.lineTo(x, headerHeight - margin.bottom);
            ctx.stroke();
        });
        rows.forEach(row => {
            const classValue = row[classIndex];
            const lineColor = classColorMap.get(classValue) || "rgba(0, 0, 0, 0.5)";
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
        parallelView.style.overflowX = "auto";
        parallelView.style.width = "100%";
        canvas.style.width = `${plotWidth + margin.left + margin.right}px`;
    }
});
