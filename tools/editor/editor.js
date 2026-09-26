const form = document.querySelector('#editor-form');
const saveButton = document.querySelector('#save');
const reloadButton = document.querySelector('#reload');
const refreshButton = document.querySelector('#refresh-preview');
const status = document.querySelector('#status');
const preview = document.querySelector('#preview');

let draft = null;
let dirty = false;

const labels = {
  meta: '基本设置', profile: '个人资料', hero: '首页首屏', metrics: '核心经验', value: '数值', featured: '重点经历',
  experience: '工作经历', projects: '工程项目', patents: '公开专利',
  skillGroups: '专业能力', education: '教育经历', industryContext: '行业背景', contact: '联系区域',
  updatedAt: '最后更新日期', defaultLocale: '默认语言', name: '姓名', email: '邮箱',
  role: '职位方向', intro: '个人介绍', portrait: '职业照片', links: '外部链接', eyebrow: '眉题',
  title: '标题', heading: '区块标题', paragraphs: '段落', period: '时间', context: '项目 / 公司背景',
  highlights: '工作要点', code: '项目编号', capabilities: '相关能力',
  number: '专利号', status: '状态', engineeringValue: '工程价值', sourceLabel: '来源名称', sourceUrl: '来源网址',
  image: '图片', logo: '学校 / 公司标志', id: '内部标识', items: '能力条目', institution: '学校', degree: '学位',
  description: '说明', invitation: '联系文案', src: '图片路径', alt: '图片替代文本', credit: '图片署名',
  usageNote: '使用说明', label: '链接名称', href: '链接地址', zh: '中文', en: 'English',
};

function labelFor(key) {
  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

function setStatus(message, type = '') {
  status.textContent = message;
  status.className = `status ${type}`.trim();
}

function markDirty() {
  dirty = true;
  saveButton.disabled = false;
  setStatus('有尚未保存的修改');
}

function inputFor(value, key, update) {
  const field = document.createElement('label');
  field.className = 'field';
  const caption = document.createElement('span');
  caption.className = 'field-label';
  caption.textContent = labelFor(key);
  field.append(caption);

  let control;
  if (key === 'defaultLocale') {
    control = document.createElement('select');
    control.innerHTML = '<option value="zh">中文</option><option value="en">English</option>';
    control.value = value;
  } else if (typeof value === 'boolean') {
    control = document.createElement('input');
    control.type = 'checkbox';
    control.checked = value;
  } else if (typeof value === 'number') {
    control = document.createElement('input');
    control.type = 'number';
    control.value = String(value);
  } else if (String(value).length > 58 || ['summary', 'description', 'usageNote'].includes(key)) {
    control = document.createElement('textarea');
    control.value = value;
  } else {
    control = document.createElement('input');
    control.type = key === 'email' ? 'email' : key.toLowerCase().includes('url') || key === 'href' ? 'url' : 'text';
    control.value = value;
  }

  control.addEventListener('input', () => {
    update(
      typeof value === 'number'
        ? Number(control.value)
        : typeof value === 'boolean'
          ? control.checked
          : control.value,
    );
    markDirty();
  });
  field.append(control);

  if (key === 'src') {
    const row = document.createElement('div');
    row.className = 'media-row';
    field.insertBefore(row, control);
    row.append(control);
    const uploader = document.createElement('label');
    uploader.className = 'upload-button';
    uploader.textContent = '上传图片';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      setStatus(`正在上传 ${file.name}…`);
      try {
        const response = await fetch(`/__editor/api/media?filename=${encodeURIComponent(file.name)}`, {
          method: 'POST', body: file, headers: { 'Content-Type': 'application/octet-stream' },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || '图片上传失败');
        control.value = result.path;
        update(result.path);
        markDirty();
        setStatus(`图片已写入代码目录：${result.path}`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : '图片上传失败', 'error');
      }
    });
    uploader.append(fileInput);
    row.append(uploader);
  }

  return field;
}

function isLocalized(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === 2 && typeof value.zh === 'string' && typeof value.en === 'string';
}

function renderValue(value, key, update) {
  if (isLocalized(value)) {
    const group = document.createElement('div');
    group.className = 'localized-group';
    const heading = document.createElement('span');
    heading.className = 'field-label';
    heading.textContent = labelFor(key);
    const grid = document.createElement('div');
    grid.className = 'locale-grid';
    ['zh', 'en'].forEach((locale) => {
      const field = inputFor(value[locale], locale, (next) => {
        value[locale] = next;
        update(value);
      });
      field.querySelector('.field-label').className = 'locale-label';
      grid.append(field);
    });
    group.append(heading, grid);
    return group;
  }

  if (Array.isArray(value)) {
    const group = document.createElement('div');
    group.className = 'array-group';
    const title = document.createElement('p');
    title.className = 'array-title';
    title.textContent = labelFor(key);
    group.append(title);
    value.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'array-item';
      const indexLabel = document.createElement('span');
      indexLabel.className = 'array-index';
      indexLabel.textContent = `${String(index + 1).padStart(2, '0')} / ${String(value.length).padStart(2, '0')}`;
      card.append(indexLabel, renderValue(item, String(index + 1), (next) => {
        value[index] = next;
        update(value);
      }));
      group.append(card);
    });
    return group;
  }

  if (value && typeof value === 'object') {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'object-group';
    const legend = document.createElement('legend');
    legend.textContent = labelFor(key);
    fieldset.append(legend);
    Object.entries(value).forEach(([childKey, childValue]) => {
      fieldset.append(renderValue(childValue, childKey, (next) => {
        value[childKey] = next;
        update(value);
      }));
    });
    return fieldset;
  }

  return inputFor(value, key, update);
}

function renderEditor() {
  form.replaceChildren();
  Object.entries(draft).forEach(([key, value], index) => {
    const section = document.createElement('details');
    section.className = 'section-card';
    section.open = index < 2;
    const summary = document.createElement('summary');
    summary.textContent = labelFor(key);
    const body = document.createElement('div');
    body.className = 'section-body';
    body.append(renderValue(value, key, (next) => { draft[key] = next; }));
    section.append(summary, body);
    form.append(section);
  });
}

async function loadContent() {
  setStatus('正在读取内容…');
  saveButton.disabled = true;
  form.innerHTML = '<div class="loading-card">正在准备编辑器…</div>';
  try {
    const response = await fetch('/__editor/api/content', { cache: 'no-store' });
    if (!response.ok) throw new Error('无法读取 public/content/site.json');
    draft = await response.json();
    dirty = false;
    renderEditor();
    setStatus('内容已载入');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : '读取失败', 'error');
  }
}

async function saveContent() {
  if (!draft || !dirty) return;
  saveButton.disabled = true;
  draft.meta.updatedAt = new Date().toISOString().slice(0, 10);
  setStatus('正在校验并写入代码…');
  try {
    const response = await fetch('/__editor/api/content', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '保存失败');
    draft = result.content;
    dirty = false;
    renderEditor();
    setStatus('已保存到 public/content/site.json', 'saved');
    preview.src = `/?preview=${Date.now()}`;
  } catch (error) {
    saveButton.disabled = false;
    setStatus(error instanceof Error ? error.message : '保存失败', 'error');
  }
}

saveButton.addEventListener('click', saveContent);
reloadButton.addEventListener('click', () => {
  if (!dirty || window.confirm('确定放弃尚未保存的修改吗？')) loadContent();
});
refreshButton.addEventListener('click', () => { preview.src = `/?preview=${Date.now()}`; });
window.addEventListener('beforeunload', (event) => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = '';
});

loadContent();
