import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AddComplaint from "./pages/AddComplaint";
import EmployeeRequests from "./pages/EmployeeRequests";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/complaint" element={<AddComplaint />} />
        <Route path="/user/complaint" element={<AddComplaint />} />
        <Route path="/user/requests" element={<EmployeeRequests />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
