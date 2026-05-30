import '../../src/css/theme1.scss';
import '../styles/demo-shell.scss';
import './styles.css';
import {ensurePortableUiRootScope} from '../utils/ensurePortableUiRoot';
import {mountCanvasDemo, mountImageDemo} from './media-demo';

ensurePortableUiRootScope();

const imageTarget = document.getElementById('image-demo');
if (imageTarget) {
  mountImageDemo(imageTarget);
}

const canvasTarget = document.getElementById('canvas-demo');
if (canvasTarget) {
  mountCanvasDemo(canvasTarget);
}

