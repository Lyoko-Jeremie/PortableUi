import '../styles/demo-base.css';
import './styles.css';
import {mountCanvasDemo, mountImageDemo} from './media-demo';

const imageTarget = document.getElementById('image-demo');
if (imageTarget) {
  mountImageDemo(imageTarget);
}

const canvasTarget = document.getElementById('canvas-demo');
if (canvasTarget) {
  mountCanvasDemo(canvasTarget);
}

