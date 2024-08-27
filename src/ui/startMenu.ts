import { bringToForeground } from './windows.js';

export function toggleStartMenu(startButton: HTMLElement, startMenu: HTMLElement) {
    startButton.addEventListener('click', () => {
        startMenu.classList.toggle('hidden');
        if (!startMenu.classList.contains('hidden')) {
            bringToForeground(startMenu);
        }
    });
}
