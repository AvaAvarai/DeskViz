import { bringToForeground } from './windows.js';

export function setupAboutWindow(aboutButton: HTMLElement, aboutWindow: HTMLElement, closeBtn: HTMLElement) {
    aboutButton.addEventListener('click', () => {
        aboutWindow.classList.remove('hidden');
        bringToForeground(aboutWindow);
    });

    closeBtn.addEventListener('click', () => {
        aboutWindow.classList.add('hidden');
    });
}
