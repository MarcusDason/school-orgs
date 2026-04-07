import * as XLSX from "xlsx";

/**
 * Export an array of objects to Excel.
 * @param {Array} data - Array of objects, e.g., [{Section: 'BSIT', Attendees: 10}, ...]
 * @param {string} fileName - The Excel file name (without extension)
 * @param {string} sheetName - Optional: sheet name
 */
export function exportToExcel(data, fileName = "export", sheetName = "Sheet1") {
  if (!data || !data.length) return;

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Style header row: bold + background color
  const headerRange = XLSX.utils.decode_range(ws["!ref"]);
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const cell_address = { c: C, r: 0 };
    const cell_ref = XLSX.utils.encode_cell(cell_address);
    if (!ws[cell_ref]) continue;
    ws[cell_ref].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } }, // Indigo background
      alignment: { horizontal: "center" },
    };
  }

  // Optional: set column widths
  ws["!cols"] = [{ wch: 20 }, { wch: 15 }];

  // Create workbook and export
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}