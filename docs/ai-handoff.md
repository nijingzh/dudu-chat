duduchat ｜ AI 交接上下文 v4（2026-10-01，两项裁决落码）
v4 更新（2026-10-01，P1A 疑问裁决收口；触发 = 江衍「1.按你推荐走 2.可以」）：
【裁决登记】①通用按钮触觉档 = Selection 轻（新 kind 'tap'「按钮轻触」），发送键单独 'send' Impact Light；②慢递信近似口径通过（v2 登记方案转正，P2B 按此实现）。
【改动】useHaptics.ts 加 'tap'（按钮轻触 / Selection / 轻 / vibrate 4ms）；GlassButton 加 haptic?: HapticKind prop（默认 'tap'，发送键显式 haptic="send"）；UiKit 发送键传 send、按钮说明改写、触觉表补第 9 行「按钮轻触」（标注裁决补充）。
【验收】npm run build ✓；eval 实测：点 GlassButton → 胶囊「🩷 按钮轻触 · Selection 轻」、点「发送 💗」→「🩷 发送消息 · Impact Light」✓。

───────────────────────────────────────────────────
v3 更新（2026-10-01，P1A 交付：脚手架 + 设计系统 + /ui 演示页；触发 = 落地方案 v2 通过「开工」）：
【交付物】工程初始化（Vite 6 + React 18 + TS 5.6 + Tailwind v4 + framer-motion 11 + zustand 5 + Capacitor 6 core/haptics/cli）；src/styles/index.css 设计 tokens（3.1 色值 / 3.3 玻璃参数全量入 CSS 变量与类）；glass/ 四件（GlassCard/GlassButton/GlassNav/GlassInput）；effects/FloatingParticles（16 颗双层动画粒子）；hooks/useHaptics（3.4 八场景映射：原生 @capacitor/haptics + 浏览器 vibrate 降级 + debug 事件）；common/HapticDebugToast（玻璃胶囊 debug 提示）；pages/UiKit 演示页。git init + 首提交（main；.gitignore 忽略 node_modules/dist/ios）。
【规格断言 computedStyle 实测全命中】glass-card rgba(255,255,255,0.22) / blur(28px) saturate(1.8) / 24px / 1px rgba(255,255,255,0.35) / 阴影 rgba(255,182,193,0.25) 0 8px 32px；GlassButton 20px；GlassNav blur(32px) / 28px；bubble-self linear-gradient(135deg,#FF8FAB,#FF6B8A)；bubble-other rgba(255,255,255,0.55)；bg 主渐变 135deg #FFB6C1→#E8A0BF。
【主观微调（实数，待复审）】气泡圆角 20px + 尾角 6px（self 20px 20px 6px 20px / other 20px 20px 20px 6px）；对方「彩色描边」具体化 = inset 0 0 0 1px rgba(200,162,255,0.55) 薰衣草紫描边 + 阴影 0 6px 20px rgba(255,182,193,0.22)；self 阴影 0 6px 20px rgba(255,107,138,0.35)；GlassInput bg rgba(255,255,255,0.28) / 边框 rgba(255,255,255,0.45) / 圆角 20px / 聚焦环 3px rgba(200,162,255,0.25)；粒子 16 颗 / 12–28px / 上浮 18–40s / 摇摆 3.2–6.4s / 峰值 opacity 0.75；debug 胶囊 13px / 顶部 12px / 圆角 999px / 白 0.6 玻璃 / 淡入 320ms 停 1400ms；/ui 页 max-width 30rem 居中；GlassButton hover 白 0.3。
【偏离登记】字体引入 Google Fonts → @fontsource 自托管（Quicksand / Comfortaa / Noto Sans SC 随包构建；理由：国内拉 Google Fonts 不稳、真机包内更稳；设计方案只定字体不定来源）。
【坑·npm 双装写坏 node_modules】terminal 前台 420s 超时**杀不掉 npm install**（进程残留继续跑），与第二次安装并发写同一 node_modules → rollup 解析到写半截的 framer-motion dist（报错位置每次不同、文件本体完好）；解法 = tasklist 查 npm-cli 残留 → Stop-Process 杀掉 → rm -rf node_modules package-lock.json 重装。安装走 registry.npmmirror.com（默认源 420s 装不完）。凡「前台超时过的安装」必须先确认无残留进程再装第二遍。
【验收】npm run build（tsc --noEmit + vite）✓ 134 modules；dev 5180 ✓；393×852 三屏 + toast 截图 vision 巡检无错位/溢出/遮挡、触觉表 8 行完整；触觉链路实测 eval 点击「发送消息」→ 胶囊浮现「🩷 发送消息 · Impact Light」✓。
【疑问随批】①通用按钮触觉归档：现所有 GlassButton 按下 = send「Impact Light」，建议通用按钮改 Selection 轻、发送键单独 send，待裁决；②慢递信近似口径（v2）仍待复审。

───────────────────────────────────────────────────
v2 更新（2026-10-01，落地方案裁决通过；触发 = 江衍回复「1.B 免费账号 7 天重签，AltStore 连数据线签名 / 2.另开美国服务器 / 3.认 / 4.要」）：
【裁决登记】①分发路线 = B：免费 Apple ID + AltStore 数据线签名，7 天重签（TestFlight 流程作废，设计方案第八节被本条覆盖）；②后端另开美国 VPS（2C2G 起步，Node+Mongo+Redis ≈1GB）；③邀请码口径 = 两码两账号、输对即登录、Phase 2 挂 JWT（通过）；④/ui 演示页要做（通过）。
【B 路线硬事实（2026-10 查证）】免费账号：描述文件 7 天过期、同时最多 3 个侧载 App（duduchat 占 1 槽，同 App 装两台手机不多占）、7 天滚动 ~10 个 App ID、iOS 16+ 要开开发者模式、首装设备注册 Apple 侧可能 1–3 天；Windows 用 AltServer 需 Apple 官网版 iTunes+iCloud（微软商店版不认）+ 防火墙放行；刷新 = 同 Wi-Fi 自动 / 数据线手动（主路径）；超期 App 打不开但数据不丢（同 bundle ID 覆盖重签），插线即恢复；Plan B = SideStore（配对一次手机端自刷）。打包链路简化：GitHub Actions 导出**无签名 .ipa**（无需证书 Secrets）→ AltStore 重签安装。
【无 APNs 的 Phase 2 调整（定稿，慢递信近似口径待复审）】APNs 整项砍（免费账号没有）；前台实时照旧；回前台重连+拉离线消息；想你了/纪念日/每日情话 = **本地通知**（无需付费账号、可离线预排）；慢递信近似 = 到达时对方在线则其设备排本地通知到点响、不在线则下次开 App 收信即弹（待复审）；桌面角标做不了 → App 内未读数；已读/正在输入/在线状态照常。工程补三件：断线重连+离线补偿、推送抽象层预留接口（将来付费插回 APNs 不动架构）、消息服务端兜底排序。其余功能（消息/语音/图片/反应/撤回/特效/触觉/甜蜜时光/小惊喜）与签名方式零关系全部正常。
【美国服务器已知代价】国内→美国 RTT ~150–250ms 可感但可用；跨境偶发不稳对策 = WSS + 重连扎实 + 服务端排序；延迟明显再议中转，不预加复杂度。接口全 HTTPS（Let's Encrypt，Capacitor ATS 只认 HTTPS）。
【状态】代码零起步，P1A 待动工；落地方案已推 v2（docs/落地方案.md）。

───────────────────────────────────────────────────
v1 更新（2026-10-01，项目启动；工作内容 = 读设计方案 + 出落地方案）：
【现状】D:/IT/project/dudu-chat 原本只有 docs/设计方案.md v1.0（规格唯一来源，只读）。本轮产出 docs/落地方案.md + 本交接文档 + docs/Phase.txt。
【落地方案要点】批次化执行设计方案 Week 1–3：P1A 脚手架+设计系统（Glass 四件 / FloatingParticles / useHaptics / UI kit 演示页）→ P1B 登录+聊天主页 → P1C 其余五页 → P1D 交互细节；Phase 2 P2A/P2B；Phase 3 增值。每批交付停手等复审，五项格式（改动文件清单/截图/主观微调说明标实数/未动清单/疑问）。
【执行细节已定】Tailwind v4 CSS-first @theme（设计方案 tailwind.config.js 是 v3 写法，token 值照抄 3.1–3.3）；字体 Google Fonts；mock 数据 zustand + localStorage，Phase 2 只换数据层 UI 不动；触觉浏览器验不了 → useHaptics 加 debug 视觉提示，真机实测。
【验收基线】iPhone 视口 393×852 截图 + computedStyle 实测对 3.1–3.3；动效先小样过目再量产。

───────────────────────────────────────────────────
项目约定（长期有效）
───────────────────────────────────────────────────
· docs/设计方案.md = 规格唯一来源，只读；裁决变更登记本文件，不改原稿。
· 每次工作完成：本文件推版本号 + docs/Phase.txt 更新进度。
· 交付固定五项：改动文件清单 / 截图 / 主观微调说明（微调值标实数）/ 未动清单 / 疑问。
· 微调方案批准前列为建议不落文档；被否回滚 = 恢复上一版，保留此前独立通过项。
· 项目结构按设计方案第六节：src/components/{glass,chat,effects,common} + src/pages + hooks/useHaptics + store/chatStore + utils/constants。
