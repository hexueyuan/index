# 开发计划

## 基本信息

- 开发类型: Bugfix
- 功能描述: 修复手机端屏幕未占满问题，保持16:9比例尽可能填充屏幕
- GitHub Issue: #13
- 远程分支: main
- 本地分支: fix-mobile-screen-fill
- 工作目录: /home/hexueyuan/index
- 创建时间: 2026-04-15
- 需求文档: 无（从 Issue 详情获取）

## 需求/问题概述

方向键和AB键换位置后（commit 3f8d3d6），手机端游戏画布缩小，屏幕上下左右都有黑边。正常应保持16:9比例尽可能占满屏幕。

根因分析：
1. `game.ts` 中 `max: { width: 960, height: 540 }` 约束限制了画布在高分辨率设备上的放大
2. CSS `height: 100%` 在移动端浏览器中可能包含地址栏后面的区域，导致 Phaser 测量到的父容器尺寸大于实际可见区域
3. 进入全屏后 Phaser 未及时重新计算画布尺寸

## 技术方案

采用 FIT 模式修复方案，保持 `Phaser.Scale.FIT` + `CENTER_BOTH` 模式不变，修复 3 个问题：

1. **移除 max 约束**：删除 `scale.max` 配置，允许画布在大屏设备上正确放大
2. **修复移动端 viewport 高度**：使用 CSS `100dvh`（dynamic viewport height）替代 `100%`，确保 body 高度等于实际可见 viewport 高度
3. **全屏后强制刷新**：进入全屏后 dispatch resize 事件，触发 Phaser Scale Manager 重新计算

## 涉及模块

| 模块 | 代码路径 | 变更类型 |
|------|----------|----------|
| game-config | src/game.ts | 修改 |
| html-layout | index.html | 修改 |

## 适用的模块开发规范

- 无（项目无模块开发规范文档）

## 子任务列表

| # | 子任务 | 模块 | 描述 |
|---|--------|------|------|
| 1 | 移除 Phaser scale max 约束 | game-config | 删除 game.ts 中 scale.max 配置 |
| 2 | 修复移动端 viewport 高度和全屏刷新 | html-layout | 修改 CSS 高度为 dvh 单位，添加全屏后 resize 事件 |

## 子任务详细说明

### 子任务 1: 移除 Phaser scale max 约束
- **目标**: 允许 Phaser 画布在任意屏幕尺寸上正确缩放，不受 960x540 上限限制
- **实现要点**:
  - 删除 `src/game.ts` 第 16-19 行的 `max: { width: 960, height: 540 }` 配置
  - 保留 `mode: Phaser.Scale.FIT` 和 `autoCenter: Phaser.Scale.CENTER_BOTH` 不变
- **涉及文件**: `src/game.ts`
- **验收标准**:
  - scale 配置中不再包含 max 属性
  - FIT 和 CENTER_BOTH 模式保持不变
  - 游戏仍可正常启动

### 子任务 2: 修复移动端 viewport 高度和全屏刷新
- **目标**: 确保移动端浏览器中 body 高度准确反映可见 viewport，全屏后画布立即重新计算尺寸
- **实现要点**:
  - 将 `index.html` CSS 中 `html, body` 的 `height: 100%` 改为 `height: 100dvh`，并保留 `height: 100%` 作为不支持 dvh 的浏览器回退
  - 在全屏请求成功后的回调中添加 `window.dispatchEvent(new Event('resize'))`，延迟 100ms 执行以确保全屏切换完成
- **涉及文件**: `index.html`
- **验收标准**:
  - CSS 中使用 `100dvh` 且有 `100%` 回退
  - 全屏进入后会触发 resize 事件
  - 移动端游戏画布尽可能占满屏幕（仅在比例不匹配时有两侧窄黑边）

## 验收标准

1. 移动端横屏时画布尽可能占满屏幕，不出现四面黑边
2. 当屏幕比例非 16:9 时，最多仅有两侧（左右或上下）窄黑边
3. 进入全屏后画布立即调整到正确尺寸
4. 桌面端行为不受影响
5. 虚拟按键正常显示和工作

## 测试策略

1. 手机浏览器横屏打开游戏，确认画布占满屏幕
2. 点击全屏 overlay 后确认画布正确调整
3. 桌面浏览器打开确认无异常
4. 虚拟方向键和 A/B 按钮功能正常

## 子任务 Agent 执行方式

对每个待执行子任务，使用 Agent 工具串行执行：

**Agent 配置：**
- subagent_type: general-purpose
- 串行执行，等待上一个子任务完成后再启动下一个

**Agent Prompt 构造方式：**

读取 `plugins/devpipe/skills/coding/references/coding-agent-prompt.md` 中 "---" 之间的 Agent Prompt 内容，替换以下占位符：
- `[WORKING_DIRECTORY]` → /home/hexueyuan/index
- `[TASK_DESCRIPTION]` → 从 TaskGet 获取子任务的完整描述
- `[MODULE_NAME]` → 子任务所属模块名称
- `[STANDARDS_DOCS]` → 无适用的模块开发规范文档

## 提交方式

所有子任务完成后，由主对话在 coding 阶段统一处理：
1. 执行全量单测 + 覆盖率检查
2. git add → git commit -m "#13 Fix mobile screen not filling viewport properly."（不 push）
3. 自动进入 review-and-fix 阶段（代码优化在评审阶段一并完成）

要点：每个 git 命令独立执行（不用 `&&`），只 add 具体的源代码和测试文件，不要添加 devpipe 状态文件（.devpipe/state/coding-plan.md、.devpipe/state/prd.md、.devpipe/state/context.json）。
- 首次提交: git add → git commit -m "#13 Fix mobile screen not filling viewport properly."
- review 修复后（review-and-fix 阶段）: git add → git commit -m "#13 Fix review comments."
- 推送（review-and-fix 阶段）: git push origin HEAD:fix-mobile-screen-fill
- 创建 PR（review-and-fix 阶段）: gh pr create --base main
