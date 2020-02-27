import { Tune } from './Tune';
import { Copy } from './Copy';
import { Browse } from './Browse';
import { Print } from './Print';
import { Welcome } from './Welcome';

export { ControlPanel } from './ControlPanel';
export { MyView } from './MyView';

export const Views = {
  Tune, 
  Copy, 
  Browse,
  Print, 
  default: Welcome,
};
