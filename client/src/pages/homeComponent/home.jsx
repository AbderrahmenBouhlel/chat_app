import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../../components/sideBarComponent/sideBar";
import './homeCss/home.css';
import UserChanges from "../../components/userChanges/userChanges";
import AddFreinds from "../../components/addFreinds/addFreinds";
import { TbBrandYatse } from "react-icons/tb";

export default function Home(props) {
    const [state, setState] = useState('messanger')
    const [slectedFreind , setSlectedFreind] = useState(null)
    const [userRows, setUserRows] = useState([]);
    const userChangesRef = useRef(null);
    const addFreindsRef = useRef(null);
    const layerRef = useRef(null);
    const isFirstRender = useRef(true)

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

    

    useEffect(() => {
        if (state === "userChanges" || state === "addFreinds") {
            layerRef.current.style.zIndex = 1001;
        } else if (state === 'messanger') {
            layerRef.current.style.zIndex = -1;
        }
    }, [state]);


    
    return (
        <>
            <div className='layer' ref={layerRef}></div>
            {state === "userChanges" ? <UserChanges ref={userChangesRef} setState={setState} user={props.user} setUser={props.setUser} />
                :
                (state === "addFreinds" ? <AddFreinds ref={addFreindsRef} setUserRows={setUserRows} user={props.user} 
                                                      userRows={userRows} setState={setState} setSlectedFreind={setSlectedFreind}
                                                      setCurrentRoomId={props.setCurrentRoomId} socket={props.socket}
                                                      setPrevRoomId={props.setPrevRoomId}
                                          />
                    :
                    null
                )
            }
            <div className="home">
                <section>
                    <SideBar setState={setState} layerRef={layerRef} 
                             user={props.user} setUser={props.setUser}
                             userRooms = {props.userRooms}
                             setUserRooms = {props.setUserRooms}
                             currentRoomId = {props.currentRoomId}
                             setCurrentRoomId={props.setCurrentRoomId}
                             setPrevRoomId={props.setPrevRoomId}
                             socket={props.socket}
                             currentRoomMessages={props.currentRoomMessages}
                             setCurrentRoomMessages={props.setCurrentRoomMessages}
                             
                    />
                </section>

                <section className="roomSection">
                    {props.currentRoomId ? <Outlet context={{user:props.user , currentRoomId:props.currentRoomId, slectedFreind:slectedFreind}}/> 
                    : 
                    <div className="container">
                        <div className="logo">
                            <TbBrandYatse className="icon" />
                            <h1 className="name">Yatiyiri Chat App</h1>
                        </div>
                        <p className="text">Select user to send message</p>
                    </div> 
                    }
                </section>
            </div>
        </>
    );
}
