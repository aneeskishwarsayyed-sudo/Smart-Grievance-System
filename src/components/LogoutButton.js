import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <button className="btn logout" onClick={logout}>
      Logout
    </button>
  );
}

export default LogoutButton;
