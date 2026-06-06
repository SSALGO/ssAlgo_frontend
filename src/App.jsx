import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation
} from "react-router-dom";
import axios from 'axios';
import Sidebar from "./Components/Dashbord/SideBar";
import TradeHistory from "./Components/Dashbord/TradeHistory";
import MainTradeHistory from "./Components/Dashbord/MainTradeHistory";
import Pricing from "./Components/Dashbord/Pricing";
import UserProfile from "./Components/Dashbord/UserProfile";
import EditApi from "./Components/Dashbord/EditApi";
import TableComponent from "./Components/AdminDash/TableComponent";
import AuthPage from "./Page/AuthPage";
import Dashboard from "./Components/Dashbord/Dashboard";
import AdminDashboard from "./Components/AdminDash/AdminDashboard";
import StrategyDashboard from "./Components/AdminDash/StrategyDashboard";
import ForgetPage from "./Page/ForgetPage";
import DeletePopup from "./Components/PopUp/DeletePopup";
import { postData } from "./api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "./Components/Buttons/ScrollToTop";

const ProtectedRoute = ({ children, redirectTo, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to={redirectTo} />;
};

function AppContent() {
  const location = useLocation();
  const [userProfile, setUserProfile] = useState({});
  const [userData, setUserData] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [BrokerDropdown, setBrokerDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [name, setName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userlog, setuserlog] = useState(false);
  const [brokers, setBrokers] = useState({});

  const isAuth = localStorage.getItem("token");
  const isAuthenticated = !isAuth || isAuth === "undefined" ? false : true;
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    if (isAuthenticated) {
      // setuserlog(true);
      fetchUserProfile();
    }
  },[])


  useEffect(() => {
    // Call API based on current route
    switch (location.pathname) {
      case '/admin/user':
        fetchUsers();
   
        break;
      case '/admin/subscription':
        fetchSubscriptions();
        // fetchTradeHistory();
        break;
      case '/admin/api':
        fetchApis();
        // fetchMainTradeHistory();
        break;
      case '/pricing':
        fetchPricingData();
        break;
      case '/':
        fetchDashboardData();
        break;
      case '/user':
        fetchUserProfile();
        break;
      case '/trade-history':
        fetchTradeHistory();
        break;
      case '/main-trade-history':
        fetchMainTradeHistory();
        break;
      default:
        break;
    }
  }, [location]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      // console.log(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchTradeHistory = async () => {
    try {
      const response = await axios.get('/api/trade-history');
      // console.log(response.data);
    } catch (error) {
      console.error('Error fetching trade history:', error);
    }
  };

  const fetchMainTradeHistory = async () => {
    try {
      const response = await axios.get('/api/main-trade-history');
      // console.log(response.data);
    } catch (error) {
      console.error('Error fetching main trade history:', error);
    }
  };

  const fetchPricingData = async () => {
    try {
      const response = await axios.get('/api/pricing');
      // console.log(response.data);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
    }
  };

  const fetchApis = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await postData("api_apis", { token });
      setApiData(response.data);
    } catch (error) {
      console.error("Error fetching APIs:", error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await postData("api_subscription", { token });
      setSubscriptionData(response.data);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await postData("api_user_profile", { token });
      setUserProfile(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await postData("api_users", { token });
      console.log(response);
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleBrokerDropdown = () => {
    setBrokerDropdown(!BrokerDropdown);
  };

  const headerData = (data) => {
    setuserlog(data.userlog);
    setBrokers(data.brokers);
  };

  const sidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleDelete = (row, type) => {
    setItemToDelete(row);
    setDeleteType(type);
    setName(type.charAt(0).toUpperCase() + type.slice(1));
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete && deleteType) {
      let endpoint = "";
      const token = localStorage.getItem("token");

      switch (deleteType) {
        case "user":
          endpoint = `api_delete_user/${itemToDelete.id}`;
          break;
        case "subscription":
          endpoint = "api_delete_subscription";
          break;
        case "api":
          endpoint = "api_delete_api";
          break;
        default:
          break;
      }
      setShowDeletePopup(false);
      const payload =
        deleteType === "user" ? { token } : { token, id: itemToDelete._id };

      try {
        await postData(endpoint, payload);
        setItemToDelete(null);
        setDeleteType("");

        if (deleteType === "user") fetchUsers();
        else if (deleteType === "subscription") fetchSubscriptions();
        else if (deleteType === "api") fetchApis();
      } catch (error) {
        console.error("Error during deletion:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    window.location.reload();
  }


  const cancelDelete = () => {
    setShowDeletePopup(false);
    setItemToDelete(null);
    setDeleteType("");
  };

  const changeUserTypeToAdmin = () => {
    if (userProfile.admin) {
      localStorage.setItem("userType", "admin");
      window.open("/admin/dashboard", "_self");
      toast.success("User type changed to Admin");
    } else {
      toast.error("You are not an admin");
    }
  };

  const changeUserTypeToUser = () => {
    localStorage.setItem("userType", "user");
    window.open("/", "_self");
    toast.success("User type changed to User");
  };

  const handleUpdate = async (row) => {
    const token = localStorage.getItem("token");
  
    if (row.isEditing === "User Management") {
      const id = row.updatedData.id;
      const response = await postData(`api_update_user/${id}`, {
        token,
        username: row.updatedData.username,
        email: row.updatedData.email,
        mobile: row.updatedData.mobile,
        StrategyLimit: row.updatedData.StrategyLimit,
      });
      fetchUsers();
    }
    if (row.isEditing === "Subscriptions") {
      const response = await postData("api_update_subscription", {
        token,
        id: row.updatedData._id,
        subtype: row.updatedData.subtype,
        start: row.updatedData.start,
        end: row.updatedData.end,
      });
      fetchSubscriptions();
    }
    if (row.isEditing === "API Management") {
      const response = await postData("api_update_api", {
        token,
        id: row.updatedData._id,
        apikey: row.updatedData.apikey,
        apisecret: row.updatedData.apisecret,
      });
      fetchApis();
    }
  };

  return (
    <div>
      <ScrollToTop/>
      {isAuthenticated && (
        <header className="uppercase flex items-center justify-between fixed px-6 py-4 max-lg:px-3 lg:hidden    w-full bg-[#ffffff] shadow-md z-10">
          <div className="flex gap-2 items-center ">
            <button className="text-[#252F4A]" onClick={toggleSidebar}>
              ☰
            </button>
            <p className="font-bold text-[16px] text-[#FF5733]">SSALGO</p>
          </div>
          <div className=" flex gap-2">
            <div>
              {!userlog && (
                <button onClick={toggleBrokerDropdown} className=" uppercase px-4 py-2 max-lg:px-2 max-lg:py-1 border max-sm:text-[9px]  text-[#FF5733] border-[#FF5733] rounded-md   max-lg:text-[12px]">
                  Login with Broker
                </button>
              )}
              {BrokerDropdown && (
                <div className="absolute mt-2  border   rounded shadow-lg z-10">
                  {Object.entries(brokers).map(([name, url], index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-gray-700 max-sm:text-[9px] hover:bg-blue-100"
                    >
                      {name}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {userlog && (
              <div className="px-4 py-2 max-lg:px-2 max-lg:py-1 max-sm:text-[9px]   max-lg:text-[12px] bg-[#2cc12c] text-white rounded">
                Verified
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 max-lg:px-2 max-lg:py-1 bg-[#FF5733] max-sm:text-[9px]  max-lg:text-[12px] text-white rounded"
            >
              LOGOUT
              </button>
            {userProfile.admin && (
              <button
                onClick={changeUserTypeToAdmin}
                className="uppercase px-4 py-2 max-lg:px-2 max-lg:py-1 max-sm:text-[9px]   max-lg:text-[12px] bg-[#FF5733] text-white rounded"
              >
                Go to Admin
              </button>
            )}
          </div>
        </header>
      )}
      <div className="" onClick={sidebarClose}>
        {isAuthenticated && (
          <Sidebar
            userType={userType}
            isOpen={sidebarOpen}
            changeUserTypeToUser={changeUserTypeToUser}
            toggleSidebar={toggleSidebar}
          />
        )}
        <ToastContainer />

        <div className={`${isAuthenticated && ""} lg:ml-64`}>
          <Routes>
            <Route
              path="/login"
              element={
                <ProtectedRoute
                  isAuthenticated={!isAuthenticated}
                  redirectTo="/"
                >
                  <AuthPage />
                </ProtectedRoute>
              }
            />
            <Route path="/forget" element={<ForgetPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  redirectTo="/login"
                >
                  <Dashboard
                    changeUserTypeToAdmin={changeUserTypeToAdmin}
                    user={userProfile}
                    headerData={headerData}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trade-history"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  redirectTo="/login"
                >
                  <TradeHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/main-trade-history"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  redirectTo="/login"
                >
                  <MainTradeHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pricing"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  redirectTo="/login"
                >
                  <Pricing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  redirectTo="/login"
                >
                  <UserProfile user={userProfile} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/api"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  redirectTo="/login"
                >
                  <EditApi />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  redirectTo="/login"
                >
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/Strategy"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  redirectTo="/login"
                >
                  <StrategyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/user"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  redirectTo="/login"
                >
                  <TableComponent
                    title="User Management"
                    description="Monitor, manage, and optimize AI-driven trading algorithms in real-time."
                    columns={[
                      { header: "User", key: "username", icon: "/user.svg" },
                      { header: "Email", key: "email", icon: "/email.svg" },
                      { header: "Mobile", key: "mobile", icon: "/call.svg" },
                      { header: "Limit", key: "StrategyLimit", icon: "/user.svg" },
                    ]}
                    data={userData}
                    onUpdate={(row) => handleUpdate(row)}
                    onDelete={(row) => handleDelete(row, "user")}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subscription"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  redirectTo="/login"
                >
                  <TableComponent
                    title="Subscriptions"
                    description="Monitor, manage, and optimize AI-driven trading algorithms in real-time."
                    columns={[
                      { header: "User", key: "user", icon: "/user.svg" },
                      { header: "Start Date", key: "start", icon: "/date.svg" },
                      { header: "End Date", key: "end", icon: "/date.svg" },
                      { header: "Subscription Type", key: "subtype", icon: "/date.svg" },
                    ]}
                    data={subscriptionData}
                    onUpdate={(row) => handleUpdate(row)}
                    onDelete={(row) => handleDelete(row, "subscription")}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/api"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  redirectTo="/login"
                >
                  <TableComponent
                    title="API Management"
                    description="Monitor, manage, and optimize AI-driven trading algorithms in real-time."
                    columns={[
                      { header: "User", key: "user", icon: "/user.svg" },
                      { header: "API Key", key: "apikey", icon: "/api1.png" },
                      { header: "Api Secret", key: "apisecret", icon: "/secret.png" },
                    ]}
                    data={apiData}
                    onUpdate={(row) => handleUpdate(row)}
                    onDelete={(row) => handleDelete(row, "api")}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
      {showDeletePopup && (
        <DeletePopup
          onCancel={cancelDelete}
          onDelete={confirmDelete}
          data={name}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
