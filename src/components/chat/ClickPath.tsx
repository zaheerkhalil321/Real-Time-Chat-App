import React from "react";
import moment from 'moment';
import ReactTooltip from 'react-tooltip';
import { VisitorInitData, VisitorInitDataVT } from "../../models";

const ClickPath = ({ initData }) => {
    var initDataVT: VisitorInitDataVT[] = (initData as VisitorInitData)?.VT ?? [];

    function time(time) {
        const duration = moment.duration(time, 'seconds');

        const h = duration.hours(); // 1
        const m = duration.minutes(); // 20
        const s = duration.seconds(); // 25
        return h+":"+ m+":"+ s
    }
    return (
        <div className="card-body p-3 d-flex flex-column ">
            {initDataVT.map((item, i) =>
                // eslint-disable-next-line react/jsx-no-target-blank
               <p><a title={item.URL} data-tip data-for="url" className="url" target="_blank"  key={i} style={{color: item.Status == 1 ? '#92d051' : '#ffd965'}} href={item.URL}>{time(item.TimeSpend)} {item.URL.slice(0,30)}
               
        </a></p>
            )}
        </div>
    )
};

export default ClickPath;