/**
 * useHaptics — 3.4 触觉反馈映射（设计方案实数）
 * iOS 真机走 @capacitor/haptics；浏览器降级 navigator.vibrate + debug 视觉提示。
 * 浏览器里震不起来是正常的，debug 提示 = 视觉替身，真机阶段实测。
 */
import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export type HapticKind =
  | 'send' // 发送消息   Impact Light
  | 'receive' // 收到消息   Impact Medium
  | 'love' // 点赞/心形  Notification Success
  | 'longPress' // 长按消息   Selection
  | 'swipe' // 滑动切换   Selection 轻微
  | 'special' // 特殊表情   Impact Heavy
  | 'sweet' // 甜蜜时刻   Notification Success × 2
  | 'page' // 页面切换   Selection 轻
  | 'tap'; // 按钮轻触   Selection 轻（裁决补充：通用按钮档，发送键走 send）

interface HapticSpec {
  label: string;
  type: string;
  intensity: string;
  /** 浏览器降级：navigator.vibrate 的毫秒模式 */
  vibrate: number | number[];
  run: () => Promise<void>;
}

export const HAPTIC_SPECS: Record<HapticKind, HapticSpec> = {
  send: {
    label: '发送消息',
    type: 'Impact',
    intensity: 'Light',
    vibrate: 8,
    run: () => Haptics.impact({ style: ImpactStyle.Light }),
  },
  receive: {
    label: '收到消息',
    type: 'Impact',
    intensity: 'Medium',
    vibrate: 16,
    run: () => Haptics.impact({ style: ImpactStyle.Medium }),
  },
  love: {
    label: '点赞/心形',
    type: 'Notification',
    intensity: 'Success',
    vibrate: [14],
    run: () => Haptics.notification({ type: NotificationType.Success }),
  },
  longPress: {
    label: '长按消息',
    type: 'Selection',
    intensity: '—',
    vibrate: 6,
    run: () => Haptics.selectionChanged(),
  },
  swipe: {
    label: '滑动切换',
    type: 'Selection',
    intensity: '轻微',
    vibrate: 4,
    run: () => Haptics.selectionChanged(),
  },
  special: {
    label: '特殊表情',
    type: 'Impact',
    intensity: 'Heavy',
    vibrate: 28,
    run: () => Haptics.impact({ style: ImpactStyle.Heavy }),
  },
  sweet: {
    label: '甜蜜时刻',
    type: 'Notification',
    intensity: 'Success × 2',
    vibrate: [14, 64, 14],
    run: async () => {
      await Haptics.notification({ type: NotificationType.Success });
      await new Promise((r) => setTimeout(r, 120));
      await Haptics.notification({ type: NotificationType.Success });
    },
  },
  page: {
    label: '页面切换',
    type: 'Selection',
    intensity: '轻',
    vibrate: 4,
    run: () => Haptics.selectionChanged(),
  },
  tap: {
    label: '按钮轻触',
    type: 'Selection',
    intensity: '轻',
    vibrate: 4,
    run: () => Haptics.selectionChanged(),
  },
};

export const HAPTIC_DEBUG_EVENT = 'duduchat:haptic-debug';

function notifyDebug(kind: HapticKind) {
  const spec = HAPTIC_SPECS[kind];
  window.dispatchEvent(
    new CustomEvent(HAPTIC_DEBUG_EVENT, {
      detail: { label: spec.label, type: spec.type, intensity: spec.intensity },
    }),
  );
}

export function useHaptics() {
  const fire = useCallback(async (kind: HapticKind) => {
    const spec = HAPTIC_SPECS[kind];
    notifyDebug(kind);
    if (Capacitor.isNativePlatform()) {
      try {
        await spec.run();
        return;
      } catch {
        // 原生失败落回浏览器路径
      }
    }
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(spec.vibrate);
      } catch {
        // 桌面浏览器不支持则静默
      }
    }
  }, []);

  return { fire };
}
