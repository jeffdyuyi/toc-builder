const xlsx = require('xlsx');

const workbook = xlsx.readFile('../TOC人物卡1.4.1.xlsx');
for (const sheetName of workbook.SheetNames) {
    console.log('---', sheetName, '---');
    const sheet = workbook.Sheets[sheetName];
    // console.log(xlsx.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 30));
    const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    json.slice(0, 30).forEach(row => {
        console.log(row.join(' | '));
    });
}
