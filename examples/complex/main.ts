import '../styles/demo-base.css';
import './styles.css';
import {mountAllComplexExamples} from './complex-demo';

const app = document.getElementById('app');
if (app) {
  mountAllComplexExamples(app);
}

