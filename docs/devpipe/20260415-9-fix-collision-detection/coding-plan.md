# 开发计划

## 基本信息

- 开发类型: Bugfix
- 功能描述: 碰撞检测太严格，1 格宽通道难以通过
- GitHub Issue: #9
- 远程分支: main
- 本地分支: fix-collision-detection
- 工作目录: /home/hexueyuan/index
- 创建时间: 2026-04-15
- 需求文档: 无（从 Issue 详情获取）

## 需求/问题概述

玩家碰撞体默认为 16x16（与 sprite 等大），而地图瓦片也是 16x16。在 1 格宽通道中零容差，导致需要反复尝试才能通过。

修复方案：将玩家碰撞体从 16x16 缩小到 10x10，偏移到 sprite 下半部分（脚部区域），每侧留 3px 容差。

## 技术方案

在 `Player` 构造函数中，通过 Phaser Arcade Body 的 `setSize()` 和 `setOffset()` 方法缩小碰撞体：
- 碰撞体尺寸：10x10 px（原 16x16）
- 偏移：x=3, y=6（居中偏下，模拟脚部碰撞）
- 每侧水平容差：3px，足够顺畅通过 16px 宽通道

## 涉及模块

| 模块 | 代码路径 | 变更类型 |
|------|----------|----------|
| Player | src/objects/Player.ts | 修改 |

## 适用的模块开发规范

- 无（项目无 `.claude/docs/` 规范文档）

## 子任务列表

| # | 子任务 | 模块 | 描述 |
|---|--------|------|------|
| 1 | 缩小玩家碰撞体 | Player | 在 Player 构造函数中设置碰撞体为 10x10 并偏移到脚部区域 |

## 子任务详细说明

### 子任务 1: 缩小玩家碰撞体
- **目标**: 将玩家碰撞体从默认 16x16 缩小到 10x10，使玩家能顺畅通过 1 格宽通道
- **实现要点**:
  - 在 `Player` 构造函数中 `scene.physics.add.existing(this)` 之后添加碰撞体设置
  - 调用 `body.setSize(10, 10)` 缩小碰撞体
  - 调用 `body.setOffset(3, 6)` 将碰撞体偏移到 sprite 下半部分（脚部）
- **涉及文件**: src/objects/Player.ts
- **验收标准**:
  - 玩家碰撞体为 10x10，偏移 (3, 6)
  - 玩家能顺畅通过 1 格宽通道，无需反复调整位置
  - 不影响与墙壁、建筑等的正常碰撞

## 验收标准

1. 玩家能顺畅通过 1 格宽通道
2. 与墙壁、水域等不可通行区域的碰撞仍然正常
3. 视觉上玩家 sprite 不会明显嵌入墙壁

## 测试策略

1. 在地图中找到 1 格宽通道，验证玩家能顺畅通过
2. 验证玩家不能穿墙或穿过不可通行区域
3. 验证世界边界碰撞仍然正常

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
- `[STANDARDS_DOCS]` → 无适用的模块开发规范文档

## 提交方式

所有子任务完成后，由主对话在 coding 阶段统一处理：
1. 执行全量单测 + 覆盖率检查
2. git add → git commit -m "#9 Reduce player collision body size for easier narrow passage navigation."（不 push）
3. 自动进入 review-and-fix 阶段（代码优化在评审阶段一并完成）

要点：每个 git 命令独立执行（不用 `&&`），只 add 具体的源代码和测试文件，不要添加 devpipe 状态文件（.devpipe/state/coding-plan.md、.devpipe/state/prd.md、.devpipe/state/context.json）。
- 首次提交: git add → git commit -m "#9 Reduce player collision body size for easier narrow passage navigation."
- review 修复后（review-and-fix 阶段）: git add → git commit -m "#9 Fix review comments."
- 推送（review-and-fix 阶段）: git push origin HEAD:fix-collision-detection
- 创建 PR（review-and-fix 阶段）: gh pr create --base main
