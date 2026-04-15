# 开发计划

## 基本信息

- 开发类型: 新功能
- 功能描述: 展示面板（InspectPanel）与交互类型分离
- GitHub Issue: #7
- 远程分支: main
- 本地分支: feature-inspect-panel-intera
- 工作目录: /home/hexueyuan/index
- 创建时间: 2026-04-15
- 需求文档: .devpipe/state/prd.md

## 需求/问题概述

将告示牌（sign）从复用 DialogBox 改为使用独立的 InspectPanel 组件展示。InspectPanel 屏幕居中、像素风木板/羊皮纸背景、直接显示全文、按键关闭。本次仅实现 sign 类型，数据结构预留 type 字段供后续扩展。不新增地图道具，只迁移现有"村口告示牌"。

## 技术方案

### InspectPanel 组件设计

新建 `src/ui/InspectPanel.ts`，与 DialogBox 平行的独立组件：

- **数据结构**：`InspectContent { type: 'sign' | 'photo' | 'diary' | 'item'; title?: string; text?: string; }`
- **布局**：屏幕中央，利用 DialogBox 同样的 zoom 校正公式计算可见区域中心
- **背景**：用 Phaser Graphics API 代码绘制像素风木板效果（深棕色主体 + 浅棕色边框 + 纹理线条）
- **文字**：标题（较大，居中，棕色/深色）+ 正文（白色/浅色，直接全文显示，自动换行）
- **交互**：show() 打开面板并锁定玩家，按交互键或点击屏幕 close() 关闭并解锁玩家
- **状态**：仅 IDLE / SHOWING 两态（无打字机效果）
- **与 DialogBox 的接口对称性**：同样接受 onOpen/onClose 回调，暴露 isActive getter

### MainScene 交互层改造

- `interactiveObjects` 类型改为 `{ x: number; y: number; dialog?: DialogLine[]; inspect?: InspectContent }[]`
- sign 解析逻辑：生成 `inspect: { type: 'sign', title: obj.name, text: textProp.value }` 而非 `dialog`
- `handleAction()`：检查 dialogBox.isActive 或 inspectPanel.isActive，分别调用 advance() 或 close()
- `tryInteract()`：根据匹配对象的 `dialog` / `inspect` 字段分流到对应组件

## 涉及模块

| 模块 | 代码路径 | 变更类型 |
|------|----------|----------|
| InspectPanel | src/ui/InspectPanel.ts | 新增 |
| MainScene | src/scenes/MainScene.ts | 修改 |

## 适用的模块开发规范

- 无（项目无 .claude/docs/ 规范文档）

## 子任务列表

| # | 子任务 | 模块 | 描述 |
|---|--------|------|------|
| 1 | 创建 InspectPanel 组件 | InspectPanel | 新建 src/ui/InspectPanel.ts，实现数据结构、像素风木板背景绘制、标题+正文布局、show/close 交互 |
| 2 | 改造 MainScene 交互层 | MainScene | 修改交互对象数据结构、sign 解析逻辑、handleAction 和 tryInteract 分流逻辑 |

## 子任务详细说明

### 子任务 1: 创建 InspectPanel 组件
- **目标**: 新建 `src/ui/InspectPanel.ts`，实现居中展示面板
- **实现要点**:
  - 定义并导出 `InspectContent` 接口：`{ type: 'sign' | 'photo' | 'diary' | 'item'; title?: string; text?: string; }`
  - 创建 `InspectPanel` class，构造函数接收 `scene`、`onOpen`、`onClose` 回调（与 DialogBox 对称）
  - 使用 DialogBox 同样的 zoom 校正公式（`visX = (cam.width/2) * (1 - 1/zoom)` 等）计算屏幕可见区域
  - 面板尺寸：宽约 200px、高约 160px（可见区域内居中），实际值可微调
  - 用 Phaser Graphics API 绘制像素风木板背景：深棕色填充（如 0x8B4513）+ 浅棕色边框（如 0xDEB887）+ 可选的水平纹理线条模拟木纹
  - 标题文字：使用 "Press Start 2P" 字体，居中，深黄/金色（如 #FFD700），scale 0.5
  - 正文文字：白色，左对齐，wordWrap 自动换行，scale 0.5
  - 所有元素 scrollFactor(0)，depth 1000+（与 DialogBox 同级）
  - `show(content: InspectContent)`: 设置标题和正文文字，显示面板，注册 pointerdown 事件，调用 onOpen
  - `close()`: 隐藏面板，移除 pointerdown 事件，调用 onClose
  - `isActive` getter: 返回面板是否正在显示
  - `destroy()` 方法清理资源
- **涉及文件**: src/ui/InspectPanel.ts（新增）
- **验收标准**:
  - InspectContent 接口包含 type 字段，预留 photo/diary/item 扩展
  - 面板居中显示，有像素风木板背景效果
  - 标题和正文正确渲染，文字可自动换行
  - show() 和 close() 正确管理显示状态和 pointerdown 事件监听
  - isActive 正确反映面板状态

### 子任务 2: 改造 MainScene 交互层
- **目标**: 修改 MainScene，将 sign 交互从 DialogBox 分流到 InspectPanel
- **实现要点**:
  - 导入 `InspectPanel` 和 `InspectContent`
  - 修改 `interactiveObjects` 类型：`{ x: number; y: number; dialog?: DialogLine[]; inspect?: InspectContent }[]`
  - 添加 `private inspectPanel!: InspectPanel;` 成员
  - 在 `create()` 中实例化 InspectPanel（与 DialogBox 同样的 onOpen/onClose 回调）
  - 修改 sign 解析逻辑（约第 112-118 行）：从生成 `dialog` 改为生成 `inspect: { type: 'sign', title: obj.name || '告示牌', text: String(textProp.value) }`
  - 修改 `handleAction()`：
    ```
    if (this.dialogBox.isActive) { this.dialogBox.advance(); }
    else if (this.inspectPanel.isActive) { this.inspectPanel.close(); }
    else { this.tryInteract(); }
    ```
  - 修改 `tryInteract()`：
    - 增加 `this.inspectPanel.isActive` 的 early return 检查
    - 匹配到对象后，根据 `obj.inspect` 或 `obj.dialog` 字段分流：
      - 有 `inspect` → `this.inspectPanel.show(obj.inspect)`
      - 有 `dialog` → `this.dialogBox.show(obj.dialog)`
- **涉及文件**: src/scenes/MainScene.ts（修改）
- **验收标准**:
  - interactiveObjects 数据结构支持 dialog 和 inspect 两种类型
  - 面对告示牌交互时弹出 InspectPanel（居中木板面板），而非底部 DialogBox
  - handleAction 正确处理 InspectPanel 的关闭（按交互键关闭）
  - 点击屏幕也能关闭 InspectPanel
  - DialogBox 功能不受影响（为后续 NPC 对话保留）
  - 手机端触屏 A 按钮交互正常

## 验收标准

1. 面对"村口告示牌"按交互键，弹出居中的木板风格面板（非底部对话框）
2. 面板直接显示全文，包含标题（"村口告示牌"）和正文（"你好啊冒险者"）
3. 按交互键或点击屏幕可关闭面板，玩家恢复移动
4. 面板打开期间玩家被锁定
5. DialogBox 功能不受影响
6. InspectContent 接口包含 type 字段，预留扩展能力
7. 手机端触屏交互正常

## 测试策略

1. 在浏览器中启动游戏，走到村口告示牌前，按 Space/Enter/A 键触发交互，验证弹出居中木板面板
2. 验证面板显示标题"村口告示牌"和正文"你好啊冒险者"，无打字机效果
3. 按交互键关闭面板，验证玩家可恢复移动
4. 面板打开时点击屏幕，验证面板关闭
5. 面板打开时尝试移动，验证玩家被锁定
6. 在手机端（或模拟触屏）验证 A 按钮触发和关闭交互
7. TypeScript 编译通过（`npx tsc --noEmit`）

## 子任务 Agent 执行方式

对每个待执行子任务，使用 Agent 工具串行执行：

**Agent 配置：**
- subagent_type: general-purpose
- 串行执行，等待上一个子任务完成后再启动下一个

**Agent Prompt 构造方式：**

读取 `.claude/plugins/devpipe/skills/coding/references/coding-agent-prompt.md` 中 "---" 之间的 Agent Prompt 内容，替换以下占位符：
- `[WORKING_DIRECTORY]` → /home/hexueyuan/index
- `[TASK_DESCRIPTION]` → 从 TaskGet 获取子任务的完整描述
- `[MODULE_NAME]` → 子任务所属模块名称
- `[STANDARDS_DOCS]` → 无适用的模块开发规范文档（.claude/docs/ 目录不存在，跳过规范文档读取步骤）

**特殊说明（覆盖模板默认行为）：**
- 本项目无自动化测试套件（无 jest/vitest/mocha 配置），Agent **不要编写单测文件、不要执行 `npm test`**
- 验证方式为 TypeScript 编译检查：`npx tsc --noEmit`
- 功能验证通过浏览器手动测试完成（不在 Agent 范围内）

## 提交方式

所有子任务完成后，由主对话在 coding 阶段统一处理：
1. TypeScript 编译检查（`npx tsc --noEmit`）
2. git add src/ui/InspectPanel.ts src/scenes/MainScene.ts
3. git commit -m "#7 Separate InspectPanel from DialogBox for sign interactions."
4. 自动进入 review-and-fix 阶段

要点：每个 git 命令独立执行（不用 `&&`），只 add 具体的源代码文件，不要添加 devpipe 状态文件。
- 首次提交: git add → git commit -m "#7 Separate InspectPanel from DialogBox for sign interactions."
- review 修复后（review-and-fix 阶段）: git add → git commit -m "#7 Fix review comments."
- 推送（review-and-fix 阶段）: git push origin HEAD:feature-inspect-panel-intera
- 创建 PR（review-and-fix 阶段）: gh pr create --base main
