export function exportToCsv(filename, rows) {
    if (!rows || !rows.length) {
        alert("Aucune donnée à exporter");
        return;
    }

    const headers = Object.keys(rows[0]);

    const csvContent = [
        headers.join(","), // header row
        ...rows.map(row =>
            headers.map(field => JSON.stringify(row[field] ?? "")).join(",")
        )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}
