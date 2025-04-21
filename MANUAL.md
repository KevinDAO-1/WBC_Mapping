# WBC Mapping Project - 使用手册

## 1. 项目简介

本项目是一个基于 Web 的交互式 3D 地图展示应用。用户可以在 3D 地图场景中浏览，点击地图上的特定标记点后，会弹出侧边栏显示该地点的详细信息，包括文本、引用、图片和视频。项目旨在提供优雅、流畅的用户体验。

## 2. 技术栈

*   **前端框架:** React (v18+)
*   **构建工具:** Vite
*   **3D 引擎:** Babylon.js (@babylonjs/core, @babylonjs/loaders, @babylonjs/gui)
*   **动画库:** Framer Motion
*   **语言:** JavaScript (JSX)
*   **包管理器:** npm

## 3. 项目结构

```
/
├── public/                     # 静态资源 (图片, 3D模型, 视频等)
│   ├── assets/
│   │   ├── 2d/                 # 2D 资源 (Logo, 箭头图片)
│   │   ├── 3d/                 # 3D 模型 (.glb)
│   │   ├── images/             # 地点标记图片, 侧边栏内容图片
│   │   └── videos/             # 侧边栏视频
│   └── index.html              # HTML 入口文件
│
├── src/                        # 项目源代码
│   ├── components/             # React UI 组件
│   │   ├── MapCanvas.jsx       # Babylon.js 3D 场景画布和标记点逻辑
│   │   ├── SidePanel.jsx       # 右侧滑出信息面板
│   │   ├── VideoPlayer.jsx     # 视频播放器组件 (含放大/缩小)
│   │   ├── Header.jsx          # 页眉组件
│   │   └── Footer.jsx          # 页脚组件
│   ├── data/                   # 数据配置文件
│   │   ├── locations.json      # 地图标记点位置和图片信息
│   │   ├── contentData.json    # 侧边栏详细内容 (按地点ID组织)
│   │   └── uiElements.json     # 页眉、页脚等静态 UI 元素配置
│   ├── App.jsx                 # 应用主组件 (布局, 状态管理)
│   ├── index.css               # 全局 CSS 样式
│   └── main.jsx                # React 应用入口
│
├── .gitignore                  # Git 忽略配置
├── eslint.config.js            # ESLint 配置文件
├── index.html                  # (Vite 使用的入口，实际在 public 下)
├── package-lock.json           # npm 依赖锁定文件
├── package.json                # 项目依赖和脚本配置
├── README.md                   # (可选) 项目 README
├── vite.config.js              # Vite 配置文件
└── MANUAL.md                   # 本使用手册
```

## 4. 运行项目

1.  **首次运行或依赖更新后:** 打开终端，导航到项目根目录 (`/Users/xiangkaisun/Desktop/VSCode/WBC_Mapping/`)，运行以下命令安装所有必需的库：
    ```bash
    npm install
    ```
    *(通常只需要执行一次，除非添加/删除了库)*

2.  **启动开发服务器:** 在项目根目录下运行：
    ```bash
    npm run dev
    ```

3.  **访问应用:** 打开浏览器，访问终端输出中显示的本地 URL (通常是 `http://localhost:5173/`)。

4.  **(可选) 局域网访问:**
    *   查找您 Mac 的局域网 IP 地址 (系统设置 -> 网络)。
    *   编辑 `vite.config.js` 文件，在 `defineConfig` 中添加 `server: { host: true }`。
    *   停止并重新运行 `npm run dev`。
    *   在同一局域网的其他设备上访问 `http://<您的MacIP地址>:5173`。

## 5. 配置与内容修改

修改网站内容主要通过编辑 `src/data/` 目录下的 JSON 文件完成。**修改并保存 JSON 文件后，通常只需刷新浏览器即可看到更改。**

**重要:** 编辑 JSON 文件时务必遵守严格的语法规则（双引号、逗号、无注释）。

### 5.1 修改地图标记点 (`src/data/locations.json`)

此文件定义了地图上每个标记点的位置和外观图片。它是一个包含多个地点对象的数组 `[...]`。

每个地点对象结构：

```json
{
  "id": "UniqueLocationID", // 必需: 地点的唯一标识符 (字符串)，必须与 contentData.json 中的键匹配
  "position": [x, y, z],     // 必需: 3D 坐标数组 [数字, 数字, 数字] (通常从 Blender 获取)
  "markerImageUrl": "/assets/images/marker_image.jpg" // 必需: 标记点图片框中显示的图片路径 (相对于 public 目录)
}
```

*   **获取坐标:** 在 Blender 中选中代表标记点的物体（或空物体），在变换面板查看 Location X, Y, Z 值。注意 Babylon.js 中 Y 轴通常代表垂直高度。
*   **图片路径:** 确保图片文件存在于 `public/assets/images/` 目录下。

### 5.2 修改侧边栏内容 (`src/data/contentData.json`)

此文件定义了点击每个标记点后，侧边栏显示的内容。它是一个以地点 `id` 为键的对象 `{}`。

每个地点对应的值是一个对象，包含：

```json
"LocationID": { // 必需: 键名必须与 locations.json 中的 id 匹配
  "title": "侧边栏主标题", // 必需: 字符串
  "highlightQuote": "要重点突出显示的引用文字", // 可选: 字符串
  "mainVideoUrl": "/assets/videos/main_video.mp4", // 可选: 主视频路径 (相对于 public)
  "chapters": [ // 必需: 章节数组
    { // 章节对象
      "title": "章节标题", // 必需: 字符串
      "contentBlocks": [ // 必需: 内容块数组
        { 
          "type": "paragraph", // 必需: 内容块类型
          "text": "段落文字内容..." // 必需: 字符串
        },
        { 
          "type": "quote", 
          "text": "普通引用文字...", // 必需: 字符串
          "attribution": "引用来源 (可选)" // 可选: 字符串
        },
        { 
          "type": "highlightQuote", // 注意: 这个类型目前由顶层的 highlightQuote 字段处理，此处的 type 会被忽略，但可以保留 text 和 attribution
          "text": "重点引用文字...", // 必需: 字符串
          "attribution": "来源 (可选)" 
        },
        {
          "type": "image",
          "url": "/assets/images/chapter_image.jpg", // 必需: 图片路径 (相对于 public)
          "alt": "图片描述 (可选)" // 可选: 字符串
        },
        {
          "type": "video",
          "url": "/assets/videos/chapter_video.mp4" // 必需: 视频路径 (相对于 public) 或外部 URL
        }
        // ...更多内容块...
      ]
    }
    // ...更多章节...
  ]
}
```

*   **`contentBlocks` 类型:** 目前支持 `"paragraph"`, `"quote"`, `"image"`, `"video"`, `"highlightQuote"` (顶层优先)。
*   **文件路径:** 图片和视频路径相对于 `public` 目录。

### 5.3 修改页眉/页脚 (`src/data/uiElements.json`)

此文件定义页眉和页脚的静态内容和基础样式。

```json
{
  "header": {
    "style": { /* CSS 样式对象 */ },
    "logo": {
      "imageUrl": "/assets/images/logo.png", // Logo 图片路径
      "altText": "Logo描述",
      "link": "/", // 点击 Logo 跳转链接
      "isExternal": false, // 是否为外部链接
      "style": { /* CSS 样式对象 */ }
    }
    // 可以添加 "nav": [...] 数组来定义导航链接
  },
  "footer": {
     "style": { /* CSS 样式对象 */ },
    "copyright": {
      "text": "版权信息文本",
      "style": { /* CSS 样式对象 */ }
    },
    "links": [ // 页脚链接数组
      {
        "id": "footer-link-1", // 唯一 ID
        "text": "链接文字",
        "url": "/link-path", // 链接地址
        "isExternal": false,
        "style": { /* CSS 样式对象 */ }
      }
      // ...更多链接...
    ]
  }
}
```

*   修改 `text`, `imageUrl`, `link`, `url` 等字段来更新内容。
*   修改 `style` 对象中的 CSS 属性来调整外观（颜色、字体大小、边距等）。

## 6. 资源文件

*   **3D 模型:** 放在 `public/assets/3d/` 目录下 (例如 `mapnewb.glb`)。
*   **标记点图片:** 放在 `public/assets/images/` 目录下 (用于标记点内部显示)。
*   **侧边栏图片:** 放在 `public/assets/images/` 目录下 (用于章节内容)。
*   **Logo 图片:** 放在 `public/assets/images/` 目录下 (或 `public/assets/2d/`)。
*   **箭头图片:** 放在 `public/assets/2d/` 目录下 (`Asset 2.png`)。
*   **视频文件:** 放在 `public/assets/videos/` 目录下。

确保在 JSON 文件中使用的路径与实际文件位置和名称一致。

## 7. (可选) 进一步开发

*   实现侧边栏视频的懒加载和播放控制。
*   实现点击地图背景缩小放大后的视频。
*   为侧边栏或放大视频添加背景模糊效果 (`backdrop-filter`)。
*   优化性能，特别是对于大型 3D 模型和大量标记点。
*   添加更复杂的导航或 UI 元素。
