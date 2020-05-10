import { Tune } from './Tune';
import { Copy } from './Copy';
import { Browse } from './Browse/Browse';
import { Print } from './Print';
import { Welcome } from './Welcome';
import { Help } from './Help';
import { ExitFromAlbum } from './ExitFromAlbum';
import { ExitFromOnePhoto } from './ExitFromOnePhoto/ExitFromOnePhoto';
import { SelectAlbum } from './SelectAlbum';
import { OnePhoto } from './OnePhoto/OnePhoto';

export { ControlPanel } from './ControlPanel';
export { AdditionalPanel} from './AdditionalPanel/AddPanel';
export { MyView } from './MyView';
export { Stepper } from './Stepper';
export { Help } from './Help';
export { PhotoStatuses } from './PhotoStatuses';
export { OnePhoto } from './OnePhoto/OnePhoto';

export const Views = {
  Tune, 
  Copy, 
  Browse,
  Print, 
  Help,
  OnePhoto,
  Welcome,
};

export const CompsAddPanel = {
  ExitFromAlbum,
  ExitFromOnePhoto,
  SelectAlbum,
  Default: () => null,
};
