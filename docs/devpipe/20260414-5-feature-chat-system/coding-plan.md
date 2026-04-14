# 开发计划

## 基本信息

- 开发类型: 新功能
- 功能描述: 实现对话系统
- GitHub Issue: #5
- 远程分支: main
- 本地分支: feature-chat-system
- 工作目录: /home/hexueyuan/index
- 创建时间: 2026-04-14
- 需求文档: .devpipe/state/prd.md

## 需求/问题概述

构建 RPG 游戏的基础对话系统 UI 组件：
- 屏幕底部半透明黑色背景对话框
- 白色文字逐字打字机效果，像素字体
- 说话者名字按角色类型区分颜色（玩家蓝色、NPC 黄色）
- 空格/回车翻页，支持跳过打字动画
- 移动端点击对话框翻页 + 虚拟 A 按钮
- 对话期间玩家不能移动
- MainScene 中的集成测试对话

## 技术方案

### 架构设计

**DialogBox 组件**：基于 `Phaser.GameObjects.Container`，使用 `setScrollFactor(0)` 固定在摄像机视口底部。2x 摄像机缩放下，可见区域为 400x300 游戏单位，对话框按此尺寸计算布局。

**对话数据结构**：
```ts
type DialogRole = 'player' | 'npc';
interface DialogLine {
  speaker: string;
  role: DialogRole;
  text: string;
}
type Dialog = DialogLine[];
```

**状态机**：DialogBox 内部维护状态 `IDLE | TYPING | PAGE_COMPLETE`：
- IDLE：对话框隐藏
- TYPING：打字机动画进行中，按键可跳过动画
- PAGE_COMPLETE：当前页文字已完整显示，按键翻到下一页或关闭

**像素字体**：在 `index.html` 中通过 Google Fonts 加载 "Press Start 2P"，Phaser Text 对象指定此字体。

**输入处理**：DialogBox 自行管理键盘输入（Space/Enter）和指针点击。通过回调通知场景锁定/解锁玩家。

**玩家锁定**：Player 类增加 `locked` 属性，`update()` 中 locked 时跳过移动逻辑。

**移动端 A 按钮**：在 `index.html` 的 D-pad 区域旁增加 A 按钮，通过 `window.__gameInput` 暴露 `pressAction` / `releaseAction` 方法。

### 颜色方案

| 元素 | 颜色 |
|------|------|
| 对话框背景 | 黑色 alpha 0.8 |
| 玩家名字 | `#5599ff`（蓝色） |
| NPC 名字 | `#ffdd44`（黄色） |
| 对话正文 | `#ffffff`（白色） |

### 对话框布局（游戏单位，2x 缩放下可见区域 400x300）

| 元素 | 位置/尺寸 |
|------|-----------|
| 对话框背景 | x:0, y:210, 宽:400, 高:90 |
| 说话者名字 | x:16, y:218, 字号:8px |
| 对话正文 | x:16, y:236, 字号:8px, 自动换行宽度 368 |

## 涉及模块

| 模块 | 代码路径 | 变更类型 |
|------|----------|----------|
| ui | src/ui/DialogBox.ts | 新增 |
| objects | src/objects/Player.ts | 修改 |
| scenes | src/scenes/MainScene.ts | 修改 |
| html | index.html | 修改 |

## 适用的模块开发规范

- 无（项目暂无 .claude/docs/ 下的模块开发规范文档）

## 子任务列表

| # | 子任务 | 模块 | 描述 |
|---|--------|------|------|
| 1 | Player 移动锁定机制 | objects | 为 Player 添加 lock/unlock 方法，locked 时跳过移动 |
| 2 | DialogBox 组件开发 | ui | 创建完整的对话框组件：显示、打字机效果、翻页、角色颜色区分、输入处理 |
| 3 | 移动端 A 按钮 + MainScene 集成 | scenes | HTML 虚拟 A 按钮、像素字体加载、MainScene 中集成对话框和测试对话 |

## 子任务详细说明

### 子任务 1: Player 移动锁定机制
- **目标**: 为 Player 类添加移动锁定能力，对话期间阻止玩家移动
- **实现要点**:
  - 添加 `private _locked: boolean = false` 属性
  - 添加 `lock()` 方法：设置 `_locked = true`，停止当前速度，播放 idle 动画
  - 添加 `unlock()` 方法：设置 `_locked = false`
  - 添加 `get locked()` getter
  - `update()` 方法开头检查 `_locked`，若为 true 直接 return
- **涉及文件**: src/objects/Player.ts
- **验收标准**:
  - Player 有 lock()/unlock() 公开方法
  - lock() 后 Player 不响应任何移动输入，停在原地播放 idle
  - unlock() 后恢复正常移动

### 子任务 2: DialogBox 组件开发
- **目标**: 创建完整的对话框 UI 组件，支持打字机效果、多页翻页、角色颜色区分
- **实现要点**:
  - 创建 `src/ui/DialogBox.ts`
  - 定义数据类型：`DialogRole`（'player' | 'npc'）、`DialogLine`（speaker + role + text）
  - DialogBox 继承 `Phaser.GameObjects.Container`，`setScrollFactor(0)`
  - 内部 GameObjects：背景（Graphics 绘制圆角矩形）、nameText（Text）、contentText（Text）、翻页指示器（闪烁三角形）
  - 状态机：IDLE / TYPING / PAGE_COMPLETE
  - `show(dialog: DialogLine[])` 方法：显示对话框，从第一页开始
  - `advance()` 方法：TYPING 时跳过动画显示完整文字；PAGE_COMPLETE 时翻到下一页或关闭
  - 打字机效果：使用 `scene.time.addEvent` 定时器，每 50ms 显示一个字符
  - 名字颜色：根据 role 设置 nameText 颜色（player: #5599ff, npc: #ffdd44）
  - 输入处理：监听 Space/Enter 键按下和指针点击，调用 advance()
  - 回调机制：构造函数接收 `onOpen` 和 `onClose` 回调，用于通知场景锁定/解锁玩家
  - `destroy()` 中清理定时器和事件监听
- **涉及文件**: src/ui/DialogBox.ts（新增）
- **验收标准**:
  - DialogBox 可通过 show() 显示多页对话
  - 文字逐字出现（打字机效果）
  - 打字过程中按键可跳过动画
  - 翻页正常，最后一页后关闭
  - 玩家名字蓝色、NPC 名字黄色
  - 支持键盘（Space/Enter）和指针点击操作
  - onOpen/onClose 回调正确触发

### 子任务 3: 移动端 A 按钮 + MainScene 集成
- **目标**: 添加移动端虚拟 A 按钮，在 MainScene 中集成对话框和测试对话
- **实现要点**:
  - **index.html**：
    - 添加 Google Fonts "Press Start 2P" 的 `<link>` 标签
    - 在 D-pad 区域左侧添加 A 按钮（圆形，带 "A" 文字）
    - A 按钮通过 `window.__gameInput.pressAction()` / `window.__gameInput.releaseAction()` 通信
  - **GameInput 接口扩展**（MainScene.ts）：
    - 添加 `pressAction` / `releaseAction` 方法
  - **MainScene 集成**：
    - 在 create() 中创建 DialogBox 实例，传入 onOpen（锁定玩家）和 onClose（解锁玩家）回调
    - 添加空格键触发测试对话的逻辑（仅在 DialogBox 未显示且未在对话中时触发）
    - A 按钮按下时如果对话框显示中则调用 advance()，否则触发测试对话
    - 测试对话数据（玩家与 NPC 交替）：
      ```ts
      const testDialog: DialogLine[] = [
        { speaker: '老村民', role: 'npc', text: '你好，欢迎来到 Southland！' },
        { speaker: '勇者', role: 'player', text: '谢谢！这个村庄看起来很宁静。' },
        { speaker: '老村民', role: 'npc', text: '是啊，不过最近村长好像有些烦心事……' },
        { speaker: '勇者', role: 'player', text: '发生了什么事吗？' },
        { speaker: '老村民', role: 'npc', text: '你要是感兴趣，可以去找村长聊聊。' },
      ];
      ```
  - **输入冲突处理**：空格键在对话框显示时用于翻页，不触发新对话
- **涉及文件**: index.html, src/scenes/MainScene.ts
- **验收标准**:
  - 像素字体 "Press Start 2P" 正确加载并在对话框中生效
  - 移动端虚拟 A 按钮显示在 D-pad 区域左侧，点击可翻页/触发对话
  - MainScene 中按空格键弹出测试对话
  - 测试对话包含玩家（蓝色名字）和 NPC（黄色名字）交替说话
  - 对话期间玩家不能移动，对话结束后恢复
  - PC 端和移动端操作均正常

## 验收标准

1. 按空格键弹出对话框，底部显示，半透明黑色背景
2. 说话者名字按角色类型显示不同颜色（玩家蓝色、NPC 黄色）
3. 文字以打字机效果逐字出现，使用像素字体 "Press Start 2P"
4. 打字过程中按空格/回车可跳过动画
5. 已显示完整文字时按空格/回车翻到下一页
6. 最后一页按键后对话框关闭
7. 对话期间玩家无法移动，关闭后恢复控制
8. 移动端点击对话框可翻页
9. 移动端虚拟 A 按钮可触发和操作对话
10. 测试对话展示玩家与 NPC 交替对话效果

## 测试策略

1. PC 端：空格键触发对话 → 打字机效果 → 空格跳过 → 空格翻页 → 最后一页关闭 → 玩家可移动
2. PC 端：对话中按方向键，玩家不应移动
3. 移动端：A 按钮触发对话 → 点击对话框翻页 → A 按钮翻页 → 关闭
4. 角色区分：确认玩家名字蓝色、NPC 名字黄色，正文白色

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

**注意**：本项目没有测试框架，Agent Prompt 中的单测步骤（b/c/d）跳过，仅执行步骤 a（代码开发）。

## 提交方式

所有子任务完成后，由主对话在 coding 阶段统一处理：
1. 调用 /simplify skill 执行全量代码优化
2. git add → git commit -m "#5 Implement dialog system with typewriter effect and role-based name colors."（不 push）
3. 自动进入 review-and-fix 阶段

要点：每个 git 命令独立执行（不用 `&&`），只 add 具体的源代码和测试文件，不要添加 devpipe 状态文件（.devpipe/state/coding-plan.md、.devpipe/state/prd.md、.devpipe/state/context.json）。
- 首次提交: git add → git commit -m "#5 Implement dialog system with typewriter effect and role-based name colors."
- review 修复后（review-and-fix 阶段）: git add → git commit -m "#5 Fix review comments."
- 推送（review-and-fix 阶段）: git push origin HEAD:feature-chat-system
- 创建 PR（review-and-fix 阶段）: gh pr create --base main
