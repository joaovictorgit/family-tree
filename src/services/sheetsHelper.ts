const XLSX = require('xlsx');
const fs = require('fs');

/**
 * Adiciona várias linhas a uma planilha ODS local.
 * @param {string} filePath - Caminho do arquivo .ods existente.
 * @param {Array<Object>} newRows - Array com objetos representando as novas linhas.
 * @param {string|null} sheetName - Nome da aba, ou null para primeira aba.
 * @param {boolean} overwrite - Se verdadeiro, sobrescreve o arquivo original.
 */
export function addRowsToOds(filePath: string, newRows: any, sheetName = null, overwrite = false) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const selectedSheetName = sheetName || workbook.SheetNames[0];
  const sheet = workbook.Sheets[selectedSheetName];

  let existingData = XLSX.utils.sheet_to_json(sheet);

  // Se a planilha estiver vazia, cria cabeçalhos com base no primeiro objeto
  if (existingData.length === 0 && newRows.length > 0) {
    existingData = [];
  }

  const allData = [...existingData, ...newRows];

  const newSheet = XLSX.utils.json_to_sheet(allData);
  workbook.Sheets[selectedSheetName] = newSheet;

  const outputPath = overwrite ? filePath : filePath.replace(/\.ods$/, '_atualizado.ods');
  XLSX.writeFile(workbook, outputPath);

  console.log(`${newRows.length} linha(s) adicionada(s) a: ${outputPath}`);
}
