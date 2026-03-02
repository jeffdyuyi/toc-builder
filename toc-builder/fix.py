import sys

try:
    with open('tmp.cjs', 'r', encoding='utf-8') as f:
        content_cjs = f.read()

    start = content_cjs.find('const occupations = {')
    end = content_cjs.find('};\n\nlet content =')
    if start == -1 or end == -1:
        print('Error finding occs in cjs')
        sys.exit(1)
    
    occs = content_cjs[start + 20 : end + 1]

    with open('src/data/constants.ts', 'r', encoding='utf-8') as f:
        content_ts = f.read()

    start_ts = content_ts.find('export const OCCUPATION_DESC')
    end_ts = content_ts.find('export const CREATION_GUIDE')

    if start_ts == -1 or end_ts == -1:
        print('error finding OCCUPATION_DESC in ts')
        sys.exit(1)

    new_ts = content_ts[:start_ts] + 'export const OCCUPATION_DESC: Record<string, OccupationData> = ' + occs + ';\n\nexport const CREATION_GUIDE' + content_ts[end_ts + 27:]

    with open('src/data/constants.ts', 'w', encoding='utf-8') as f:
        f.write(new_ts)

    print('Success!')
except Exception as e:
    print('Exception:', e)
