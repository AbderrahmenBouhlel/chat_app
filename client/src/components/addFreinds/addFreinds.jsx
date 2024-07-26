import React ,{ useEffect , useState } from "react"
import { CiSearch } from "react-icons/ci";
import "./addFreindsCss/addFreinds.css"
import Avatar from "../avatar/avatar";
import { useNavigate } from "react-router-dom";


const AddFreinds = React.forwardRef((props, ref) => {
    const navigate = useNavigate()
    const {socket} = props ;
    useEffect(()=>{
        fetch ('http://localhost:3000/api/auth/users', {
            method:'GET' ,
        })
        .then((resp)=>{
            return resp.json()
        })
        .then((data)=>{
            if (data.error){
                throw new Error(data.message)
            }
            props.setUserRows(data.users)
        })
        .catch((error)=>{
            console.error(error)
        }) 
        
        
    },[])

    useEffect(() => {
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

    async function handleBeginConversation(friend){
        if (socket){
            socket.emit('createRoom' , {
                userId:props.user.id ,
                friendId:friend.id
            })
            props.setState('messanger');
        }
    }
    return (
     
        <form action="" className="addFreinds" key={props.addFreindsRef} ref={ref}>
            <div className="searchBarCont">
                <input className="searchBar" type="text" name="" id="" />
                <div className="iconContainer">
                    <CiSearch  className="searchIcon"/>
                </div>
                
            </div>

            <div className="userscontainer">
                {props.userRows.map((user , index)=>{
                    return (
                        user.id !== props.user.id ? 
                            <div className="userInfo" key={index} onClick={()=>handleBeginConversation(user)}>
                                <Avatar photoData={user.photo} className={"userAvatar"}/>
                                <div className="nameEmail">
                                    <p className="name">{user.username}</p>
                                    <p className="email">{user.email}</p>
                                </div>
                            </div>
                            :
                            null
                    )
                })}

            </div>
        </form>
           
      
    )
})

export default AddFreinds ;