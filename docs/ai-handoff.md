duduchat ｜ AI 交接上下文 v11（2026-10-01，安全批：限速 + 邀请码出库 + 历史清洗）
v11 更新（2026-10-01，两小批合并登记；触发 = 江衍问「自用有安全风险吗」「邀请码会跟着 push 上 github 吗」）：
【勘误】v10 后的限速批交付曾误报「docs v11 + git 提交」，实际只做了代码/部署——本批补交并入账。
【限速批】server/src/limiter.js（零依赖内存限速）：login 5 次/分/IP、全 API 240 次/分/IP；index.js 关 x-powered-by 指纹。实测：爆破 8 连发 401×3→429×5；真登录不受影响。背景实数：该 VPS 24h SSH 被爆破 14673 次（journald），3000 端口同为公开面必被扫，限速后爆破不可行。
【邀请码出库】真码从代码彻底移除（改前 constants.ts + config.js 两处明文）：服务端 config.js INVITE_CODES 纯 env 读取、无默认、未配则全员拒登（fail-closed，启动告警）；VPS systemd 单元 Environment=INVITE_CODES=… 是唯一栖身地；前端 constants.ts 改 mockLookupInvite（P2B 前 mock 登录任意非空码通过、身份 mock 档，真校验 P2B 归 POST /api/login）；e2e 测试改自造码 test-invite-a/b 不引用真码。全仓扫描 0 处。
【裁决】git 历史里的残留用 git filter-repo --replace-text 清洗（本批执行，本地无远端随便重写）；三选一中选 filter-repo。
【安全口径】明文 HTTP 自用可接受（记：公共 WiFi 下可窃听，若要 https 需碰 nginx/443 必先请示）；上传文件 UUID 不可枚举；比本服务更大的暴露面是 4444 x-ui 面板（用户自管，已提醒改强密码/端口）。
【备份裁决】不做异地备份（江衍「不用备份」）；本地 data/backups 每日自动拷保留零成本挂着，不再投入。
───── 以下 v10 存档 ─────
v10 更新（2026-10-01，P2A 部署到 VPS；触发 = 江衍提供 VPS 并要求「vpn 服务不要动」）：
【VPS】RackNerd 美国，root@us.nijingzh.top（SSH 已改密钥登录：本机 ~/.ssh/duduchat_vps，密码仅首次装公钥用过一次）；Ubuntu 24.04 / 1.4G 内存 / 21G 空闲 / IP 107.174.102.51 / DNS us.nijingzh.top。
【硬约束·VPN 禁区】机上跑着 VPN 栈：x-ui(4444) + xray(53189) + hysteria-server(8888/udp) + nginx(80) + iptables xui 链 —— 全部不碰；不装 nginx 反代、不动 iptables/ufw（ufw inactive、INPUT ACCEPT 实测端口直通）。
【部署实况】/opt/duduchat-server（代码 scp 上去，npm install --omit=dev）；systemd 单元 duduchat.service（端口 3000、Restart=always、开机自启 enabled）；JWT_SECRET 服务器上 openssl rand 生成存于单元文件；DATA_DIR=/opt/duduchat-server/data（PGlite 零新服务；DATABASE_URL 一设即切 PostgreSQL）；TOGETHER_DATE=2026-08-19。
【实测】公网 http://us.nijingzh.top:3000/health ✓；两枚邀请码真登录建号（衍/她）✓；bootstrap 配对 ✓ togetherDate ✓ 消息/信空 ✓；备份 devdb-2026-10-01 产出 ✓；部署后 hysteria/nginx/x-ui 依旧 active ✓。
【注意】正式库已建账号——P2B 联调别拿真库打 mock 消息（e2e 测试自带临时 DATA_DIR，别对着 3000 端口跑 e2e.test.js）。备份目前同盘（data/backups 每日拷），异地备份待办。
【下一步】P2B 前端接服务端（API_BASE=http://us.nijingzh.top:3000）：登录换 JWT、消息走 REST+Socket、在线/正在输入/已读、上传换 URL、断线重连/离线补偿、慢递信本地通知。
───── 以下 v9 存档 ─────
v9 更新（2026-10-01，P1D 附批 + P2A 服务端核心；触发 = 江衍「1.做 2.要 3.不用了 继续下一步」）：
【裁决】①聊天图片消息要做（复用照片墙压缩）；②滑动切 tab 手势要；③特效不用录屏、保持现状。
【P1D 附批】utils/image.ts compressImage 抽公共（照片墙/图片消息共用）；🖼️ 真选图 → canvas 压 900px/JPEG0.72 → 图片气泡（meta.src 渲染真图，无 src 回退渐变占位）→ 详情页同源；滑动切 tab：pointer 手势，横向 60px 且 |dx|>2|dy| 触发，输入框内不响应，边缘 tab 不越界，fire('swipe')。
【P2A 服务端核心】server/（Node+Express+Socket.io，端口 3000）：邀请码即账号（两码两号、无密码、JWT 30d）、自动配对（两用户互绑单一 pair）、消息模型（text/image/voice + meta JSON + sent/read/recalled）、慢递信队列（到点投递 online 推 letter:due / 离线 bootstrap 兜底、重启恢复排程）、上传（multer 10MB → /uploads）、每日备份（PGlite 目录拷 backups/；生产 pg_dump 走 VPS cron）。数据层：DATABASE_URL 空 → PGlite（WASM 真 Postgres 免编译）；有值 → pg.Pool 连真 PostgreSQL；同一套 SQL。REST /api/*（login/bootstrap/messages/read/recalled/letters/upload）+ Socket.io（presence/typing/推送）。
【P2A 实测】server/test/e2e.test.js 16/16 通过：登录×2+错码 401 / 配对 bootstrap / 在一起日期 / presence / A发B实时收 / typing / 已读回执 / 撤回落库 / 图片 meta 落库 / 慢递信 1.5s 到点投递 / 上传 URL / 离线信 bootstrap 兜底 / 备份产出。
【环境坑】Node 26 无 sqlite3 预编译 → node-gyp 编译卡死且本机无 MSVC（vswhere 空）→ 已杀进程换 PGlite 方案（纯 WASM）；PGlite 0.2.x 没有 open()，就绪用 await lite.ready。npm install 超时 420s 顶后进程不死（node-gyp 子进程）——并行再装必炸 node_modules，先 Stop-Process 再清。
【疑问/待办】前端接服务端是 P2B（在线状态/上传换 URL/断线重连/本地通知）；生产 JWT_SECRET/邀请码 env 到 VPS 部署时定；VPS 未买（已开清单给江衍）。
───── 以下 v8 存档 ─────
v8 更新（2026-10-01，照片墙附批 + P1D 交付；触发 = 江衍「照片墙可以做导入、删除的功能 其他都过 继续」）：
【裁决】①P1C 复审通过（含全部主观微调值）；②照片墙做导入/删除功能（不走等真实照片路线）；③P1C 两问按「其他都过」收口：转盘 8 点子保持通用清单、语音「按住说话」手势归 P1D。
【交付物】照片墙附批：sweetStore photos（localStorage duduchat-photos）+ 导入（file input 多选≤6 张、canvas 压到长边≤900px JPEG 0.72）+ 删除（右上 ✕）。P1D：pages/SweetMoments 照片墙功能版；components/effects/SweetEffects（全屏特效层：spoil 撒娇=白描边粉辉光环×2+9 飘心上浮 1500ms / missYou 想你=15 飘落爱心🌸✨ / celebrate 庆祝=3 烟花 13 粒径向 950ms+18 confetti / sad 不开心=灰纱 rgba(126,126,142,0.32)+16 雨滴）+ store/effectStore；MessageBubble 长按 350ms→反应条（💕😂😮😢👍🔥+撤回归长按菜单，裁决 v6④ 兑现：点击出撤回已撤）+ 反应浮出 900ms + 入场 spring(stiffness 320/damping 26) + 反应→特效映射（💕spoil/😂celebrate/😢sad）；ChatInputBar 按住说话（上滑 60px 取消、时长按秒入气泡）+ ✨特效菜单（撒娇/想你/庆祝→发消息+特效）；App 转场按 tab 方向滑入（x 26/18px、320ms）。
【自修】①「正在输入」指示器卡死：切 tab 卸载 Chat 清掉 mock 回复定时器但 otherTyping 残留 → 卸载时一并复位；②撒娇光环 2px 半透明粉在粉底上隐形 → 白描边 3px+辉光（vision 两轮实证后修）。
【Phase 1 完成度】P1A~P1D 全部交付；Phase 2（后端）未动。
【疑问】①聊天里发图片（🖼️）仍是 P1D 占位（P2B 接上传），要不要顺手让聊天也发本地图片（复用照片墙压缩）？②滑动切 tab 手势要不要（现为点 tab+方向滑入）？③特效动态小样可录屏给——静态截图只拍到单帧。
───── 以下 v7 存档 ─────
v7 更新（2026-10-01，P1C 交付：五页一批；触发 = 江衍「继续 放行」）：
【P1B 复审通过】含真值裁决批（v6）一并放行。
【交付物】五页 + 底部导航 + 消息类型扩展：pages/SweetMoments（天数大数字+心跳 / 纪念日倒计时 / 心情打卡 / 爱情日记 / 照片墙占位）、pages/Surprises（今日情话 / 约会转盘 / 写封蜜语 / 慢递信 / 一起听歌）、pages/Me（资料卡+四入口+JSON 数据导出真可用）、pages/Profile（主题色 4 款 / 聊天背景 4 款，均改 CSS 变量真实生效）、pages/Settings（触觉 3 档 / 通知 3 项 / 外观 3 项 / 消息锁占位，10 开关全部真实生效或标注占位）、pages/AnniversaryPage（增删改+倒计时）、pages/MessageDetail（图片缩放 / 语音波形进度 / 上下文预览）；components/common/BottomNav（四 tab，3.3 GlassNav）；store/settingsStore（localStorage 持久化+applySettingsToCSS）/ sweetStore（心情/日记/纪念日/便签/慢递信）/ uiStore（tab/sub 导航）；chatStore 消息扩 kind: text|image|voice + detailMessage；mock 种子消息补图片/语音各一。设置真实生效链路：触觉开关→useHaptics 分档拦截；粒子开关→FloatingParticles 显隐；心跳开关→天数动画；主题色→--color-bubble-self-from/to（气泡/发送钮/大数字联动）；聊天背景→--bg-gradient-from/to；气泡柔光→--bubble-shadow。
【实测全过】四 tab 切换；心情打卡持久化（2026-10-01「想你」）；天数 44 / 倒计时 13 天（10-14 我的生日）；纪念日增「第一次约会 12-25」成 4 条；主题切薰衣草后 --color-bubble-self-from=#C8A2FF computed 实证；粒子开关双向显隐 + localStorage 持久化；图片详情缩放 130% + 上下文预览；语音详情播放波形推进 13 格 / 3″-7″。
【自检修复四则】①haptic debug 胶囊溢出屏右缘遮内容（vision 三页都拍到）→ 根因：motion.div 动画 transform 覆盖 CSS translateX(-50%)、元素从屏幕中线贴边；修 = 居中位移挪 framer style x:'-50%' + max-width/ellipsis 防长文溢出，实测盒居中（中线 196.5=196.5）；②转盘无扇区感/指针弱：原 8 个全圆 seg 互相覆盖成整圆 → 盘面改 conic-gradient 8 段交替 rgba(255,255,255,0.34)/rgba(255,143,171,0.34)（45°/格）、指针 26px+白描边；③day-label「第 N 天」N 未替换 → 改「我们在一起的日子 · 起点 2026-08-19」；④心情选中态白框生硬 → 白 0.45→0.32 + 柔光 0 6px 16px rgba(255,182,193,0.28) + 位移 -3→-2px。
【主观微调（实数，待复审）】天数 84px 心跳 scale 1.045/1.025 双拍 1.6s；倒计时数字 40px；转盘 224px 盘面/中心钮 62px/1.6s cubic(0.16,0.9,0.24,1)；照片墙双列瀑布流 6 格占位（高 140-200px）；底部导航 4 tab 圆角 28px 条、激活上浮 2px；开关 46×27px 滑块 21px/220ms；详情蒙层 rgba(60,38,55,0.55)+blur 24px；图片占位 168×126px（气泡）/264×200px（详情）；语音波形 14 格（气泡）/36 格（详情）；聊天输入栏 padding-bottom 72px 避让导航。
【占位说明】照片墙=渐变+emoji 占位（不用 AI 图，等真实照片）；歌单 4 首占位；语音/图片消息 mock；消息锁开关占位；头像/昵称编辑 P2B。
【坑·framer 覆盖 CSS transform】motion.div 的动画帧会把 CSS transform 整体覆盖（translateX(-50%) 失效、元素贴边）——motion 组件的常驻位移一律放 style={{x:...}}，别写 CSS transform；定位断言用 getBoundingClientRect 实测勿目测（vision 误读了三轮）。
【验收】build ✓；393×852 全页截图 vision 巡检 + 数值断言（盒居中/缩放 130%/波形 13 格/settings 持久化）。
【疑问随批】①照片墙用渐变占位等真实照片，还是先放你们的实拍照（发我就缝进去）；②约会转盘 8 个点子文案要不要换成你们自己的清单；③语音条按住说话的手势（4.2）归 P1D 一起做，本批语音气泡是 mock 消息——确认没歧义。

───────────────────────────────────────────────────
v6 更新（2026-10-01，P1B 疑问裁决落码；触发 = 江衍提供真值三则 + 会话确认）：
【裁决登记】①邀请码真值：男方 [REDACTED]（衍）/ 女方 [REDACTED]（她）；②在一起的日子 = 2026-08-19（真值），天数改动态计算 togetherDays()，口径 = 含首日（8/19 = 第 1 天，今日 2026-10-01 显示 44 天，实数待复审）；③登录底部文案「只属于我们两个人的小世界 💌」维持不改；④「点自己气泡出撤回」临时入口待 P1D 长按手势上线时**撤掉**（撤回收进长按菜单）；⑤会话口径确认：邀请码只在设备首次登录填一次，localStorage 记会话启动免登录，「退出」清会话后重新要码（P2B 换 JWT 同逻辑）。昵称未给真值，维持「衍 / 她」占位。
【改动】constants.ts：INVITE_CODES 换真值两枚、TOGETHER_DAYS 520 删除 → togetherDays() 动态（new Date(2026,7,19) 起算含首日）；Chat.tsx 导航天数改 togetherDays()。
【验收】build ✓；浏览器实测两枚新码均进入聊天页、导航显示「在一起 44 天」（2026-10-01）✓。

───────────────────────────────────────────────────
v5 更新（2026-10-01，P1A 复审通过 + P1B 交付待复审；触发 = 江衍「都放行。下一步」）：
【P1A 复审通过】视觉与微调数值全部放行（2026-10-01）。
【交付物】utils/constants.ts（邀请码 dudu520/mimi520 两码两账号、mock 资料、TOGETHER_DAYS 520、自动回复 5 条、快捷表情 8 枚、登录文案）；store/chatStore.ts（zustand mock：view/消息/撤回/已读/正在输入/登录会话 localStorage）；pages/Login.tsx（情侣头像交叠 + 渐变大标题 + 邀请码玻璃卡 + 错误 shake + 底部文案）；pages/Chat.tsx（GlassNav 昵称/在线/天数/退出 + 气泡区 + mock 轨道：发消息→1.2s 正在输入→2.8s 自动回复）；chat/ 三件（MessageBubble 点自己消息→撤回、TypingIndicator 三点呼吸、ChatInputBar 表情/文本/语音/图片/发送）；common/Avatar.tsx；App.tsx 登录↔聊天 AnimatePresence 淡入浮出 300ms + #ui 保留演示页 + 会话记忆。
【交互链路实测全过】错误码 →「邀请码不对哦，再看看？」常驻 + shake；dudu520 → 聊天页（导航「🐰她 在线 · 在一起 520 天」）；发消息 → 300ms 已读 → 1.2s 正在输入三点 → 2.8s 自动回复；点自己气泡 →「撤回」→「你撤回了一条消息」；表情面板 8 枚、点 💗 入输入框。
【主观微调（实数，待复审）】头像 72px 交叠 translateX ±13px rotate ±6°、右前左后 z 分层；登录标题 40px 渐变字 #FF6B8A→#C8A2FF；错误 shake translateX ±6/5/-3px 420ms；气泡 max-width 76% / padding 9px 14px / 字号 14px；时间戳 10px、已读薰衣草紫；撤回占位 11px op 0.55；输入栏圆角 24px、图标钮 36px、发送圆钮 38px 渐变粉影 0 6px 18px rgba(255,107,138,0.4)；表情面板 8 枚 22px；正在输入 6px 点 180ms stagger 呼吸 1.2s；页面过渡 opacity + y 12px 300ms cubic(0.22,0.8,0.3,1)；mock 轨道 1.2s / 2.8s。
【占位说明】语音/图片按钮 = 占位 toast（P2B 接上传）；头像 emoji 占位（我的页上传）；昵称「她」、邀请码、天数 520 均占位待真值。
【自检修复三则】①错误提示原 600ms 随 shake 消失看不清 → 错误文案常驻到输入变化、shake 用 key 重放；②mock 种子时间戳 21:03 硬编码与当前时间倒流 → minutesAgo() 动态生成（30/28/27 分钟前，实测 16:18→16:20→16:21 递增）；③登录头像交叠白色菱形生硬 → translateX 10→13px + z-index 分层（vision 复验无瑕疵）。
【验收】build ✓；393×852 截图 vision 巡检登录/聊天页无错位/遮挡/溢出。
【疑问随批】①邀请码/昵称/天数真实值（现全占位）；②登录底部文案「只属于我们两个人的小世界 💌」措辞认不认；③点气泡出撤回是 P1D 长按手势之前的临时入口，长按上线后是否保留点击入口。

───────────────────────────────────────────────────
v4 更新（2026-10-01，两项裁决落码；触发 = 江衍「1.按你推荐走 2.可以」）：
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
