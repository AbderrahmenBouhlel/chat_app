import React, { useState, forwardRef, useEffect } from "react";
import Avatar from "../avatar/avatar";
import "./userChangesCss/userChanges.css";

const UserChanges = React.forwardRef((props, ref) => {
    const [formData, setFormData] = useState({
        username: "",
        photo: "",
        id: props.user?.id,
    });
    const [fileName, setFileName] = useState("change profile picture");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, photo: file }));
            setFileName(file.name);
        } else {
            setFormData(prev => ({ ...prev, photo: "" }));
            setFileName('change profile picture');
        }
    };

    const handleCancel = () => {
        props.setState('messanger');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        if (formData.username || formData.photo) {
            if (formData.username) {
                formDataToSend.append('username', formData.username);
            }
            if (formData.photo) {
                formDataToSend.append('photo', formData.photo);
            }
            formDataToSend.append('id', formData.id);
            fetch('http://localhost:3000/api/auth/userchanges', {
                method: 'POST',
                body: formDataToSend
            })
            .then(resp => resp.json())
            .then(data => {
                if(data.error){
                    throw new Error(data.message)
                }
                handleCancel();
                console.log(data.user)
                props.setUser(data.user);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    };
    useEffect(() => {
        console.log(props.user)
        const handleClickOutside = (event) => {
            if (
                ref.current && !ref.current.contains(event.target) 
            ) {
                props.setState('messanger');
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className="container" ref={ref}>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <h5 className="details">Profile Details</h5>
                <p className="editText">Edit user details</p>

                <div className="inputField">
                    <p>Name:</p>
                    <input defaultValue={props.user?.username} className="nameInput" type="text" name="username" id="nameC" onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))} />
                </div>

                <div className="inputField">
                    <p>Photo:</p>
                    <div className="photoField">
                        <Avatar className={"userChangePhoto"} photoData={props.user?.photo} />
                        <label className="photoLabel" htmlFor="imageFieldC">{fileName}</label>
                        <input type="file" accept="image/*" name="imageField" id="imageFieldC" onChange={handleFileChange} />
                    </div>
                </div>

                <hr />
                <div className="btnsCont">
                    <button className="cancelBtn" type="button" onClick={handleCancel}>Cancel</button>
                    <button className="saveBtn">Save</button>
                </div>
            </form>
        </div>
    );
});

export default UserChanges;
