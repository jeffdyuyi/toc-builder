import { ACADEMIC_SKILLS, SOCIAL_SKILLS, TECH_SKILLS, GENERAL_SKILLS, NON_CLASS_ELIGIBLE } from './constants';
export interface EquipmentItem { id: string; name: string; qty: string; price: string; note1: string; note2: string }
export interface Character {
 player: string; name: string; avatar: string; drive: string; occupation: string; specialty: string; pillar: string; wealth: string;
 sanity: number; stability: number; health: number; sourceOfStability: string; notes: string; campaignMemo: string; equipment: string;
 equipmentItems: EquipmentItem[]; gender: string; age: string; appearance: string; distinguishing: string; personality: string; backstory: string;
 skills: Record<string, string>; pools?: Record<string, number>; customClassSkills?: string[];
}
export type CharacterSetter = (fn: (prev: Character) => Character) => void;
export const statFields = { '心智(9)': 'sanity', '坚毅(9)': 'stability', '健康(9)': 'health' } as const;
export const allSkills = [...ACADEMIC_SKILLS, ...SOCIAL_SKILLS, ...TECH_SKILLS, ...GENERAL_SKILLS];
export function level(data: Character, skill: string): number {
 const field = statFields[skill as keyof typeof statFields];
 return field ? data[field] : Math.max(0, Number(data.skills[skill]) || 0);
}
export function pool(data: Character, skill: string): number { return data.pools?.[skill] ?? level(data, skill); }
export function updateAbility(data: Character, skill: string, value: number, playing: boolean): Character {
 const field = statFields[skill as keyof typeof statFields];
 const minimum = playing && field && field !== 'sanity' ? -12 : 0;
 const next = Math.max(minimum, Math.min(99, Math.trunc(value) || 0));
 if (playing) return { ...data, pools: { ...data.pools, [skill]: Math.min(level(data, skill), next) } };
 return field ? { ...data, [field]: next, skills: { ...data.skills, [skill]: String(next) } } : { ...data, skills: { ...data.skills, [skill]: String(next) } };
}
export function normalizeCharacter(data: Character): Character {
 if (!data || !data.skills || typeof data.skills !== 'object' || Array.isArray(data.skills)) throw new Error('无效技能数据');
 const next = { ...data, skills: { ...data.skills }, equipmentItems: data.equipmentItems || [] };
 const textFields = ['player', 'name', 'avatar', 'drive', 'occupation', 'specialty', 'pillar', 'wealth', 'sourceOfStability', 'notes', 'campaignMemo', 'equipment', 'gender', 'age', 'appearance', 'distinguishing', 'personality', 'backstory'] as const;
 for (const field of textFields) next[field] = typeof data[field] === 'string' ? data[field] : '';
 if (!Array.isArray(next.equipmentItems)) throw new Error('无效装备数据');
 next.equipmentItems = next.equipmentItems.map(item => {
  if (!item || typeof item !== 'object') throw new Error('无效装备条目');
  return Object.fromEntries(['id', 'name', 'qty', 'price', 'note1', 'note2'].map(key => [key, typeof item[key as keyof EquipmentItem] === 'string' ? item[key as keyof EquipmentItem] : ''])) as unknown as EquipmentItem;
 });
 for (const skill of allSkills) {
  const field = statFields[skill as keyof typeof statFields];
  const raw = data.skills[skill];
  const value = Math.max(0, Math.min(99, Math.trunc(Number(raw ?? (field ? data[field] : 0))) || 0));
  next.skills[skill] = String(value);
  if (field) next[field] = value;
 }
 for (const [skill, value] of Object.entries(data.pools || {})) {
  if (!allSkills.includes(skill) || !Number.isFinite(value)) throw new Error('无效能力池');
  const field = statFields[skill as keyof typeof statFields];
  next.pools = { ...next.pools, [skill]: Math.max(field && field !== 'sanity' ? -12 : 0, Math.min(level(next, skill), Math.trunc(value))) };
 }
 next.customClassSkills = Array.isArray(data.customClassSkills) ? data.customClassSkills.filter(skill => allSkills.includes(skill) && !NON_CLASS_ELIGIBLE.includes(skill)) : undefined;
 return next;
}
