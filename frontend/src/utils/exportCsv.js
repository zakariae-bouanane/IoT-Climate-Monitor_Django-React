export function exportToCsv(filename, rows) {
    if (!rows || !rows.length) {
        alert("Aucune donnée à exporter");
        return;
    }

    const headers = [
        "id",
        "sensor_name",
        "sensor_id",
        "min_temp",
        "max_temp",
        "temperature",
        "humidity",
        "status",
        "timestamp"
    ];

    const formattedRows = rows.map(row => ({
        id: row.id,
        sensor_name: row.sensor?.name ?? "",
        sensor_id: row.sensor?.sensor_id ?? "",
        min_temp: row.sensor?.min_temp ?? "",
        max_temp: row.sensor?.max_temp ?? "",
        temperature: row.temperature,
        humidity: row.humidity,
        status: row.status,
        timestamp: new Date(row.timestamp).toLocaleString()
    }));


    const csvContent = [
        headers.join(","), 
        ...formattedRows.map(row =>
            headers.map(field => `"${row[field]}"`).join(",")
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
