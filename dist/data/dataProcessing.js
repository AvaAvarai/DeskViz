export function calculateStats(data, fileName, fileSize) {
    const headers = data[0];
    const caseCount = data.length - 1;
    const attributeCount = headers.length - 1;
    const classColumn = headers.find(header => header.toLowerCase() === 'class');
    const classIndex = classColumn ? headers.indexOf(classColumn) : -1;
    const classCount = classIndex > -1 ? new Set(data.slice(1).map(row => row[classIndex])).size : 0;
    const datasetSize = (fileSize / 1024).toFixed(2); // Convert to KB
    return { fileName, caseCount, attributeCount, classCount, datasetSize };
}
