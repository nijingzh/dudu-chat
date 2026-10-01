import { useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import GlassCard from '../components/glass/GlassCard';

interface Props {
  onBack: () => void;
}

const GROUPS = [
  {
    title: '触觉反馈',
    group: 'haptics' as const,
    items: [
      { key: 'send', label: '发送/交互触感' },
      { key: 'receive', label: '收到消息震动' },
      { key: 'effect', label: '特效震动' },
    ],
  },
  {
    title: '通知',
    group: 'notify' as const,
    items: [
      { key: 'message', label: '新消息提醒（P2B 本地通知）' },
      { key: 'missYou', label: '想你了提醒' },
      { key: 'anniversary', label: '纪念日提醒' },
    ],
  },
  {
    title: '外观',
    group: 'appearance' as const,
    items: [
      { key: 'particles', label: '背景飘浮粒子' },
      { key: 'bubbles', label: '气泡柔光' },
      { key: 'heartbeat', label: '天数心跳动画' },
    ],
  },
  {
    title: '隐私',
    group: 'privacy' as const,
    items: [{ key: 'messageLock', label: '消息锁（占位，P2B 实装）' }],
  },
];

/** 设置页（设计方案 5.6）：触觉 / 通知 / 外观 / 隐私 */
export default function Settings({ onBack }: Props) {
  const store = useSettingsStore();
  const [lockTip, setLockTip] = useState(false);

  return (
    <main className="page-scroll">
      <button type="button" className="sub-back" onClick={onBack}>
        ‹ 返回
      </button>
      <h1 className="sub-title">设置</h1>

      {GROUPS.map((g) => (
        <section key={g.title} className="sec">
          <h2 className="sec-title">{g.title}</h2>
          <GlassCard className="switch-card">
            {g.items.map((item) => (
              <div key={item.key} className="switch-row">
                <span className="switch-label">{item.label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={store[g.group][item.key as keyof (typeof store)[typeof g.group]]}
                  className={`switch ${store[g.group][item.key as keyof (typeof store)[typeof g.group]] ? 'switch--on' : ''}`}
                  onClick={() => {
                    if (g.group === 'privacy' && !store.privacy.messageLock && !lockTip) {
                      setLockTip(true);
                      window.setTimeout(() => setLockTip(false), 1800);
                    }
                    store.toggle(g.group, item.key);
                  }}
                >
                  <span className="switch-knob" />
                </button>
              </div>
            ))}
          </GlassCard>
        </section>
      ))}
      {lockTip && <div className="app-toast settings-toast">消息锁只是占位开关，P2B 才有真锁</div>}
    </main>
  );
}
