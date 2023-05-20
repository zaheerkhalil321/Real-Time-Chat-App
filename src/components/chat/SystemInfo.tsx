import React from "react";
import { VisitorInitData, VisitorIpInformation } from '../../models/index';
import EventEmitter from '../../services/eventemitter';
import { Events } from '../../models/events';
import Browser from '../../assets/img/browser.png';
import OS from '../../assets/img/os.png';
import Desktop from '../../assets/img/desktop.png';

interface SystemInfoProps {
    initData: VisitorInitData | undefined;
}

interface SystemInfoState {
    visitorIpInformation: VisitorIpInformation | null
}

class SystemInfo extends React.Component<SystemInfoProps, SystemInfoState> {

    constructor(props) {
        super(props);

        this.state = {
            visitorIpInformation: null
        };

        EventEmitter.on(Events.onVisitorIpInformationLoaded, this.onVisitorIpInformationLoaded);
    }

    onVisitorIpInformationLoaded = (visitorIpInformation: VisitorIpInformation) => {

        this.setState({
            visitorIpInformation: visitorIpInformation
        });
    }

    render() {
        return (
            <div className="card-body pb-0">
                <div className="d-flex justify-content-between mb-1">
                    <div className="card-block">
                        {/* <h2><i className="fal fa-desktop"></i></h2> */}
                        <img src={Desktop}  style={{width:30,height:30,marginTop:7}}/>
                        <h4 className="card-title" style={{marginTop:15}}>{this.props.initData?.Info?.Device ?? ''}</h4>

                    </div>
                    <div className="card-block">
                        {/* <h2><i className="fab fa-windows"></i></h2> */}
                        <img src={OS}  style={{width:30,height:30,marginTop:7}}/>
                        <h4 className="card-title" style={{marginTop:15}}>{this.props.initData?.Info?.OS ?? ''}</h4>
                    </div>
                    <div className="card-block">
                        {/* <h2><i className="fab fa-chrome"></i></h2> */}
                        <img src={Browser}  style={{width:30,height:30,marginTop:7}}/>
                        <h4 className="card-title" style={{marginTop:15}}>{this.props.initData?.Info?.Browser ?? ''}</h4>
                    </div>
                    <div className="card-block">
                        <h2><i className="fal fa-map-marker"></i></h2>
                        <h4 className="card-title">{this.state?.visitorIpInformation != null ? this.state?.visitorIpInformation[0]?.expr1 : ''}</h4>
                    </div>
                </div>
            </div>
        );
    }
}

export default SystemInfo;