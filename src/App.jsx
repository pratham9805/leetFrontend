import { Route,Routes,Navigate } from "react-router";
import Homepage from "../pages/Homepage";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import { checkAuth } from "./authSlice";
import {useDispatch,useSelector} from "react-redux"
import { useEffect } from "react";
import AdminPanel from "../pages/AdminPanel";
function App(){

  const {isAuthenticated,loading,user} = useSelector((state)=>state.auth)
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(checkAuth())
  },[])
  if(loading){
    return(
      <div className="flex min-h-screen items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }
  return(<>
  <Routes>
    <Route path="/" element={isAuthenticated?<Homepage></Homepage>:<Navigate to={"/signup"}/>}></Route>
    <Route path="/login" element={isAuthenticated?<Navigate to={'/'}/>:<Login></Login>}></Route>
    <Route path="/signup" element={isAuthenticated?<Navigate to={'/'}/>:<Signup></Signup>}></Route>
    <Route path="/admin" element={isAuthenticated&&user?.role=='admin'?<AdminPanel/>:<Navigate to={'/'}/>}></Route>
  </Routes>
  
  </>)
  
}
export default App;