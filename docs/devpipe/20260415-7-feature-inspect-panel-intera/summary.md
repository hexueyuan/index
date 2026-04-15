# 展示面板（InspectPanel）与交互类型分离

## 基本信息

| 字段 | 值 |
|------|-----|
| 开发类型 | 新功能 |
| GitHub Issue | #7 |
| 远程分支 | main |
| 本地分支 | feature-inspect-panel-intera |
| 开发日期 | 2026-04-15 |
| 完成日期 | 2026-04-15 |
| PR | https://github.com/hexueyuan/index/pull/8 |

## 原始需求

需求来源于 GitHub Issue #7，属于项目个人主页游戏的第三步迭代计划。

**核心问题**：当前告示牌（sign）复用了 `DialogBox`（对话系统）来展示内容，但告示牌、照片、日记等本质是"阅读/展示"而非"对话"。两者在语义、视觉风格和交互方式上存在明显差异——对话框位于屏幕底部、半透明黑底、逐字打字机效果，而告示牌应该位于屏幕中央、有主题风格背景、直接显示全文。

**业务价值**：将"查看/展示"和"对话"两种交互类型在架构上分离，为后续扩展（照片、日记、道具等查看类交互）奠定基础。如果继续混用 DialogBox，每新增一种展示类型都需要在对话系统中做特殊处理，耦合度会越来越高。

Issue 中还规划了 5 个可交互道具（村口告示牌、信箱、花园石碑、公告栏、池塘边石头），但本次迭代仅做架构分离，不新增道具。

## 需求分析过程

### 范围裁剪

Issue 原始规划包含 4 种内容类型（sign/photo/diary/item）和 5 个地图道具。经讨论后决定：

- **本次仅实现 sign 类型**，数据结构预留 type 字段供后续扩展。理由是先验证架构设计的可行性，其他类型可以后续增量添加。
- **不新增地图道具**，仅迁移现有的"村口告示牌"。这样改动最小化，方便验证效果。

### 视觉风格决策

Issue 提到"羊皮纸/木板风格背景"，这面临两个选择：

1. **代码绘制**：用 Phaser Graphics API 绘制像素风仿木板效果（深棕色填充 + 浅棕色边框 + 木纹线条），无需外部素材
2. **图片素材**：使用真实纹理图片做背景，需要额外的美术资源

最终选择**代码绘制**，原因是：项目是像素风格游戏，代码绘制的简洁几何效果与整体风格一致；无需管理额外的图片资源；后续如需更换为图片素材，只需修改 InspectPanel 内部的背景绘制逻辑，不影响外部接口。

### 交互模型分析

InspectPanel 与 DialogBox 的核心差异：

| 维度 | DialogBox（对话） | InspectPanel（查看） |
|------|-------------------|---------------------|
| 位置 | 屏幕底部 | 屏幕中央 |
| 背景 | 半透明黑底 | 木板/羊皮纸风格 |
| 文字显示 | 逐字打字机效果 | 直接显示全文 |
| 角色标识 | 有说话者名字和角色颜色 | 无 |
| 翻页 | 支持多页 | 单页（sign 类型） |
| 关闭方式 | 最后一页按键关闭 | 任意交互键或点击关闭 |

两者共享 `player.lock/unlock` 机制，通过相同的 `onOpen/onClose` 回调接口集成。

## 实现方案

### 架构设计

新增 `InspectPanel` 组件与 `DialogBox` 平行，两者不互相依赖，通过 `MainScene` 的交互分流逻辑协调：

```
MainScene.tryInteract()
  ├── obj.inspect → InspectPanel.show()
  └── obj.dialog  → DialogBox.show()
```

### InspectPanel 组件（`src/ui/InspectPanel.ts`）

- **数据结构**：`InspectContent { type: 'sign' | 'photo' | 'diary' | 'item'; title?: string; text?: string; }` — type 字段预留但当前未使用，添加了 TODO 注释标记
- **视觉绘制**：使用 Phaser Graphics API 绘制三层结构——浅棕色边框（0xDEB887）→ 深棕色填充（0x8B4513）→ 6 条半透明木纹线条（0x7A3B10, alpha 0.4）
- **布局计算**：复用 DialogBox 的 camera zoom 校正公式，确保面板在 2x zoom 下正确居中
- **状态机**：仅 IDLE/SHOWING 两态（比 DialogBox 的 IDLE/TYPING/PAGE_COMPLETE 简单），无打字机效果
- **接口对称性**：与 DialogBox 相同的构造函数签名（scene, onOpen, onClose）和 `isActive` getter

### MainScene 交互层改造（`src/scenes/MainScene.ts`）

- `interactiveObjects` 类型从 `{ dialog: DialogLine[] }` 改为 `{ dialog?: DialogLine[]; inspect?: InspectContent }`
- sign 解析逻辑改为生成 `inspect` 而非 `dialog`，标题取自 Tiled 对象的 `obj.name`
- `handleAction()` 三路分流：DialogBox 活跃 → advance、InspectPanel 活跃 → close、否则 → tryInteract
- `tryInteract()` 增加 InspectPanel 的 early return 检查，匹配后按 inspect/dialog 字段分流

### 关键设计决策

1. **不提取公共基类**：InspectPanel 和 DialogBox 虽然有相似的 lock/unlock 模式，但状态机和渲染逻辑差异很大，强行提取基类会过度抽象。保持两个独立组件更清晰。
2. **不修改 Tiled 地图**：现有的 `type: "sign"` + `text` 属性结构天然支持 InspectContent 的映射，无需改动地图文件。
3. **inspect 优先于 dialog**：当同一对象同时设置了两个字段时，inspect 优先。虽然当前业务不会出现此情况，但选择了更合理的默认行为。

## 问题与解决方案

### 问题 1：pointerdown 事件时序导致面板秒关

- **现象**：代码评审发现潜在问题——如果 show() 在注册 pointerdown 事件后，同一帧的事件传播可能触发 handleClose，导致面板刚打开就被关闭
- **原因**：Phaser 的 input 事件系统中，on('pointerdown') 注册后如果当前帧已有 pointerdown 事件在传播中，可能立即触发回调
- **解决方案**：使用 `scene.time.delayedCall(0, ...)` 延迟一帧注册 pointerdown 事件监听器，确保不会在触发 show 的同一帧内关闭面板

### 问题 2：show() 重复调用导致事件监听器泄漏

- **现象**：如果面板已显示时再次调用 show()，会重复注册 pointerdown 事件监听器（Phaser 的 on() 不去重）
- **原因**：缺少活跃状态的防御性检查
- **解决方案**：在 show() 开头添加 `if (this.visible) return;` 守卫条件

### 问题 3：SSH 多路复用导致 git push 失败

- **现象**：`git push` 报错 `muxserver_listen: link mux listener ... Bad file descriptor`
- **原因**：SSH config 中配置了 `ControlMaster auto` 和 `ControlPath ~/.ssh/%r@%h:%p`，但 Docker 容器环境中 mux socket 文件描述符异常
- **解决方案**：通过 `GIT_SSH_COMMAND="ssh -o ControlMaster=no -o ControlPath=none"` 绕过 SSH 多路复用

## 反思与复盘

### 做得好的地方

- **范围控制**：从 Issue 的完整规划中裁剪出最小可验证的子集（仅 sign 类型 + 仅迁移现有道具），避免了一次性做太多导致的风险
- **接口对称设计**：InspectPanel 与 DialogBox 保持相同的构造函数签名和 isActive 接口，使 MainScene 的集成代码非常简洁
- **代码评审发现真实问题**：3 个 should_fix 问题中，pointerdown 时序问题和重复调用保护是真实的运行时 bug，评审阶段发现比上线后排查高效得多

### 可以改进的地方

- **zoom 计算逻辑重复**：InspectPanel 和 DialogBox 中的 camera zoom 可见区域计算代码完全相同，应提取为共享工具函数。评审中作为 nice_to_have 跳过了，后续应处理
- **depth 魔法数字**：两个 UI 组件都硬编码 depth 1000，应提取为共享常量

### 后续待办

- 实现 photo/diary/item 类型的 InspectPanel 渲染逻辑（根据 type 字段切换面板风格）
- 在地图上新增更多可交互道具（花园石碑、公告栏、池塘边石头等）
- 提取 UI 组件的公共常量和工具函数（zoom 计算、depth 值等）
- 考虑为 InspectPanel 添加打开/关闭动画（淡入淡出或缩放效果）
