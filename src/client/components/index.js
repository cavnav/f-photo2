import { Tune } from './Tune';
import { Navigator } from './Navigator';
import { Copy } from './Copy';
import { Browse } from './Browse';
import { Print } from './Print';

export { ControlPanel } from './ControlPanel';
export { MyView } from './MyView';

export const Views = {
  Tune, 
  Copy, 
  Browse,
  Print, 
  default: Navigator
};
