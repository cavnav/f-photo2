import { Tune } from './Tune';
import { Copy } from './Copy';
import { Browse } from './Browse';
import { Print } from './Print';
import { Welcome } from './Welcome';
import { Help } from './Help';

export { ControlPanel } from './ControlPanel';
export { MyView } from './MyView';
export { Stepper } from './Stepper';
export { Help } from './Help';

export const Views = {
  Tune, 
  Copy, 
  Browse,
  Print, 
  Help,
  default: Welcome,
};
