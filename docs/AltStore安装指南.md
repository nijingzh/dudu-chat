# duduchat 装机指南（AltStore 免费签名）

写给第一次装的时候照着走，装过一次就不用再看了。

## 一、这台 Windows 要装的东西

1. iTunes —— 必须去 Apple 官网下（https://www.apple.com/itunes/ ），微软商店版不行，AltServer 认不到。
2. iCloud —— 同样要 Apple 官网版（https://support.apple.com/en-us/117118 里面有下载）。
3. AltServer —— https://altstore.io/ 下载安装。

装完 iTunes 和 iCloud 各登录一次你的 Apple ID，AltServer 在右下角托盘里待命就行。

## 二、iPhone 上要做的事

iOS 16 以上要开开发者模式：设置 → 隐私与安全性 → 开发者模式 → 打开 → 重启。
（第一次装完 App 会提示「未受信任的开发者」，去 设置 → 通用 → VPN与设备管理 里信任你的 Apple ID 那条。）

## 三、出包（要我做或者你自己点都行）

1. GitHub 仓库页面 → Actions → Build unsigned iOS IPA → Run workflow。
2. 跑完（大约 5–8 分钟）→ 点进这次运行 → 底部 Artifacts → 下载 duduchat-ipa → 解压出 duduchat.ipa。
3. 这个 ipa 是无签名的，直接装会失败，必须走 AltStore 重签——这是故意的，仓库里不用存任何证书。

## 四、签名装机

1. iPhone 用数据线连电脑，解锁，信任此电脑。
2. 右下角托盘 AltServer → Sideload .ipa → 选 duduchat.ipa → 输 Apple ID 和密码（本机直传苹果签名，不过第三方）。
3. 装好后手机上信任开发者，App 就能开了。

## 五、之后每周要记得的事

免费签名 7 天过期。过期后 App 打不开，插数据线 → AltServer → Refresh，就续上了。
两台手机（你和她）各自第一次装都要签名一次，之后每周各自刷新。

如果哪周忘了刷新断了，重签一次就好，聊天记录在服务器上，不会丢。

## 已知限制（免费账号的锅，不是 bug）

- 最多同时装 3 个 App（用你的免费 Apple ID 签的算一类，全家桶额度）。
- 7 天不续就闪退，重签恢复。
- 免费 Apple ID 大约每 7 天只能签 10 个不同 App，自己人用绰绰有余。
