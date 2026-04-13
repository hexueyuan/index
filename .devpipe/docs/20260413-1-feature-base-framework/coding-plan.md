# 开发计划

## 基本信息

- 开发类型: 新功能
- 功能描述: 基础框架搭建
- GitHub Issue: #1
- 远程分支: main
- 本地分支: feature/base-framework
- 工作目录: /home/hexueyuan/index
- 创建时间: 2026-04-13
- 需求文档: .devpipe/prd.md

## 需求/问题概述

搭建像素风个人介绍网站的基础框架，部署在 GitHub Pages（`hexueyuan.github.io/index`）。

本期交付：
1. GitHub Pages 自动部署配置（GitHub Actions）
2. Phaser 3 + Vite + TypeScript 代码库结构
3. 可渲染像素风场景的主场景（使用 Kenney.nl 开源素材）
4. 可通过键盘方向键和触屏控制的角色移动
5. 文档与资源目录结构规划

## 技术方案

**渲染引擎**：Phaser 3 —— 内置 Tilemap、精灵动画、输入管理（键盘/触屏）、场景管理，是像素风2D游戏的主流选择，便于后续扩展 NPC 和对话系统。

**构建工具**：Vite + TypeScript —— 开发速度快，构建产物为纯静态文件，直接托管在 GitHub Pages。

**部署方案**：GitHub Actions 在 push 到 `main` 时自动构建，部署 `dist/` 到 `gh-pages` 分支；Vite base 配置为 `/index/`。

**像素素材**：使用 Kenney.nl 免费像素素材包（如 Tiny Dungeon 或 1-Bit Pack，16×16 瓦片），包含地形瓦片和角色精灵。

**地图渲染**：用 Phaser 的 `StaticTilemapLayer` + 硬编码二维数组定义初始场景（20×15 瓦片），无需外部地图编辑器。

**移动控制**：键盘方向键使用 Phaser 内置 `CursorKeys`；移动端使用页面上叠加的虚拟方向键按钮（HTML/CSS + Phaser input 事件）。

## 涉及模块

| 模块 | 代码路径 | 变更类型 |
|------|----------|----------|
| 项目配置 | package.json, vite.config.ts, tsconfig.json, index.html | 新增 |
| CI/CD | .github/workflows/deploy.yml | 新增 |
| 游戏入口 | src/main.ts, src/game.ts | 新增 |
| 主场景 | src/scenes/MainScene.ts | 新增 |
| 玩家对象 | src/objects/Player.ts | 新增 |
| 游戏素材 | public/assets/ | 新增 |
| 文档目录 | docs/, README.md | 新增 |

## 适用的模块开发规范

（无 .claude/docs/ 规范文档）

## 子任务列表

| # | 子任务 | 模块 | 描述 |
|---|--------|------|------|
| 1 | 项目初始化与构建配置 | 项目配置/CI | 搭建 Vite+TS+Phaser3 项目骨架，配置 GitHub Pages 自动部署 |
| 2 | 基础像素场景渲染 | 主场景 | 创建 Phaser 主场景，加载开源瓦片素材，渲染简单地图 |
| 3 | 角色移动控制 | 玩家对象 | 添加玩家精灵，实现键盘方向键移动，添加移动端虚拟方向键 |
| 4 | 资源目录规划与文档 | 文档目录 | 规划 docs/ 和 public/assets/ 目录结构，补充 README |

## 子任务详细说明

### 子任务 1: 项目初始化与构建配置

- **目标**: 建立可运行、可构建、可自动部署到 GitHub Pages 的 Vite+TS+Phaser3 项目骨架
- **实现要点**:
  - 初始化 package.json，安装 `phaser`、`vite`、`typescript` 依赖
  - 创建 `vite.config.ts`，设置 `base: '/index/'`
  - 创建 `tsconfig.json`，配置合理的 TypeScript 编译选项
  - 创建 `index.html`，引入 `src/main.ts` 作为入口
  - 创建 `src/main.ts`（空占位）和 `src/game.ts`（Phaser.Game 配置骨架）
  - 创建 `.github/workflows/deploy.yml`：push 到 `main` 分支时触发，执行 `npm ci && npm run build`，使用 `peaceiris/actions-gh-pages` 将 `dist/` 部署到 `gh-pages` 分支
- **涉及文件**:
  - `package.json`
  - `vite.config.ts`
  - `tsconfig.json`
  - `index.html`
  - `src/main.ts`
  - `src/game.ts`
  - `.github/workflows/deploy.yml`
- **验收标准**:
  - `npm run dev` 可正常启动本地开发服务器，浏览器可访问
  - `npm run build` 构建成功，生成 `dist/` 目录
  - `.github/workflows/deploy.yml` 文件结构正确（人工检查 YAML 语法）

### 子任务 2: 基础像素场景渲染

- **目标**: Phaser 主场景能加载像素素材并渲染出一个静态的像素风地图背景
- **实现要点**:
  - 从 Kenney.nl 下载免费像素素材包（优先使用 Kenney Micro Roguelike 或 Tiny Town，16×16 瓦片）；如无法下载，用代码绘制彩色方块作为占位
  - 将素材放置在 `public/assets/tilesets/` 目录
  - 完善 `src/game.ts`，配置 Phaser.Game（canvas 模式，800×600 分辨率）
  - 创建 `src/scenes/MainScene.ts`，继承 `Phaser.Scene`
  - 在 `preload()` 中加载瓦片图像
  - 在 `create()` 中用硬编码二维数组（20×15）创建 `Phaser.Tilemaps.Tilemap`，渲染地形图层（地面 + 边界）
- **涉及文件**:
  - `src/game.ts`（更新）
  - `src/scenes/MainScene.ts`（新增）
  - `public/assets/tilesets/`（素材文件）
- **验收标准**:
  - 浏览器打开后，canvas 区域显示像素风地图背景，无报错
  - 地图有明显的地面和边界区分

### 子任务 3: 角色移动控制

- **目标**: 场景中有可控制的角色精灵，支持键盘方向键移动和移动端虚拟方向键
- **实现要点**:
  - 从已下载的 Kenney 素材中选取角色精灵（或用单色方块占位）
  - 创建 `src/objects/Player.ts`，继承 `Phaser.Physics.Arcade.Sprite`
  - 在 `MainScene` 中启用 Arcade Physics，添加 Player 对象
  - 用 `scene.input.keyboard.createCursorKeys()` 处理方向键输入，实现4方向移动（速度约 100px/s）
  - 角色移动限制在地图边界内（`setCollideWorldBounds(true)`）
  - 在 `index.html` 中添加 HTML 虚拟方向键（上下左右4个按钮，CSS 定位到 canvas 右下角），通过 `pointerdown`/`pointerup` 事件驱动 Player 移动
- **涉及文件**:
  - `src/objects/Player.ts`（新增）
  - `src/scenes/MainScene.ts`（更新）
  - `index.html`（更新：添加虚拟方向键 HTML/CSS）
  - `public/assets/sprites/`（精灵素材）
- **验收标准**:
  - 场景中出现角色，可通过键盘方向键控制上下左右移动
  - 角色不能移出地图边界
  - 移动端（或浏览器触屏模拟）点击虚拟方向键后角色响应移动

### 子任务 4: 资源目录规划与文档

- **目标**: 建立清晰的项目资源目录结构，补充 README，方便后续迭代
- **实现要点**:
  - 确认并完善以下目录结构（已存在的不重复创建）：
    ```
    public/
      assets/
        tilesets/    # 瓦片图像（地形）
        sprites/     # 角色/NPC 精灵图
        images/      # 其他图片素材
        audio/       # 音效（预留）
    docs/
      assets/
        images/      # 文档用截图
        videos/      # 演示视频
      DESIGN.md      # 设计决策记录
    ```
  - 每个目录添加 `.gitkeep` 文件（如目录为空）
  - 创建 `docs/DESIGN.md`，记录技术选型决策（Phaser 3、Vite、素材来源）
  - 更新根目录 `README.md`：项目简介、本地开发步骤（`npm install && npm run dev`）、部署说明、资源目录说明
- **涉及文件**:
  - `public/assets/audio/.gitkeep`
  - `public/assets/images/.gitkeep`（如为空）
  - `docs/assets/images/.gitkeep`
  - `docs/assets/videos/.gitkeep`
  - `docs/DESIGN.md`
  - `README.md`
- **验收标准**:
  - `docs/` 和 `public/assets/` 目录结构完整
  - `README.md` 包含本地开发步骤
  - `docs/DESIGN.md` 记录了核心技术选型

## 验收标准

1. 访问本地开发服务器（`npm run dev`）能看到像素风场景，角色可移动
2. `npm run build` 构建成功无报错
3. GitHub Actions workflow 文件结构正确，push 到 main 后能触发自动部署
4. 代码目录结构清晰：`src/`（源码）、`public/assets/`（游戏素材）、`docs/`（文档）分离
5. 移动端虚拟方向键可触发角色移动

## 测试策略

1. 本地 `npm run dev` 手动测试：键盘控制角色移动、边界碰撞
2. 浏览器开发者工具切换移动设备模拟：测试触屏虚拟方向键
3. `npm run build` 验证构建成功
4. 将构建产物（dist/）托管于本地静态服务器，验证路径配置（`/index/` base）正确

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
- `[STANDARDS_DOCS]` → （无适用规范文档）

## 提交方式

所有子任务完成后，由主对话在 coding 阶段统一处理：
1. 调用 /simplify skill 执行全量代码优化
2. 如有改动，再次执行全量单测 + 覆盖率检查
3. git add → git commit -m "#1 Add base framework with Phaser3, Vite, and GitHub Pages deployment."（不 push）
4. 自动进入 review-and-fix 阶段

要点：每个 git 命令独立执行（不用 `&&`），只 add 具体的源代码和测试文件，不要添加 devpipe 状态文件（.devpipe/coding-plan.md、.devpipe/prd.md、.devpipe/context.json）。
- 首次提交: git add → git commit -m "#1 Add base framework with Phaser3, Vite, and GitHub Pages deployment."
- review 修复后（review-and-fix 阶段）: git add → git commit -m "#1 Fix review comments."
- 推送（review-and-fix 阶段）: git push origin HEAD:feature/base-framework
- 创建 PR（review-and-fix 阶段）: gh pr create --base main
