import { bringToForeground } from './windows.js';

export function makeDraggable(header: HTMLElement, windowElement: HTMLElement) {
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    const onMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            const desktop = document.getElementById('desktop') as HTMLElement;
            const desktopRect = desktop.getBoundingClientRect();
            const windowRect = windowElement.getBoundingClientRect();

            // Calculate new position
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;

            // Boundary checks
            newLeft = Math.max(desktopRect.left, Math.min(newLeft, desktopRect.right - windowRect.width));
            newTop = Math.max(
                desktopRect.top + document.getElementById('stats-panel')!.offsetHeight,
                Math.min(newTop, desktopRect.bottom - windowRect.height - document.getElementById('taskbar')!.offsetHeight)
            );

            // Set new position
            windowElement.style.left = `${newLeft}px`;
            windowElement.style.top = `${newTop}px`;
        }
    };

    const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    header.addEventListener('mousedown', (e: MouseEvent) => {
        isDragging = true;
        offsetX = e.clientX - windowElement.offsetLeft;
        offsetY = e.clientY - windowElement.offsetTop;
        bringToForeground(windowElement); // Bring to foreground when dragging starts

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}
