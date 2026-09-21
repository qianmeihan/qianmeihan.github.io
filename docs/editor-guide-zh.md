# 钱美含作品集编辑器使用说明

公开网页供访客只读浏览。只有持有钱美含 GitHub 仓库写入权限和专用访问令牌的人，才能通过 `/admin/` 修改内容。

## 首次准备

1. 登录钱美含自己的 GitHub 账号。
2. 按照 GitHub 官方的[细粒度个人访问令牌说明](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)创建 Fine-grained personal access token。
3. Resource owner 选择 `qianmeihan`。
4. Repository access 选择 `Only select repositories`，并且只选择 `qianmeihan/qianmeihan.github.io`。
5. Repository permissions 中只把 `Contents` 设为 `Read and write`；其余权限保持默认的最低权限。
6. 设置合理的到期时间，例如 30 天。生成后立即把令牌保存到可信的密码管理器；GitHub 不会再次完整显示它。

## 修改网页

1. 打开 `https://qianmeihan.github.io/admin/`。
2. 选择使用访问令牌登录，并在本人可信设备上粘贴令牌。
3. 打开“钱美含作品集 / Meihan Qian Portfolio”。
4. 每次修改都同时检查中文 `zh` 与英文 `en` 字段。不要只更新一种语言。
5. 图片应上传到编辑器提供的媒体目录，并补齐中英文替代文本、署名、来源网址和使用说明。
6. 保存修改。编辑器会向仓库 `main` 分支提交变更。
7. 在 GitHub 仓库的 Actions 页面等待 “Verify and deploy portfolio” 运行成功，然后检查公开网页。

## 内容安全边界

- 可以公开年龄、邮箱、宝马华晨项目、舍弗勒经历和已公开专利。
- 宝马华晨项目下不要填写当前雇主或公司名称。
- 不要添加手机号、家庭住址、证件号码、薪资、账号密码、令牌、内部供应商身份、保密尺寸、未公开项目细节。
- 不要添加优化算法或生产计划工具内容。
- 不要把行业配图描述为钱美含直接开发的实物产品。
- 不要把访问令牌写入任何网页字段、代码文件、截图、Issue 或提交说明。

## 令牌泄露或设备丢失时

立即前往 GitHub 的个人访问令牌设置页撤销该令牌，随后创建新的仓库专用令牌。旧令牌撤销后，公开网页仍然正常显示，只是编辑器需要使用新令牌重新登录。

Sveltia CMS 官方说明建议技术用户使用访问令牌方式；令牌权限应遵循 GitHub 的最小权限原则，只覆盖这个作品集仓库。
