# 开发计划

## 基本信息

- 开发类型: 新功能
- 功能描述: 交换方向键与A键的左右位置，新增B键用于取消
- GitHub Issue: #11
- 远程分支: main
- 本地分支: feature-swap-ab-keys
- 工作目录: /home/hexueyuan/index
- 创建时间: 2026-04-15
- 需求文档: .devpipe/state/prd.md

## 需求/问题概述

1. 移动端虚拟按键位置交换：D-Pad 从右下角移到左下角，A 键从左下角移到右下角
2. 新增 B 键（取消）：与 A 键斜对角排列（A 右上、B 左下），关闭当前激活的 UI（对话框直接关闭、检查面板关闭）
3. PC 端 Escape 键映射为 B 键功能

## 技术方案

### 涉及文件和修改点

**1. `index.html`**
- CSS: D-Pad 的 `right: 20px` 改为 `left: 20px`
- CSS: A 按钮 (`#btn-action`) 的 `left: 20px` 改为 `right: 20px`，调整 `bottom` 值使其处于右上位置
- HTML: 新增 B 按钮 `<button id="btn-cancel">B</button>`，样式与 A 按钮一致（圆形 56x56），定位在 A 按钮的左下方
- JS: 新增 B 按钮的 `pointerdown` 事件绑定，调用 `window.__gameInput.pressCancel()`

**2. `src/scenes/MainScene.ts`**
- `GameInput` 接口新增 `pressCancel: () => void`
- `window.__gameInput` 暴露 `pressCancel` 调用 `handleCancel()`
- 新增 `handleCancel()` 方法：
  - `dialogBox.isActive` → `dialogBox.close()`（直接关闭，不推进）
  - `inspectPanel.isActive` → `inspectPanel.close()`
  - 否则无操作
- 注册 Escape 键 (`KeyCodes.ESC`)，绑定到 `handleCancel()`

**3. `src/ui/DialogBox.ts`**
- 将 `close()` 方法的访问级别从 `private` 改为 `public`

### 布局方案（移动端）

交换后的按键位置：
```
左下角: D-Pad (left: 20px, bottom: 20px)
右下角: A 键 (right: 20px, bottom: 80px)  — 右上位置
        B 键 (right: 76px, bottom: 20px)  — 左下位置
```

A 和 B 呈斜对角排列，符合经典 Game Boy 风格（A 在右上，B 在左下）。

## 涉及模块

| 模块 | 代码路径 | 变更类型 |
|------|----------|----------|
| 前端页面 | index.html | 修改 |
| 主场景 | src/scenes/MainScene.ts | 修改 |
| 对话框 | src/ui/DialogBox.ts | 修改 |

## 适用的模块开发规范

- 无（项目无 `.claude/docs/` 模块开发规范文档）

## 子任务列表

| # | 子任务 | 模块 | 描述 |
|---|--------|------|------|
| 1 | 交换 D-Pad 和 A 键位置 | 前端页面 | 修改 index.html CSS，将 D-Pad 移到左下角，A 键移到右下角 |
| 2 | 新增 B 键并实现取消功能 | 前端页面 + 主场景 + 对话框 | 添加 B 按钮 UI、游戏逻辑、Escape 键绑定、DialogBox.close() 公开化 |

## 子任务详细说明

### 子任务 1: 交换 D-Pad 和 A 键位置
- **目标**: 将移动端虚拟按键布局从"A左D-Pad右"交换为"D-Pad左A右"
- **实现要点**:
  - 修改 `index.html` 中 `#dpad` 的 CSS: `right: 20px` → `left: 20px`
  - 修改 `#btn-action` 的 CSS: `left: 20px; bottom: 68px` → `right: 20px; bottom: 80px`
- **涉及文件**: index.html
- **验收标准**:
  - D-Pad 显示在屏幕左下角
  - A 键显示在屏幕右下角
  - 功能不受影响（方向键控制移动、A 键触发交互）

### 子任务 2: 新增 B 键并实现取消功能
- **目标**: 添加 B 键（取消），在移动端和 PC 端均可使用
- **实现要点**:
  - `index.html`: 添加 B 按钮 HTML `<button id="btn-cancel">B</button>`，CSS 样式与 A 按钮一致（圆形 56x56），定位 `right: 76px; bottom: 20px`（A 按钮左下方对角位置）
  - `index.html`: 添加 B 按钮 `pointerdown` 事件，调用 `window.__gameInput.pressCancel()`
  - `src/ui/DialogBox.ts`: 将 `close()` 从 `private` 改为 `public`（B 键需要直接调用关闭而非推进）
  - `src/scenes/MainScene.ts`:
    - `GameInput` 接口新增 `pressCancel: () => void`
    - 新增 `handleCancel()`: dialogBox.isActive → dialogBox.close()；inspectPanel.isActive → inspectPanel.close()；否则无操作
    - `window.__gameInput` 暴露 `pressCancel: () => this.handleCancel()`
    - 注册 Escape 键 (`Phaser.Input.Keyboard.KeyCodes.ESC`)，绑定 `handleCancel()`
- **涉及文件**: index.html, src/scenes/MainScene.ts, src/ui/DialogBox.ts
- **验收标准**:
  - 移动端 B 键与 A 键呈斜对角排列（A 右上、B 左下）
  - 按 B 键或 Escape 键，能直接关闭对话框（不推进对话内容）
  - 按 B 键或 Escape 键，能关闭检查面板
  - 无 UI 激活时，B 键无效果
  - A 键原有功能不受影响

## 验收标准

1. 移动端方向键显示在屏幕左下角，A 键和 B 键显示在屏幕右下角
2. A 键在右上、B 键在左下，呈斜对角排列
3. 按下 B 键（移动端）或 Escape 键（PC 端），能直接关闭当前显示的对话框（不推进对话，直接退出）
4. 按下 B 键（移动端）或 Escape 键（PC 端），能关闭当前显示的检查面板
5. 无 UI 激活时，B 键无效果
6. A 键的所有原有功能不受影响

## 测试策略

1. 在浏览器中打开游戏，验证移动端虚拟按键位置（D-Pad 左下、A/B 右下）
2. 触发对话框后按 B 键/Escape，验证对话框直接关闭（不推进到下一页）
3. 触发对话框后按 A 键，验证推进行为不变
4. 触发检查面板后按 B 键/Escape，验证面板关闭
5. 无 UI 时按 B 键/Escape，验证无效果
6. 验证方向键和 A 键的原有功能正常

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
2. git add → git commit -m "#11 Swap D-Pad and A button positions, add B button for cancel."（不 push）
3. 自动进入 review-and-fix 阶段（代码优化在评审阶段一并完成）

要点：每个 git 命令独立执行（不用 `&&`），只 add 具体的源代码和测试文件，不要添加 devpipe 状态文件（.devpipe/state/coding-plan.md、.devpipe/state/prd.md、.devpipe/state/context.json）。
- 首次提交: git add → git commit -m "#11 Swap D-Pad and A button positions, add B button for cancel."
- review 修复后（review-and-fix 阶段）: git add → git commit -m "#11 Fix review comments."
- 推送（review-and-fix 阶段）: git push origin HEAD:feature-swap-ab-keys
- 创建 PR（review-and-fix 阶段）: gh pr create --base main
