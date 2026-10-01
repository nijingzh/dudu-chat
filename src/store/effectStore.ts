/**
 * store/effectStore — 全屏甜蜜特效（4.2 表情回应 / 消息特效）。
 * play(kind) 播一场，SweetEffects 层渲染，自动收场。
 */
import { create } from 'zustand';

export type EffectKind = 'spoil' | 'missYou' | 'celebrate' | 'sad';

interface EffectState {
  current: EffectKind | null;
  seq: number;
  play: (kind: EffectKind) => void;
  clear: () => void;
}

export const useEffectStore = create<EffectState>((set, get) => ({
  current: null,
  seq: 0,
  play: (kind) => set({ current: kind, seq: get().seq + 1 }),
  clear: () => set({ current: null }),
}));

/** 各特效时长 ms（收场定时） */
export const EFFECT_DURATION: Record<EffectKind, number> = {
  spoil: 1800,
  missYou: 2600,
  celebrate: 2400,
  sad: 2400,
};
