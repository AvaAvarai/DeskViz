declare var Plotly: any;

document.addEventListener("DOMContentLoaded", () => {
    // Existing elements
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

    // Parallel coordinates elements
    const openParallelView = document.getElementById('open-parallel-view') as HTMLElement;
    const parallelWindow = document.getElementById('parallel-window') as HTMLElement;
    const parallelView = document.getElementById('parallel-view') as HTMLElement;
    const parallelCloseBtn = document.getElementById('parallel-close-btn') as HTMLElement;

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
        renderParallelCoordinates(parsedData); // Assuming parsedData is available globally
    });

    parallelCloseBtn.addEventListener('click', () => {
        parallelWindow.classList.add('hidden');
    });

    // Dragging windows
    function makeDraggable(header: HTMLElement, windowElement: HTMLElement) {
        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        header.addEventListener('mousedown', (e: MouseEvent) => {
            isDragging = true;
            offsetX = e.clientX - windowElement.offsetLeft;
            offsetY = e.clientY - windowElement.offsetTop;
        });

        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (isDragging) {
                windowElement.style.left = `${e.clientX - offsetX}px`;
                windowElement.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    makeDraggable(tableWindow.querySelector('.window-header') as HTMLElement, tableWindow);
    makeDraggable(parallelWindow.querySelector('.window-header') as HTMLElement, parallelWindow);

    // File input change handler
    let parsedData: string[][];

    fileInput.addEventListener('change', (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvData = (e.target as FileReader).result as string;
                parsedData = parseCSV(csvData); // Save the parsed data globally
                const stats = calculateStats(parsedData, file.name, file.size);
                showStatsPanel(stats);
                renderTable(parsedData);
                tableWindow.classList.remove('hidden'); // Show window when data is loaded
            };
            reader.readAsText(file);
        }
    });

    function parseCSV(data: string): string[][] {
        return data.trim().split('\n').map(row => row.split(','));
    }

    function calculateStats(data: string[][], fileName: string, fileSize: number) {
        const headers = data[0];
        const caseCount = data.length - 1;
        const attributeCount = headers.length - 1;
        const classColumn = headers.find(header => header.toLowerCase() === 'class');
        const classIndex = classColumn ? headers.indexOf(classColumn) : -1;
        const classCount = classIndex > -1 ? new Set(data.slice(1).map(row => row[classIndex])).size : 0;
        const datasetSize = (fileSize / 1024).toFixed(2); // Convert to KB

        return { fileName, caseCount, attributeCount, classCount, datasetSize };
    }

    function showStatsPanel(stats: any) {
        statsPanel.innerHTML = `
            Currently loaded dataset: ${stats.fileName} |
            ${stats.caseCount} cases |
            ${stats.attributeCount} attributes |
            ${stats.classCount} unique classes |
            ${stats.datasetSize} KB
        `;
        statsPanel.classList.remove('hidden');
    }

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

        tableView.innerHTML = ''; // Clear any existing table
        tableView.appendChild(table);
        tableView.classList.remove('hidden');
    }

    function renderParallelCoordinates(data: string[][]) {
        const headers = data[0];
        const rows = data.slice(1);
        
        // Identify class column and unique classes
        const classIndex = headers.findIndex(header => header.toLowerCase() === 'class');
        if (classIndex === -1) {
            console.error("Class column not found!");
            return;
        }
        
        const uniqueClasses = Array.from(new Set(rows.map(row => row[classIndex])));
        console.log("Unique Classes:", uniqueClasses);
    
        // Generate distinct colors for each class
        const classColors = generateClassColors(uniqueClasses.length);
    
        // Map each class to its color
        const classColorMap = new Map(uniqueClasses.map((cls, i) => [cls, classColors[i]]));
    
        // Assign a numerical value to each class for coloring
        const colorValues = rows.map(row => uniqueClasses.indexOf(row[classIndex]));
        
        const dimensions = headers.map((header, index) => ({
            label: header,
            values: rows.map(row => index === classIndex ? uniqueClasses.indexOf(row[index]) : parseFloat(row[index]) || 0), // Map class to numeric index
        }));
    
        const plotData = [
            {
                type: 'parcoords',
                line: {
                    color: colorValues, // Use the numerical class index for colors
                    colorscale: uniqueClasses.map((cls, i) => [i / (uniqueClasses.length - 1), classColorMap.get(cls)]), // Map colorscale to class colors
                },
                dimensions: dimensions,
            },
        ];
    
        const layout = {
            title: {
                text: 'Parallel Coordinates Plot',
                font: {
                    size: 18,
                },
                xref: 'paper',
                x: 0.05,
            },
            margin: { l: 50, r: 50, t: 100, b: 50 }, // Increase top margin to avoid overlap
        };
    
        Plotly.newPlot(parallelView, plotData, layout);
    }    
    
    function generateClassColors(numClasses: number): string[] {
        return Array.from({ length: numClasses }, (_, i) => {
            const hue = i / numClasses;
            const rgb = HSVtoRGB(hue, 1, 1);
            return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        });
    }
    
    function HSVtoRGB(h: number, s: number, v: number): [number, number, number] {
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
    
        let r = 0, g = 0, b = 0; // Initialize with default values
    
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
    
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
});
