import { useEffect, useState } from "react"
import Avatar from "../avatar/avatar"




const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
export default function SelectCon(props){
    const [latestNotification , setLatestNotification] = useState(null)
    const [latestRoomMessage , setLatestRoomMessage] = useState(null)
    

    useEffect(() => {
        async function fetchRoomMessage(roomId) {
            try {
                const response = await fetch('http://localhost:3000/api/message/roomlatestmessage', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ roomId: props.room.roomId }),
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch room latest message');
                }
    
                const data = await response.json();
                if (data.message.length > 0){
                    setLatestRoomMessage(data.message[0].content); // Ensure messages are set correctly
                }
                
    
            } catch (error) {
                console.error('Error fetching room messages:', error.message);
            }
           
        }
    
        if (props.room.roomId) {
            fetchRoomMessage(props.room.roomId);
        }
    
    }, []);
    
  

  
    // useEffect(() => {
    //     console.log(props.notifications)
    //     if (!props.notifications || props.notifications.length === 0) {
    //         setLatestNotification(null);
    //         return;
    //     }
    
    //     const latestNotification = props.notifications[props.notifications.length - 1];
    //     console.log(latestNotification)
    //     // Update user rooms with the latest message
    //     props.setUserRooms(prev => prev.map(roomObj => 
    //         roomObj.roomId === props.room.roomId 
    //             ? { ...roomObj, latestMessage: latestNotification.message_data.content }
    //             : roomObj
    //     ));
    
    //     // Set the latest notification
    //     setLatestNotification(latestNotification);
    // }, [props.notifications]);
    useEffect(()=>{
        let currentRoom = props.userRooms.find(room => room.roomId === props.room.roomId)
        if (currentRoom.latestMessage){
            setLatestRoomMessage(currentRoom.latestMessage.content)
        }
    }, [props.userRooms])

    useEffect(()=>{
        console.log(latestRoomMessage)
    }, [latestRoomMessage])



    

    return (

        <div className='converstaion' onClick={e => props.handleRoomNav(props.room.roomId)}>
            <Avatar photoData={props.friend.photo} className={"friendImage"}/>
            <div className='conversationInfo'>
            
                <p className="name">
                    {props.friend.username}
                </p>
                <p className="notification">
                    {latestNotification? truncateText(latestNotification.message_data.content, 20) : truncateText(latestRoomMessage, 60)  }
                    
                </p>
                
                {props.notifications && props.notifications.length>0 && <div className='notificationNbr'> {props.notifications.length} </div>}

            </div>
        </div>
    
    )
}


