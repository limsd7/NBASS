// EXPERT_CONTENTS index — content unchanged, split per CareType.
import type { CareContent } from './expertTypes';
import { PART_HEALTHY } from './contents/healthy'; 
import { PART_SLEEP } from './contents/sleep'; 
import { PART_BURNOUT } from './contents/burnout'; 
import { PART_CIRCULATION } from './contents/circulation'; 
import { PART_CONCENTRATION } from './contents/concentration'; 
import { PART_ADRENAL } from './contents/adrenal'; 
import { PART_ANXIETY_TENSION } from './contents/anxiety_tension'; 
import { PART_STRESS_OVERLOAD } from './contents/stress_overload'; 
import { PART_LOW_ENERGY } from './contents/low_energy'; 
import { PART_DEPRESSION_AMOTIVATION } from './contents/depression_amotivation'; 
import { PART_BRAIN_FATIGUE } from './contents/brain_fatigue'; 
import { PART_HYPERSENSITIVE } from './contents/hypersensitive'; 
import { PART_ATTENTION_DEFICIT } from './contents/attention_deficit'; 

export const EXPERT_CONTENTS: Record<string, CareContent> = {
    ...PART_HEALTHY, ...PART_SLEEP, ...PART_BURNOUT, ...PART_CIRCULATION, ...PART_CONCENTRATION, ...PART_ADRENAL, ...PART_ANXIETY_TENSION, ...PART_STRESS_OVERLOAD, ...PART_LOW_ENERGY, ...PART_DEPRESSION_AMOTIVATION, ...PART_BRAIN_FATIGUE, ...PART_HYPERSENSITIVE, ...PART_ATTENTION_DEFICIT,
};