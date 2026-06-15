



import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { postData } from '../../api';
import { displayValue, getApiData } from '../../utils/displayValue';

const Sidebar = ({ userType,isOpen, toggleSidebar,changeUserTypeToUser }) => {
  const location = useLocation();
  const [date,setdate]=useState("")
  const isAdmin = localStorage.getItem("userType") === "admin";
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    window.location.reload();
  }

  const fetchIndex = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await postData("api_index", { token });
      const indexData = getApiData(response) || {};
      setdate(displayValue(indexData.user_expiry));

      // setApiData(response.data);
    } catch (error) {
      console.error("Error fetching APIs:", error);
    }
  };

  useEffect(()=>{
    fetchIndex();
  },[])


  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
  const day = String(today.getDate()).padStart(2, '0');

  // Format date as YYYY-MM-DD
  const today_date = `${year}-${month}-${day}`;

  const renderMenuItems = () => {
    if (isAdmin) {
      return (
        <>
          {/* <h1 className="text-xl font-bold mb-2 text-[#99A1B7]">Main</h1> */}

          <li className={`mb-4 font-bold  px-3 ${location.pathname === '/admin/dashboard' ? 'bg-[#450303] py-2 rounded-md ' : ''}`}>
            <Link to="/admin/dashboard" className="flex items-center  text-xl hover:text-white">
            <img src="/dashboard.svg" alt="" />

              <span className="mr-2">
                {/* <i className="fas fa-tachometer-alt"></i> */}
              </span>
              DASHBOARD
            </Link>
          </li>
          <li className={`mb-4 font-bold px-3 ${location.pathname === '/admin/api' ? 'bg-[#450303] py-2 rounded-md  ' : ''}`}>
            <Link to="/admin/api" className="flex items-center  text-xl hover:text-white">
            <img src="/api.svg" alt="" />

              <span className="mr-2">
                {/* <i className="fas fa-code"></i> */}
              </span>
              API

            </Link>
          </li>
          <li className={`mb-4 font-bold px-3 ${location.pathname === '/admin/subscription' ? 'bg-[#450303] py-2 rounded-md ' : ''}`}>
            <Link to="/admin/subscription" className="flex items-center text-xl hover:text-white">
            <img src="/pricing.svg" alt="" />

              <span className="mr-2">
                <i className="fas fa-credit-card"></i>
              </span>

              SUBSCRIPTION

            </Link>
          </li>
          <li className={`mb-4 font-bold px-3 ${location.pathname === '/admin/user' ? 'bg-[#450303] py-2 rounded-md  ' : ''}`}>
            <Link to="/admin/user" className="flex items-center  text-xl hover:text-white">
            <img src="/pro.svg" alt="" />
            <span className="mr-2">
                <i className="fas fa-users "></i>
              </span>


              USERS

            </Link>
          </li>
          <li className={`mb-4 font-bold px-3 ${location.pathname === '/admin/strategy' ? 'bg-[#450303] py-2 rounded-md  ' : ''}`}>
            <Link to="/admin/strategy" className="flex items-center text-xl hover:text-white">

            <img src="/startagy.svg" alt="" />

              <span className="mr-2">
                <i className="fas fa-chart-line"></i>
              </span>
              {/* <div className='flex gap-2'> */}
              STRATEGY'S
              {/* </div> */}
             </Link>
          </li>

          <li  className={`mb-4 font-bold  px-3 ${location.pathname === '/logout' ? 'bg-[#450303] py-2 rounded-md ' : ''}`}>
          <button onClick={changeUserTypeToUser}>
          <a href="#" className="flex items-center text-xl text-white gap-2">
              <img src="/logout.svg" alt="" />
              {/* <span className="mr-2">
                <i className="fas fa-sign-out-alt"></i>
              </span> */}
              BACK TO USER
            </a>
            </button>
          </li>


        </>
      );
    } else {
      return (
        <div className="mb-10">
          <li className={`mb-4 px-3 font-bold ${location.pathname === '/' ? 'bg-[#450303] py-2 rounded-md  '  : ''}`}>
            <Link to="/" className="flex items-center text-xl text-white gap-2">
              <img src="/dashboard.svg" alt="" />
              {/* <span className="mr-2">
                <i className="fas fa-tachometer-alt"></i>
              </span> */}
              DASHBOARD
            </Link>
          </li>
          <li className={`mb-4 px-3 font-bold ${location.pathname === '/api' ? 'bg-[#450303] py-2 rounded-md   '  : ''}`}>
            <Link to="/api" className="flex items-center text-xl text-white gap-2">
              <img src="/api.svg" alt="" />
              {/* <span className="mr-2">
                <i className="fas fa-code"></i>
              </span> */}
              API
            </Link>
          </li>
          <li className={`mb-4 px-3 font-bold ${location.pathname === '/pricing' ? 'bg-[#450303] py-2 rounded-md  ' : ''}`}>
            <Link to="/pricing" className="flex items-center text-xl text-white gap-2">
              <img src="/pricing.svg" alt="" />
              {/* <span className="mr-2">
                <i className="fas fa-tags"></i>
              </span> */}
              PRICING
            </Link>
          </li>
          <li className={`mb-4 px-3 font-bold ${location.pathname === '/user' ? 'bg-[#450303] py-2 rounded-md ' : ''}`}>
            <Link to="/user" className="flex items-center text-xl text-white gap-2">
              <img src="/pro.svg" alt="" />
              {/* <span className="mr-2">
                <i className="fas fa-user"></i>
              </span> */}
              PROFILE
            </Link>
          </li>
          <li className={`mb-4 px-3 font-bold ${location.pathname === '/trade-history' ? 'bg-[#450303] py-2 rounded-md  ' : ''}`}>
            <Link to="/trade-history" className="flex items-center text-xl text-white gap-2" >
              <img src="/trade.svg" alt="" />
              {/* <span className="mr-2">
                <i className="fas fa-history"></i>
              </span> */}
              TRADE HISTORY
            </Link>
          </li>
          <li className={`mb-4 px-3 font-bold ${location.pathname === '/main-trade-history' ? 'bg-[#450303] py-2 rounded-md  ' : ''}`}>
            <Link to="/main-trade-history" className="flex items-center text-xl gap-2 text-white">



              <img src="/maintrade.svg" alt="" />

                MAIN TRADE HISTORY

            </Link>
          </li>

          <div className="uppercase flex items-center text-xl font-bold mt-4 mb-2 w-full bg-[#450303] text-white py-2 px-4 rounded">
  {today_date < date ? (
    <div className='flex flex-col items-center justify-center'>
      Plan Expiry Date:
      <div className='justify-center'>{date}</div>
    </div>
  ) : (
    "Your plan is expired"
  )}
</div>

          <h1 className=" uppercase text-lg font-bold mb-2 mt-10 text-[#ffffff]  ">Other</h1>
          {/* <li className={`mb-4 px-3 ${location.pathname === '/settings' ? 'bg-[#FF5733] py-2 rounded-md ' : ''}`}>
            <a href="#" className="flex items-center text-xl text-white gap-2">
              <img src="/setting.svg" alt="" />
              <span className="mr-2">
                <i className="fas fa-cog"></i>
              </span>
              Settings
            </a>
          </li> */}
          <li  className={`mb-4 font-bold px-3 ${location.pathname === '/logout' ? 'bg-[#FF5733] py-2 rounded-md ' : ''}`}>
          <button onClick={handleLogout}>
          <a href="#" className="flex items-center text-xl text-white gap-2">
              <img src="/logout.svg" alt="" />
              {/* <span className="mr-2">
                <i className="fas fa-sign-out-alt"></i>
              </span> */}
              LOG OUT
            </a>
            </button>
          </li>
        </div>
      );
    }
  };

  return (
    <div className={`  w-64   fixed bg-[#FF5733] text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} h-screen  z-10  w-64 lg:bg-[#FF5733] lg:text-white lg:transform-none `}onClick={toggleSidebar}>

      <div className="px-6 pt-5">
        <Link to="https://www.ssalgo.com/" className="flex items-center text-xl text-white gap-2">
        <h1 className="text-2xl font-bold text-white]"> SSALGO HOME</h1>
        </Link>
        {/* <div class="border-t-2 border-dotted border-white my-4"></div> */}
        <div className="border-t-2 border-dashed border-[#99A1B7] my-4"></div>

      </div>
      <nav className="">
        {/* <h1 className="text-xl font-bold mb-2 px-6 text-[#ffffff]">MAIN</h1> */}


        <ul className=" px-3">

          {renderMenuItems()}
        </ul>
        <div className="p-4">
        <div className="border-t-2 border-dashed border-[#99A1B7] my-4"></div>



      </div>
      </nav>

    </div>
  );
};

Sidebar.propTypes = {
  userType: PropTypes.oneOf(['admin', 'user']),
};

export default Sidebar;
