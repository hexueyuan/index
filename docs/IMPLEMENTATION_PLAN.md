# Southland 村庄 - 项目实施计划

## 项目愿景

一个 Pokemon 风格的像素艺术村庄，名为 **Southland**。玩家以访客身份探索村庄，通过 NPC 对话、可交互道具、房间布置、日记、隐藏区域等方式，了解村长（站点主人）的性格、爱好、工作经历和隐藏彩蛋。

## 当前进度

- [x] Phaser 3 + TypeScript + Vite 项目脚手架
- [x] 基于 Tiled 的村庄地图（50x40 tiles），包含 basic/building/terrain/collision 图层
- [x] 玩家角色，带 4 方向行走动画
- [x] 碰撞系统（树木、水域、房屋、围栏）
- [x] 键盘 + 虚拟方向键操控
- [x] GitHub Pages 部署

---

## 实施步骤

### Step 1：对话系统

**目标**：构建所有文字交互的基础 UI 组件。

**为什么先做**：NPC、告示牌、日记、道具最终都需要"显示一段文字"，这是所有叙事内容的载体，且不需要任何地图知识，纯写代码即可。

**具体任务**：

1. 创建 `src/ui/DialogBox.ts`
   - 屏幕底部半透明黑色背景框
   - 白色文字逐字显示（打字机效果）
   - 按空格/回车翻到下一页
   - 最后一页按键后关闭对话框
   - 对话进行时玩家不能移动

2. 对话数据结构：
   ```ts
   // 一段对话就是一个字符串数组
   const dialog = [
     "你好，欢迎来到 Southland！",
     "我是这个村庄的老居民。",
     "村长是一个很有趣的人呢……"
   ];
   ```

3. 在 MainScene 里测试：按空格键弹出一段固定对话，验证效果

**新增文件**：`src/ui/DialogBox.ts`
**修改文件**：`src/scenes/MainScene.ts`、`src/objects/Player.ts`

---

### Step 2：交互触发机制

**目标**：让玩家能通过靠近 + 按键的方式与地图上的物体互动。

**需要学习的 Tiled 技能**：添加对象层（Object Layer）+ 设置自定义属性。比画 tile 简单得多——就是在地图上画矩形、填属性。

**具体任务**：

1. **在 Tiled 中操作**：添加对象层，命名为 `interactions`
   - 用矩形工具在告示牌/门口/NPC 位置画一个矩形区域
   - 在右侧属性面板给每个矩形设置自定义属性：
     - `type`："sign"（告示牌）/ "door"（门）/ "npc_spawn"（NPC 出生点）
     - `message`：对话文本内容（用于告示牌）
     - `target`：目标场景名（用于门）
     - `dialogId`：对话数据引用 ID（用于 NPC）

2. **在代码中读取对象层**：
   ```ts
   // MainScene.create() 中
   const interactionObjects = map.getObjectLayer('interactions');
   for (const obj of interactionObjects.objects) {
     // obj.x, obj.y = 位置
     // obj.properties = 你在 Tiled 设的自定义属性
     // 根据 type 创建不同的交互区域
   }
   ```

3. **交互流程**：
   - 玩家与 zone 重叠 → 显示"按 E 交互"提示图标
   - 按 E 键 → 调用 Step 1 的对话系统显示 message
   - 对话关闭 → 提示消失，玩家恢复控制

**新增文件**：`src/objects/InteractionZone.ts`
**修改文件**：`src/scenes/MainScene.ts`、`public/assets/maps/village.tmj`

---

### Step 3：展示面板（InspectPanel）与交互类型分离

**目标**：将"对话"和"查看/阅读"两种交互类型分离，构建独立的展示面板组件。

**为什么要做这一步**：当前告示牌复用了 `DialogBox`（对话系统），但告示牌、照片、日记等本质是"阅读/展示"而非"对话"。两者在语义、视觉风格和交互方式上都有差异，混用会导致后续扩展困难。

#### 交互类型划分

| 类型 | 组件 | 场景 | UI 特征 |
|------|------|------|---------|
| **Dialog（对话）** | `DialogBox` | NPC | 说话者名字 + 角色颜色、打字机效果、多轮翻页 |
| **Inspect（查看）** | `InspectPanel` | 告示牌、照片、日记、道具 | 无说话者、标题+正文、可按类型定制样式 |

#### 具体任务

1. **新建 `src/ui/InspectPanel.ts`**
   - 数据结构：
     ```ts
     interface InspectContent {
       type: 'sign' | 'photo' | 'diary' | 'item';  // 后续可扩展
       title?: string;        // 如 "村口告示牌"
       text?: string;         // 文字内容（告示牌/日记）
       image?: string;        // 图片资源 key（照片/道具）
     }
     ```
   - 告示牌：屏幕中央面板，标题 + 正文，直接显示全文，按键关闭
   - 照片：展示图片，可附带标题/描述
   - 日记：多页翻页浏览（复用翻页逻辑，但样式独立于对话框）
   - 共用 `player.lock/unlock` 逻辑

2. **视觉风格差异化**
   - `DialogBox`（对话）：屏幕底部、半透明黑底、逐字显示 → 保持不变
   - `InspectPanel`（告示牌）：屏幕中央、羊皮纸/木板风格背景、直接显示全文
   - `InspectPanel`（照片/日记）：较大面板或全屏、带关闭按钮

3. **改造 `MainScene` 交互层**
   - `interactiveObjects` 数据结构扩展：
     ```ts
     interface InteractiveObject {
       x: number;
       y: number;
       dialog?: DialogLine[];       // NPC 对话 → 走 DialogBox
       inspect?: InspectContent;    // 查看/展示 → 走 InspectPanel
     }
     ```
   - `tryInteract` 根据 `dialog` / `inspect` 字段分流到不同组件
   - 告示牌解析从生成 `dialog` 改为生成 `inspect`

4. **Tiled 地图侧**
   - 无需改动。已有的 `type` 字段（`sign`）天然区分类型
   - 后续新增 `photo`、`diary`、`item` 等 type，解析时分流到 `inspect`

#### 计划放置的可交互道具

| 道具 | 位置 | type | 内容 |
|------|------|------|------|
| 村口告示牌 | 村庄入口附近 | sign | "欢迎来到 Southland！这里是村长 HXY 的领地。" |
| 信箱 | 村长家门口 | item | 联系方式 / 邮箱 |
| 花园石碑 | 花园区域 | sign | 喜欢的一句话 / 座右铭 |
| 公告栏 | 村庄广场 | sign | 自我介绍 / 近况更新 |
| 池塘边的石头 | 池塘旁 | sign | 一段随想或感悟 |

**新增文件**：`src/ui/InspectPanel.ts`
**修改文件**：`src/scenes/MainScene.ts`、`public/assets/maps/village.tmj`

---

### Step 4：场景切换（室内地图）

**目标**：玩家可以进入建筑，探索独立的室内场景。每栋房子有自己的室内地图。

**具体任务**：

1. **用 Tiled 创建室内地图**
   - `public/assets/maps/house_main.tmj` — 村长的家（约 15x12 tiles）
   - `public/assets/maps/library.tmj` — 图书馆/档案室（约 15x12 tiles）
   - `public/assets/maps/house_neighbor.tmj` — 邻居的家（约 12x10 tiles）
   - 室内地图比室外简单：地板铺满，墙壁围一圈，家具放在上层
   - 每个室内地图同样添加 `interactions` 对象层

2. **在 Tiled 中标记门的传送点**
   - 室外地图的门对象：`type: "door"`, `target: "house_main"`, `spawnX: 7`, `spawnY: 10`
   - 室内地图的出口对象：`type: "door"`, `target: "village"`, `spawnX: 25`, `spawnY: 8`

3. **代码实现场景切换**
   - 创建通用的 `src/scenes/MapScene.ts`，可以加载任意 .tmj 地图
   - 玩家踩到 door 交互区域 → 画面淡出 → 切换场景 → 画面淡入
   - 复用 Step 2 的交互系统

4. **室内内容设计**
   - **村长的家**：书架（技术书）、电脑桌、墙上照片、喜欢的物品——每个可交互都显示一段描述
   - **图书馆**：日记书架，记录你的工作经历时间线
   - **邻居的家**：一些暗示你爱好的随意物品

**室内地图设计小技巧**：
- 不需要树墙边界，用墙壁 tile 即可
- 地板用一种 tile 铺满，上面叠放家具层
- 先做一个最简单的空房间跑通流程，再慢慢加家具

**新增文件**：`src/scenes/MapScene.ts`、室内 .tmj 地图文件
**修改文件**：`src/scenes/MainScene.ts`（或重构为 MapScene）

---

### Step 5：NPC 系统

**目标**：在村庄中放置角色，通过对话揭示村长的性格和故事。

**具体任务**：

1. **在 Tiled 对象层标记 NPC 出生点**
   - `type: "npc"`, `name: "老村民"`, `dialogId: "old_villager_1"`, `sprite: "npc_elder"`

2. **创建 NPC 精灵**
   - 最简单的做法：复用 character.png 的 spritesheet 格式，换不同颜色的角色图
   - NPC 站在原地播放 idle 动画
   - （可选）简单巡逻：在两个点之间来回走

3. **集中管理对话数据**
   - 创建 `src/data/dialogs.ts`，所有对话内容统一管理，通过 dialogId 引用

4. **NPC 交互**：玩家靠近 NPC → 按 E → 播放对话（复用 Step 2 机制）

**计划 NPC 角色（3~5 个）**：

| NPC | 位置 | 身份 | 揭示的内容 |
|-----|------|------|-----------|
| 老村民 | 村庄广场 | 长期居民 | 性格特点（"村长这个人啊……"） |
| 图书管理员 | 图书馆内 | 知识守护者 | 引导玩家阅读日记/工作经历 |
| 邻居/好友 | 房屋附近 | 亲近的朋友 | 兴趣爱好、推荐喜欢的东西 |
| 旅行者 | 村庄入口 | 外来视角 | 第三人称评价，增加趣味性 |
| 神秘 NPC | 隐藏位置 | 彩蛋角色 | 特殊内容，特定条件下出现 |

**新增文件**：`src/objects/NPC.ts`、`src/data/dialogs.ts`、NPC 精灵图资源
**修改文件**：`src/scenes/MainScene.ts`（或 MapScene）

---

### Step 6：丰富内容与彩蛋

**目标**：填充世界内容，添加隐藏惊喜，让村庄有灵魂。

#### 需要实现的内容

**村长的家（室内）**：
- 书架 → 喜欢的技术书籍列表
- 电脑桌 → GitHub 项目 / 作品集链接
- 墙上照片 → 有意义的生活瞬间
- 奖杯架 → 成就和证书
- 床 / 桌面物品 → 揭示性格的趣味描述

**图书馆/档案室**：
- 日记系统 — 通过 `InspectPanel`（type: diary）多页翻阅，展示工作经历时间线
  - 教育经历
  - 工作经验条目
  - 重点项目总结
  - 学习里程碑
- 每本日记作为书架上的独立可交互物品

**室外区域**：
- 花园 → 兴趣爱好 / 放松方式
- 池塘区域 → 反思性 / 哲理性的想法
- 隐藏的林间小路 → 通向秘密区域

#### 彩蛋设计

| 彩蛋 | 触发方式 | 内容 |
|------|---------|------|
| 池塘钓鱼 | 在池塘边连按 3 次 E | "你在水中看到了自己的倒影……和一只鱼？！" |
| 隐藏房间 | 穿过树墙的缺口 | 秘密区域，有特殊 NPC 或信息 |
| NPC 彩蛋对话 | 与同一个 NPC 对话 10 次以上 | 他们会说完全不同的话 |
| 密码解谜 | 按特定顺序与物体交互 | 解锁隐藏内容或成就 |
| 宠物 | 地图隐藏角落 | 一只猫/狗，短暂跟随你 |

#### 氛围打磨（可选，优先级低）

- 背景音乐 / 环境音效（资源放 `public/assets/audio/`）
- 昼夜系统（色调叠加层）
- 粒子效果（水面波纹、花瓣飘落）
- 动态 tile（水面波动、花朵摇摆）

**新增文件**：`src/data/diaries.ts`、`src/data/easter_eggs.ts`

---

## 目标架构

```
src/
  main.ts                  # 入口文件
  game.ts                  # Phaser 游戏配置
  scenes/
    MapScene.ts            # 通用场景，可加载任意 .tmj 地图
  objects/
    Player.ts              # 玩家角色
    NPC.ts                 # NPC 角色
    InteractionZone.ts     # 不可见的交互触发区域
  ui/
    DialogBox.ts           # NPC 对话组件（屏幕底部、打字机效果）
    InspectPanel.ts        # 查看/展示组件（告示牌、照片、日记、道具）
    InteractionPrompt.ts   # "按 E 交互" 浮动提示
  data/
    dialogs.ts             # 所有 NPC/告示牌的对话内容
    diaries.ts             # 日记/工作经历时间线条目
    easter_eggs.ts         # 彩蛋触发定义
  constants/
    tiles.ts               # Tile 索引常量（已有）

public/assets/
  maps/
    village.tmj            # 主室外地图
    house_main.tmj         # 村长的家（室内）
    library.tmj            # 图书馆（室内）
    house_neighbor.tmj     # 邻居的家（室内）
    hidden_room.tmj        # 隐藏房间
  images/
    PokemonLike.png        # Tileset（已有）
  sprites/
    character.png          # 玩家 spritesheet（已有）
    npc_elder.png          # 老村民 spritesheet
    npc_librarian.png      # 图书管理员 spritesheet
    npc_neighbor.png       # 邻居 spritesheet
    npc_traveler.png       # 旅行者 spritesheet
    npc_mystery.png        # 隐藏 NPC spritesheet
  audio/                   # 预留给背景音乐和音效
```

---

## 执行节奏与里程碑

```
Step 1（对话系统）        →  世界能"说话"了
Step 2（交互机制）        →  世界能被"触碰"了
Step 3（展示面板与道具）    →  对话与展示分离，内容开始呈现了
Step 4（场景切换）        →  世界变得丰富了（有室内）
Step 5（NPC 系统）        →  世界有"人"了
Step 6（内容与彩蛋）      →  故事有了灵魂
```

每个步骤完成后都有一个**可展示的成果**，且后续步骤都依赖前面的基础设施。

## 各步骤所需技能与难度

| 步骤 | 需要的技能 | 难度 |
|------|-----------|------|
| Step 1 对话系统 | TypeScript + Phaser UI | 中等 |
| Step 2 交互机制 | Tiled 对象层 + 代码读取 | 中等 |
| Step 3 展示面板与道具 | InspectPanel 组件 + 交互分流 | 中等 |
| Step 4 场景切换 | Tiled 建新地图 + Phaser 场景管理 | 中等 |
| Step 5 NPC 系统 | 精灵图 + 对话数据管理 | 中等 |
| Step 6 内容与彩蛋 | 创意 + 重复利用以上机制 | 低 |
