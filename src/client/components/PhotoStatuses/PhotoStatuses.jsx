import './styles.css';
import React from 'react';
import { useMyReducer } from '../../functions';
import { ResumeObj } from '../../resumeObj';
import { channel } from '../../Channel';
import { Print } from '../';

const resumeObj = new ResumeObj({
  selector: [
    PhotoStatuses.name,
  ],
  val: getStateInit(),
});

const PhotoStatusesComp = channel.addComp({
  fn: PhotoStatuses,
  getAPI,
  getReqProps,
});

export function PhotoStatuses(
  props,
) {
  const [state] = useMyReducer({
    initialState: {
      ...getStateInit(),
    },
    setCompDeps: ({
      deps,
    }) => PhotoStatusesComp.setCompDeps({
      deps: {
        ...deps,
        id: props.id,
      },
    }),
    fn: ({
      stateUpd,
    }) => {
      resumeObj.save({ 
        val: stateUpd,
      });
    },
  });

  React.useEffect(
    () => {
      const rp = PhotoStatusesComp.getReqProps();
      const statusesUpd = rp.checkStatuses.reduce((res, check) => {
        const status = Object.keys(getStateInit()).find((status) => new RegExp(status, 'i').test(check.name));
        res[status] = check({
          src: props.id,
        });
        return res;
      },
      {});
      PhotoStatusesComp.deps.setState(statusesUpd);
    },
    [props.id]
  );

  const statuses = getStatuses();

  return (statuses.length === 0) ? null : (
    <div className="PhotoStatusIcons">
      { statuses }
    </div>
  );


  // ----------------------------------
  function getStatuses() {
    return Object.entries(state)
      .map(([status, val]) => {
        return val === false ? null : (
          <img key={status} src={`${status}.png`} />
        );
      })
      .filter((status) => status);     
  }
}

function getReqProps({
  channel,
}) {
  const compsAPI = channel.crop({
    comps: {
      ...Print.API,
    },
  });

  return {
    ...compsAPI,
    checkStatuses: [
      compsAPI.PrintAPI.isFileToPrint,
    ],
  };
}

function getAPI({
}) {
  // Create auto-generated list of fns to toggle status.
  return {

    changePrintStatus: () => {
      const rp = PhotoStatusesComp.getReqProps();
      const { deps } = PhotoStatusesComp;
      const statusUpd = rp.PrintAPI.togglePrint({
        src: deps.id,
      });
      deps.setState({
        toPrint: statusUpd,
      });
    }, 
  }
};

function getStateInit() {
  return {
    toPrint: false,
    toShare: false,
  };
}


