import '../../src/css/theme1.scss';
import '../styles/demo-base.css';
import './styles.css';
import {Button} from '../../src/components/basic';
import {Container} from '../../src/layout';
import {
  basicContainerExample,
  complexNestedLayoutExample,
  flexLayoutExample,
  gridLayoutExample,
  groupLayoutExample,
  responsiveLayoutExample,
} from './layout-demo';

const mount = (id: string, element: HTMLElement): void => {
  const target = document.getElementById(id);
  if (target) {
    target.appendChild(element);
  }
};

mount('basic-container-demo', basicContainerExample());
mount('flex-layout-demo', flexLayoutExample());
mount('grid-layout-demo', gridLayoutExample());
mount('group-layout-demo', groupLayoutExample());
mount('complex-layout-demo', complexNestedLayoutExample());
mount('responsive-layout-demo', responsiveLayoutExample());

const verticalContainer = new Container({
  direction: 'vertical',
  gap: 10,
  padding: 15,
  backgroundColor: '#f9f9f9',
});

for (let i = 1; i <= 3; i += 1) {
  verticalContainer.addChild(new Button({text: `Vertical Button ${i}`}));
}

const verticalDemoTarget = document.getElementById('vertical-container-demo');
if (verticalDemoTarget) {
  verticalContainer.mount(verticalDemoTarget);
}

