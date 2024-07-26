
import { useState , useEffect} from "react";
import './avatar.css'
import { FaUser } from "react-icons/fa";


export default function Avatar({photoData , className, active}){
    const [photo , setPhoto] = useState(null)
   

    useEffect(()=>{
       if (photoData){
        setPhoto(`data:image/jpeg;base64,${photoData}`);
       }
    },[photoData])

    return (
        <div className= { "imageContainer " + className} >
            {
                photo ?  <img src={photo}  alt="sample" className="image" />
                :
                <div className="AvatarIconContainer">
                    <FaUser className="randomUserIcon" />
                </div>
            }
           
            {active ? <div className="userStatus"></div> : null}
        </div>
    )
}