/// <reference path="../types/style-modules.d.ts" />
import '../../src/css/theme1.scss';
import '../styles/demo-shell.scss';
import {ensurePortableUiRootScope} from '../utils/ensurePortableUiRoot';

ensurePortableUiRootScope();

// The basic demo file runs immediately and mounts all sections to document.body.
import './basic-components-demo';
