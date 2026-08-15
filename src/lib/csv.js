export function exportToCsv(filename, rows, columns) {
  // columns: [{ key, label }]
  const header = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const value = row[c.key] ?? '';
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  const csv = '\uFEFF' + [header, ...lines].join('\n'); // BOM عشان يفتح صح بالعربي في إكسل

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
