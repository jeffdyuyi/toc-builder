const xlsx = require('xlsx');

const workbook = xlsx.readFile('../TOC人物卡1.4.1.xlsx');
console.log('Sheet Names:', workbook.SheetNames);
for (const sheetName of workbook.SheetNames) {
    console.log('---', sheetName, '---');
    const sheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (json.length > 0) {
        console.log('Headers:', json[0]);
        console.log('Row 1:', json[1]);
    }
}
