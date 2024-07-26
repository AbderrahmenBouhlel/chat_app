import { useState,useRef, useEffect } from "react";

import { FaRegUserCircle } from "react-icons/fa";
import './loginCss/login.css'

import { useNavigate } from "react-router-dom";
import Avatar from "../../components/avatar/avatar";



function Login(props) {
    const [state, setState] = useState('email');
    const [formData , setFormData] = useState({email:'' , password:''})
    
    const [error , setError] = useState('')
    const [photoData , setPhotoData] = useState('')
    const navigate = useNavigate();

    const hadleInputChange = (e)=>{
        const {name , value} = e.target;
        setFormData(prev => ({...prev , [name]:value}))
    }
  
    async function handleEmailSubmit(e){
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Explicitly set content type
                },
                body: JSON.stringify({email:formData.email}) // Send JSON data
            });
    
            const data = await response.json();
            if (data.error){
                props.setErrorMessage(true)
                props.setMessage(data.message)
                setTimeout(()=> {
                    props.setHideError(true)
                    setTimeout(()=>{
                        props.setErrorMessage(false)
                        props.setHideError(false)
                    },500)
                    
                }, 1800); 
                    throw new Error(data.message)
            }
            props.setUser(data.user)
            setPhotoData(data.user.photo)
            setState('password')
            props.setVerifyMessage(true)
            props.setMessage('Email Verify')
            setTimeout(()=> {
                props.setHideMsg(true)
                setTimeout(()=>{
                    props.setVerifyMessage(false)
                    props.setHideMsg(false)
                    props.setMessage('')
                },500)
                
             }, 1800); 

        } catch (error) {
            console.error('Error:', error);
        }

    }
    async function handlePasswordSubmit(e){
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Explicitly set content type
                },
                body: JSON.stringify({email:formData.email , password: formData.password}) // Send JSON data
            });
    
            const data = await response.json();
            if (data.error){
                props.setErrorMessage(true)
                props.setMessage(data.message)
                setTimeout(()=> {
                    props.setHideError(true)
                    setTimeout(()=>{
                        props.setErrorMessage(false)
                        props.setHideError(false)
                    },500)
                    
                }, 1800); 
                throw new Error(data.message)
            }
            if (data.token){
                localStorage.setItem('token',data.token)
            }
            props.setMessage('login successfully')
            props.setUser(data.user)
            navigate('/')
            props.setAuthSuccess(true)

        } catch (error) {
            console.error('Error:', error);
        }

    }

    useEffect(() => {
        if (props.authSuccess) {
            props.setVerifyMessage(true);
            setTimeout(() => {
                props.setHideMsg(true);
                setTimeout(() => {
                    props.setVerifyMessage(false);
                    props.setHideMsg(false);
                    props.setMessage('');
                    props.setAuthSuccess(false);
                }, 500);
            }, 1800);
        }
    }, [props.authSuccess]);
    

  return (
        <>
        
         {state == 'email' ? 
            <form  className="authForm" onSubmit={handleEmailSubmit}>
                <div className="iconContainer">
                    <FaRegUserCircle className="icon" />
                </div>
                <p className="salut">welcome to Yatiyiri Chat app!</p>

                <div className="inputField">
                    <label htmlFor="emailL">email:</label>
                    <input type="email" placeholder="enter your email" name="email" 
                        id="emailL" value={formData.email}
                        onChange={hadleInputChange} required
                    />
                </div>
                <button className="submit-btn" >let s go</button>
                <p className="existingAcount"> New User ? <span className="login" onClick={()=> navigate('/signUp')}>register</span></p>
                
            </form>
            :
            <form  className="authForm" onSubmit={handlePasswordSubmit}>
                <div className="iconContainer">
                    {photoData ? <Avatar className="userImage" photoData={photoData} /> 
                    : 
                    <FaRegUserCircle className="icon" />
                    }
                    
                </div>

                <p className="salut">welcome to Yatiyiri Chat app!</p>
                <div className="inputField">
                    <label htmlFor="passwordL">password:</label>
                    <input type="password" placeholder="enter your password" name="password" 
                        id="passwordL" value={formData.password}
                        onChange={hadleInputChange} required
                            />
                </div>
                <button className="submit-btn">Login</button>
                <p className="existingAcount"> Forgot password ? </p>

            </form>

        }
        </>
       
        
  );
}

export default Login;

