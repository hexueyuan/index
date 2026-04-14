# 构建基础地图与操作角色

## 基本信息

| 字段 | 值 |
|------|-----|
| 开发类型 | 新功能 |
| GitHub Issue | #3 |
| 远程分支 | main |
| 本地分支 | feature-base-map-and-role |
| 开发日期 | 2026-04-13 |
| 完成日期 | 2026-04-13 |

## 原始需求

需求来源：GitHub Issue #3「构建基础地图和操作角色」。

项目是一个像素风个人主页游戏，基于 Phaser 3 + TypeScript + Vite 构建。前一个迭代（Issue #1）已搭建基础框架，包含程序化生成的简易地图（纯色方块）和一个蓝色方块角色（无动画）。本次需求是将其升级为口袋妖怪风格的真实视觉效果。

核心要求：
1. 使用 `PokemonLike.png`（640x640，40x40 格 16x16 tileset）渲染一个村庄风格的地图
2. 地图包含草地、路径、树木、房屋、水面等村庄元素
3. 地图大于屏幕（约 2-3 倍），相机跟随玩家移动
4. 玩家角色使用真实精灵 + 4 方向行走动画，停止时播放 idle 动画
5. 障碍物（树木、房屋、水面）有碰撞阻挡

已有素材：`16x16RetroTileset.zip`，包含 tileset 图片和角色行走动画帧（5 方向 x 4 帧）。

业务价值：为后续添加 NPC、交互内容、场景切换打好视觉和玩法基础。让访问者进入一个有沉浸感的像素世界，而非简陋的色块演示。

## 需求分析过程

### 边界确定

通过与用户讨论，明确了本次迭代的范围：
- **做什么**：基于 2D 数组的 tilemap 渲染 + 角色精灵动画 + tile 碰撞
- **不做什么**：不使用 Tiled 编辑器（`.tmx`），不做 NPC/对话/场景切换/音效，不做存档

这个边界选择的理由是：当前最需要的是视觉基础设施，用代码定义地图（2D 数组）虽然编辑不如 Tiled 方便，但避免了引入额外的工具链和地图文件格式解析，对于这个规模的地图（50x40）足够。

### 关键技术约束

1. **单层 tilemap**：分析 PokemonLike.png 后决定使用单层方案。Pokemon 风格 tileset 中每个 tile 自包含背景色，不需要多层叠加。这比多层方案更简单且对 Phaser data-based tilemap 支持更好。
2. **相机缩放替代层缩放**：确定使用 `cameras.main.setZoom(2)` 而非 `layer.setScale(2)`，因为后者会导致物理碰撞体与视觉位置偏移——这是 Phaser 3 的已知陷阱。
3. **角色 spritesheet 需要预合成**：原始素材是 20 个独立 PNG 文件，需要用脚本合并为一张 spritesheet（4 列 x 5 行 = 64x80 像素），以便用 Phaser 的 `load.spritesheet` 统一加载。

### 模块影响分析

变更涉及 5 个模块：素材（新增）、常量（重写）、地图（新增）、场景（重写大部分）、玩家（修改）。其中场景模块改动最大，需要删除全部旧的程序化生成代码，替换为 tilemap 方案。

## 实现方案

### 整体架构

采用 Phaser 3 data-based tilemap 架构：

```
PokemonLike.png (tileset) + VILLAGE_MAP (2D array) → Phaser Tilemap → 渲染层 + 碰撞层
character.png (spritesheet) → Player sprite + 5 组动画 (idle/walk_down/walk_up/walk_left/walk_right)
Camera.setZoom(2) → 全局 2 倍缩放，统一处理碰撞和视觉
```

### 核心模块设计

**tiles.ts（常量层）**：定义 tileset 中各元素的 tile index 常量。通过 `index = row * 40 + col` 计算，将 PokemonLike.png 中 1600 个 tile 映射为语义化常量（`GRASS_1`, `TREE_TOP_LEFT`, `HOUSE_TL` 等）。同时导出 `COLLIDABLE_TILES` 数组，列举所有不可通行的 tile index。

**villageMap.ts（地图数据层）**：50 列 x 40 行的 2D 数组，使用 tiles.ts 中的常量引用。在文件头部定义短别名（如 `const G1 = GRASS_1`）以保持数组可读性。地图布局：四周树木围栏，中间区域有草地、十字路径、几栋房屋、一个池塘、散落的树木和花朵。

**MainScene.ts（场景层）**：preload 加载 tileset 和角色 spritesheet → create 中用 `this.make.tilemap({ data })` 创建 tilemap → 设置碰撞 → 创建角色动画 → 实例化 Player → 注册碰撞器 → 配置相机跟随和缩放。

**Player.ts（玩家层）**：构造函数使用 `'character'` texture，update 方法根据速度向量切换动画（walk_left/right/up/down/idle），使用 `currentAnim` 属性避免重复 play 调用。支持键盘和虚拟 D-pad 双输入。

### 关键设计决策

1. **缩放策略**：选择 `Camera.setZoom(2)` 而非 `layer.setScale(2)`，原因是 Phaser 的物理引擎按原始坐标系计算碰撞体，setScale 会让碰撞和视觉不同步。setZoom 在渲染管线末端统一缩放，不影响物理。

2. **地图尺寸**：50x40 tiles = 800x640 原始像素，zoom=2 后显示为 1600x1280，约为 800x600 viewport 的 2 倍。这个尺寸在「有探索感」和「不至于空旷」之间取得平衡。

3. **角色动画帧率**：idle 4fps（缓慢呼吸感），walk 8fps（流畅但不急促）。每方向 4 帧，repeat=-1 循环播放。

## 问题与解决方案

### 问题 1：Sharp 模块在 linux-arm64 环境不可用

- **现象**：尝试用 Node.js + sharp 库分析 tileset 图片时，`require('sharp')` 抛出错误 `@img/sharp-linux-arm64` 包不存在。
- **原因**：开发容器运行在 linux-arm64 架构上，而 sharp 的预编译二进制只包含了部分平台。npm install sharp 也无法解决（需要 native 编译环境）。
- **解决方案**：改用 Python + Pillow（`pip3 install Pillow`）进行图片分析。Pillow 纯 Python 实现的 PNG 解码无平台限制，在任何架构上都能正常工作。

### 问题 2：Tile index 映射错误导致视觉异常

- **现象**：首次渲染后，地图四周的边界 tile 和树的背景 tile 看起来不对。树木几乎与草地融为一体，无法区分。
- **原因**：初始 tile index 是基于对 tileset 的粗略分析猜测的。例如 tile 0（用作树顶）实际只有单一颜色 `RGB(0,129,0)`，与草地底色完全相同，在 16x16 尺度下无法区分。
- **解决方案**：开发了系统化的 tileset 分析方法论：
  1. 用 Python/Pillow 逐个提取 1600 个 tile 的平均颜色、alpha 值、唯一颜色数
  2. 按颜色分组（草绿、深绿、棕色、黄色、红色、蓝色、紫色、灰色）
  3. 将「唯一颜色数」作为视觉细节指标——1 色 = 纯色块（与背景融合），7+ 色 = 有纹理对比度
  4. 最终选定 tile 320/321/440/441 作为树木（7 种颜色，绿+黑+灰纹理，与草地有明显对比）

### 问题 3：Vite 构建在 linux-arm64 缺少 Rollup 原生模块

- **现象**：`npm run build` 失败，报错 `@rollup/rollup-linux-arm64-gnu` 未安装。
- **原因**：Rollup 的平台特定原生绑定在 `npm install` 时未正确安装（可能因容器环境的 libc 版本问题）。
- **解决方案**：确认这是平台依赖问题而非代码问题。使用 `npx tsc --noEmit` 验证 TypeScript 编译无误，确认代码正确性。实际部署通过 GitHub Actions CI（linux-amd64）完成构建，绕过了本地构建限制。

### 问题 4：SSH mux socket 导致 git push 失败

- **现象**：`git push` 报错 SSH 连接超时。
- **原因**：容器内 SSH 的 ControlMaster 多路复用 socket 状态异常。
- **解决方案**：使用 `GIT_SSH_COMMAND="ssh -o ControlMaster=no"` 禁用 SSH 连接复用后推送成功。

## 反思与复盘

### 做得好的

1. **素材分析方法论有价值**：开发的 Python/Pillow 分析脚本（提取颜色、分组、计算唯一颜色数）形成了可复用的 tileset 分析流程。对于没有文档说明的像素素材，这种定量分析比肉眼猜测可靠得多。

2. **缩放策略选择正确**：一开始就选择了 `Camera.setZoom` 而非 `layer.setScale`，避免了后续碰撞偏移的调试时间。这个经验来自 Phaser 社区的已知陷阱总结。

3. **模块分层清晰**：tiles.ts（常量）→ villageMap.ts（数据）→ MainScene.ts（渲染）→ Player.ts（逻辑）的分层使得后续修改 tile index 只需改 tiles.ts，地图布局只需改 villageMap.ts，互不影响。

### 可以改进的

1. **Tile index 应该更早做精确分析**：第一次提交的 tile index 是粗略猜测的，导致推送后发现视觉问题需要返工（额外一次 commit + push）。建议在 coding 阶段就进行精确的像素级分析，而不是先提交再修。

2. **缺少本地预览验证环节**：由于容器内 Vite 构建有平台限制，无法在本地启动 dev server 预览效果。只能通过 GitHub Pages 部署后查看。未来可以考虑在 CI 中加入截图对比步骤，或在开发环境中解决 Rollup 平台依赖问题。

3. **task-progress.md 的问题记录不够及时**：开发过程中遇到的问题（sharp 失败、tile 映射错误等）未在 Agent 执行时实时写入 task-progress.md 的问题记录章节，而是在总结阶段才回溯。建议在 coding Agent 的 prompt 中强调遇到问题时主动记录。

### 后续建议

- 当前树木、房屋的 tile 映射仍有优化空间（部分边缘 tile 使用了相同 index 作为占位），后续可以进一步精细化
- 地图目前是硬编码的 2D 数组，随着地图变大可考虑引入 Tiled 编辑器 + JSON 导出
- 角色碰撞体大小可能需要根据实际游玩体验微调
