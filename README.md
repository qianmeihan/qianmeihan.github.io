# 钱美含个人作品集

这是钱美含的中英文机械工程作品集，公开地址为：

https://qianmeihan.github.io/

公开网页是只读的。编辑器只在自己的电脑上运行，不需要账号、密码或登录验证。

## 最重要的一件事

```text
pnpm editor = 启动本地编辑器
点击保存      = 修改自己电脑里的文件
git push      = 把修改正式发布到互联网
```

只要没有执行 `git push origin main`，线上网页就不会改变。

在本地编辑器中点击“保存到代码”，只会更新这个项目文件夹里的内容。即使关闭编辑器、关闭浏览器或重新启动电脑，也不会自动发布。

## 如何启动编辑器

打开终端，执行：

```bash
cd "/Users/apple/Desktop/人物角色/钱美含/qianmeihan.github.io"
pnpm editor
```

`pnpm editor` 的意思就是启动编辑器。运行后，浏览器会自动打开：

```text
http://127.0.0.1:4173/__editor/
```

- 左侧：修改中英文内容和图片。
- 右侧：预览修改后的网页。
- “保存到代码”：把修改写入本地项目文件。
- 关闭运行命令的终端：停止本地编辑器。

这个地址只在当前电脑启动编辑器时可用，不是公开网站的一部分。

## 修改和保存

1. 运行 `pnpm editor`。
2. 在左侧修改内容，同时检查中文和英文。
3. 如需换图，点击图片路径旁边的“上传图片”。
4. 在右侧预览网页。
5. 点击“保存到代码”。

文字会保存到：

```text
public/content/site.json
```

上传的图片会保存到：

```text
public/media/
```

完成这些操作后，线上网页仍然不会改变。

## 正式发布

确认本地预览没有问题后，在终端执行：

```bash
git status
git diff
git add public/content/site.json public/media
git commit -m "content: update portfolio"
git push origin main
```

如果没有新增或更换图片，可以只提交内容文件：

```bash
git add public/content/site.json
git commit -m "content: update portfolio"
git push origin main
```

推送后，GitHub Actions 会自动检查、构建并发布网页。通常等待一两分钟即可看到更新。

## 撤销尚未发布的修改

如果只是本地修改，而且还没有提交或推送，可以先查看差异：

```bash
git diff
```

不要在不确定时使用强制删除或重置命令。可以先保留修改，或者让 Codex 帮忙检查和恢复指定内容。

## 项目文件结构

```text
qianmeihan.github.io/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml       # GitHub Pages 自动检查和发布流程
├── docs/
│   ├── editor-guide-zh.md          # 更详细的中文编辑说明
│   ├── image-sources.md            # 网络图片来源和使用说明
│   └── superpowers/                # 项目设计与实施记录
├── public/
│   ├── content/
│   │   └── site.json               # 网页的中英文文字内容
│   ├── media/                      # 头像、学校/公司标志、专利图和行业图片
│   ├── favicon.svg                 # 浏览器标签图标
│   ├── og-cover.svg                # 社交平台分享封面
│   └── robots.txt                  # 搜索引擎规则
├── src/
│   ├── components/                 # 首页、经历、项目、专利等页面组件
│   ├── content/                    # 内容格式、读取和公开规则检查
│   ├── editor/                     # 编辑器是否保持本地的自动测试
│   ├── hooks/                      # 语言和主题状态
│   ├── lib/                        # 中英文切换等通用逻辑
│   ├── styles/                     # 颜色、排版、桌面和手机响应式样式
│   ├── test/                       # 测试环境设置
│   ├── App.tsx                     # 整个公开网页的结构入口
│   └── main.tsx                    # React 启动入口
├── tests/
│   └── e2e/
│       └── portfolio.spec.ts       # 浏览器端到端测试
├── tools/
│   ├── build/
│   │   └── portraitPreload.ts      # 构建时按当前头像自动生成预加载提示
│   └── editor/
│       ├── index.html              # 本地编辑器页面
│       ├── editor.css              # 本地编辑器样式
│       ├── editor.js               # 可视化编辑交互
│       └── localEditorServer.ts    # 本地读取、校验和保存接口
├── index.html                      # 公开网页 HTML 入口
├── package.json                    # pnpm 命令和项目依赖
├── pnpm-lock.yaml                  # 固定依赖版本
├── playwright.config.ts            # 浏览器测试配置
├── vite.config.ts                  # 开发、编辑器和构建配置
└── vitest.config.ts                # 单元测试配置
```

以下目录由工具自动生成，不需要手动编辑：

```text
node_modules/   # 安装的项目依赖
dist/           # 构建后的公开网页
test-results/   # 自动测试结果
```

## 常用命令

```bash
pnpm editor       # 启动本地可视化编辑器
pnpm dev          # 启动普通开发预览
pnpm test         # 运行单元和内容规则测试
pnpm build        # 构建公开网页
pnpm test:e2e     # 运行真实浏览器测试
pnpm check        # 运行单元测试并构建网页
```

## 内容边界

下载简历是经本人明确确认公开的原始中文版 PDF，包含手机号、期望薪资及当前公司名称。下列限制仍适用于网页正文。下载文件位于 `public/downloads/meihan-qian-resume.pdf`；以后替换这个文件并提交、推送即可更新，首屏和联系区共用同一下载地址。

- 可以公开年龄、邮箱、宝马华晨项目、舍弗勒经历和公开专利。
- 不公开当前公司的名称。
- 不公开手机号、家庭地址、证件号码、薪资、账号密码和保密项目资料。
- 不添加优化算法、库存优化或生产计划工具内容。
- 行业配图只用于说明相关技术领域，不表示图片中的产品均由钱美含本人设计。

## 主要公开链接

- GitHub：https://github.com/qianmeihan
- LinkedIn：https://www.linkedin.com/in/qianmeihan/
- 公开专利：https://eureka.patsnap.com/patent/CN223978857U
