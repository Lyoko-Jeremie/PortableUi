/**
 * basic-components-demo.ts
 *
 * 展示所有 10 个基础组件的典型用法。
 * 运行方式：编译后在浏览器中打开 basic-demo.html，或直接用 ts-node 查看日志。
 *
 * import 路径根据实际打包输出调整（此处假设从项目根目录通过路径别名访问）。
 */

import { Button }     from '../../src/components/basic/Button';
import { Input }      from '../../src/components/basic/Input';
import { Label }      from '../../src/components/basic/Label';
import { TextBox }    from '../../src/components/basic/TextBox';
import { Select }     from '../../src/components/basic/Select';
import { Checkbox }   from '../../src/components/basic/Checkbox';
import { Radio }      from '../../src/components/basic/Radio';
import { Slider }     from '../../src/components/basic/Slider';
import { DatePicker } from '../../src/components/basic/DatePicker';
import { FileUpload } from '../../src/components/basic/FileUpload';

// ─── 工具：创建带标题的区块 ─────────────────────────────────────────────────
function section(title: string): HTMLElement {
  const wrap = document.createElement('section');
  wrap.style.cssText = 'margin: 24px 0; padding: 16px; border: 1px solid #ddd; border-radius: 6px;';

  const h2 = document.createElement('h2');
  h2.style.cssText = 'margin: 0 0 12px; font-size: 14px; color: #555;';
  h2.textContent = title;
  wrap.appendChild(h2);

  document.body.appendChild(wrap);
  return wrap;
}

// ─── 1. Button ──────────────────────────────────────────────────────────────
{
  const wrap = section('Button');

  // 普通按钮
  const btnNormal = new Button({
    text: '点击我',
    onClick: (self) => {
      self.setText('已点击 ✔');
      self.setDisabled(true);
    },
  });
  btnNormal.mount(wrap);

  // 提交按钮
  const btnSubmit = new Button({ text: '提交', type: 'submit' });
  btnSubmit.mount(wrap);

  // 禁用按钮
  const btnDisabled = new Button({ text: '禁用', disabled: true });
  btnDisabled.mount(wrap);

  // 样式定制
  const btnStyled = new Button({
    text: '自定义样式',
    style: { background: '#4f46e5', color: '#fff', borderRadius: '20px', padding: '6px 16px', border: 'none', cursor: 'pointer' },
    onClick: () => alert('自定义按钮被点击'),
  });
  btnStyled.mount(wrap);
}

// ─── 2. Input ───────────────────────────────────────────────────────────────
{
  const wrap = section('Input');
  const output = document.createElement('p');
  output.style.color = '#888';
  output.textContent = '实时值：';

  const label = new Label({ text: '邮箱地址', htmlFor: 'demo-email' });
  label.mount(wrap);

  const input = new Input({
    id: 'demo-email',
    type: 'email',
    placeholder: 'user@example.com',
    autocomplete: 'email',
    onInput: (_self, _e, value) => { output.textContent = `实时值：${value}`; },
    onChange: (_self, _e, value) => console.log('[Input] onChange:', value),
  });
  input.mount(wrap);
  wrap.appendChild(output);

  // 密码框
  const pwdInput = new Input({ type: 'password', placeholder: '密码（最少 8 位）', minLength: 8 });
  pwdInput.mount(wrap);

  // 数字框
  const numInput = new Input({ type: 'number', placeholder: '数量', value: '1' });
  numInput.mount(wrap);
}

// ─── 3. Label ──────────────────────────────���────────────────────────────────
{
  const wrap = section('Label');

  const lbl = new Label({ text: '姓名：', htmlFor: 'demo-name' });
  lbl.mount(wrap);

  const nameInput = new Input({ id: 'demo-name', placeholder: '请输入姓名' });
  nameInput.mount(wrap);

  // 动态更新文字
  const btnToggle = new Button({
    text: '切换语言',
    onClick: () => lbl.setText(lbl.getText() === '姓名：' ? 'Name: ' : '姓名：'),
  });
  btnToggle.mount(wrap);
}

// ─── 4. TextBox ─────────────────────────────────────────────────────────────
{
  const wrap = section('TextBox');

  const tb = new TextBox({
    placeholder: '请输入详细描述...',
    rows: 5,
    resize: 'vertical',
    onChange: (_self, _e, value) => console.log('[TextBox] onChange length:', value.length),
  });
  tb.mount(wrap);

  const btnClear = new Button({
    text: '清空',
    onClick: () => tb.setValue(''),
  });
  btnClear.mount(wrap);

  const btnFill = new Button({
    text: '填入示例',
    onClick: () => tb.setValue('这是一段示例文本。\n可以包含多行内容。'),
  });
  btnFill.mount(wrap);
}

// ─── 5. Select ──────────────────────────────────────────────────────────────
{
  const wrap = section('Select');
  const output = document.createElement('p');
  output.style.color = '#888';

  // 单选
  const citySelect = new Select({
    placeholder: '请选择城市',
    options: [
      { label: '北京', value: 'beijing' },
      { label: '上海', value: 'shanghai' },
      { label: '广州', value: 'guangzhou' },
      { label: '深圳', value: 'shenzhen' },
      { label: '香港（暂停）', value: 'hongkong', disabled: true },
    ],
    onChange: (_self, _e, value) => { output.textContent = `已选城市：${value}`; },
  });
  citySelect.mount(wrap);
  wrap.appendChild(output);

  // 动态更新选项
  const btnSwap = new Button({
    text: '切换为国际城市',
    onClick: () => citySelect.setOptions([
      { label: 'Tokyo', value: 'tokyo' },
      { label: 'London', value: 'london' },
      { label: 'New York', value: 'newyork' },
    ]),
  });
  btnSwap.mount(wrap);

  // 多选
  const multiOutput = document.createElement('p');
  multiOutput.style.color = '#888';
  const multiSelect = new Select({
    multiple: true,
    options: [
      { label: '篮球', value: 'basketball' },
      { label: '足球', value: 'football' },
      { label: '游泳', value: 'swimming' },
      { label: '跑步', value: 'running' },
    ],
    value: ['basketball'],
    onChange: (_self, _e, values) => { multiOutput.textContent = `已选兴趣：${(values as string[]).join(', ')}`; },
  });
  multiSelect.mount(wrap);
  wrap.appendChild(multiOutput);
}

// ─── 6. Checkbox ────────────────────────────────────────────────────────────
{
  const wrap = section('Checkbox');

  const submitBtn = new Button({ text: '提交', disabled: true, type: 'submit' });

  const agreeCheck = new Checkbox({
    label: '我已阅读并同意《用户协议》',
    name: 'agree',
    value: 'yes',
    onChange: (_self, _e, checked) => submitBtn.setDisabled(!checked),
  });
  agreeCheck.mount(wrap);
  submitBtn.mount(wrap);

  // 半选示例
  const wrap2 = document.createElement('div');
  wrap2.style.marginTop = '8px';
  const indeterCheck = new Checkbox({ label: '（半选示例）', indeterminate: true });
  indeterCheck.mount(wrap2);
  wrap.appendChild(wrap2);
}

// ─── 7. Radio ───────────────────────────────────────────────────────────────
{
  const wrap = section('Radio');
  const output = document.createElement('p');
  output.style.color = '#888';
  output.textContent = '未选择';

  const options = ['男', '女', '不愿透露'];
  options.forEach((label, i) => {
    const radio = new Radio({
      name: 'gender',
      label,
      value: String(i),
      checked: i === 0,
      onChange: (_self, _e, checked) => {
        if (checked) output.textContent = `已选：${label}`;
      },
    });
    radio.mount(wrap);
  });
  wrap.appendChild(output);
}

// ─── 8. Slider ──────────────────────────────────────────────────────────────
{
  const wrap = section('Slider');

  // 音量滑块
  const volLabel = new Label({ text: '音量' });
  volLabel.mount(wrap);

  const volSlider = new Slider({
    min: 0, max: 100, step: 1, value: 50,
    onInput: (_self, _e, value) => console.log('[Slider] volume:', value),
  });
  volSlider.mount(wrap);

  // 透明度滑块（步长 0.1）
  const opLabel = new Label({ text: '透明度（0–1）' });
  opLabel.mount(wrap);

  const opSlider = new Slider({
    min: 0, max: 1, step: 0.1, value: 1,
    onChange: (_self, _e, value) => console.log('[Slider] opacity:', value),
  });
  opSlider.mount(wrap);

  // 编程式控制
  const btnReset = new Button({
    text: '重置为 50',
    onClick: () => volSlider.setValue(50),
  });
  btnReset.mount(wrap);
}

// ─── 9. DatePicker ──────────────────────────────────────────────────────────
{
  const wrap = section('DatePicker');
  const output = document.createElement('p');
  output.style.color = '#888';

  const today = new Date().toISOString().slice(0, 10);

  const dp = new DatePicker({
    value: today,
    min: '2020-01-01',
    max: '2030-12-31',
    onChange: (_self, _e, value) => { output.textContent = `已选日期：${value}`; },
  });
  dp.mount(wrap);
  wrap.appendChild(output);

  const btnToday = new Button({
    text: '设为今天',
    onClick: () => dp.setValue(today),
  });
  btnToday.mount(wrap);
}

// ─── 10. FileUpload ─────────────────────────────────────────────────────────
{
  const wrap = section('FileUpload');
  const fileList = document.createElement('ul');
  fileList.style.color = '#444';

  // 图片上传
  const imgLabel = new Label({ text: '上传图片' });
  imgLabel.mount(wrap);

  const imgUpload = new FileUpload({
    accept: 'image/png, image/jpeg, image/gif',
    multiple: true,
    onChange: (_self, _e, files) => {
      fileList.innerHTML = '';
      files.forEach(f => {
        const li = document.createElement('li');
        li.textContent = `${f.name} (${(f.size / 1024).toFixed(1)} KB)`;
        fileList.appendChild(li);
      });
    },
  });
  imgUpload.mount(wrap);
  wrap.appendChild(fileList);

  const btnClear = new Button({
    text: '清空选择',
    onClick: () => {
      imgUpload.clearFiles();
      fileList.innerHTML = '';
    },
  });
  btnClear.mount(wrap);

  // 文档上传（单文件）
  const docLabel = new Label({ text: '上传文档（PDF/Word）' });
  docLabel.mount(wrap);

  const docUpload = new FileUpload({
    accept: '.pdf,.doc,.docx',
    onChange: (_self, _e, files) => console.log('[FileUpload] doc:', files[0]?.name),
  });
  docUpload.mount(wrap);
}

