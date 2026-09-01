import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register as registerApi, login as loginApi } from "../service/auth.api";
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

      dispatch(setUser(data.user || data));
      dispatch(setLoading(false));
      setLocalLoading(false);
      setSuccess(true);
      return { success: true, data };
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

      dispatch(setUser(data.user || data));
      dispatch(setLoading(false));
      setLocalLoading(false);
      setSuccess(true);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Login failed. Please enter valid credentials.";
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      setLocalLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    user,
    loading: localLoading || reduxLoading || false,
    error: localError || reduxError,
    success,
    handleRegister,
    handleLogin,
    clearError: () => {
      setLocalError(null);
      dispatch(setError(null));
    }
  };
};

export default useAuth;
