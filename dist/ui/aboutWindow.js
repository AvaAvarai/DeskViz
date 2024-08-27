import { bringToForeground } from './windows.js';
export function setupAboutWindow(aboutButton, aboutWindow, closeBtn) {
    aboutButton.addEventListener('click', () => {
        aboutWindow.classList.remove('hidden');
        bringToForeground(aboutWindow);
    });
    closeBtn.addEventListener('click', () => {
        aboutWindow.classList.add('hidden');
    });
}
