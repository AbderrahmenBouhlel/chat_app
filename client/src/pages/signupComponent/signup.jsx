import { useState,useRef } from "react";
import "./signupCss/signup.css"
import { FaXmark } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";


function SignUp(props) {
    const [fileName, setFileName] = useState('Upload profile picture');
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        photo: ""
    });
    const navigate = useNavigate()
    const fileInputRef = useRef(null);

    const handleLoginNavigation =()=>{
        navigate('/login')
    }
    const handleHomeNavigation =()=>{
        navigate('/')
    }
    const hadleInputChange = (e)=>{
        const {name , value} = e.target;
        setFormData(prev => ({...prev , [name]:value}))
    }
    const hadleFileChange = (e)=>{
        const file = e.target.files[0]; // get the file
        if (file){
            setFormData(prev => ({...prev , photo:file}))
            setFileName(file.name)
        }
        else{
            setFormData(prev => ({...prev , photo:""}))
            setFileName('Upload profile picture')
        }
    }
    const handleFileRemove= (e)=>{
        setFormData(prev => ({...prev , photo:null}))
        setFileName('Upload profile picture')
        if (fileInputRef.current){
            fileInputRef.current.value = '';
        }
        
    }
  function handlFormSubmit(e){
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
    }
    fetch ('http://localhost:3000/api/auth/signup', {
        method:'POST' ,
        body : formDataToSend
    })
    
    .then((resp) => resp.json())
    .then((data)=>{
        if (data.error){
            throw new Error(data.message);
        }
        props.setMessage('user created successfully');
        props.setAuthSuccess(true);
        handleLoginNavigation();
    })
    .catch(error =>{
        console.error('Error:',error);
    })
    

    
  }
  return (
    <form  className="authForm" onSubmit={handlFormSubmit} encType="multipart/form-data">
        <p className="salut">welcome to Yatiyiri Chat app!</p>
        <div className="inputField">
            <label htmlFor="nameS">Name:</label>
            <input type="text" placeholder="enter your name" name="name" 
                   id="nameS" value={formData.name}
                   onChange={hadleInputChange} required
                    />
        </div>
        <div className="inputField">
            <label htmlFor="emailFieldS">Email:</label>
            <input type="email" placeholder="enter your email" name="email" 
                   id="emailFieldS" value={formData.email}
                    onChange={hadleInputChange}  required 
                />
        </div>
        <div className="inputField">
            <label htmlFor="passwordS">Password:</label>
            <input type="password" placeholder="enter your password" name="password" 
                   id="passwordS" onChange={hadleInputChange} 
                   value={formData.password} required
                   />
        </div>
        <div className="inputField">
            <p>Photo:</p>
            <div className="labelContainer">
                <label className="fileLabel" name="photo" htmlFor="imageField">{fileName} </label>
                {formData.photo ?  <button className="removeFileBtn" type="button" onClick={handleFileRemove}><FaXmark /></button> 
                    : null
                }
            </div>
            
            
            <input type="file" accept="image/*" name="imageField" ref={fileInputRef}
                   id="imageField" onChange={hadleFileChange}  />
        </div>
        <button className="submit-btn">Register</button>
        <p className="existingAcount"> already have an account? <span className="login" onClick={handleLoginNavigation}>Login</span></p>
    </form>
  );
}

export default SignUp;

