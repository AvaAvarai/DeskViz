export function parseCSV(data: string): string[][] {
    return data.trim().split('\n').map(row => row.split(','));
}

export function handleFileInput(fileInput: HTMLInputElement, onFileLoaded: (data: string[][]) => void) {
    fileInput.addEventListener('change', (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvData = (e.target as FileReader).result as string;
                const data: string[][] = parseCSV(csvData);
                onFileLoaded(data);
            };
            reader.readAsText(file);
        }
    });
}
