import re
import json

txt = open('e:/YJF/TOC 车卡器/TOC职业能力.txt', 'r', encoding='utf-8').read()
constants = open('src/data/constants.ts', 'r', encoding='utf-8').read()

# Extract skills
all_skills = []
for match in re.finditer(r'\[(.*?)\]', constants):
    parts = match.group(1).split(',')
    for p in parts:
        p = p.strip().strip('"').strip("'")
        if p and p != '自定义...':
            all_skills.append(p)

def get_base_name(skill):
    m = re.match(r'^(.*?)\(\d+\)$', skill)
    if m: return m.group(1)
    m = re.match(r'^(.*?)\*$', skill)
    if m: return m.group(1)
    return skill

skill_map = {}
for s in all_skills:
    skill_map[get_base_name(s)] = s

def extract_skills_from_text(text):
    found = []
    # common logic
    for word in re.split(r'[、，。（）\s]+', text):
        if word in skill_map:
            found.append(skill_map[word])
    return found

occupations = {}
parts = re.split(r'\n\n+', txt.strip())
for p in parts:
    lines = p.strip().split('\n')
    if not lines: continue
    name = lines[0].strip()
    if name not in constants and name != '精神病学家': continue
    
    desc_lines = []
    i = 1
    while i < len(lines) and not lines[i].startswith('职业能力：'):
        desc_lines.append(lines[i].strip())
        i += 1
    desc = '\n'.join(desc_lines)
    
    parsed_skills = lines[i].replace('职业能力：', '').strip() if i < len(lines) else ''
    skills = extract_skills_from_text(parsed_skills)

    i += 1
    # Check if there are more parsed skills lines
    while i < len(lines) and not lines[i].startswith('信誉等级：') and not lines[i].startswith('特殊规则：'):
        parsed_skills += '\n' + lines[i].strip()
        skills.extend(extract_skills_from_text(lines[i].strip()))
        i += 1
    
    credit = lines[i].replace('信誉等级：', '').strip() if i < len(lines) and lines[i].startswith('信誉等级：') else ''
    if credit: i += 1
    
    special_lines = []
    while i < len(lines):
        l = lines[i]
        if l.startswith('特殊规则：'):
            l = l.replace('特殊规则：', '')
        elif l.startswith('特殊能力：'):
            l = l.replace('特殊能力：', '')
        special_lines.append(l.strip())
        i += 1
    special = '\n'.join(special_lines)
    
    occupations[name] = {
        'desc': desc,
        'parsedSkillsText': parsed_skills,
        'skills': list(set(skills)), # dedup
        'credit': credit,
        'special': special
    }

with open('src/data/_occ.json', 'w', encoding='utf-8') as f:
    json.dump(occupations, f, ensure_ascii=False, indent=4)
