
import React, { useEffect, useState } from 'react';
import StrategyTable from './StrategyTable'; // Updated import path
import { postData } from '../../../api';
import DeletePopup from "../../../components/common/DeletePopup";
import DynamicEditForm from '../../../components/forms/strategy/DynamicEditForm';
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const StrategyDashboard = () => {
  const [data, setData] = useState([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({});
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

  const onClose = () => {
    setShowEditForm(false);
  };

const captitalLater=function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

  async function fetchStrategy() {
    const token = localStorage.getItem('token');
    const response = await postData("api_strategys", { token });
    // console.log("strategy data ", response.data);

    // Transform the data to include all fields
    const transformedData = response.data.map(item => ({
      Users: item.user,
      Time: item.time,
      BOT: item.botname,
      Strategy: item.strategy,
      Symbol: item.symbol,
      TF: item.timeframe,
      Live: item.live ? 'Live' : 'Paper',
      LOTS: item.lot,
      Duration: item.position,
      'B/S Mode': item.BSmode ? 'Buyer' : 'Seller',
      Status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      _id: item.botcode,
      Data: item
    }));

    setData(transformedData);
    setLoading(false);
  }

  useEffect(() => {
    fetchStrategy();
  }, []);

  const token = localStorage.getItem('token');

  const handleStart = async (id) => {
    await postData("api_start_admin_ssalgo", { id, token });
    fetchStrategy();
  };

  const handleStop = async (id) => {
    await postData("api_stop_admin_ssalgo", { id, token });
    fetchStrategy();
  };

  const handleModify = async (data) => {
    const response = await postData(`api_edit_admin_strategy_form/${data.botcode}`, { token });
    setEditData(response.data);
    setShowEditForm(true);
  };

  const handleDelete = (row) => {
    setItemToDelete(row);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    setShowDeletePopup(false);
    await postData("api_delete_admin_ssalgo", { id: itemToDelete, token });
    fetchStrategy();
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
  };

  const filteredData = data.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    
    return (
      (item.Users ? String(item.Users).toLowerCase().includes(searchLower) : false) ||
      (item.BOT ? String(item.BOT).toLowerCase().includes(searchLower) : false) ||
      (item.Strategy ? String(item.Strategy).toLowerCase().includes(searchLower) : false) ||
      (item.Symbol ? String(item.Symbol).toLowerCase().includes(searchLower) : false) 
    );
  });
  

  return (
    <div className=" uppercase py-4 px-6 max-lg:px-3">
      {showEditForm && <DynamicEditForm onClose={onClose} formData={editData} />}
      {!showEditForm && (
        <div>
          <h1 className="text-2xl font-bold text-[#0A1438] max-lg:mt-14">Admin Dashboard</h1>
          <p className="text-[#4B5675] font-medium text-sm mt-1">
            Monitor, manage, and optimize AI-driven trading algorithms in real-time.
          </p>
          <h2 className="text-2xl text-[#0A1438] font-bold mt-3 mb-6">Strategy Dashboard</h2>

          {/* Search bar */}
          <input
            type="text"
            className="border p-2 mb-4 w-full max-w-md"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading ? (
            <LoadingSpinner label="Loading strategies..." />
          ) : (
            <StrategyTable
              data={filteredData}
              onStart={handleStart}
              onStop={handleStop}
              onModify={handleModify}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}

      {showDeletePopup && (
        <DeletePopup
          onCancel={cancelDelete}
          onDelete={confirmDelete}
          data="strategy"
        />
      )}
    </div>
  );
};

export default StrategyDashboard;
