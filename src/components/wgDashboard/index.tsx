import React, { Component } from "react";
import './wgDashboard.css';

const WgDashboard = (props) => {
    return (
        <>
            <div className="dashboard-boxes">
                <div className="dashboard-chat-box">
                    <img src={process.env.PUBLIC_URL + '/css/dashboard-icons/Group 6150.svg'} />
                    <h1>Start Chatting</h1>
                    <p>Click here to begin chatting on your website</p>
                </div>
            </div>

        </>
    );
}

export default WgDashboard;
