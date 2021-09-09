import './styles.css';
import React from 'react';
import { useMyReducer } from '../../functions';
import { ResumeObj } from '../../resumeObj';
import { channel } from '../../Channel';
import { Print } from '../';



export const PhotoStatuses = channel.addComp({
  name: 'PhotoStatuses',
  render,
  getAPI,
  getReqProps,
});

const resumeObj = new ResumeObj({
  selector: [
    PhotoStatuses.name,
  ],
  val: getStateInit(),
});

function render(
  props,
) {
  const [state] = useMyReducer({
    initialState: {
      ...getStateInit(),
    },
    setCompDeps: ({
      deps,
    }) => this.setCompDeps({
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
      const rp = this.getReqProps();
      const statusesUpd = rp.checkStatuses.reduce((res, check) => {
        const status = Object.keys(getStateInit()).find((status) => new RegExp(status, 'i').test(check.name));
        res[status] = check({
          src: props.id,
        });
        return res;
      },
      {});
      this.deps.setState(statusesUpd);
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
  const PrintAPI = Print.getAPI();
  return {
    PrintAPI,
    checkStatuses: [
      PrintAPI.isFileToPrint,
    ],
  };
}

function getAPI({
  deps,
}) {
  // Create auto-generated list of fns to toggle status.
  return {

    changePrintStatus: () => {
      const rp = PhotoStatuses.getReqProps();
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


