import {Button, Canvas, Image, Label} from '../../src/components/basic';

const createSvgDataUrl = (title: string, color: string): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <rect width="640" height="360" fill="${color}" />
      <text x="320" y="185" text-anchor="middle" font-size="40" fill="#ffffff" font-family="Arial, sans-serif">${title}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const imageAssets = {
  mountain: createSvgDataUrl('Mountain', '#2563eb'),
  ocean: createSvgDataUrl('Ocean', '#0891b2'),
  sunset: createSvgDataUrl('Sunset', '#ea580c'),
};

export const mountImageDemo = (container: HTMLElement): void => {
  const feedback = document.createElement('p');
  feedback.className = 'demo-feedback';
  feedback.textContent = '已加载：Mountain';

  const image = new Image({
    src: imageAssets.mountain,
    alt: 'Sample mountain background',
    width: 640,
    height: 360,
    loading: 'lazy',
    onLoad: () => {
      feedback.textContent = `已加载：${image.getSrc().includes('Ocean') ? 'Ocean' : image.getSrc().includes('Sunset') ? 'Sunset' : 'Mountain'}`;
    },
    onError: () => {
      feedback.textContent = '图片加载失败，请检查地址。';
    },
  });

  const imageWrap = document.createElement('div');
  imageWrap.className = 'image-wrap';
  image.mount(imageWrap);

  const controls = document.createElement('div');
  controls.className = 'demo-controls';

  new Button({text: 'Mountain', onClick: () => image.setSrc(imageAssets.mountain)}).mount(controls);
  new Button({text: 'Ocean', onClick: () => image.setSrc(imageAssets.ocean)}).mount(controls);
  new Button({text: 'Sunset', onClick: () => image.setSrc(imageAssets.sunset)}).mount(controls);
  new Button({text: '错误地址', onClick: () => image.setSrc('https://invalid.local/404.png')}).mount(controls);

  container.appendChild(imageWrap);
  container.appendChild(controls);
  container.appendChild(feedback);
};

const drawScene = (context: CanvasRenderingContext2D, width: number, height: number): void => {
  context.clearRect(0, 0, width, height);

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#312e81');
  gradient.addColorStop(1, '#0ea5e9');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = 'rgba(255, 255, 255, 0.2)';
  for (let x = 0; x <= width; x += 24) {
    context.fillRect(x, 0, 1, height);
  }
  for (let y = 0; y <= height; y += 24) {
    context.fillRect(0, y, width, 1);
  }

  context.fillStyle = '#fde047';
  context.font = '600 18px Arial';
  context.fillText('Click canvas to add a marker', 16, 30);
};

const drawMarker = (context: CanvasRenderingContext2D, x: number, y: number): void => {
  context.beginPath();
  context.arc(x, y, 8, 0, Math.PI * 2);
  context.fillStyle = '#f97316';
  context.fill();

  context.beginPath();
  context.arc(x, y, 16, 0, Math.PI * 2);
  context.strokeStyle = '#fb923c';
  context.lineWidth = 2;
  context.stroke();
};

export const mountCanvasDemo = (container: HTMLElement): void => {
  const width = 640;
  const height = 260;

  const status = document.createElement('p');
  status.className = 'demo-feedback';
  status.textContent = '点击画布添加标记点。';

  const canvas = new Canvas({
    width,
    height,
    onDraw: (_self, context) => {
      drawScene(context, width, height);
    },
    onClick: (self, event) => {
      const canvasElement = self.getCanvasElement();
      const context = self.getContext('2d') as CanvasRenderingContext2D | null;
      if (!canvasElement || !context) {
        return;
      }

      const bounds = canvasElement.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;

      drawMarker(context, x, y);
      status.textContent = `最近点击位置：(${Math.round(x)}, ${Math.round(y)})`;
    },
  });

  const controls = document.createElement('div');
  controls.className = 'demo-controls';

  new Button({
    text: '重绘背景',
    onClick: () => {
      const context = canvas.getContext('2d') as CanvasRenderingContext2D | null;
      if (context) {
        drawScene(context, width, height);
        status.textContent = '背景已重绘。';
      }
    },
  }).mount(controls);

  new Button({
    text: '导出 Data URL',
    onClick: () => {
      const preview = canvas.toDataURL('image/png');
      status.textContent = `Data URL 长度：${preview.length}`;
    },
  }).mount(controls);

  new Label({
    text: '提示：Canvas 组件支持 onDraw/onClick/getContext/toDataURL。',
    className: 'demo-hint',
  }).mount(container);

  canvas.mount(container);
  container.appendChild(controls);
  container.appendChild(status);
};

