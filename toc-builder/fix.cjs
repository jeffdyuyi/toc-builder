const fs = require('fs');

try {
    let content_cjs = fs.readFileSync('tmp.cjs', 'utf-8');
    let start = content_cjs.indexOf('const occupations = {');
    let end = content_cjs.indexOf('};\n\nlet content =');
    if (start === -1 || end === -1) {
        console.log('Error finding occs in cjs');
        process.exit(1);
    }

    let occs = content_cjs.substring(start + 20, end + 1);

    let content_ts = fs.readFileSync('src/data/constants.ts', 'utf-8');

    let start_ts = content_ts.indexOf('export const OCCUPATION_DESC');
    let end_ts = content_ts.indexOf('export const CREATION_GUIDE');

    if (start_ts === -1 || end_ts === -1) {
        console.log('error finding OCCUPATION_DESC in ts:', start_ts, end_ts);
        process.exit(1);
    }

    let new_ts = content_ts.substring(0, start_ts) + 'export const OCCUPATION_DESC: Record<string, OccupationData> = ' + occs + ';\n\nexport const CREATION_GUIDE' + content_ts.substring(end_ts + 27);

    fs.writeFileSync('src/data/constants.ts', new_ts, 'utf-8');

    console.log('Success!');
} catch (e) {
    console.error('Exception:', e);
}
