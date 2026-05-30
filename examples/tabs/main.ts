import '../../src/css/theme1.scss';
import '../styles/demo-shell.scss';
import './styles.css';
import {ensurePortableUiRootScope} from '../utils/ensurePortableUiRoot';
import {mountTabsExample} from './tabs-demo.ts';

ensurePortableUiRootScope();

const app = document.getElementById('app');
if (app) {
  mountTabsExample(app);
}


