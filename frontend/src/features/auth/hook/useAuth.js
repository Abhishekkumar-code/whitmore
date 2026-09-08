import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register as registerApi, login as loginApi, getme } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading: reduxLoading, error: reduxError } = useSelector((state) => state.auth || {});
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async ({ fullname, email, contact, password, isSeller }) => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      setSuccess(false);
      dispatch(setLoading(true));
      dispatch(setError(null));

      const data = await registerApi({ fullname, email, contact, password, isSeller });

      const userData = data.user || data;
      dispatch(setUser(userData));
      dispatch(setLoading(false));
      setLocalLoading(false);
      setSuccess(true);
      return { success: true, user: userData, data };
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Registration failed. Please try again.";
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      setLocalLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const handleLogin = async ({ email, password }) => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      setSuccess(false);
      dispatch(setLoading(true));
      dispatch(setError(null));

      const data = await loginApi({ email, password });

      const userData = data.user || data;
      dispatch(setUser(userData));
      dispatch(setLoading(false));
      setLocalLoading(false);
      setSuccess(true);
      return { success: true, user: userData, data };
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Login failed. Please enter valid credentials.";
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      setLocalLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const handlegetme = async()=>{
    try{
          dispatch(setLoading(true))
      const data = await getme()
      dispatch(setUser(data.user))

    }
    
    catch(err){
      
      console.log(err)
    }
    
    finally{

    dispatch(setLoading(false))
    }
  
  }


  return {
    user,
    loading: localLoading || reduxLoading || false,
    error: localError || reduxError,
    success,
    handleRegister,
    handleLogin,
    handlegetme,
    clearError: () => {
      setLocalError(null);
      dispatch(setError(null));
    }
  };
};

export default useAuth;
