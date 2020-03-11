import { Tune } from './Tune';
import { Copy } from './Copy';
import { Browse } from './Browse';
import { Print } from './Print';
import { Help } from './Help';
import { Welcome } from './Welcome';

export { ControlPanel } from './ControlPanel';
export { MyView } from './MyView';
export { Stepper } from './Stepper';

export const Views = {
  Tune, 
  Copy, 
  Browse,
  Print, 
  Help,
  default: Welcome,
};
