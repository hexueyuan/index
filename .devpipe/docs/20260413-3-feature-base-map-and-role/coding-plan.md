# 开发计划

## 基本信息

- 开发类型: 新功能
- 功能描述: 构建基础地图和操作角色
- GitHub Issue: #3
- 远程分支: main
- 本地分支: feature-base-map-and-role
- 工作目录: /home/hexueyuan/index
- 创建时间: 2026-04-13
- 需求文档: .devpipe/prd.md

## 需求/问题概述

将当前程序化绘制的简易地图和蓝色方块角色，替换为使用真实像素素材（PokemonLike.png tileset + CharacterAnimation 角色帧）渲染的口袋妖怪风格村庄地图。地图大于屏幕（~2 倍），相机跟随玩家。角色有 4 方向行走动画和 idle 动画。障碍物 tile（树木、房屋、水面）有碰撞阻挡。

## 技术方案

### 素材处理

- `PokemonLike.png`（640×640，40×40 格 16px tiles）复制到 `public/assets/images/`
- 角色动画帧（20 个 16×16 PNG）复制到 `public/assets/sprites/`，按规则重命名，然后用脚本合并为一张 spritesheet（4 列 × 5 行 = 64×80 像素的 `character.png`），行顺序：idle, walk_down, walk_up, walk_left, walk_right
- Phaser preload 中：tileset 用 `load.spritesheet` 加载（frameWidth/Height=16），角色 spritesheet 也用 `load.spritesheet` 加载

### 地图系统

- 使用 Phaser `this.make.tilemap({ data, tileWidth: 16, tileHeight: 16 })` 从 2D 数组创建 tilemap
- 单层方案：Pokemon 风格 tileset 中每个 tile 自包含背景，不需要多层
- **注意 API**：`map.addTilesetImage('tileset', 'tileset')` — 第一个参数是 tileset name（data-based tilemap 中自定义），第二个是 preload 中的 cache key
- 地图尺寸：50 列 × 40 行（原始 50×16=800px × 40×16=640px）
- `src/constants/tiles.ts` 重构：定义 tileset 中各元素的 tile index 常量（grass, path, tree, house, water 等）及碰撞配置
- `src/maps/villageMap.ts` 新建：50×40 的 2D 数组定义村庄布局
- tile index 需要通过查看 PokemonLike.png 实际内容来确定（coding 阶段由 Agent 打开图片识别）

### 碰撞系统

- 在 tilemap layer 上通过 `layer.setCollision([...collidableIndices])` 设置碰撞
- 使用 `this.physics.add.collider(player, layer)` 注册碰撞
- 可碰撞 tile：树木、房屋、水面、地图边界围栏

### 缩放与相机

- **不使用 `layer.setScale(2)`**（会导致碰撞体与视觉位置偏移）
- 改用 `this.cameras.main.setZoom(2)` 整体放大画面，所有对象、碰撞体、相机自动保持一致
- `this.cameras.main.startFollow(player)` 跟随玩家
- `this.cameras.main.setBounds(0, 0, mapPixelWidth, mapPixelHeight)` 限定相机范围（原始像素尺寸，zoom 自动处理缩放）
- 游戏画布保持 800×600（viewport），zoom=2 时实际可视区域为 400×300 原始像素
- 地图原始尺寸 50×16=800px × 40×16=640px，zoom=2 下约 2 倍可视区域

### 角色动画

- 角色 spritesheet `character.png`（64×80，4 列×5 行）用 `load.spritesheet` 加载
- 用 `this.anims.create()` 创建 5 个动画：idle(帧0-3), walk_down(帧4-7), walk_up(帧8-11), walk_left(帧12-15), walk_right(帧16-19)
- 每个动画 4 帧，walk 动画 frameRate=8 repeat=-1，idle frameRate=4 repeat=-1
- Player.update() 中根据速度方向切换动画，速度为 0 时播放 idle
- Player 构造函数中 texture 改为 `'character'`，frame 为 0
- Player **不再需要 `setScale(2)`**，缩放由相机 zoom 统一处理

### 需要移除的旧代码

- `MainScene.generateTileTextures()` — 旧的程序化 tile 纹理
- `MainScene.generatePlayerTexture()` — 旧的蓝色方块纹理
- `MainScene.createMapData()` / `addTerrainFeatures()` — 旧的地图数据生成
- `MainScene.renderMap()` — 旧的逐个 image 渲染
- `tiles.ts` 中的旧 TileType/TILE_TEXTURES 定义

## 涉及模块

| 模块 | 代码路径 | 变更类型 |
|------|----------|----------|
| 素材 | `public/assets/images/`, `public/assets/sprites/` | 新增 |
| 常量 | `src/constants/tiles.ts` | 修改（重写） |
| 地图 | `src/maps/villageMap.ts` | 新增 |
| 场景 | `src/scenes/MainScene.ts` | 修改（重写大部分） |
| 玩家 | `src/objects/Player.ts` | 修改 |

## 适用的模块开发规范

- 无（`.claude/docs/` 不存在）

## 子任务列表

| # | 子任务 | 模块 | 描述 |
|---|--------|------|------|
| 1 | 素材准备与 preload 加载 | 素材/场景 | 复制素材文件到 public/assets/，在 MainScene.preload() 中加载 tileset 和角色帧 |
| 2 | Tilemap 村庄地图、碰撞与相机 | 常量/地图/场景 | 重构 tiles.ts，创建 villageMap.ts 地图数据，用 Phaser Tilemap 渲染地图，设置碰撞和相机跟随 |
| 3 | 角色精灵与行走动画 | 玩家/场景 | 替换蓝色方块为真实角色精灵，添加 4 方向行走动画 + idle，接入 tilemap 碰撞 |

## 子任务详细说明

### 子任务 1: 素材准备与 preload 加载
- **目标**: 将素材文件部署到正确位置，并在 Phaser 中完成加载
- **实现要点**:
  - 将 `.devpipe/16x16RetroTileset/PokemonLike.png` 复制到 `public/assets/images/PokemonLike.png`
  - 将角色动画帧复制到临时目录并重命名（注意不同目录下有同名文件，必须从正确目录复制）：
    - `.devpipe/16x16RetroTileset/CharacterAnimation/Idle/Untitled-0_0.png` → `idle_0.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/Idle/Untitled-0_1.png` → `idle_1.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/Idle/Untitled-0_2.png` → `idle_2.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/Idle/Untitled-0_3.png` → `idle_3.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkDown/Untitled-2_0.png` → `walk_down_0.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkDown/Untitled-2_1.png` → `walk_down_1.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkDown/Untitled-2_2.png` → `walk_down_2.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkDown/Untitled-2_3.png` → `walk_down_3.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkUp/Untitled-2_0.png` → `walk_up_0.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkUp/Untitled-2_1.png` → `walk_up_1.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkUp/Untitled-2_2.png` → `walk_up_2.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkUp/Untitled-2_3.png` → `walk_up_3.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkLeft/Untitled-3_0.png` → `walk_left_0.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkLeft/Untitled-3_1.png` → `walk_left_1.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkLeft/Untitled-3_2.png` → `walk_left_2.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkLeft/Untitled-3_3.png` → `walk_left_3.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkRight/Untitled-3_0.png` → `walk_right_0.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkRight/Untitled-3_1.png` → `walk_right_1.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkRight/Untitled-3_2.png` → `walk_right_2.png`
    - `.devpipe/16x16RetroTileset/CharacterAnimation/WalkRight/Untitled-3_3.png` → `walk_right_3.png`
  - 用 Node.js 脚本（或 Python/canvas）将 20 个 16×16 帧合并为一张 spritesheet `public/assets/sprites/character.png`（4 列 × 5 行 = 64×80 像素），行顺序：idle(行0), walk_down(行1), walk_up(行2), walk_left(行3), walk_right(行4)
  - 在 `MainScene.preload()` 中加载：
    - `this.load.spritesheet('tileset', 'assets/images/PokemonLike.png', { frameWidth: 16, frameHeight: 16 })` 加载 tileset
    - `this.load.spritesheet('character', 'assets/sprites/character.png', { frameWidth: 16, frameHeight: 16 })` 加载角色 spritesheet
  - 删除 `MainScene.generateTileTextures()` 和 `MainScene.generatePlayerTexture()` 方法
- **涉及文件**: `public/assets/images/PokemonLike.png`, `public/assets/sprites/character.png`, `src/scenes/MainScene.ts`
- **验收标准**:
  - `public/assets/images/PokemonLike.png` 存在
  - `public/assets/sprites/character.png` 存在且为 64×80 像素的 spritesheet
  - MainScene.preload() 加载 tileset 和 character spritesheet，无旧的程序化纹理生成代码
  - 项目可编译（`npx tsc --noEmit` 无报错）

### 子任务 2: Tilemap 村庄地图、碰撞与相机
- **目标**: 用真实 tileset 渲染 Pokemon 风格村庄地图，支持 tile 碰撞和相机跟随
- **实现要点**:
  - 用 Read 工具查看 `public/assets/images/PokemonLike.png` 图片，识别各元素对应的 tile index（草地、路径、树木、房屋、水面、围栏等）
  - 重写 `src/constants/tiles.ts`：导出 tile index 常量（如 `GRASS = 某index`, `TREE_TOP = 某index` 等）和碰撞 tile 数组 `COLLIDABLE_TILES: number[]`
  - 新建 `src/maps/villageMap.ts`：导出 50×40 的 2D 数组 `VILLAGE_MAP: number[][]`，设计一个合理的村庄布局（四周树木围栏，中间有草地、路径、几栋房屋、池塘、散落的树木）
  - 重写 `MainScene.create()` 中的地图相关逻辑：
    - `const map = this.make.tilemap({ data: VILLAGE_MAP, tileWidth: 16, tileHeight: 16 })`
    - `const tileset = map.addTilesetImage('tileset', 'tileset')` — 第一个参数是 tileset name，第二个是 cache key；**不要使用 `layer.setScale(2)`**
    - `const layer = map.createLayer(0, tileset, 0, 0)`
    - `layer.setCollision(COLLIDABLE_TILES)`
    - 设置世界边界为地图原始像素尺寸（不乘 scale，zoom 会自动处理）
  - 设置相机（**使用 zoom 替代 setScale 进行缩放**）：
    - `this.cameras.main.setZoom(2)` — 整体 2 倍缩放，避免碰撞体偏移问题
    - `this.cameras.main.setBounds(0, 0, mapPixelWidth, mapPixelHeight)` — 使用原始像素尺寸
    - `this.cameras.main.startFollow(player)`（在 player 创建后）
  - 删除旧方法：`createMapData()`, `addTerrainFeatures()`, `renderMap()`
  - 存储 layer 引用为类属性，供子任务 3 设置碰撞
- **涉及文件**: `src/constants/tiles.ts`, `src/maps/villageMap.ts`（新建）, `src/scenes/MainScene.ts`
- **验收标准**:
  - 地图使用 PokemonLike.png 中的 tiles 渲染，视觉上呈现村庄场景
  - 地图显示尺寸大于 800×600（约 1600×1280）
  - 相机跟随玩家移动，不超出地图边界
  - 障碍物 tile 设置了碰撞
  - 项目可编译（`npx tsc --noEmit` 无报错）

### 子任务 3: 角色精灵与行走动画
- **目标**: 替换蓝色方块为真实角色精灵，实现方向感知的行走动画
- **实现要点**:
  - 在 `MainScene.create()` 中使用 character spritesheet 创建动画（帧号基于 4列×5行布局）：
    ```
    this.anims.create({ key: 'idle', frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'walk_down', frames: this.anims.generateFrameNumbers('character', { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk_up', frames: this.anims.generateFrameNumbers('character', { start: 8, end: 11 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk_left', frames: this.anims.generateFrameNumbers('character', { start: 12, end: 15 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk_right', frames: this.anims.generateFrameNumbers('character', { start: 16, end: 19 }), frameRate: 8, repeat: -1 });
    ```
  - 修改 `Player.ts`：
    - 构造函数中 texture 改为 `'character'`，frame 改为 `0`（idle 第一帧）
    - **不使用 `setScale(2)`**（缩放由相机 zoom 统一处理）
    - 新增 `currentAnim: string` 属性跟踪当前动画
    - `update()` 中根据 velocity 方向播放对应动画：
      - vx < 0 → `play('walk_left', true)`, vx > 0 → `play('walk_right', true)`
      - vy < 0 → `play('walk_up', true)`, vy > 0 → `play('walk_down', true)`
      - vx === 0 && vy === 0 → `play('idle', true)`
    - 避免重复调用 play（检查 `this.anims.currentAnim?.key` 是否已经是目标动画）
  - 在 `MainScene.create()` 中注册 player 与 tilemap layer 的碰撞：
    - `this.physics.add.collider(this.player, layer)`
  - Player body 大小可能需要微调以匹配 16×16 角色尺寸
  - 确保 D-pad 和键盘控制仍正常工作
- **涉及文件**: `src/objects/Player.ts`, `src/scenes/MainScene.ts`
- **验收标准**:
  - 角色使用真实精灵而非蓝色方块
  - 移动时播放对应方向的 4 帧行走动画
  - 停止时播放 idle 动画
  - 角色无法穿过障碍物 tile
  - 键盘和 D-pad 均可正常控制

## 验收标准

1. 地图使用 PokemonLike.png 中的 tiles 渲染，视觉上呈现口袋妖怪风格的村庄场景（有草地、路径、树木、至少一栋房屋）
2. 地图大小大于屏幕，相机跟随玩家移动，不超出地图边界
3. 玩家角色使用 CharacterAnimation 中的精灵，移动时播放对应方向的行走动画，停止时播放 Idle 动画
4. 玩家无法穿过障碍物 tiles（树木、房屋、水面）
5. 键盘方向键和虚拟 D-pad 均可正常控制角色移动

## 测试策略

1. 编译检查：`npx tsc --noEmit` 无报错
2. 构建检查：`npm run build` 成功生成 dist/
3. 视觉验证：启动开发服务器，检查地图渲染、角色动画、相机跟随效果
4. 碰撞验证：尝试走向树木/房屋/水面，确认角色被阻挡
5. 输入验证：键盘方向键和 D-pad 均能控制角色

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

**特别说明：**
- 本项目是前端游戏项目（Phaser 3 + TypeScript + Vite），无后端、无传统单元测试框架
- Agent 执行子任务时，跳过单测编写和覆盖率检查步骤（`.claude/docs/` 不存在）
- 验证方式以编译检查（`npx tsc --noEmit`）和构建检查（`npm run build`）为主

## 提交方式

所有子任务完成后，由主对话在 coding 阶段统一处理：
1. 调用 /simplify skill 执行全量代码优化
2. 如有改动，再次执行编译检查
3. git add → git commit -m "#3 Build base village map and player character with animations."（不 push）
4. 自动进入 review-and-fix 阶段

要点：每个 git 命令独立执行（不用 `&&`），只 add 具体的源代码和测试文件，不要添加 devpipe 状态文件（.devpipe/coding-plan.md、.devpipe/prd.md、.devpipe/context.json）。
- 首次提交: git add → git commit -m "#3 Build base village map and player character with animations."
- review 修复后（review-and-fix 阶段）: git add → git commit -m "#3 Fix review comments."
- 推送（review-and-fix 阶段）: git push origin HEAD:feature-base-map-and-role
- 创建 PR（review-and-fix 阶段）: gh pr create --base main
