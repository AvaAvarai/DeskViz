export function bringToForeground(element: HTMLElement) {
    let highestZIndex = 1;
    document.querySelectorAll('*').forEach(el => {
        const zIndex = parseInt(window.getComputedStyle(el).zIndex);
        if (zIndex > highestZIndex) {
            highestZIndex = zIndex;
        }
    });
    element.style.zIndex = (highestZIndex + 1).toString();
}
