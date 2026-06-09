import React, { useEffect, useState } from "react";
import { fetchFastApiGetData, postFastApiJsonData } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  displayValue,
  toArray,
  toObject,
} from "../../utils/displayValue";

const BrokerSetup = () => {
  const [brokerList, setBrokerList] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState("");
  const [brokerFields, setBrokerFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [savedApiId, setSavedApiId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeBroker, setActiveBroker] = useState("");
  const [brokerHealth, setBrokerHealth] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const token = localStorage.getItem("token");

  const fetchBrokerList = async () => {
    try {
      setLoadError("");
      const response = await fetchFastApiGetData("api/brokers", {}, token);

      if (response?.success && response.data) {
        const {
          broker_display_names = {},
          broker_requirements = {},
          broker_actions = {},
          broker_status = {},
          current_broker,
        } = response.data;

        const displayNames = toObject(broker_display_names);
        const requirementsByBroker = toObject(broker_requirements);
        const actionsByBroker = toObject(broker_actions);
        const statusByBroker = toObject(broker_status);
        const brokers = Object.keys(displayNames).map((key) => ({
          key,
          name: displayValue(displayNames[key]) || key,
          requirements: toArray(requirementsByBroker[key]),
          actions: toObject(actionsByBroker[key]),
          status: {
            enabled: true,
            status: "wired",
            ...toObject(statusByBroker[key]),
          },
        }));

        setBrokerList(brokers);
        setActiveBroker(displayValue(current_broker));

        const active = brokers.find((b) => b.key === current_broker);
        if (active) {
          setSelectedBroker(active.key);
        } else if (brokers.length) {
          setSelectedBroker(brokers[0].key);
        }
      } else {
        setLoadError(displayValue(response?.message) || "Failed to load broker list");
        toast.error("Failed to load broker list");
      }
    } catch (error) {
      console.error(error);
      setLoadError(displayValue(error));
      toast.error("Error loading brokers");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrokerHealth = async () => {
    try {
      const response = await fetchFastApiGetData("api/brokers/status", {}, token);
      if (response?.success) {
        setBrokerHealth(toArray(response.data).length ? response.data : Object.keys(toObject(response.data)).length ? [response.data] : []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSavedBrokerData = async (brokerKey, requirements = []) => {
    try {
      const response = await fetchFastApiGetData(`api/brokers/${brokerKey}/credentials`, {}, token);

      if (response?.success && response.data) {
        const { _id, ...fields } = toObject(response.data);
        setSavedApiId(displayValue(_id));
        setFieldValues(toObject(fields.values ?? fields));
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
    toArray(requirements).forEach((field) => {
      const normalizedField = toObject(field);
      const fieldId = displayValue(normalizedField.id);
      if (fieldId) {
        emptyFields[fieldId] = displayValue(normalizedField.default_value);
      }
    });
    setFieldValues(emptyFields);
    setSavedApiId("");
  };

  useEffect(() => {
    fetchBrokerList();
    fetchBrokerHealth();
  }, []);

  useEffect(() => {
    if (selectedBroker && brokerList.length) {
      const selected = brokerList.find((b) => b.key === selectedBroker);
      if (selected) {
        setBrokerFields(selected.requirements);
        fetchSavedBrokerData(selectedBroker, selected.requirements);
      }
    }
  }, [selectedBroker, brokerList]);

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
      toast.warn(`${displayValue(brokerMeta.name)} is not wired for live trading yet`);
      setIsSaving(false);
      return;
    }

    try {
      const response = await postFastApiJsonData(`api/brokers/${selectedBroker}/credentials`, {
        values: fieldValues,
        activate: true,
      }, token);

      if (response?.success) {
        toast.success("Credentials saved successfully");
        toast.success("Broker activated");
        setActiveBroker(selectedBroker);
        fetchBrokerHealth();
        if (response.data?.upserted_id) setSavedApiId(response.data.upserted_id);
      } else {
        toast.error(displayValue(response?.message) || "Failed to save credentials");
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

  const selectedBrokerMeta = brokerList.find((broker) => broker.key === selectedBroker);
  const selectedHealth = brokerHealth.find((health) => health?.broker === selectedBroker);

  const statusClass = (value) => {
    const normalized = String(value || "").toLowerCase();
    if (["connected", "filled", "wired", "paper_only"].includes(normalized)) {
      return "bg-green-100 text-green-700";
    }
    if (["missing_credentials", "coming_soon", "unknown"].includes(normalized)) {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-red-100 text-red-700";
  };

  const statusPill = (label, value) => (
    <div className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
      <span className="normal-case text-sm text-gray-600">{label}</span>
      <span className={`rounded px-2 py-1 text-xs font-semibold uppercase ${statusClass(value)}`}>
        {displayValue(value) || "unknown"}
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 py-4 text-gray-600">
        Loading broker settings...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full px-6 py-4 uppercase max-lg:px-3">
    <ToastContainer />
    <div className="mb-4 flex items-center justify-between">
  <h1 className="text-2xl font-bold">Edit Broker API</h1>
  {activeBroker && (
    <div className="flex items-center space-x-4">
      <p className="text-[#FF5733] font-semibold">Active Broker</p>
      <p className="bg-[#FF5733] uppercase text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 transition duration-300">
        {displayValue(getActiveBrokerName())}
      </p>
    </div>
  )}
</div>

    <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-4">
      <div className="rounded border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-500">Mode</p>
        <p className="mt-1 text-lg font-bold normal-case">
          {selectedBroker === "paper" ? "Paper only" : "Live capable"}
        </p>
      </div>
      <div className="rounded border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-500">Credentials</p>
        <p className="mt-1 text-lg font-bold normal-case">
          {selectedHealth?.missing_credentials?.length ? "Missing fields" : "Ready"}
        </p>
      </div>
      <div className="rounded border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-500">Login</p>
        <p className="mt-1 text-lg font-bold normal-case">
          {displayValue(selectedHealth?.login_status) || "unknown"}
        </p>
      </div>
      <div className="rounded border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-500">Websocket</p>
        <p className="mt-1 text-lg font-bold normal-case">
          {displayValue(selectedHealth?.websocket_status) || "unknown"}
        </p>
      </div>
    </div>

    {loadError && (
      <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 normal-case text-red-700">
        {loadError}
      </div>
    )}

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
            {displayValue(broker.name)}{broker.status?.enabled === false ? " (Coming soon)" : ""}
          </option>
        ))}
      </select>
    </div>

    {selectedBroker && (
      <p className="mb-4 text-sm normal-case text-gray-600">
        {displayValue(selectedBrokerMeta?.status?.notes)}
      </p>
    )}

    {selectedBroker && (
      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {statusPill("Registry", selectedBrokerMeta?.status?.status)}
        {statusPill("Login status", selectedHealth?.login_status)}
        {statusPill("Websocket", selectedHealth?.websocket_status)}
        {statusPill("Enabled", selectedBrokerMeta?.status?.enabled === false ? "coming_soon" : "wired")}
        {selectedHealth?.missing_credentials?.length > 0 && (
          <div className="rounded border border-yellow-200 bg-yellow-50 px-3 py-2 normal-case text-yellow-800 lg:col-span-2">
            Missing: {displayValue(selectedHealth.missing_credentials)}
          </div>
        )}
        {selectedHealth?.last_order_result && (
          <div className="rounded border border-gray-200 px-3 py-2 normal-case text-gray-700 lg:col-span-2">
            Last order: {displayValue(selectedHealth.last_order_result)}
          </div>
        )}
        {selectedHealth?.last_error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 normal-case text-red-700 lg:col-span-2">
            Last error: {displayValue(selectedHealth.last_error)}
          </div>
        )}
      </div>
    )}

    {brokerFields.map((field, index) => {
      const normalizedField = toObject(field);
      const fieldId = displayValue(normalizedField.id);
      const inputType = displayValue(normalizedField.type) || "text";

      return (
      <div key={fieldId || index} className="mb-4">
        <label className="block text-sm font-medium mb-1">{displayValue(normalizedField.label) || fieldId}</label>
        <input
          type={inputType}
          value={displayValue(fieldValues[fieldId])}
          onChange={(e) => handleInputChange(fieldId, e.target.value)}
          autoComplete={inputType === "password" ? "current-password" : "off"}
          disabled={!fieldId}
          className="border border-gray-300 px-4 py-2 rounded w-full"
        />
      </div>
      );
    })}

    <button
      onClick={handleSave}
      disabled={isSaving || !selectedBroker}
      className="bg-[#FF5733] uppercase mt-5 max-lg:mt-3 text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 transition duration-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSaving ? "Saving..." : "Save Credentials"}
    </button>
  </div>
  );
};

export default BrokerSetup;
