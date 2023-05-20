// @ts-nocheck
import React, { useState, useEffect } from "react";
const ButtonsTabs = () => {
    return (
        <div className="transcript-form pl-0 pr-0 pt-0 pb-1">
            <h6 className="transcript-form-heading">Transcript</h6>
            <form className="p-1 transcript" action="" method="post">
                <div className="form-group row mb-1">
                    <label className="col-sm-4 col-form-label">Department</label>
                    <div className="col-sm-8 pl-0">
                        <select className="form-control" id="department">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                        </select>
                    </div>
                </div>
                <div className="form-group row mb-1">
                    <label className="col-sm-4 col-form-label">Chat Type</label>
                    <div className="col-sm-8 pl-0">
                        <select className="form-control" id="chat-type">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                        </select>
                    </div>
                </div>
                <div className="form-group row mb-1">
                    <label className="col-sm-4 col-form-label">Lead Type</label>
                    <div className="col-sm-8 pl-0">
                        <select className="form-control" id="lead-type">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                        </select>
                    </div>
                </div>
                <div className="form-group row mb-1">
                    <label className="col-sm-4 col-form-label">Status Type</label>
                    <div className="col-sm-8 pl-0">
                        <select className="form-control" id="status-type">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                        </select>
                    </div>
                </div>
                <div className="form-group row mb-1">
                    <label className="col-sm-4 col-form-label">Vehicle Interest</label>
                    <div className="col-sm-8 pl-0">
                        <select className="form-control" id="vehicle-interest">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                        </select>
                    </div>
                </div>
                <div className="form-group row mb-1">
                    <label className="col-sm-4 col-form-label">Year</label>
                    <div className="col-sm-8 pl-0">
                        <select className="form-control" id="lead-type">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                        </select>
                    </div>
                </div>
                <div className="form-group row mb-1">
                    <label className="col-sm-4 col-form-label">Make</label>
                    <div className="col-sm-8 pl-0">
                        <select className="form-control" id="make">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                        </select>
                    </div>
                </div>
                <div className="form-group row mb-1">
                    <label className="col-sm-4 col-form-label">Model</label>
                    <div className="col-sm-8 pl-0">
                        <select className="form-control" id="model">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                        </select>
                    </div>
                </div>

                <div className="form-group row mb-1">
                    <label className="col-sm-4 col-form-label">Name</label>
                    <div className="col-sm-8 pl-0">
                        <input type="email" className="form-control" id="name"/>
                    </div>
                </div>

                <div className="form-group row mb-1">
                    <label className="col-sm-4 col-form-label">Phone</label>
                    <div className="col-sm-8 pl-0">
                        <input type="email" className="form-control" id="phone"/>
                    </div>
                </div>

                <div className="form-group row mb-1">
                    <label className="col-sm-4 col-form-label">Email</label>
                    <div className="col-sm-8 pl-0">
                        <input type="email" className="form-control" id="email"/>
                    </div>
                </div>
            </form>
        </div>
    )
};

export default ButtonsTabs;