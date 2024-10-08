export function showStatsPanel(stats, classColorMap, uniqueClasses, statsPanel) {
    let classSwatches = uniqueClasses.map(cls => {
        const color = classColorMap.get(cls);
        return `
            <span class="class-swatch" style="background-color: ${color};"></span>${cls}
        `;
    }).join(" | ");
    statsPanel.innerHTML = `
        Currently loaded dataset: ${stats.fileName} |
        ${stats.caseCount} cases |
        ${stats.attributeCount} attributes |
        ${stats.classCount} unique classes |
        ${stats.datasetSize} KB |
        Classes: ${classSwatches}
    `;
    statsPanel.classList.remove('hidden');
}
