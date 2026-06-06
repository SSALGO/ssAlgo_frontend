import React, { useEffect, useState } from "react";
import { postData } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditApi = () => {
  const [brokerList, setBrokerList] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState("");
  const [brokerFields, setBrokerFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [savedApiId, setSavedApiId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeBroker, setActiveBroker] = useState("");

  const token = localStorage.getItem("token");

  const fetchBrokerList = async () => {
    try {
      const response = await postData("api_broker_multi_api", { token });

      if (response?.success && response.data) {
        const {
          broker_display_names = {},
          broker_requirements = {},
          broker_actions = {},
          broker_status = {},
          current_broker,
        } = response.data;

        const brokers = Object.keys(broker_display_names).map((key) => ({
          key,
          name: broker_display_names[key],
          requirements: broker_requirements[key] || [],
          actions: broker_actions[key] || {},
          status: broker_status[key] || { enabled: true, status: "wired" },
        }));

        setBrokerList(brokers);
        setActiveBroker(current_broker);

        const active = brokers.find((b) => b.key === current_broker);
        if (active) setSelectedBroker(active.key);
      } else {
        toast.error("Failed to load broker list");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading brokers");
    }
  };

  const fetchSavedBrokerData = async (brokerKey, requirements = []) => {
    try {
      const payload = {
        token,
        operation: "get",
        broker: brokerKey,
      };

      const response = await postData("api_multi_api", payload);

      if (response?.success && response.data) {
        const { _id, ...fields } = response.data;
        setSavedApiId(_id || "");
        setFieldValues(fields);
      } else {
        initializeEmptyFields(requirements);
      }
    } catch (error) {
      console.error(error);
      initializeEmptyFields(requirements);
      toast.warn("No saved credentials found");
    }
  };

  const initializeEmptyFields = (requirements) => {
    const emptyFields = {};
    requirements.forEach((field) => {
      emptyFields[field.id] = field.default_value || "";
    });
    setFieldValues(emptyFields);
    setSavedApiId("");
  };

  useEffect(() => {
    fetchBrokerList();
  }, []);

  useEffect(() => {
    if (selectedBroker && brokerList.length) {
      const selected = brokerList.find((b) => b.key === selectedBroker);
      if (selected) {
        setBrokerFields(selected.requirements);
        fetchSavedBrokerData(selectedBroker, selected.requirements);
      }
    }
  }, [selectedBroker]);

  const handleBrokerSelect = (e) => {
    setSelectedBroker(e.target.value);
  };

  const handleInputChange = (fieldId, value) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const brokerMeta = brokerList.find((b) => b.key === selectedBroker);
    if (brokerMeta?.status?.enabled === false) {
      toast.warn(`${brokerMeta.name} is not wired for live trading yet`);
      setIsSaving(false);
      return;
    }

    const payload = {
      token,
      operation: "update",
      broker: selectedBroker,
      ...fieldValues,
    };

    if (savedApiId) payload.id = savedApiId;

    try {
      const response = await postData("api_multi_api", payload);

      if (response?.success) {
        toast.success("Credentials saved successfully");

        const activeRes = await postData("api_edit_broker", {
          token,
          selectedbroker: selectedBroker,
        });

        if (activeRes?.success) {
          toast.success("Broker activated");
          setActiveBroker(selectedBroker);
        } else {
          toast.warn("Saved but failed to activate broker");
        }

        if (response.data?._id) setSavedApiId(response.data._id);
      } else {
        toast.error(response?.message || "Failed to save credentials");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error while saving credentials");
    } finally {
      setIsSaving(false);
    }
  };

  const getActiveBrokerName = () => {
    const active = brokerList.find((b) => b.key === activeBroker);
    return active ? active.name : "";
  };

  return (
    <div className="uppercase mx-auto py-4 px-6 max-lg:px-3 w-full">
    <ToastContainer />
    <div className="flex justify-between items-center mb-4">
  <h1 className="text-2xl font-bold">Edit Broker API</h1>
  {activeBroker && (
    <div className="flex items-center space-x-4">
      <p className="text-[#FF5733] font-semibold">Active Broker</p>
      <p className="bg-[#FF5733] uppercase text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 transition duration-300">
        {getActiveBrokerName()}
      </p>
    </div>
  )}
</div>



    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Select Broker</label>
      <select
        value={selectedBroker}
        onChange={handleBrokerSelect}
        className="border border-gray-300 px-4 py-2 rounded w-full"
      >
        <option value="">-- Select Broker --</option>
        {brokerList.map((broker) => (
          <option
            key={broker.key}
            value={broker.key}
            disabled={broker.status?.enabled === false}
          >
            {broker.name}{broker.status?.enabled === false ? " (Coming soon)" : ""}
          </option>
        ))}
      </select>
    </div>

    {selectedBroker && (
      <p className="mb-4 text-sm normal-case text-gray-600">
        {brokerList.find((broker) => broker.key === selectedBroker)?.status?.notes}
      </p>
    )}

    {brokerFields.map((field) => (
      <div key={field.id} className="mb-4">
        <label className="block text-sm font-medium mb-1">{field.label}</label>
        <input
          type={field.type || "text"}
          value={fieldValues[field.id] || ""}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-full"
        />
      </div>
    ))}

    <button
      onClick={handleSave}
      disabled={isSaving}
      className="bg-[#FF5733] uppercase  mt-5 max-lg:mt-3 text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 transition duration-300"
    >
      {isSaving ? "Saving..." : "Save Credentials"}
    </button>
  </div>
  );
};

export default EditApi;
