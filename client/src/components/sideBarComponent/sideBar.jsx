import './sideBarCss/sideBar.css'
import { RiLogoutBoxLine } from "react-icons/ri";
import { AiFillMessage } from "react-icons/ai";
import { FaUserPlus } from "react-icons/fa";
import Avatar from "../../components/avatar/avatar.jsx"
import { useEffect, useRef, useState } from 'react';
import { FiArrowUpLeft, FiRadio } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import SelectCon from '../selectConversation/selectCon.jsx';




export default function SideBar(props){
    const [photoData , setPhotoData] = useState(null)
    const navigate = useNavigate()
    
    function handleUserChanges(e) {
        e.stopPropagation();
        props.setState('userChanges');
    }
    function handleAddFreinds(e){
        e.stopPropagation();
        props.setState('addFreinds') ;
    }

    function handleRoomNav(roomId){
        props.setPrevRoomId(props.currentRoomId)
        props.setCurrentRoomId(roomId)
    }
    useEffect(()=>{
        if (props.user){
            setPhotoData(props.user.photo)
        }
    },[props.user])

    function handleLogout() {
        localStorage.removeItem('token'); // Remove the token from local storage
        props.socket.disconnect(); // Properly disconnect the socket
        navigate('/login'); // Redirect to the login page
    }

   
  
    return (
        <div className='sideBarContainer'>
            <div className="sideBar">
                <div className='section section1'>
                    <div className='item'>
                        <AiFillMessage className='icon message' />
                    </div>
                    <div className='item' onClick={handleAddFreinds}>
                        <FaUserPlus className='icon userPlus' />
                    </div>
                    
                </div>
                <div className='section section2'>
                    <div className="itemAvatar" onClick={handleUserChanges}>
                        <Avatar className="userAvatar" photoData={photoData} active={true} /> 
                    </div>
                    <div className="item" onClick={handleLogout} >
                        <RiLogoutBoxLine  className='icon logout'/>
                    </div>
                </div>
                
            </div>
            <div className='existingRooms'>
                <div className='title'>
                    <p>message</p>
                </div>
                <div className='converstaions'>
                    {props.userRooms ?  
                        props.userRooms.map((room , index)=>{
                            let friend ;
                            room.creator.id == props.user.id ? friend = room.friend : friend=room.creator
                            return (
                                <SelectCon key={index} friend={friend}
                                           room={room} handleRoomNav={handleRoomNav}
                                           userRooms = {props.userRooms} setUserRooms = {props.setUserRooms}
                                           notifications= {room.roomNotifications? room.roomNotifications : null}
                                           
                                 />
                            )
                        })
                    
                        :
                        <div className='explore'>
                            <FiArrowUpLeft className='icon'/>
                            <p className='message'>
                                Explore users to start a conversation with
                            </p>

                        </div>
                
                    }

                </div>
                
                
        
            </div>

            
        </div>
       

    )

}