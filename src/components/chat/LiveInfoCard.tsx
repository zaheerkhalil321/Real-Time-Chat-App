import React from "react";
import ReactTooltip from 'react-tooltip';
import { VisitorInitData, VisitorData } from '../../models/index';
const LiveInfoCard = ({ initData, visitorData }) => {

  var initDataInfo: VisitorInitData = initData;
  var visitorDataInfo: VisitorData = visitorData;


  return (
    <div className="card-body live-card-info card-content">
      <div className="d-flex justify-content-between mb-1">
        <p onClick={() => window.open(visitorDataInfo?.websiteurl.toString())} className="cursor-pointer text-primary"><a data-tip data-for="referrer" className="fas l-info fal fa-window-alt fa-lg text-info pr-2"></a>{visitorDataInfo?.websiteurl ?? ''}<ReactTooltip place="right" id="referrer" type="info" effect="solid">
          <span>Referrer</span>
        </ReactTooltip></p>
      </div>
      <div className="d-flex justify-content-between mb-1">
        <p onClick={() => window.open(initDataInfo?.Info?.URL.toString())} className="cursor-pointer text-primary"><a data-tip data-for="link" className="fas l-info fal fa-link fa-lg text-info pr-2  "></a>{initDataInfo?.Info?.URL ? initDataInfo?.Info?.URL.length > 40 ? initDataInfo.Info.URL.slice(0, 43) : initDataInfo.Info.URL : ''}<ReactTooltip place="right" id="link" type="info" effect="solid">
          <span>Chat Initiated</span>
        </ReactTooltip></p>

      </div>
      <div className="d-flex justify-content-between mb-1">
        <p><a data-tip data-for="localTime" className="fas l-info fal fa-clock fa-lg grey-text pr-2"></a>{initDataInfo?.Info?.DateTimeOnSite ?? ''}<ReactTooltip place="right" id="localTime" type="info" effect="solid">
          <span>Visitor's Local Time</span>
        </ReactTooltip></p>

      </div>
      <div className="d-flex justify-content-between mb-1">
        <p><a data-tip data-for="websiteLocal" className="fas l-info fal fa-clock fa-lg grey-text pr-2"></a>{initDataInfo?.Info?.FirstVisitDate ?? ''}
          <ReactTooltip place="right" id="websiteLocal" type="info" effect="solid">
            <span>Website's Local Time</span>
          </ReactTooltip></p>

      </div>
    </div>
  )
};

export default LiveInfoCard;