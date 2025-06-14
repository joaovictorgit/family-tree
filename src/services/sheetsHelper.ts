const XLSX = require('xlsx');
const fs = require('fs');

/**
 * Adiciona várias linhas em lotes a uma planilha ODS local.
 * @param {string} filePath - Caminho do arquivo .ods existente.
 * @param {Array<Object>} newRows - Novas linhas a serem inseridas.
 * @param {string|null} sheetName - Nome da aba, ou null para primeira aba.
 * @param {boolean} overwrite - Se verdadeiro, sobrescreve o arquivo original.
 * @param {number} batchSize - Tamanho do lote, default 30.
 */
export function addRowsToOds(
  filePath: string,
  newRows: any[],
  sheetName: string | null = null,
  overwrite: boolean = false,
  batchSize: number = 30
) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const selectedSheetName = sheetName || workbook.SheetNames[0];
  const sheet = workbook.Sheets[selectedSheetName];

  let existingData = XLSX.utils.sheet_to_json(sheet);

  const outputPath = overwrite ? filePath : filePath.replace(/\.ods$/, '_atualizado.ods');
  const totalBatches = Math.ceil(newRows.length / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const batch = newRows.slice(i * batchSize, (i + 1) * batchSize);
    existingData = [...existingData, ...batch];

    const newSheet = XLSX.utils.json_to_sheet(existingData);
    workbook.Sheets[selectedSheetName] = newSheet;

    XLSX.writeFile(workbook, outputPath);
    console.log(`Batch ${i + 1}/${totalBatches} processado com ${batch.length} linhas.`);
  }

  console.log(`✅ Total de ${newRows.length} linhas adicionadas em ${totalBatches} lote(s): ${outputPath}`);
}
