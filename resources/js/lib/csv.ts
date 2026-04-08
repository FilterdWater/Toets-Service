/**
 * RFC 4180-style CSV field escaping for Excel / Dutch locale (UTF-8 BOM).
 */
export function escapeCsvField(value: string): string {
    if (/[",\r\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export function rowsToCsvContent(rows: string[][]): string {
    const bom = '\uFEFF';
    const lines = rows.map((row) =>
        row.map((cell) => escapeCsvField(cell)).join(','),
    );
    return bom + lines.join('\r\n');
}

export function downloadCsvFile(filename: string, content: string): void {
    const blob = new Blob([content], {
        type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

export function sanitizeCsvFilenameSegment(name: string): string {
    const trimmed = name
        .replace(/[/\\?%*:|"<>]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();

    return trimmed.length > 0 ? trimmed : 'toets';
}
