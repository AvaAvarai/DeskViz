import { toggleStartMenu } from './ui/startMenu.js';
import { setupAboutWindow } from './ui/aboutWindow.js';
import { makeDraggable } from './ui/draggable.js';
import { showStatsPanel } from './ui/statsPanel.js';
import { generateClassColors } from './data/colorUtils.js';
import { calculateStats } from './data/dataProcessing.js';
import { handleFileInput, parseCSV } from './data/fileHandler.js';

declare var d3: any;

document.addEventListener("DOMContentLoaded", () => {
    // Get elements
    const startButton = document.getElementById('start-button') as HTMLElement;
    const startMenu = document.getElementById('start-menu') as HTMLElement;
    const about = document.getElementById('about') as HTMLElement;
    const seeCode = document.getElementById('see-code') as HTMLElement;
    const loadCsv = document.getElementById('load-csv') as HTMLElement;
    const openTableView = document.getElementById('open-table-view') as HTMLElement;
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const statsPanel = document.getElementById('stats-panel') as HTMLElement;
    const tableView = document.getElementById('table-view') as HTMLElement;
    const tableWindow = document.getElementById('table-window') as HTMLElement;
    const closeBtn = document.getElementById('close-btn') as HTMLElement;
    const aboutWindow = document.getElementById('about-window') as HTMLElement;
    const aboutCloseBtn = document.getElementById('about-close-btn') as HTMLElement;

    const openParallelView = document.getElementById('open-parallel-view') as HTMLElement;
    const parallelWindow = document.getElementById('parallel-window') as HTMLElement;
    const parallelView = document.getElementById('parallel-view') as HTMLElement;
    const parallelCloseBtn = document.getElementById('parallel-close-btn') as HTMLElement;

    let highestZIndex = 1;

    let parsedData: string[][];

    function bringToForeground(windowElement: HTMLElement) {
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
        } else {
            console.warn("No data loaded yet!");
        }
        startMenu.classList.add('hidden');
    });

    parallelCloseBtn.addEventListener('click', () => {
        parallelWindow.classList.add('hidden');
    });

    makeDraggable(tableWindow.querySelector('.window-header') as HTMLElement, tableWindow);
    makeDraggable(parallelWindow.querySelector('.window-header') as HTMLElement, parallelWindow);
    makeDraggable(aboutWindow.querySelector('.window-header') as HTMLElement, aboutWindow);

    handleFileInput(fileInput, (data: string[][]) => {
        parsedData = data;

        const stats = calculateStats(data, fileInput.files![0].name, fileInput.files![0].size);

        const classIndex = data[0].findIndex(header => header.toLowerCase() === 'class');
        const rows = data.slice(1);
        const uniqueClasses = Array.from(new Set(rows.map(row => row[classIndex])));
        const classColors = generateClassColors(uniqueClasses.length);
        const classColorMap = new Map<string, string>(uniqueClasses.map((cls, i) => [cls, classColors[i]]));

        showStatsPanel(stats, classColorMap, uniqueClasses, statsPanel);
        renderTable(parsedData);
        tableWindow.classList.remove('hidden');
        bringToForeground(tableWindow);
    });

    function renderTable(data: string[][]) {
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

    function renderParallelCoordinatesD3Canvas(data: string[][]) {
        const canvas = document.getElementById('parallelCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        
        const margin = {top: 50, right: 50, bottom: 50, left: 50};
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
                .domain(d3.extent(rows, (row: string[]) => parseFloat(row[i])) as [number, number])
                .range([plotHeight, 0]);
        });

        const xScale = d3.scalePoint()
            .domain(d3.range(headers.length))
            .range([0, plotWidth]);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        headers.forEach((header, i) => {
            const x = xScale(i)! + margin.left;
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
                const x = xScale(i)! + margin.left;
                const y = yScales[i](parseFloat(row[data[0].indexOf(header)]))! + margin.top;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
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
