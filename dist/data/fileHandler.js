export function parseCSV(data) {
    return data.trim().split('\n').map(row => row.split(','));
}
export function handleFileInput(fileInput, onFileLoaded) {
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvData = e.target.result;
                const data = parseCSV(csvData);
                onFileLoaded(data);
            };
            reader.readAsText(file);
        }
    });
}
