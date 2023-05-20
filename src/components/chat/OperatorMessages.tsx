import React from "react";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import _ from 'lodash';
import CannedMessagesComponent from './CannedMessagesComponent';
import PushContent from "./PushContent";
import { CannedType } from "../../models";

interface OperatorMessagesProps {
    websiteId: number;
    languageId: number;
    userId: number;
}

interface OperatorMessagesState {
    websiteId: number;
    languageId: number;
    userId: number;
}

class OperatorMessagesComponent extends React.Component<OperatorMessagesProps, OperatorMessagesState> {

    constructor(props) {
        super(props);

        this.state = {
            websiteId: this.props.websiteId,
            languageId: this.props.languageId,
            userId: this.props.userId
        };
    }

    componentDidUpdate(prevProps: OperatorMessagesProps, prevState: OperatorMessagesState) {
        if ((prevProps.websiteId != this.props.websiteId)) {
            this.setState({
                websiteId: Number(this.props.websiteId)
            });
        }

        if ((prevProps.languageId != this.props.languageId)) {
            this.setState({
                languageId: this.props.languageId
            });
        }

        if ((prevProps.userId != this.props.userId)) {
            this.setState({
                userId: this.props.userId
            });
        }
    }

    render() {

        return (
            <>
                <ul id="tab-button" className="nav nav-tabs" role="tablist">
                    <li><a className="nav-item nav-link active" data-toggle="tab" role="tab" aria-selected="false" href="#website-canned-messages">Website Canned</a></li>
                    <li><a className="nav-item nav-link" data-toggle="tab" role="tab" aria-selected="false" href="#personal-canned-messages">Personal Canned</a></li>
                    <li><a className="nav-item nav-link" data-toggle="tab" role="tab" aria-selected="true" href="#canned-messages">Push Content</a></li>
                </ul>

                <div className="tab-content c-msgs px-0">
                    <div id="website-canned-messages" className="tab-pane fade  show active" role="tabpanel" >
                        <CannedMessagesComponent userId={this.state.userId} languageId={this.state.languageId} websiteId={this.state.websiteId} type={CannedType.Website} />
                    </div>
                    <div id="personal-canned-messages" className="tab-pane fade" role="tabpanel" >
                        <CannedMessagesComponent userId={this.state.userId} languageId={this.state.languageId} websiteId={this.state.websiteId} type={CannedType.User} />
                        {/* <div className="card shadow mb-4">
                            <div className="card-body p-c-msg">
                                <div className="form-group has-search">
                                    <input className="fa fa-search form-control-feedback" ></input>
                                    <span className="fa fa-search form-control-feedback"></span>
                                    <input type="text" className="form-control" />
                                </div>
                                <div className="personal-msgs">
                                </div>
                            </div>
                        </div> */}
                    </div>


                    <div id="canned-messages" className="tab-pane " role="tabpanel">
                        <PushContent websiteId={this.state.websiteId} />
                    </div>
                </div>
            </>
        )
    }
}
export default OperatorMessagesComponent;


