import React from "react";
import { Button } from 'primereact/button';

interface ImageUploadProps {
    imagePreviewUrl: string;
    LoadImage(file: File): void;
    isEdit: boolean,
    userImage:string
}
interface ImageUploadState {
    loading: boolean,
    isEdit: boolean,
    isCloseIconHidden: boolean

}

class ImageUpload extends React.Component<ImageUploadProps, ImageUploadState> {
    constructor(props) {
        super(props);

        this.state = {
            isEdit: this.props.isEdit,
            loading: false,
            isCloseIconHidden: false
        };
    }

    componentDidUpdate(prevProps) {
      
        if (prevProps.imagePreviewUrl !== this.props.imagePreviewUrl) {
            this.setState({
                loading: false,
            });
        }
    }


    _handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        var files = e.target.files;
        if (files![0] !== undefined) {
            this.setState({ loading: true,})
            this.props.LoadImage(files![0]);
        }
    }

    handleClear = () => {
        var emptyFile = File;
        this.props.LoadImage(emptyFile[0]);
        // this.setState({
        //     isCloseIconHidden: true
        // });
    }

    render() {
        let { imagePreviewUrl } = this.props;
        let imagePreview: any = null;
        if (imagePreviewUrl) {
            imagePreview = (<img src={imagePreviewUrl} />);
        } else {
            imagePreview = (
                <div className="camera-image" >
                    <img src={process.env.PUBLIC_URL + '/css/resources-images/camera.svg'} />
                    <span className="upload-image">Upload Photo</span>
                </div >);
        }

        return (
            <div className="previewComponent" >
                {/* <Button hidden={this.state.isCloseIconHidden} style={{ height: "18px", width: "18px" }} onClick={this.handleClear} icon="pi pi-times" className="p-button-rounded" /> */}
                {this.state.loading === true ? (<Button style={{ height: "18px", width: "18px" }} icon="pi pi-spin pi-spinner" className="p-button-rounded" />) : ("")}
                <label htmlFor="file-input"> {imagePreview}</label>

                <input id="file-input" className="fileInput"
                    type="file"
                    onChange={(e) => this._handleImageChange(e)} />

            </div>
        )
    }
}

export default ImageUpload