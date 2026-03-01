const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('../TOC人物卡1.4.1.xlsx');
const data = {};

for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // use header: 1 to get array of arrays
    const json = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
    data[sheetName] = json;
}

fs.writeFileSync('../toc-builder/src/data/raw_excel.json', JSON.stringify(data, null, 2));
console.log('Data exported successfully.');
