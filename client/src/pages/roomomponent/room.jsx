import "./roomCss/room.css"
import { FaPlus } from "react-icons/fa6";
import { IoIosSend } from "react-icons/io";
import Avatar from "../../components/avatar/avatar.jsx"
import { useEffect, useState , useRef} from "react";
import formatMessageTimestamp from "../../../utils/formatTimestamp.js"
import 'tippy.js/dist/tippy.css';
import Tippy from '@tippyjs/react';




export default function Room(props){
    const [friend , setFriend] = useState(null)
    
    const textareaRef = useRef(null);
    const formRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const isFirstRender = useRef(true)
    
 
    const handleInput = () => {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;

         // Adjust the height of the messagesContainer
        const formHeight = formRef.current.offsetHeight;
        messagesContainerRef.current.style.height = `calc(100% - ${formHeight}px)`;

        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        
    };
    useEffect(()=>{
        handleInput();
    }, [])
  
    useEffect(()=>{
        props.room.creator.id == props.user.id ? setFriend(props.room.friend) : setFriend(props.room.creator)
    },[props.room])
    
    useEffect(() => {
        async function fetchRoomMessages(roomId) {
            try {
                const response = await fetch('http://localhost:3000/api/message/roommessages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ roomId: roomId }),
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch room messages');
                }
    
                const data = await response.json();
                props.setCurrentRoomMessages(data.messages || []); // Ensure messages are set correctly
    
            } catch (error) {
                console.error('Error fetching room messages:', error.message);
            }
        }
    
        props.setCurrentRoomMessages([]); // Clear previous messages
    
        if (props.prevRoomId) {
            props.socket.emit('leave_room', { roomId: props.prevRoomId });
        }
    
        if (props.room.roomId) {
            fetchRoomMessages(props.room.roomId);
        }
    
    }, [props.room]);
    
    
    
      useEffect(() => {
        // Scroll to the bottom when roomMessages change
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, [props.currentRoomMessages]);

    
      async function addMessageDB(messageObj) {
            try {
                const response = await fetch('http://localhost:3000/api/message/createmessage', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(messageObj)
                });
        
                // Check if response is OK
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to add message');
                }
        
                const data = await response.json();
                // Handle success, e.g., update UI or state
        
            } catch (error) {
                console.error('Error:', error.message);
                // Handle the error, e.g., show an error message to the user
            }
      }
    

    async function MessageSubmit(e) {
    e.preventDefault();
    const messageContent = textareaRef.current.value;
    const now = new Date().toISOString(); // Adjust format if necessary

    const messageObj = {
        content: messageContent,
        timestamp: now,
        user_id: props.user.id ,
        room_id: props.room.roomId,
        status:'sent',
        recipientId : friend.id ,
    };

    await addMessageDB(messageObj);


    await props.socket.emit('send_message' , messageObj)
    
    
    props.setUserRooms(prev => {
        return prev.map((roomObj)=>{
            if (roomObj.roomId === props.room.roomId){
                return ({...roomObj , latestMessage: messageObj})
            }
            return roomObj;
        })
    })
    
    props.setCurrentRoomMessages((prev) => [...prev, messageObj]);
    textareaRef.current.value = ""
    }

    function handleKeyDown(e){
        if (e.key === "Enter" && !e.shiftKey) { // Check for Enter key (without Shift)
            MessageSubmit(e); // Submit the message
        }
    }

    useEffect(()=>{
        if(props.room.roomNotifications && props.room.roomNotifications.length>0){
            console.log(props.room.roomNotifications)
            for (let notification of props.room.roomNotifications){
                console.log(notification)
                props.socket.emit('readNotification' ,{notificationId : notification.notificationId})
            }
            props.setUserRooms((prev) =>{
                return prev.map(room =>{
                    if (room.roomId === props.room.roomId){
                        return {...room , roomNotifications:{}}
                    }
                    return room;
                })
            })
        }
    }, [props.room])



    useEffect(()=>{
        if (isFirstRender.current){
            const handleMessageReceive = (data) => {
                props.setCurrentRoomMessages((prev) => [...prev, data.message_data]);
                props.setCurrentRoomMessages((prev) => [...prev, data]);
            };
         
          
            props.socket.on('recive_message' , handleMessageReceive)
          
            isFirstRender.current =false ;
            return () => {
                props.socket.off('receive_message', handleMessageReceive);
            };
        }
        
        
    }, [props.socket])

    useEffect(()=>{
        if (props.user){
            props.socket.emit('join_room' ,props.room.roomId)
        }
    }, [props.room, props.user])

  

 
  
    return (
        <div className="roomContainer">
            <div className="friendInfo">
                <Avatar photoData={friend?.photo}  className={"friendPhoto"}/>
                <div className="freindStatus">
                    <h2 className="name">{friend?.username}</h2>
                    <p className="status">offline</p>
                </div>
            </div>
            <div className="room">
                <div className="messagesContainer" ref={messagesContainerRef}>
                    {props.currentRoomMessages.map((message , index)=>{
                        return (
                            <Tippy key={index} content={<div className="tippiMsg"> {formatMessageTimestamp(message.timestamp)} </div>}  placement={"left"}>
                                <div key={index}  className={`message ${message.user_id == props.user.id ? "userMessage" : "friendMessage"}`}>
                                    <p>{message.content}</p>
                                </div>

                            </Tippy>
                            
                            
                        )
                    })}
                    
                   
                
                </div>
                <form ref={formRef} onSubmit={MessageSubmit} className="inputCont" >
                    <FaPlus  className=" icon searchIcon"/>
                    <textarea ref={textareaRef} className="messageInput" placeholder="tap your message here ..."
                              onInput={handleInput} name="" id=""
                              onKeyDown={handleKeyDown}
                    />
                    
         
                    
                    <button type="submit" className="submitBtn">
                        <IoIosSend className="icon sendIcon"/>
                    </button>
                </form>
                
            </div>
        
        </div>
    )
}