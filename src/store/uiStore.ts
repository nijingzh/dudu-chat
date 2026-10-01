/**
 * store/uiStore — 页面导航（P1C）。
 * tab = 底部玻璃导航四页；sub = 「我的」下的子页（全屏，带返回）。
 */
import { create } from 'zustand';

export type Tab = 'chat' | 'sweet' | 'surprises' | 'me';
export type Sub = null | 'profile' | 'settings' | 'anniversary';

interface UiState {
  tab: Tab;
  sub: Sub;
  setTab: (t: Tab) => void;
  openSub: (s: Sub) => void;
  closeSub: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  tab: 'chat',
  sub: null,
  setTab: (t) => {
    if (get().tab !== t || get().sub) {
      set({ tab: t, sub: null });
    }
  },
  openSub: (s) => set({ sub: s }),
  closeSub: () => set({ sub: null }),
}));
