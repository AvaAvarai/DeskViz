"use strict";
document.addEventListener("DOMContentLoaded", () => {
    // Existing elements
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
    // Parallel coordinates elements
    const openParallelView = document.getElementById('open-parallel-view');
    const parallelWindow = document.getElementById('parallel-window');
    const parallelView = document.getElementById('parallel-view');
    const parallelCloseBtn = document.getElementById('parallel-close-btn');
    // Toggle start menu
    startButton.addEventListener('click', () => {
        startMenu.classList.toggle('hidden');
    });
    about.addEventListener('click', () => {
        alert('What if there was a locally 🏠 sessioned computer desktop 🖥️ metaphor for data science 📈 and visualization tools 🛠️?');
        startMenu.classList.add('hidden');
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
    });
    closeBtn.addEventListener('click', () => {
        tableWindow.classList.add('hidden');
    });
    openParallelView.addEventListener('click', () => {
        parallelWindow.classList.remove('hidden');
        startMenu.classList.add('hidden');
        renderParallelCoordinatesD3Canvas(parsedData); // Updated function call
    });
    parallelCloseBtn.addEventListener('click', () => {
        parallelWindow.classList.add('hidden');
    });
    // Dragging windows
    function makeDraggable(header, windowElement) {
        let isDragging = false;
        let offsetX = 0, offsetY = 0;
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - windowElement.offsetLeft;
            offsetY = e.clientY - windowElement.offsetTop;
        });
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                windowElement.style.left = `${e.clientX - offsetX}px`;
                windowElement.style.top = `${e.clientY - offsetY}px`;
            }
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
    makeDraggable(tableWindow.querySelector('.window-header'), tableWindow);
    makeDraggable(parallelWindow.querySelector('.window-header'), parallelWindow);
    // File input change handler
    let parsedData;
    fileInput.addEventListener('change', (event) => {
        var _a;
        const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvData = e.target.result;
                parsedData = parseCSV(csvData); // Save the parsed data globally
                const stats = calculateStats(parsedData, file.name, file.size);
                showStatsPanel(stats);
                renderTable(parsedData);
                tableWindow.classList.remove('hidden'); // Show window when data is loaded
            };
            reader.readAsText(file);
        }
    });
    function parseCSV(data) {
        return data.trim().split('\n').map(row => row.split(','));
    }
    function calculateStats(data, fileName, fileSize) {
        const headers = data[0];
        const caseCount = data.length - 1;
        const attributeCount = headers.length - 1;
        const classColumn = headers.find(header => header.toLowerCase() === 'class');
        const classIndex = classColumn ? headers.indexOf(classColumn) : -1;
        const classCount = classIndex > -1 ? new Set(data.slice(1).map(row => row[classIndex])).size : 0;
        const datasetSize = (fileSize / 1024).toFixed(2); // Convert to KB
        return { fileName, caseCount, attributeCount, classCount, datasetSize };
    }
    function showStatsPanel(stats) {
        statsPanel.innerHTML = `
            Currently loaded dataset: ${stats.fileName} |
            ${stats.caseCount} cases |
            ${stats.attributeCount} attributes |
            ${stats.classCount} unique classes |
            ${stats.datasetSize} KB
        `;
        statsPanel.classList.remove('hidden');
    }
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
        tableView.innerHTML = ''; // Clear any existing table
        tableView.appendChild(table);
        tableView.classList.remove('hidden');
    }
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
        parallelView.style.overflowX = "auto";
        parallelView.style.width = "100%";
        canvas.style.width = `${plotWidth + margin.left + margin.right}px`;
    }
    // Call this function when you want to render the parallel coordinates
    openParallelView.addEventListener('click', () => {
        parallelWindow.classList.remove('hidden');
        startMenu.classList.add('hidden');
        renderParallelCoordinatesD3Canvas(parsedData); // Corrected function call
    });
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
});
