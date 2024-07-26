import { BrowserRouter as Router, Routes, Route , useNavigate } from "react-router-dom";
import './App.css';
import SignUp from "./pages/signupComponent/signup";
import Login from './pages/loginComponent/login';
import Layout from "./pages/layoutComponent/lyout";
import Home from "./pages/homeComponent/home";
import { useEffect, useState, useRef } from "react";
import io from 'socket.io-client'
import { FaCheckCircle } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import Room from "./pages/roomomponent/room";


function App() {
  const [user, setUser] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [currentRoomMessages ,setCurrentRoomMessages ] = useState([])

  const [prevRoomId, setPrevRoomId] = useState(null);
  const [userRooms, setUserRooms] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state
  const [notification, setNotification] = useState(null) ; 


  const [socket, setSocket] = useState(null);
  const [verifyMessage, setVerifyMessage] = useState(false);
  const [hideMsg, setHideMsg] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [hideError, setHideError] = useState(false);
  const [message, setMessage] = useState("");


  const navigate = useNavigate()
  useEffect(() => {
    let newSocket
    if (user && user.id && authSuccess) {
      newSocket = io("http://localhost:3000");
      newSocket.on('request_user_id' , ()=>{
        console.log('Received request_user_id event from server');
        newSocket.emit('set_user_id', { userId :user.id });
      })
      setSocket(newSocket);


      newSocket.on('new_notification' , (data)=>{
        console.log('Received notification event from server');
        setNotification(data)
      })
      
      newSocket.on('roomCreated', (roomDetails) => {
        console.log('Room created:', roomDetails);
        setUserRooms(prev => [...prev ,roomDetails ])
        if (currentRoomId){
          console.log("setting the prev room")
          setPrevRoomId(currentRoomId)
        }
        setCurrentRoomId(roomDetails.roomId)
        // Update user rooms or handle room creation
      });
      newSocket.on('roomfounded', (roomId) => {
        if (currentRoomId){
          console.log("setting the prev room")
          setPrevRoomId(currentRoomId)
        }
        setCurrentRoomId(roomId)
        // Update user rooms or handle room creation
      });

      fetch('http://localhost:3000/api/room/userrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.message);
          }
          setUserRooms(data.userRooms);
          setLoading(false); // Set loading to false once data is fetched
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
          setLoading(false); // Set loading to false in case of error
        });

        return  () => {
          newSocket.off('request_user_id');
          newSocket.off('new_notification');
          newSocket.off('roomCreated');
          newSocket.off('roomfounded');
          newSocket.off('recive_message');
          newSocket.disconnect();
        };
    }

  }, [user]);

  useEffect(() => {
      const token = localStorage.getItem('token');
      if (token != 'null') {
        fetch('http://localhost:3000/api/auth/protected', {
          method: 'GET',
          headers: { authorization: token },
        })
          .then((resp) => resp.json())
          .then((data) => {
            if (data.error) {
              throw new Error(data.message);
            }
            if (data.user) {
              setUser(data.user);
              setAuthSuccess(true)
            }
          })
          .catch((error) => {
            console.error('Error fetching user:', error);
            localStorage.setItem('token' , null);
            navigate('/login');
            setLoading(false);
          });
      }
      else{
        navigate('/signUp')
        setLoading(false);
      }

  }, []);


  useEffect(()=>{
    if (currentRoomId ){
      navigate('/'+currentRoomId)
    }

    
  }, [currentRoomId, userRooms])


  useEffect(()=>{
    if (notification){
      let notRoomId = notification.message_data.room_id ;
      setUserRooms(prev => {
        let newUserRooms = prev.map((room)=>{
          if (room.roomId === notRoomId){
            console.log("setting user rooms")
            if (room.roomNotifications && room.roomNotifications.length > 0) {
              let newNotifcations = [...room.roomNotifications , notification]
              return {...room , roomNotifications:newNotifcations}
            }
            else{
              return {...room , roomNotifications:[notification]}
            }
          }
          else{
            return room
          }
        })
        return newUserRooms
      })
    }
  }, [ notification])

  return (
    <>
      {verifyMessage && (
        <div className={`verifyMsg ${hideMsg ? 'hide' : ''}`}>
          <FaCheckCircle className="icon" />
          {message}
        </div>
      )}
      {errorMessage && (
        <div className={`verifyMsg ${hideError ? 'hide' : ''}`}>
          <FaRegCircleXmark className="icon" />
          {message}
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <Home
                user={user}
                setUser={setUser}
                authSuccess={authSuccess}
                setHideMsg={setHideMsg}
                setMessage={setMessage}
                setVerifyMessage={setVerifyMessage}
                setAuthSuccess={setAuthSuccess}
                setCurrentRoomId={setCurrentRoomId}
                currentRoomId={currentRoomId}
                userRooms={userRooms}
                setUserRooms={setUserRooms}
                socket={socket}
                setPrevRoomId={setPrevRoomId}
                prevRoomId={prevRoomId}
                currentRoomMessages={currentRoomMessages}
                setCurrentRoomMessages={setCurrentRoomMessages}
              />
            }
          >
            {userRooms?.map((room) => {
              return <Route
                key={room.roomId}
                path={`${room.roomId}`}
                element={<Room room={room} user={user} socket={socket} 
                          prevRoomId={prevRoomId}  currentRoomMessages={currentRoomMessages}
                          setCurrentRoomMessages={setCurrentRoomMessages} 
                          setUserRooms={setUserRooms} userRooms= {userRooms}

                        />}
              />}
            )}
          </Route>
          <Route element={<Layout />}>
            <Route
              path="signup"
              element={<SignUp setAuthSuccess={setAuthSuccess} setMessage={setMessage} />}
            />
            <Route
              path="login"
              element={
                <Login
                  setVerifyMessage={setVerifyMessage}
                  setAuthSuccess={setAuthSuccess}
                  setUser={setUser}
                  user={user}
                  setHideMsg={setHideMsg}
                  authSuccess={authSuccess}
                  setErrorMessage={setErrorMessage}
                  setHideError={setHideError}
                  setMessage={setMessage}
                />
              }
            />
          </Route>
        </Routes>
      )}
    </>
  );
}

export default App;
