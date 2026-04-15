# 修复手机端屏幕未占满问题

## 基本信息

| 字段 | 值 |
|------|-----|
| 开发类型 | Bugfix |
| GitHub Issue | #13 |
| 远程分支 | main |
| 本地分支 | fix-mobile-screen-fill |
| 开发日期 | 2026-04-15 |
| 完成日期 | 2026-04-15 |

## 原始需求

**来源**：GitHub Issue #13，用户在手机端测试时发现的显示问题。

**原始描述**：
> 方向键和AB键换位置之后手机端的屏幕被缩小了，屏幕的上下左右都有黑边。正常应该保持16:9的比例然后尽可能把屏幕占满。

**业务背景**：本项目是一个基于 Phaser 3 的 2D RPG 网页游戏，需要同时支持桌面和手机浏览器。在前一次迭代（#11，commit 3f8d3d6）中将方向键和 A/B 按钮的位置进行了互换（D-Pad 从右侧移到左侧，A/B 按钮从左侧移到右侧），之后用户在手机端观察到游戏画布明显缩小，四周出现黑边。

## 需求分析过程

### 问题定位

通过代码审查确认，commit 3f8d3d6 **仅修改了虚拟按键的 CSS 定位**（`position: fixed`），未触及任何画布缩放逻辑。所有控件使用 `position: fixed` 定位，不应影响 Phaser 的父容器尺寸测量。因此判断按钮换位本身不是直接原因，而是暴露了已有的移动端适配问题。

### 根因分析

深入分析 Phaser 缩放配置（`src/game.ts`）和移动端布局代码（`index.html`），定位到三个问题：

1. **`max` 约束限制放大**：`scale.max: { width: 960, height: 540 }` 阻止画布在高分辨率设备上放大，导致在 CSS 视口大于 960x540 的设备上画布无法填满屏幕。

2. **移动端 viewport 高度测量不准**：CSS `height: 100%` 在移动端浏览器中可能包含动态地址栏后面的区域（尤其是 iOS Safari），导致 Phaser 测量到的父容器高度大于实际可见区域。当 Phaser 用这个偏大的高度进行 FIT 计算时，画布会被进一步缩小。

3. **全屏切换后未刷新**：进入全屏后 viewport 尺寸变化，但 Phaser Scale Manager 可能未及时重新计算画布尺寸。

### 方案选择

考虑了三种 Phaser 缩放模式：
- **FIT 模式（选定）**：保持 16:9 比例，尽可能填充屏幕，比例不匹配时最多两侧有窄黑边。改动最小，风险最低。
- **EXPAND 模式**：动态调整游戏分辨率匹配屏幕，无黑边但需要适配 DialogBox/InspectPanel 等 UI 组件的动态分辨率，改动较大。
- **ENVELOP 模式**：画布完全覆盖屏幕但裁剪超出部分，可能丢失边缘游戏内容。

最终选择 FIT 模式修复，因为改动范围可控（仅 2 个文件、9 行变更），且能直接解决"四面黑边"的核心问题。

## 实现方案

修改涉及 2 个文件，共 9 行源代码变更：

### 1. 移除 Phaser scale max 约束（`src/game.ts`）

删除 `scale` 配置中的 `max: { width: 960, height: 540 }` 属性。这个约束原本用于防止画布超过原始分辨率，但在移动端反而阻止了正确的缩放。移除后，Phaser 的 FIT 模式可以自由地将 960x540 的游戏画面缩放到任意尺寸的父容器中。

### 2. 修复移动端 viewport 高度（`index.html` CSS）

将 `html, body` 的 `height` 从 `100%` 改为 `100dvh`（dynamic viewport height），利用 CSS 后声明覆盖特性保留 `100%` 作为回退：

```css
height: 100%;      /* 回退：不支持 dvh 的浏览器 */
height: 100dvh;    /* 现代浏览器：使用动态 viewport 高度 */
```

`dvh` 单位会排除移动端浏览器动态地址栏的干扰，确保 body 高度等于实际可见 viewport 高度。该单位在 2022 年后的主流浏览器中已广泛支持。

### 3. 全屏后触发 resize 事件（`index.html` JS）

在 `requestFullscreen()` 的 `.then()` 回调中添加延迟 100ms 的 resize 事件分发：

```javascript
rfs.call(el).then(function() {
  setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 100);
}).catch(function() {});
```

延迟 100ms 是为了确保浏览器完成全屏模式切换后再触发 Phaser Scale Manager 的重新计算。

## 问题与解决方案

### 问题 1：SSH ControlMaster 导致 git push 失败

- **现象**：执行 `git push` 时报错 `muxserver_listen: link mux listener ... Bad file descriptor`，无法推送到 GitHub。
- **原因**：SSH 配置中启用了 `ControlMaster auto`，Docker 容器环境下 Unix socket 文件创建/链接出现问题，导致 SSH 多路复用连接失败。
- **解决方案**：通过 `GIT_SSH_COMMAND` 环境变量临时禁用 SSH 多路复用：`GIT_SSH_COMMAND="ssh -o ControlMaster=no -o ControlPath=none" git push origin HEAD:fix-mobile-screen-fill`。

### 问题 2：gh CLI 未认证

- **现象**：执行 `gh pr create` 时报错 `To get started with GitHub CLI, please run: gh auth login`。
- **原因**：Docker 容器内 `gh` 未进行 GitHub 认证。
- **解决方案**：用户在容器内手动执行 `gh auth login -h github.com` 完成认证后重试。

## 反思与复盘

### 做得好的地方

- **根因分析充分**：没有被"按钮换位导致屏幕缩小"的表象误导，通过代码审查确认了真正的问题源头是 Phaser 缩放配置和移动端 viewport 测量。
- **方案选择务实**：在 FIT/EXPAND/ENVELOP 三种模式中选择了改动最小的 FIT 修复，避免了不必要的架构变更。
- **修复精准**：9 行代码变更，涉及 2 个文件，精准解决问题。

### 可以改进的地方

- **问题记录不够及时**：开发过程中遇到的 SSH 和 gh CLI 问题未在 task-progress.md 中实时记录，总结时需要从对话历史中回溯。
- **Docker 环境预检**：SSH ControlMaster 和 gh CLI 认证问题属于环境问题，可以在 devpipe:init 阶段增加环境预检步骤，提前发现并处理。

### 后续建议

- 考虑在未来迭代中切换到 EXPAND 模式，彻底消除黑边，提供更沉浸的移动端体验。这需要同时适配 DialogBox 和 InspectPanel 的动态分辨率渲染。
- 建议在 init 阶段增加 `git push --dry-run` 和 `gh auth status` 的环境预检，避免在 review-and-fix 阶段才发现环境问题。
