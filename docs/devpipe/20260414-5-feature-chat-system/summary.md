# 实现对话系统

## 基本信息

| 字段 | 值 |
|------|-----|
| 开发类型 | 新功能 |
| GitHub Issue | #5 |
| 远程分支 | main |
| 本地分支 | feature-chat-system |
| 开发日期 | 2026-04-14 |
| 完成日期 | 2026-04-14 |

## 原始需求

需求来自 GitHub Issue #5，目标是为像素风格 RPG 探索游戏构建所有文字交互的基础 UI 组件——对话系统。

项目当时已有地图加载、角色移动和碰撞系统，但没有任何 UI 组件。后续的 NPC 对话、告示牌、日记、道具说明等叙事功能都需要"显示一段文字"的能力，因此对话系统是第一个需要实现的 UI 组件。

Issue 中明确要求：
- 屏幕底部半透明黑色背景框
- 白色文字逐字显示（打字机效果）
- 按空格/回车翻页，最后一页按键后关闭
- 对话进行时玩家不能移动
- 在 MainScene 中按空格键触发一段固定对话验证效果

## 需求分析过程

### 需求细化

原始 Issue 只定义了基本的对话框行为，在需求讨论阶段（devpipe:discuss）逐步明确了以下细节：

1. **角色区分**：对话需要区分说话者身份。最终选择**名字颜色区分**方案——玩家角色名字蓝色（`#5599ff`）、NPC 名字黄色（`#ffdd44`），正文统一白色。相比头像或气泡样式，颜色区分实现简单且符合像素风格。

2. **字体选择**：选定 Google Fonts 的 "Press Start 2P" 像素字体，与游戏整体风格一致。

3. **打字机效果**：固定速度（50ms/字符）+ 可跳过。相比可调速度，固定速度实现简单，跳过功能已能满足急躁玩家的需求。

4. **移动端交互**：在虚拟方向键区域旁增加 A 按钮，同时支持点击对话框本身翻页。

### 功能边界

明确排除了：NPC 交互触发（后续 NPC 系统实现）、对话分支/选项、样式自定义、头像表情、音效。这些都是可以在基础对话组件之上迭代的功能。

### 数据结构设计

将原始 Issue 中简单的字符串数组扩展为结构化数据：

```ts
interface DialogLine {
  speaker: string;    // 说话者名字
  role: 'player' | 'npc';  // 角色类型，决定名字颜色
  text: string;       // 对话正文
}
```

这样每页对话都能携带说话者信息，支持角色区分功能。

## 实现方案

### 整体架构

采用三层结构实现：

1. **Player 锁定层**（`Player.ts`）：添加 `lock()`/`unlock()` 方法和 `_locked` 状态，`update()` 中 locked 时跳过所有移动逻辑。这是最小侵入的方式——不修改现有移动代码，只在入口处加一个守卫。

2. **DialogBox 组件层**（`DialogBox.ts`）：纯 UI 组件，不依赖任何游戏逻辑。通过 `onOpen`/`onClose` 回调与外部通信，实现解耦。

3. **场景集成层**（`MainScene.ts` + `index.html`）：负责创建 DialogBox、连接 Player 锁定回调、处理键盘/虚拟按钮输入。

### DialogBox 核心设计

**不继承 Container**：最初设计为继承 `Phaser.GameObjects.Container`，但开发中发现 Container 的 `setScrollFactor(0)` 在 2x 摄像机缩放下不能可靠地传播给子元素。最终改为普通类，内部每个游戏对象（Graphics 背景、Text 名字、Text 正文、Graphics 指示器）独立管理 `setScrollFactor(0)` 和 depth。

**状态机**：三状态 `IDLE → TYPING → PAGE_COMPLETE`，状态转换清晰：
- `show()` → TYPING（开始打字）
- 打字完成 → PAGE_COMPLETE（显示翻页指示器）
- `advance()` 在 TYPING 时跳过动画，在 PAGE_COMPLETE 时翻页或关闭

**坐标计算**：这是本次开发最关键的技术点。Phaser 摄像机 zoom 时，`setScrollFactor(0)` 的坐标不是从屏幕左上角 (0,0) 开始的，而是从画布中心点缩放的。公式为：

```
screenPos = (gamePos - canvasCenter) * zoom + canvasCenter
```

因此 DialogBox 在构造时根据摄像机 zoom 动态计算可见区域的左上角坐标和宽高，确保对话框正确定位在屏幕底部。

**文字渲染策略**：使用 16px 字号 + `setScale(0.5)` 的方式，在 2x 摄像机缩放下获得清晰的 8px 等效字体。`wordWrap` 宽度相应乘以 2 来补偿缩放。为解决中文字符裁切问题，Text 对象需要设置 `padding: { top: 6, bottom: 6 }`。

### 移动端 A 按钮

在 `index.html` 中添加圆形 A 按钮，通过 `window.__gameInput.pressAction()` 与 Phaser 场景通信。按钮使用 `pointerdown` 事件，与 D-pad 方向键的交互方式保持一致。

## 问题与解决方案

### 问题 1：Phaser 基类属性名冲突

- **现象**：DialogBox 继承 Container 时，定义的 `state` 属性和 `active` getter 与基类冲突，TypeScript 报错
- **原因**：`Phaser.GameObjects.Container` 基类已有 `state`（类型 `number`）和 `active`（`boolean`）属性
- **解决方案**：将 `state` 改名为 `dialogState`，`active` 改名为 `isActive`。教训：继承 Phaser 基类时要先检查基类已有的属性名

### 问题 2：Container setScrollFactor(0) 在 zoom 下失效

- **现象**：对话框位置没在屏幕底部，而且对话内容不显示
- **原因**：`Phaser.GameObjects.Container` 的 `setScrollFactor(0)` 在摄像机 2x 缩放下不能可靠地传播给子元素，导致子元素位置偏移
- **解决方案**：放弃 Container 继承，改为普通类，每个游戏对象（Graphics、Text）独立调用 `setScrollFactor(0)`

### 问题 3：scrollFactor(0) 坐标系与摄像机 zoom 的交互

- **现象**：即使改为独立 setScrollFactor(0)，对话框仍然不在屏幕底部，文字在屏幕左侧之外不可见
- **原因**：Phaser 摄像机的 zoom 是从画布中心点缩放的。`setScrollFactor(0)` 的对象坐标 (0, 0) 并非映射到屏幕左上角，而是经过 `screenPos = (gamePos - canvasCenter) * zoom + canvasCenter` 变换。原来的 `boxY=210` 映射到 `screenY = (210-300)*2+300 = 120`（屏幕中偏上），文字 `x=16` 映射到 `screenX = (16-400)*2+400 = -368`（屏幕外）
- **解决方案**：在构造函数中根据摄像机 zoom 动态计算可见区域原点 `visX = (cam.width/2) * (1 - 1/zoom)`，以此为基准定位所有 UI 元素。这个方案兼容任意 zoom 值

### 问题 4："Press Start 2P" 不支持中文字符

- **现象**：对话正文中的中文字符不显示
- **原因**：Google Fonts "Press Start 2P" 是纯 Latin 字体，不包含 CJK 字形
- **解决方案**：设置字体回退链 `'"Press Start 2P", "Courier New", monospace'`，英文用像素字体，中文自动回退到系统等宽字体

### 问题 5：中文字符上下裁切

- **现象**：中文字符的顶部和底部被裁切，显示不完整
- **原因**：Phaser Text 内部创建的 Canvas 纹理尺寸基于 Latin 字体度量计算，CJK 字符的实际高度超出了这个范围
- **解决方案**：为 Text 对象添加 `padding: { top: 6, bottom: 6 }`，让内部 Canvas 纹理留出额外空间

### 问题 6：Space 键双重注册导致首页跳过

- **现象**：按空格触发对话后，第一页的打字机动画被立即跳过
- **原因**：MainScene 和 DialogBox 都监听了 Space 键，同一次按键触发了两次处理——一次打开对话框，一次跳过动画
- **解决方案**：移除 DialogBox 内部的键盘监听，统一在 MainScene 中处理输入

## 反思与复盘

### 做得好的地方

1. **解耦设计**：DialogBox 通过回调与场景通信，不依赖 Player 或任何游戏逻辑，可以在任何 Phaser 场景中复用
2. **状态机清晰**：三状态设计简洁明了，`advance()` 方法的行为在每个状态下都有明确定义，不会出现状态混乱
3. **渐进式排查**：从 Container 到独立对象到坐标修正到字体回退到 padding，每一步都是基于用户反馈逐步定位的

### 可以改进的地方

1. **对 Phaser 摄像机 zoom 行为的理解不足**：坐标系问题耗费了多个迭代才解决。应该在设计阶段就写一个最小 demo 验证 `setScrollFactor(0)` + zoom 的坐标行为，而不是假设 (0,0) 是屏幕左上角
2. **字体兼容性未提前考虑**：选择 "Press Start 2P" 时没有验证它是否支持中文，导致后期需要加回退链。选择字体时应先确认目标语言的字形覆盖
3. **可以考虑使用独立 UI 摄像机**：Phaser 支持多摄像机，为 UI 创建一个 zoom=1 的独立摄像机是更干净的方案，可以避免所有 zoom 相关的坐标计算问题。当前的动态计算方案虽然可行，但增加了认知复杂度

### 对后续工作的建议

- 如果后续需要更多 UI 组件（血条、物品栏等），建议创建一个 zoom=1 的 UI 摄像机，所有 UI 元素放在该摄像机下，从根本上解决坐标问题
- 对话系统后续扩展（NPC 触发、分支选项）时，DialogBox 的 `show()` 接口已经足够灵活，只需扩展数据结构和调用方式
- 中文字体问题长期来看应该使用一个完整支持 CJK 的像素字体，而不是依赖系统字体回退
