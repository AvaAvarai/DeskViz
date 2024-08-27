"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const about = document.getElementById('about');
    const seeCode = document.getElementById('see-code');
    const loadCsv = document.getElementById('load-csv');
    startButton.addEventListener('click', () => {
        startMenu.classList.toggle('hidden');
    });
    about.addEventListener('click', () => {
        alert('This is DeskViz, a simulated desktop application for data visualization.');
        startMenu.classList.add('hidden');
    });
    seeCode.addEventListener('click', () => {
        window.open('https://github.com/AvaAvarai/DeskViz', '_blank');
        startMenu.classList.add('hidden');
    });
    loadCsv.addEventListener('click', () => {
        alert('Load CSV functionality will be implemented here.');
        startMenu.classList.add('hidden');
    });
    document.addEventListener('click', (event) => {
        if (!startButton.contains(event.target) && !startMenu.contains(event.target)) {
            startMenu.classList.add('hidden');
        }
    });
});
