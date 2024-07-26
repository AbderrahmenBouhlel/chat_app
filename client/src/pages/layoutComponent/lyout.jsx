import {Outlet , Link} from "react-router-dom"
import { TbBrandYatse } from "react-icons/tb";
import "./loyoutCss/layout.css"


export default function Layout() {
    return (
      <div className="pageContainer">
        <nav className="navBar">
          <Link to="/">
            <div className="logoContainer">
              <TbBrandYatse className="icon" />
              <h1 className="name">Yatiyiri Chat App</h1>
            </div>
          </Link>
        </nav>
        <div className="FormContainer">
          <Outlet />
        </div>
      </div>
    );

}
