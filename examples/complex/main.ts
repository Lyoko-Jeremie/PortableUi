import '../../src/css/theme1.scss';
import '../styles/demo-shell.scss';
import {ensurePortableUiRootScope} from '../utils/ensurePortableUiRoot';
import {mountAllComplexExamples} from './complex-demo';

ensurePortableUiRootScope();

const app = document.getElementById('app');
if (app) {
  mountAllComplexExamples(app);
}

