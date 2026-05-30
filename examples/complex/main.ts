import '../../src/css/theme1.scss';
import {mountAllComplexExamples} from './complex-demo';

const app = document.getElementById('app');
if (app) {
  mountAllComplexExamples(app);
}

