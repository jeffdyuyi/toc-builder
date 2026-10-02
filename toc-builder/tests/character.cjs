const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const cache = new Map();
function load(name) {
 if (cache.has(name)) return cache.get(name);
 const file = path.resolve(__dirname, '../src/data', name + '.ts');
 const mod = new Module(file, module);
 mod.filename = file;
 mod.paths = module.paths;
 mod.require = ref => ref.endsWith('.json') ? JSON.parse(fs.readFileSync(path.resolve(path.dirname(file), ref), 'utf8')) : ref.startsWith('./') ? load(ref.slice(2)) : require(ref);
 mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText, file);
 cache.set(name, mod.exports);
 return mod.exports;
}
const { normalizeCharacter, level, pool, updateAbility } = load('character');
const base = normalizeCharacter({ name: '测试调查员', sanity: 4, stability: 1, health: 1, skills: { '运动': '8' }, equipmentItems: [] });
assert.equal(level(base, '心智(9)'), 4);
let character = updateAbility(base, '健康(9)', 9, false);
assert.equal(character.health, 9);
assert.equal(character.skills['健康(9)'], '9');
character = updateAbility(character, '健康(9)', -3, true);
assert.equal(pool(character, '健康(9)'), -3);
assert.equal(level(character, '健康(9)'), 9);
character = updateAbility(character, '运动', 5, true);
assert.equal(pool(character, '运动'), 5);
assert.equal(level(character, '运动'), 8);
assert.equal(pool(updateAbility(character, '运动', 20, true), '运动'), 8);
assert.equal(level(updateAbility(base, '运动', -2, false), '运动'), 0);
assert.equal(level(updateAbility(base, '运动', 10000, false), '运动'), 99);
const restored = normalizeCharacter(JSON.parse(JSON.stringify(character)));
assert.equal(pool(restored, '健康(9)'), -3);
assert.equal(pool(restored, '运动'), 5);
assert.equal(pool({ ...restored, pools: {} }, '运动'), 8);
assert.equal(normalizeCharacter({ ...base, skills: { '健康(9)': '7' }, health: 2 }).health, 7);
assert.throws(() => normalizeCharacter({ ...base, pools: { '运动': '坏数据' } }));
assert.throws(() => normalizeCharacter({ ...base, equipmentItems: [null] }));
console.log('通过：状态同步、等级与池分离、消耗与恢复、边界输入、旧存档迁移及存档往返。');

const { PRESET_CHARACTERS, createPresetSave } = load('presets');
assert.equal(PRESET_CHARACTERS.length, 5);
assert.equal(new Set(PRESET_CHARACTERS.map(preset => preset.id)).size, 5);
assert.deepEqual(PRESET_CHARACTERS.map(preset => preset.save.data.name), ['肯尼斯·菲尔', '罗杰·菲尔', '诺曼·莱特', '简·乔伊斯-克利夫兰', '诺克斯·梅克皮斯']);
for (const preset of PRESET_CHARACTERS) {
 const source = fs.readFileSync(path.resolve(__dirname, `../../预设角色卡_${preset.save.data.name}.json`), 'utf8');
 assert.deepEqual(preset.save, JSON.parse(source));
 const copy = createPresetSave(preset);
 assert.equal(copy.isCompleted, true);
 assert.equal(copy.settings.playerCount, 5);
 assert.equal(copy.frozenStats.invUsed, copy.settings.customInvPoints);
 assert.equal(copy.frozenStats.genUsed, copy.settings.customGenPoints);
 for (const [skill, value] of Object.entries(copy.data.skills)) assert.equal(pool(copy.data, skill), Number(value));
 copy.data = updateAbility(copy.data, '健康(9)', 0, true);
 copy.data.name = '玩家的副本';
 copy.settings.customGenPoints = 0;
 copy.data.equipmentItems.push({ id: 'test', name: '笔记本', qty: '1', price: '', note1: '', note2: '' });
 const fresh = createPresetSave(preset);
 assert.deepEqual(JSON.parse(JSON.stringify(fresh)), JSON.parse(source));
 const roundTrip = normalizeCharacter(JSON.parse(JSON.stringify(fresh)).data);
 assert.deepEqual(roundTrip, fresh.data);
}
assert.equal(createPresetSave(PRESET_CHARACTERS[1]).data.sanity, 12);
assert.equal(createPresetSave(PRESET_CHARACTERS[2]).data.sanity, 12);
console.log('通过：五张预设源文件一致性、满池跑团状态、独立副本、重新载入与导出往返。');

const { DRAFT_KEY, BACKUP_PREFIX, saveWithBackup, listCharacters } = load('storage');
const store = {};
const storage = {
 getItem: key => store[key] ?? null,
 setItem: (key, value) => { store[key] = value; }
};
saveWithBackup(storage, '原角色', '旧存档');
assert.equal(store.toc_char_原角色, '旧存档');
assert.equal(store[BACKUP_PREFIX + '原角色'], undefined);
store[DRAFT_KEY] = '自动草稿';
saveWithBackup(storage, '原角色', '新存档');
assert.equal(store[BACKUP_PREFIX + '原角色'], '旧存档');
assert.equal(store.toc_char_原角色, '新存档');
assert.equal(store[DRAFT_KEY], '自动草稿');
saveWithBackup(storage, '原角色', '新存档');
assert.equal(store[BACKUP_PREFIX + '原角色'], '旧存档');
assert.deepEqual(listCharacters(store), ['原角色']);
assert.throws(() => saveWithBackup({ ...storage, setItem: () => { throw new Error('QuotaExceededError'); } }, '原角色', '失败的存档'));
assert.equal(store.toc_char_原角色, '新存档');
assert.equal(store[BACKUP_PREFIX + '原角色'], '旧存档');
console.log('通过：正式存档与自动草稿隔离、同名覆盖上一版备份、重复保存保留备份、写入失败不覆盖原存档。');
