import kenneth from '../../../预设角色卡_肯尼斯·菲尔.json';
import roger from '../../../预设角色卡_罗杰·菲尔.json';
import norman from '../../../预设角色卡_诺曼·莱特.json';
import jane from '../../../预设角色卡_简·乔伊斯-克利夫兰.json';
import knox from '../../../预设角色卡_诺克斯·梅克皮斯.json';
import { normalizeCharacter } from './character';
import type { Character } from './character';

export interface CharacterSave {
  version: number;
  settings: { variantIdx: number; playerCount: number; customInvPoints: number | null; customGenPoints: number | null };
  data: Character;
  isCompleted: boolean;
  frozenStats: { invUsed: number; genUsed: number };
}
export interface PresetCharacter { id: string; summary: string; save: CharacterSave }

// The five root JSON files are the source of truth; no separate runtime copies.
export const PRESET_CHARACTERS: PresetCharacter[] = [
  { id: 'kenneth', summary: '贫穷而自豪的艺术家，因担心父亲失踪而来到他的家。', save: kenneth },
  { id: 'roger', summary: '务实负责的医生，面对父亲的失踪与难以回避的家庭责任。', save: roger },
  { id: 'norman', summary: '热爱解谜的芝加哥警探，为寻找失踪的老朋友展开调查。', save: norman },
  { id: 'jane', summary: '出身富有家族，秘密资助古董调查，试图找回失联的专家。', save: jane },
  { id: 'knox', summary: '精明的古物学者，为老友的安危担忧，也有不愿公开的生意。', save: knox },
];

export function createPresetSave(preset: PresetCharacter): CharacterSave {
  const save = structuredClone(preset.save);
  save.data = normalizeCharacter(save.data);
  return save;
}
