import React, { Component, Fragment, useEffect, useState, useRef, useCallback } from "react";
import { Link, Redirect, useHistory } from 'react-router-dom';
import './resource.css';
import "../../assets/GlobalStyle.css";
import { ApiResult, companyRoleMDL, employeeCompanyMDL, LanguageMDL, AgentsMDL, AllResourcesData, LoginResponse } from '../../models/index';
import { wglcsApiService } from '../../services/WglcsApiService'
import validator from 'validator'
import { Dropdown } from 'primereact/dropdown';
import Image from "./Image";
import SnackBar from "../alert/SnackBar";
import Spinner from "../../components/spinner/spinner";
import { Password } from 'primereact/password';
import Confirmation from "../alert/ConfirmationDialog";

function getSteps() {
    return ['Select campaign settings', 'Create an ad group', 'Create an ad'];
}


const PersonalInformation = (props) => {
    const history = useHistory();
    const [activeStep, setActiveStep] = React.useState(0);
    const [completed, setCompleted] = React.useState<{ [k: number]: boolean }>({});
    const steps = getSteps();
    const [loading, setLoading] = useState(true);
    const [lazyloading, setLazyLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(false);

    const [userData, setUserData] = useState([]);
    const [employeeCompaniesData, setEmployeeCompaniesData] = useState([] as any);
    const [rolesData, setRolesData] = useState([] as any);
    const [saveResponse, setSaveResponse] = useState([] as any);

    const [languageData, setLanguageData] = useState([] as any);
    const [selectedCompaniesData, setSelectedCompaniesData] = useState([] as any);
    const [selectedRolesData, setSelectedRolesData] = useState([]);
    const [selectedLanguagesData, setSelectedLanguagesData] = useState([]);
    const [rowForEdit, setRowForEdit] = useState([]);
    const [isEdit, setIsEdit] = useState(false);

    const [firstName, setfirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [userImage, setUserImage] = useState("");

    const [firstNameErrorText, setFirstNameErrorText] = useState("");
    const [lastNameErrorText, setLastNameErrorText] = useState("");
    const [emailErrorText, setEmailErrorText] = useState("");
    const [companyErrorText, setCompanyErrorText] = useState("");
    const [userErrorText, setUserErrorText] = useState("");
    const [maxChatErrorText, setMaxChatErrorText] = useState("");
    const [allotedBreaksErrorText, setAllotedBreaksErrorText] = useState("");
    const [roleErrorText, setRoleErrorText] = useState("");
    const [languageErrorText, setLanguageErrorText] = useState("");
    const [passwordErrorText, setPasswordErrorText] = useState("");
    const [reTypePasswordErrorText, setReTypePasswordErrorText] = useState("");
    const [InvolveErrorText, setInvolveErrorText] = useState("");

    const [userName, setUserName] = useState("");
    const [companyId, setCompanyId] = useState(null);
    const [userId, setUserId] = useState(0);
    const [roleId, setRoleId] = useState(null);
    const [password, setPassword] = useState("");
    const [reTypePassword, setReTypePassword] = useState("");
    const [allotedBreaks, setAllotedBreaks] = useState(0);
    const [maxChat, setMaxChat] = useState(0);
    const [languageId, setLanguageId] = useState(null);
    const [involveSms, setinvolveSms] = useState(false);
    const [involveEmail, setInvolveEmail] = useState(false);
    const [reUsePassword, setReUsePassword] = useState(false);
    const [twoFactorAuthentication, setTwoFactorAuthentication] = useState(false);
    const [disable, setDisable] = useState(false);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [severity, setSeverity] = useState("");
    const [responseMsg, setResponseMsg] = useState("");
    const [openConfirmation, setOpenConfirmation] = useState(false);

    const successToast = useRef(null);
    const ErrorToast = useRef(null);

    const totalSteps = () => {
        return steps.length;
    };

    const completedSteps = () => {
        return Object.keys(completed).length;
    };

    const isLastStep = () => {
        return activeStep === totalSteps() - 1;
    };

    const allStepsCompleted = () => {
        return completedSteps() === totalSteps();

    }

    const handleNext = () => {
        const newActiveStep =
            isLastStep() && !allStepsCompleted()
                ? steps.findIndex((step, i) => !(i in completed))
                : activeStep + 1;

        if (newActiveStep == 1) {
            var isPersonalInfoError = PersonalInformationValidator()
            if (!isPersonalInfoError) {
                setActiveStep(newActiveStep);
            }
        }
        if (newActiveStep == 2) {
            var isAccountError = AccountInformationValidator()
            if (!isAccountError) {
                setActiveStep(newActiveStep);
            }
        }

        if (activeStep == 2) {
            var isSecurityError = SecurityInformationValidator()
            if (!isSecurityError) {
                insertuserinfo();
            }
        }
    };

    const Step1 = () => {
        handleReset()
    }

    const Step2 = () => {
        var isError = PersonalInformationValidator()
        if (!isError) {
            setActiveStep(1)
        }
    }

    const Step3 = () => {
        var isError1 = PersonalInformationValidator()
        var isError = AccountInformationValidator()
        if (!isError) {
            setActiveStep(2)
        }
    }

    const PersonalInformationValidator = () => {
        const emailRegularExpression = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        var emailFormate = emailRegularExpression.test(email.toLowerCase());

        var isError = false;
        if (firstName.length === 0) {
            isError = true;
            setFirstNameErrorText("* Required");
        }
        if (lastName.length === 0) {
            isError = true;
            setLastNameErrorText("* Required");
        }
        if (email.length === 0) {
            isError = true;
            setEmailErrorText("* Required");
        }
        if (email.length > 0 && emailFormate == false) {
            isError = true;
            setEmailErrorText("* Invalid Email");
        }
        return isError;
    }

    const AccountInformationValidator = () => {
        var isError = false;

        if (companyId == null) {
            isError = true;
            setCompanyErrorText("* Required");
        }
        if (userName.length === 0) {
            isError = true;
            setUserErrorText("* Required");
        }

        if (!isEdit) {
            var PassError = PasswordValidator();
            if (PassError) {
                isError = true;
            }
        }

        if (isEdit && password.length > 0) {
            var isPasswordError = PasswordValidator();
            if (isPasswordError) {
                isError = true;
            }
        }

        if (maxChat === 0) {
            isError = true;
            setMaxChatErrorText("* Required");
        }
        if (allotedBreaks === 0) {
            isError = true;
            setAllotedBreaksErrorText("* Required");
        }
        if (roleId == null) {
            isError = true;
            setRoleErrorText("* Required");
        }
        if (languageId == null) {
            isError = true;
            setLanguageErrorText("* Required");
        }
        return isError;
    }

    const PasswordValidator = () => {
        var isError = false;
        if (validator.isStrongPassword(password, {
            minLength: 8, minUppercase: 1, minLowercase: 1,
            minNumbers: 1, minSymbols: 1, maxLength: 20
        })) {
        } else {
            isError = true;
            setPasswordErrorText("User Password must be 8-20 characters long and must contain 1 small-case letter, 1 Capital letter, 1 digit and 1 special character.");
        }

        if (reTypePassword.length === 0) {
            isError = true;
            setReTypePasswordErrorText("* Required");
        }
        if (reTypePassword != password) {
            isError = true;
            setReTypePasswordErrorText("* Password and Retype Password does not match");
        }
        return isError;
    }


    const SecurityInformationValidator = () => {
        var isError = false;
        if (involveEmail === false && involveSms === false) {
            isError = true;
            setInvolveErrorText("* Required");
        }
        return isError;
    }


    const RemoveValidation = () => {
        setLastNameErrorText("");
        setEmailErrorText("");
        setFirstNameErrorText("")
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStep = (step: number) => () => {
        setActiveStep(step);
    };


    const handleComplete = () => {
        const newCompleted = completed;
        newCompleted[activeStep] = true;
        setCompleted(newCompleted);
        handleNext();
    };

    const handleReset = () => {
        setActiveStep(0);
        setCompleted({});
    };


    const handleFirstName = (value) => {
        setfirstName(value)
    }

    useEffect(() => {
        if (props.location?.state?.selectedData != undefined) { setIsEdit(true) }
        let TempArray = [{ id: 2, name: "sdfs" }]
        setEmployeeCompaniesData(TempArray)
        setRolesData(TempArray)
        ServiceCalls()
    }, [])


    useEffect(() => {
        if (props.location?.state?.selectedData != undefined) {
            setRowForEdit(props.location?.state?.selectedData)
            FillFormValues(props.location?.state?.selectedData)
        }
    }, [rolesData])


    const FillFormValues = (data) => {
        var InvolveContact = "";
        if (data.length != 0) {
            let filterdLang = languageData?.find((item: LanguageMDL) => item.languageId == languageId);
            setSelectedLanguagesData(filterdLang ?? []);

            let filterdRole = rolesData?.find((item: companyRoleMDL) => item.roleId == roleId);
            setSelectedRolesData(filterdRole ?? []);

            setUserImage(data?.imagePath)
            setUserId(data?.userId)
            setfirstName(data?.employeeFname)
            setLastName(data?.employeeLname)
            setEmail(data?.employeeEmail)
            setPhone(data?.employeePhone)
            //    setPassword(data?.userPassword)
            setAllotedBreaks(data?.alottedBreak)
            setMaxChat(data?.userNoOfChats)
            setUserName(data?.userName)
            setLanguageId(data?.languageId)
            setCompanyId(data?.companyId)
            setRoleId(data?.roleId)
            setTwoFactorAuthentication(false)
            setReUsePassword(false)
            setDisable(data?.status)

            if (data?.involveContact === "Email") {
                setInvolveEmail(true)
            }

            if (data?.involveContact === "Sms") {
                setinvolveSms(true)
            }

            if (data?.involveContact === "Both") {
                setinvolveSms(true)
                setInvolveEmail(true)
            }
            if (data?.involveContact === "") {
                setinvolveSms(false)
                setInvolveEmail(false)
            }
        }
    }



    const getString = (text: string) => {
        setAddress(text)
    }

    const ServiceCalls = async () => {

        setLazyLoading(true)
        var UserResponse: AgentsMDL[] = [];

        let UserData = ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse);
        let RolesResponse = await wglcsApiService.getrolesbyempcompanyid(UserData?.userLoginData?.empCompId);
        let LanguageResponse = await wglcsApiService.getempcompanylanguagesdetail();
        setLanguageData(LanguageResponse?.data?.data)
        setRolesData(RolesResponse?.data?.data)
        setLazyLoading(false)

        let EmployeeComResponse = await wglcsApiService.getemployeecompanyies();
        setEmployeeCompaniesData(EmployeeComResponse?.data?.data)

        if (props.location?.state?.selectedData != undefined) {
            let comId = props.location?.state?.selectedData?.companyId.toString();
            let filterdCom = EmployeeComResponse?.data?.data?.find((item: employeeCompanyMDL) => item.employeeCompanyId == comId);
            setSelectedCompaniesData(filterdCom ?? []);
        }
        setLoading(false)
    }

    const Clear = () => {
        setfirstName("")
        setLastName("")
        setEmail("")
        setPhone("")
        setAddress("")

        setCompanyId(null);
        setUserName("")
        setUserId(0)
        setPassword("")
        setReTypePassword("")
        setMaxChat(0)
        setAllotedBreaks(0)
        setLanguageId(null)
        setRoleId(null)
        setinvolveSms(false)
        setInvolveEmail(false)
        setTwoFactorAuthentication(false)
        setReUsePassword(false)
        setIsEdit(false)
        setDisable(false)
        setUserImage("")

        setSelectedCompaniesData([])
        setSelectedLanguagesData([])
        setSelectedRolesData([])
    }

    const ConfirmationResponse = (response, mode) => {
        if (response) {
            insertuserinfo()
        }
        setOpenConfirmation(false)
    }

    const handleConfirmationDialog = () => {
        setOpenConfirmation(true)
    }


    const insertuserinfo = async () => {
        var InvolveContact = "";
        var res = [] as any;

        if (involveEmail === true) {
            InvolveContact = "Email";
        }

        if (involveSms === true) {
            InvolveContact = "Sms";
        }

        if (involveSms === true && involveEmail === true) {
            InvolveContact = "Both"
        }


        const body = {
            employeeFname: firstName,
            employeeLname: lastName,
            employeeEmail: email,
            employeePhone: phone,
            userId: userId,
            userName: userName,
            userPassword: password,
            roleId: roleId,
            creationDate: new Date(),
            alottedBreak: allotedBreaks,
            userNoOfChats: maxChat,
            languageId: languageId,
            employeeCompanyId: companyId,
            accountVerification: twoFactorAuthentication,
            reusePassword: reUsePassword,
            involveContact: InvolveContact,
            imagePath: userImage,
            status: disable,
        }

        if (isEdit) {
            res = await wglcsApiService.updateuserinfo_v2(body);
        }
        else {
            res = await wglcsApiService.insertuserinfobll_v2(body);
        }
        if (res?.data?.status == true) {
            setPageLoading(true)
            setSeverity("info")
            setResponseMsg("Operation Successfully completed")
            setOpenSnackBar(true);
            setTimeout(() => {
                history.push("/resourcesPool")
            }, 3000);
            Clear()
        }
        else {
            if (res?.data?.error[0]?.Code === "AP-2019-9qXWFw") {
                handleReset()
                setEmailErrorText("Email already exists.")
            }
            else {
                setSeverity("error")
                setResponseMsg("Error")
                setOpenSnackBar(true);
                handleReset()
                setTimeout(() => {
                    setOpenSnackBar(false);
                }, 3000);
            }
        }
    }


    const handleInvolveSMS = (e) => {
        setinvolveSms(e.target.checked)
        setInvolveErrorText("");
    }

    const handleInvolveEmail = (e) => {
        setInvolveEmail(e.target.checked)
        setInvolveErrorText("");
    }

    const handleTwoFactorAuthentication = (e) => {
        setTwoFactorAuthentication(e.target.checked)
    }

    const handleReUsePassword = (e) => {
        setReUsePassword(e.target.checked)
    }

    const handleDisable = (e) => {
        setDisable(e.target.checked)
    }

    const getCompanyId = (e) => {
        setSelectedCompaniesData(e)
        setCompanyId(e.employeeCompanyId)
    }

    const getRoleId = (e) => {
        setSelectedRolesData(e)
        setRoleId(e.roleId)
    }

    const getLangaugeId = (e) => {
        setSelectedLanguagesData(e)
        setLanguageId(e.languageId)
    }

    const RoleOptionTemplate = (option) => {
        if (lazyloading) {
            return (
                <div className="spinner-div"><i className="pi pi-spin pi-spinner" ></i></div>)
        }
        else {
            return (
                <div className="country-item">
                    <div>{option.roleName}</div>
                </div>
            );
        }
    }

    const CompanyOptionTemplate = (option) => {
        if (loading) {
            return (
                <div className="spinner-div"><i className="pi pi-spin pi-spinner" ></i></div>
            )
        }
        else {
            return (
                <div className="country-item">
                    <div>{option.companyName}</div>
                </div>
            );
        }
    }

    const getImage = async (fileToUpload: File) => {
        if (fileToUpload == undefined) {
            setUserImage("");
        }
        else {
            var formData: FormData = new FormData();
            formData.append('paramData', fileToUpload, fileToUpload.name);
            try {
                var res = await wglcsApiService.picsupload(formData);
                setUserImage(res.data!.data);
            } catch (error) {
                alert(error);
            }
        }

    }

    function getStepContent(
        step: number,
    ) {
        switch (step) {
            case 0:
                return (
                    <div className="personal-container">

                        <div className="row">
                            <div className="flex-container col-12">
                                <span className="personal-hr">
                                    <span className="numberimage Steps" style={{ borderColor: "#4e86c7", color: "#fff", backgroundColor: "#4e86c7" }} onClick={Step1}>1</span>
                                    <hr style={{ borderColor: "#4e86c7" }} className="Steps" onClick={Step1} />
                                    <h1>Personal Information</h1>
                                </span>
                                <span className="personal-hr">
                                    <span className="numberimage Steps" onClick={Step2}>2</span>
                                    <hr className="Steps" onClick={Step2} />
                                </span>
                                <span className="personal-hr">
                                    <span className="numberimage Steps" onClick={Step3}>3</span>
                                </span>

                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 pl-md-5 px-0 pr-md-2">

                                <Image LoadImage={(row) => getImage(row)} imagePreviewUrl={userImage} isEdit={isEdit} userImage={userImage} />
                                {/* <FileUploadDemo/> */}
                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/user.svg'} />
                                    <input value={firstName} onClick={RemoveValidation} onChange={(e) => handleFirstName(e.target.value)} type="text" placeholder="First Name" className="form-control" />
                                    <span style={{ color: "red" }}>{firstNameErrorText}</span>
                                </div>

                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/user.svg'} />
                                    <input value={lastName} onClick={RemoveValidation} onChange={(e) => setLastName(e.target.value)} type="text" placeholder="Last Name" className="form-control" />
                                    <span style={{ color: "red" }}>{lastNameErrorText}</span>
                                </div>

                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/email.svg'} />
                                    <input value={email} onClick={RemoveValidation} onChange={(e) => setEmail(e.target.value)} type="text" placeholder="Email" className="form-control" />
                                    <span style={{ color: "red" }}>{emailErrorText}</span>
                                </div>
                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/ph.svg'} />
                                    <input value={phone} onChange={(e) => setPhone(e.target.value)} type="number" placeholder="Phone" className="form-control" />
                                </div>
                                <div className="form-group switch-btn">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/ath.svg'} />
                                    <div className="form-control">
                                        <h2>2-Factor Authentication</h2>
                                        <span className="switch-bg">
                                            <label className="switch">
                                                <input onChange={(e) => handleTwoFactorAuthentication(e)} type="checkbox" />
                                                <span className="slider round"></span>
                                            </label>
                                        </span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/location.svg'} />
                                    <input value={address} onChange={(e) => setAddress(e.target.value)} type="text" placeholder="Address" className="form-control" />
                                </div>

                                <div className="form-group cancel-next">
                                    {isEdit === true ? (<>
                                        <button className="cancel" onClick={handleConfirmationDialog}>Save</button>
                                        <button className="next-btn" onClick={handleNext}>Next</button></>
                                    ) : (<button className="next-btn next-btn-width" onClick={handleNext}>Next</button>)}

                                </div>
                            </div>
                            <div className="col-md-6 pr-md-3  hide-image resource-image-center">
                                <img className="resource-right-image" src={process.env.PUBLIC_URL + '/css/resources-images/Group 5966.svg'} />
                            </div>


                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="personal-container">
                        <div className="row">
                            <div className="flex-container col-12">
                                <span className="personal-hr">
                                    <span className="numberimage Steps" style={{ borderColor: "#4e86c7", color: "#fff", backgroundColor: "#4e86c7" }} onClick={Step1}>1</span>
                                    <hr style={{ borderColor: "#4e86c7" }} className="Steps" onClick={Step1} />
                                </span>
                                <span className="personal-hr">
                                    <span className="numberimage Steps" style={{ borderColor: "#4e86c7", color: "#fff", backgroundColor: "#4e86c7" }} onClick={Step2}>2</span>
                                    <hr className="Steps" style={{ borderColor: "#4e86c7" }} onClick={Step2} />
                                    <h1>Account Information</h1>
                                </span>
                                <span className="personal-hr">
                                    <span className="numberimage Steps" onClick={Step3}>3</span>
                                </span>
                            </div>

                        </div>
                        <div className="row">
                            <div className="col-md-6 pl-md-5 px-0 pr-md-2 pt-3 personalInfo">
                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/Group 6131.png'} />
                                    <Dropdown className="form-control" onFocus={() => { setCompanyErrorText("") }} filter filterBy="companyName" style={{ padding: "3px !important", display: "flex" }} value={selectedCompaniesData} options={employeeCompaniesData} itemTemplate={CompanyOptionTemplate} onChange={(e) => getCompanyId(e.target.value)} optionLabel="companyName" placeholder="Company" />
                                    <span style={{ color: "red" }}>{companyErrorText}</span>
                                </div>

                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/Group 6132.png'} />
                                    <input placeholder="Username" onClick={() => { setUserErrorText("") }} value={userName} onChange={(e) => setUserName(e.target.value)} type="text" className="form-control" />
                                    <span style={{ color: "red" }}>{userErrorText}</span>
                                </div>

                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/lock.png'} />
                                    <Password placeholder="Password" toggleMask value={password} onChange={(e) => setPassword(e.target.value)} header={header} footer={footer} onClick={() => { setPasswordErrorText("") }} />
                                    <span style={{ color: "red" }}>{passwordErrorText}</span>
                                </div>

                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/lock.png'} />
                                    <Password placeholder="Retype Password" toggleMask value={reTypePassword} onChange={(e) => setReTypePassword(e.target.value)} header={header} footer={footer} onClick={() => { setReTypePasswordErrorText("") }} />
                                    <span style={{ color: "red" }}>{reTypePasswordErrorText}</span>
                                </div>

                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/chat.png'} />
                                    <input placeholder="Max Chats" onClick={() => { setMaxChatErrorText("") }} value={maxChat} onChange={(e) => setMaxChat(parseInt(e.target.value))} type="number" className="form-control" />
                                    <span style={{ color: "red" }}>{maxChatErrorText}</span>
                                </div>

                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/break.png'} />
                                    <input placeholder="Alloted Breaks" onClick={() => { setAllotedBreaksErrorText("") }} value={allotedBreaks} onChange={(e) => setAllotedBreaks(parseInt(e.target.value))} type="number" className="form-control" />
                                    <span style={{ color: "red" }}>{allotedBreaksErrorText}</span>
                                </div>

                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/language.png'} />
                                    <Dropdown className="form-control" onFocus={() => { setLanguageErrorText("") }} filter filterBy="languageName" style={{ padding: "3px !important", display: "flex" }} value={selectedLanguagesData} options={languageData} onChange={(e) => getLangaugeId(e.target.value)} placeholder="Languages" optionLabel="languageName" />
                                    <span style={{ color: "red" }}>{languageErrorText}</span>
                                </div>

                                <div className="form-group">
                                    <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/book.png'} />
                                    <Dropdown className="form-control" onFocus={() => { setRoleErrorText("") }} filter filterBy="roleName" style={{ padding: "3px !important", display: "flex" }} value={selectedRolesData} options={rolesData} itemTemplate={RoleOptionTemplate} onChange={(e) => getRoleId(e.value)} placeholder="Roles" optionLabel="roleName" />
                                    <span style={{ color: "red" }}>{roleErrorText}</span>
                                </div>

                                <div className=" form-group cancel-next">

                                    {isEdit === true ? (<>
                                        <button className="cancel back-btn inline-3-btn" onClick={handleBack}>Back</button>
                                        <button className="next-btn inline-3-btn" onClick={handleConfirmationDialog}>Save</button>
                                        <button className="next-btn inline-3-btn" onClick={handleNext}>Next</button></>) : (
                                        <>
                                            <button className="cancel" onClick={handleBack}>Back</button>
                                            <button className="next-btn" onClick={handleNext}>Next</button></>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6 pr-md-3  hide-image pt-md-5">
                                <img className="resource-right-image" src={process.env.PUBLIC_URL + '/css/resources-images/Group 5966.svg'} />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="resources-container">
                        <div className="personal-container">

                            <div className="row">
                                <div className="flex-container col-12">
                                    <span className="personal-hr">
                                        <span className="numberimage Steps" style={{ borderColor: "#4e86c7", color: "#fff", backgroundColor: "#4e86c7" }} onClick={Step1}>1</span>
                                        <hr style={{ borderColor: "#4e86c7" }} className="Steps" onClick={Step1} />
                                    </span>
                                    <span className="personal-hr">
                                        <span className="numberimage Steps" style={{ borderColor: "#4e86c7", color: "#fff", backgroundColor: "#4e86c7" }} onClick={Step2}>2</span>
                                        <hr className="Steps" style={{ borderColor: "#4e86c7" }} onClick={Step2} />

                                    </span>
                                    <span className="personal-hr involve">
                                        <span className="numberimage Steps" style={{ borderColor: "#4e86c7", color: "#fff", backgroundColor: "#4e86c7" }} onClick={Step3}>3</span>
                                        <h1>Involve Setup</h1>
                                    </span>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6  pl-md-5 pt-md-5">
                                    <div className="form-group switch-btn">
                                        <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/chat.png'} />
                                        <div className="form-control">
                                            <h2>SMS</h2>
                                            <span className="switch-bg">
                                                <label className="switch">
                                                    <input checked={involveSms} onChange={(e) => handleInvolveSMS(e)} type="checkbox" />
                                                    <span className="slider round"></span>
                                                </label>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="form-group switch-btn">
                                        <img className="input-image" src={process.env.PUBLIC_URL + '/css/resources-images/email.svg'} />

                                        <div className="form-control">
                                            <h2>Email</h2>
                                            <span className="switch-bg">
                                                <label className="switch">
                                                    <input checked={involveEmail} onChange={(e) => handleInvolveEmail(e)} type="checkbox" />
                                                    <span className="slider round"></span>
                                                </label>
                                            </span>
                                        </div>
                                    </div>


                                    {/* {isEdit===true?(
                                            <div className="form-group switch-btn">
                                                <h2>Disable User</h2>
                                                <label className="switch">
                                                    <input onChange={(e) => handleDisable(e)} checked={disable} type="checkbox" />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        ):("")} */}
                                    

                                    <div className="form-group cancel-next">
                                        <button className="cancel" onClick={handleBack}>Back</button>
                                        <button className="next-btn" onClick={handleConfirmationDialog}>Save</button>

                                    </div>

                                </div>
                                <div className="col-md-6 pr-md-3  pt-md-5 hide-image resource-image-center">
                                    <img className="resource-right-image" src={process.env.PUBLIC_URL + '/css/resources-images/Group 5966.svg'} />
                                </div>


                            </div>
                        </div>
                    </div>
                );
            default:
                return 'Unknown step';
        }
    }

    const header = <h6>Pick a password</h6>;
    const footer = (
        <React.Fragment>
            <hr />
            <p className="p-mt-2">Suggestions</p>
            <ul className="p-pl-2 p-ml-2 p-mt-0" style={{ lineHeight: '1.5' }}>
                <li>At least one lowercase</li>
                <li>At least one uppercase</li>
                <li>At least one numeric</li>
                <li>Minimum 8 characters</li>
            </ul>
        </React.Fragment>
    );

    if (pageLoading) {
        return (
            <>
                <SnackBar open={openSnackBar} severity={severity} message={responseMsg} />
                <Spinner />
            </>
        )
    }
    else {
        return (
            <div >
                <div>
                    {allStepsCompleted() ? (
                        <div>

                        </div>
                    ) : (
                        <div>
                            <div>
                                <div className="resources-container">
                                    <div className="row home-resources d-none d-md-block">
                                        <div className="col-12">
                                            <h6><Link to="/">Home</Link> / <Link to="/resourcesPool">Resources</Link><span> / AddResource</span></h6>
                                        </div>
                                    </div>

                                    <div className="row d-md-flex d-none">
                                        <div className="col-md-12 resources-heading">
                                            <h1>Add Resource</h1>
                                        </div>
                                    </div>

                                    <div className="row d-md-none d-block">
                                        <div className="col-md-6 text-center resource-manager">
                                            <h1><Link to="/resourcesPool"><i className="fa fa-chevron-left"></i></Link>Add Resource<Link to="/resourcesPool"><i className="fa fa-times"></i></Link></h1>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {getStepContent(activeStep)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <Confirmation Open={openConfirmation} message="Are you sure you want to save this information?" ConfirmationResponse={(e, mode) => ConfirmationResponse(e, mode)} ConfirmationMode="Save" />

            </div>
        );
    }

}
export default PersonalInformation;
