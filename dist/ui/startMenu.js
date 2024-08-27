import { bringToForeground } from './windows.js';
export function toggleStartMenu(startButton, startMenu) {
    startButton.addEventListener('click', () => {
        startMenu.classList.toggle('hidden');
        if (!startMenu.classList.contains('hidden')) {
            bringToForeground(startMenu);
        }
    });
}
