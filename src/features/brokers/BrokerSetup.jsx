import React, { useEffect, useState } from "react";
import { fetchFastApiGetData, postFastApiJsonData } from "../../api";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import {
  displayValue,
  toArray,
  toObject,
} from "../../utils/displayValue";
import { ErrorState, StatusBadge } from "../../shared/components/TradingUi";

const MASKED_SECRET_VALUE = "********";

const BrokerSetupSkeleton = () => (
  <div className="mx-auto w-full animate-pulse px-6 py-4 max-lg:px-3">
    <div className="mb-5 flex items-center justify-between">
      <div className="h-8 w-52 rounded bg-slate-200" />
      <div className="h-9 w-40 rounded bg-slate-200" />
    </div>
    <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-24 rounded border border-slate-200 bg-slate-100" />
      ))}
    </div>
    <div className="mb-5 h-11 rounded bg-slate-100" />
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-20 rounded border border-slate-200 bg-slate-100" />
      ))}
    </div>
  </div>
);

const BrokerSetup = () => {
  const [brokerList, setBrokerList] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState("");
  const [brokerFields, setBrokerFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [savedApiId, setSavedApiId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeBroker, setActiveBroker] = useState("");
  const [brokerHealth, setBrokerHealth] = useState([]);
  const [savedCredentials, setSavedCredentials] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [visibleSecretFields, setVisibleSecretFields] = useState({});
  const [revealedSecretValues, setRevealedSecretValues] = useState({});
  const [revealingSecretField, setRevealingSecretField] = useState("");

  const accessToken = localStorage.getItem("accessToken");

  const fetchBrokerList = async () => {
    try {
      setLoadError("");
      const response = await fetchFastApiGetData("api/brokers", {}, accessToken);

      if (response?.success && response.data) {
        const {
          broker_display_names = {},
          broker_requirements = {},
          broker_actions = {},
          broker_status = {},
          saved_credentials = {},
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
        setSavedCredentials(toObject(saved_credentials));
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
      const response = await fetchFastApiGetData("api/brokers/status", {}, accessToken);
      if (response?.success) {
        setBrokerHealth(toArray(response.data).length ? response.data : Object.keys(toObject(response.data)).length ? [response.data] : []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isSecretField = (field = {}) => {
    const normalized = toObject(field);
    const id = displayValue(normalized.id).toLowerCase();
    const type = displayValue(normalized.type).toLowerCase();
    return (
      type === "password"
      || id.includes("secret")
      || id.includes("token")
      || id.includes("password")
      || id.includes("auth_code")
      || id.includes("totp")
      || id.includes("factor2")
      || id.includes("session")
      || id === "pin"
      || id === "pwd"
      || id === "apisecret"
    );
  };

  const applySavedBrokerData = (brokerKey, requirements = [], source = savedCredentials) => {
    setVisibleSecretFields({});
    setRevealedSecretValues({});
    setRevealingSecretField("");
    const saved = toObject(source[brokerKey]);
    if (!Object.keys(saved).length) {
      initializeEmptyFields(requirements);
      return false;
    }

    const secretPresent = toObject(saved.secret_present);
    const values = {};
    toArray(requirements).forEach((field) => {
      const normalizedField = toObject(field);
      const fieldId = displayValue(normalizedField.id);
      if (!fieldId) return;
      if (isSecretField(normalizedField)) {
        values[fieldId] = secretPresent[fieldId] || saved[fieldId] ? MASKED_SECRET_VALUE : "";
      } else {
        values[fieldId] = displayValue(saved[fieldId] ?? normalizedField.default_value);
      }
    });

    setSavedApiId(displayValue(saved._id || saved.id));
    setFieldValues(values);
    return true;
  };

  const fetchSavedBrokerData = async (brokerKey, requirements = []) => {
    if (applySavedBrokerData(brokerKey, requirements)) {
      return;
    }

    try {
      const response = await fetchFastApiGetData(`api/brokers/${brokerKey}/credentials`, {}, accessToken);

      if (response?.success && response.data) {
        const { _id, ...fields } = toObject(response.data);
        setSavedApiId(displayValue(_id));
        const savedValues = toObject(fields.values ?? fields);
        const maskedValues = { ...savedValues };
        toArray(requirements).forEach((field) => {
          const fieldId = displayValue(toObject(field).id);
          if (fieldId && isSecretField(field) && savedValues[fieldId]) {
            maskedValues[fieldId] = MASKED_SECRET_VALUE;
          }
        });
        setFieldValues(maskedValues);
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
    setVisibleSecretFields({});
    setRevealedSecretValues({});
    setRevealingSecretField("");
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
  }, [selectedBroker, brokerList, savedCredentials]);

  const handleBrokerSelect = (e) => {
    setSelectedBroker(e.target.value);
  };

  const handleInputChange = (fieldId, value) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
    setRevealedSecretValues((prev) => {
      if (!(fieldId in prev) || prev[fieldId] === value) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const handleSecretVisibility = async (fieldId) => {
    if (visibleSecretFields[fieldId]) {
      setVisibleSecretFields((prev) => ({ ...prev, [fieldId]: false }));
      if (savedApiId && revealedSecretValues[fieldId] === fieldValues[fieldId]) {
        setFieldValues((prev) => ({ ...prev, [fieldId]: MASKED_SECRET_VALUE }));
      }
      return;
    }

    if (fieldValues[fieldId] !== MASKED_SECRET_VALUE) {
      setVisibleSecretFields((prev) => ({ ...prev, [fieldId]: true }));
      return;
    }

    if (revealedSecretValues[fieldId]) {
      setFieldValues((prev) => ({ ...prev, [fieldId]: revealedSecretValues[fieldId] }));
      setVisibleSecretFields((prev) => ({ ...prev, [fieldId]: true }));
      return;
    }

    setRevealingSecretField(fieldId);
    try {
      const response = await postFastApiJsonData(
        `api/brokers/${selectedBroker}/credentials/reveal`,
        { field: fieldId },
        accessToken,
      );
      const revealedValue = displayValue(response?.data?.value);
      if (!response?.success || !revealedValue) {
        throw new Error(response?.message || "Saved credential could not be revealed");
      }
      setFieldValues((prev) => ({ ...prev, [fieldId]: revealedValue }));
      setRevealedSecretValues((prev) => ({ ...prev, [fieldId]: revealedValue }));
      setVisibleSecretFields((prev) => ({ ...prev, [fieldId]: true }));
    } catch (error) {
      toast.error(error.message || "Unable to reveal saved credential");
    } finally {
      setRevealingSecretField("");
    }
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
      const valuesToSave = { ...fieldValues };
      brokerFields.forEach((field) => {
        const fieldId = displayValue(toObject(field).id);
        if (
          savedApiId
          && isSecretField(field)
          && (
            !valuesToSave[fieldId]
            || valuesToSave[fieldId] === MASKED_SECRET_VALUE
            || revealedSecretValues[fieldId] === valuesToSave[fieldId]
          )
        ) {
          delete valuesToSave[fieldId];
        }
      });

      const response = await postFastApiJsonData(`api/brokers/${selectedBroker}/credentials`, {
        values: valuesToSave,
        activate: true,
      }, accessToken);

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

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const response = await postFastApiJsonData(`api/brokers/${selectedBroker}/test`, {}, accessToken);
      if (!response?.success) {
        throw new Error(response?.data?.message || response?.message || "Broker connection failed.");
      }
      await fetchBrokerHealth();
      toast.success(`${displayValue(selectedBrokerMeta?.name) || selectedBroker} connected successfully.`);
    } catch (error) {
      toast.error(error.message || "Unable to test broker connection.");
      await fetchBrokerHealth();
    } finally {
      setIsTesting(false);
    }
  };

  const selectedBrokerMeta = brokerList.find((broker) => broker.key === selectedBroker);
  const selectedHealth = brokerHealth.find((health) => health?.broker === selectedBroker);
  const selectedSavedCredentials = toObject(savedCredentials[selectedBroker]);
  const hasSavedCredentials = Object.keys(selectedSavedCredentials).length > 0 || Boolean(savedApiId);
  const configuredBrokers = brokerList.filter((broker) => (
    broker.key === activeBroker || Object.keys(toObject(savedCredentials[broker.key])).length > 0
  ));

  const statusClass = (value) => {
    const normalized = String(value || "").toLowerCase();
    if (["connected", "filled", "wired", "paper_only"].includes(normalized)) {
      return "bg-green-100 text-green-700";
    }
    if (["missing_credentials", "coming_soon", "not_tested", "not tested", "unknown"].includes(normalized)) {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-red-100 text-red-700";
  };

  const displayStatus = (value, fallback = "Not tested") => {
    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized || normalized === "unknown" || normalized === "not_tested") {
      return fallback;
    }
    return normalized.replaceAll("_", " ");
  };

  const statusPill = (label, value) => (
    <div className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
      <span className="normal-case text-sm text-gray-600">{label}</span>
      <span className={`rounded px-2 py-1 text-xs font-semibold uppercase ${statusClass(value)}`}>
        {displayStatus(value)}
      </span>
    </div>
  );

  if (isLoading) {
    return <BrokerSetupSkeleton />;
  }

  return (
    <div className="mx-auto w-full px-6 py-4 uppercase max-lg:px-3">
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
          {selectedHealth?.missing_credentials?.length ? "Missing fields" : hasSavedCredentials ? "Saved" : "Ready"}
        </p>
      </div>
      <div className="rounded border border-gray-200 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500">Login</p>
            <p className="mt-1 text-lg font-bold normal-case">
              {displayStatus(selectedHealth?.login_status)}
            </p>
          </div>
          {hasSavedCredentials && selectedBroker !== "paper" ? (
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="rounded border border-[#FF5733] px-2.5 py-1.5 text-xs font-bold text-[#FF5733] hover:bg-[#FFF0EC] disabled:opacity-60"
            >
              {isTesting ? "Testing..." : "Test"}
            </button>
          ) : null}
        </div>
      </div>
      <div className="rounded border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-500">Websocket</p>
        <p className="mt-1 text-lg font-bold normal-case">
          {displayStatus(selectedHealth?.websocket_status)}
        </p>
        <p className="mt-1 text-xs normal-case text-[#79829E]">Updated by the live market-feed worker.</p>
      </div>
    </div>

    {configuredBrokers.length > 0 && (
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-[#252F4A]">Configured brokers</h2>
          <span className="text-xs font-semibold normal-case text-[#79829E]">
            {configuredBrokers.length} saved
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {configuredBrokers.map((broker) => {
            const health = brokerHealth.find((item) => item?.broker === broker.key);
            const missing = toArray(health?.missing_credentials);
            const connection = displayStatus(
              health?.login_status,
              missing.length ? "Missing credentials" : "Not tested"
            );
            return (
              <button
                key={broker.key}
                type="button"
                onClick={() => setSelectedBroker(broker.key)}
                className={`flex min-h-20 items-center justify-between gap-3 rounded border p-3 text-left ${
                  selectedBroker === broker.key ? "border-[#FF5733] bg-[#FFF7F4]" : "border-slate-200 bg-white"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#252F4A]">{displayValue(broker.name)}</p>
                  <p className="mt-1 text-xs normal-case text-[#79829E]">
                    {broker.key === activeBroker ? "Active broker" : "Credentials saved"}
                  </p>
                </div>
                <StatusBadge
                  value={connection}
                  tone={connection === "connected" ? "connected" : missing.length ? "missing" : "not_tested"}
                />
              </button>
            );
          })}
        </div>
      </div>
    )}

    {loadError && <div className="mb-5"><ErrorState message={loadError} onRetry={fetchBrokerList} /></div>}

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
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 normal-case text-sm text-amber-900">
        <p className="font-bold">Credential risk</p>
        <p className="mt-1">
          Broker credentials can permit account access and order placement. Saved secret fields are shown as filled masks; type a new value only when you want to replace one.
        </p>
        {displayValue(selectedBrokerMeta?.status?.notes) ? <p className="mt-2">{displayValue(selectedBrokerMeta?.status?.notes)}</p> : null}
      </div>
    )}

    {selectedBroker && (
      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {statusPill("Registry", selectedBrokerMeta?.status?.status)}
        {statusPill("Login status", selectedHealth?.login_status)}
        {statusPill("Websocket", selectedHealth?.websocket_status)}
        {statusPill("Enabled", selectedBrokerMeta?.status?.enabled === false ? "coming_soon" : "wired")}
        {selectedHealth?.last_test_at ? (
          <div className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
            <span className="normal-case text-sm text-gray-600">Last tested</span>
            <span className="text-xs font-semibold normal-case text-[#4B5675]">
              {displayValue(selectedHealth.last_test_at)}
            </span>
          </div>
        ) : null}
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
      const secret = isSecretField(normalizedField);

      return (
      <div key={fieldId || index} className="mb-4">
        <label className="block text-sm font-medium mb-1">{displayValue(normalizedField.label) || fieldId}</label>
        <div className="relative">
          <input
            type={secret ? (visibleSecretFields[fieldId] ? "text" : "password") : inputType}
            value={displayValue(fieldValues[fieldId])}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
            autoComplete={secret ? "new-password" : "off"}
            placeholder={secret && savedApiId ? "Saved - enter a new value to replace" : ""}
            disabled={!fieldId}
            className={`w-full rounded border border-gray-300 px-4 py-2 ${secret ? "pr-12" : ""}`}
          />
          {secret ? (
            <button
              type="button"
              onClick={() => handleSecretVisibility(fieldId)}
              disabled={!fieldId || revealingSecretField === fieldId}
              aria-label={visibleSecretFields[fieldId] ? `Hide ${displayValue(normalizedField.label) || fieldId}` : `Show ${displayValue(normalizedField.label) || fieldId}`}
              title={visibleSecretFields[fieldId] ? "Hide credential" : "Show credential"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#4B5675] hover:text-[#FF5733] disabled:cursor-wait disabled:opacity-60"
            >
              {revealingSecretField === fieldId ? (
                <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
              ) : visibleSecretFields[fieldId] ? (
                <EyeOff aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Eye aria-hidden="true" className="h-5 w-5" />
              )}
            </button>
          ) : null}
        </div>
        {secret && savedApiId ? (
          <p className="mt-1 text-xs normal-case text-[#4B5675]">Saved value is present. Keep the mask to leave it unchanged.</p>
        ) : null}
      </div>
      );
    })}

    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <button
        onClick={handleSave}
        disabled={isSaving || !selectedBroker}
        className="bg-[#FF5733] uppercase max-lg:mt-3 text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 transition duration-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Save Credentials"}
      </button>
      <button
        type="button"
        onClick={handleTestConnection}
        disabled={isTesting || !selectedBroker}
        className="rounded-md border border-[#FF5733] px-4 py-2 font-semibold text-[#FF5733] hover:bg-[#FFF0EC] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isTesting ? "Testing..." : "Test Connection"}
      </button>
      <div className="flex items-center">
        <StatusBadge value={selectedHealth?.last_error ? "Error" : selectedHealth?.login_status || "Not connected"} tone={selectedHealth?.last_error ? "error" : undefined} />
      </div>
    </div>
  </div>
  );
};

export default BrokerSetup;
