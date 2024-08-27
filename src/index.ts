document.addEventListener("DOMContentLoaded", () => {
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

    // Toggle start menu
    startButton.addEventListener('click', () => {
        startMenu.classList.toggle('hidden');
    });

    about.addEventListener('click', () => {
        alert('This is VizDesk, a simulated desktop application for data visualization.');
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

    // Dragging the window
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    const windowHeader = tableWindow.querySelector('.window-header') as HTMLElement;

    windowHeader.addEventListener('mousedown', (e: MouseEvent) => {
        isDragging = true;
        offsetX = e.clientX - tableWindow.offsetLeft;
        offsetY = e.clientY - tableWindow.offsetTop;
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
        if (isDragging) {
            tableWindow.style.left = `${e.clientX - offsetX}px`;
            tableWindow.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    fileInput.addEventListener('change', (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvData = (e.target as FileReader).result as string;
                const parsedData = parseCSV(csvData);
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
            Dataset: ${stats.fileName} |
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
});
