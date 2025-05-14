import { fetchUserByToken } from "../src/redux/authSlice";

const restoreUserSession = (dispatch) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Dispatch the token to fetch user data
    // dispatch(fetchUserByToken(token));
  }
};

export default restoreUserSession;
