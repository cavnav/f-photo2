import { Tune } from './Tune';
import { Copy } from './Copy';
import { Browse } from './Browse';
import { Print } from './Print';
import { Welcome } from './Welcome';
import { Help } from './Help';
import { ExitFromAlbum } from './ExitFromAlbum';
import { SelectAlbum } from './SelectAlbum';
import { OnePhoto } from './OnePhoto';

export { ControlPanel } from './ControlPanel';
export { AdditionalPanel} from './AdditionalPanel';
export { MyView } from './MyView';
export { Stepper } from './Stepper';
export { Help } from './Help';
export { PhotoStatuses } from './PhotoStatuses';
export { OnePhoto } from './OnePhoto';

export const Views = {
  Tune, 
  Copy, 
  Browse,
  Print, 
  Help,
  OnePhoto,
  default: Welcome,
};

export const CompsAddPanel = {
  ExitFromAlbum,
  SelectAlbum,
  Default: () => null,
};
