import React, { useEffect, useState } from "react";
import { fetchFastApiGetData, postFastApiJsonData } from "../../api";
import { toast } from "react-toastify";
import { ChevronDown, ExternalLink, Eye, EyeOff, Loader2, Plus } from "lucide-react";
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

const statusTone = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (["connected", "filled", "wired", "paper_only"].includes(normalized)) return "connected";
  if (["failed", "rejected", "disconnected", "error"].includes(normalized)) return "error";
  if (["missing_credentials", "coming_soon", "not_tested", "not tested", "unknown", "reconnect_required"].includes(normalized)) return "missing";
  return undefined;
};

const BrokerStatusBadge = ({ value, fallback = "Not tested" }) => (
  <StatusBadge value={value || fallback} tone={statusTone(value || fallback)} />
);

const formatStatus = (value, fallback = "Not tested") => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized || normalized === "unknown" || normalized === "not_tested") {
    return fallback;
  }
  return normalized.replaceAll("_", " ");
};

const formatDateTime = (value) => {
  const raw = displayValue(value);
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString();
};

const getMainStatus = (health, hasCredentials, activeBroker) => {
  if (!activeBroker) return "Not configured";
  if (!hasCredentials && activeBroker !== "paper") return "Not configured";
  const login = String(health?.login_status || "").toLowerCase();
  const token = String(health?.token_status || "").toLowerCase();
  if (login === "connected" || token === "connected") return "Connected";
  if (["failed", "rejected", "error"].includes(login)) return "Failed";
  if (["reconnect_required", "expired", "unauthorized"].includes(token)) return "Disconnected";
  return "Disconnected";
};

const ActiveBrokerCard = ({
  activeBrokerMeta,
  activeHealth,
  activeHasCredentials,
  isTesting,
  isConnectingRedirectBroker,
  isRedirectBroker,
  onPrimaryAction,
  onTestConnection,
  onManage,
}) => {
  const activeBrokerKey = activeBrokerMeta?.key || "";
  const mainStatus = getMainStatus(activeHealth, activeHasCredentials, activeBrokerKey);
  const failed = ["failed", "disconnected"].includes(mainStatus.toLowerCase());
  const lastChecked = activeHealth?.last_verified_at || activeHealth?.last_test_at || activeHealth?.connected_at;
  const primaryLabel = isRedirectBroker
    ? activeHasCredentials ? `Reconnect ${displayValue(activeBrokerMeta?.name)}` : `Connect ${displayValue(activeBrokerMeta?.name)}`
    : activeHasCredentials ? "Manage Credentials" : "Configure Broker";

  return (
    <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 normal-case shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#79829E]">Active Broker</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0A1438]">
              {displayValue(activeBrokerMeta?.name) || "No broker configured"}
            </h1>
            <BrokerStatusBadge value={mainStatus} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-[#79829E]">Login</p>
              <p className="mt-1 font-bold text-[#252F4A]">{formatStatus(activeHealth?.login_status)}</p>
            </div>
            <div>
              <p className="font-semibold text-[#79829E]">Websocket</p>
              <p className="mt-1 font-bold text-[#252F4A]">{formatStatus(activeHealth?.websocket_status)}</p>
            </div>
            <div>
              <p className="font-semibold text-[#79829E]">Last checked</p>
              <p className="mt-1 font-bold text-[#252F4A]">{formatDateTime(lastChecked) || "Not tested"}</p>
            </div>
          </div>
          {failed && activeHealth?.last_error ? (
            <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {displayValue(activeHealth.last_error)}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <button
            type="button"
            onClick={isRedirectBroker ? onPrimaryAction : onManage}
            disabled={isConnectingRedirectBroker}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#FF5733] px-4 py-2 font-bold uppercase text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConnectingRedirectBroker ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : isRedirectBroker ? <ExternalLink aria-hidden="true" className="h-4 w-4" /> : null}
            {primaryLabel}
          </button>
          <button
            type="button"
            onClick={onTestConnection}
            disabled={isTesting || !activeBrokerKey}
            className="rounded-md border border-[#FF5733] px-4 py-2 font-bold uppercase text-[#FF5733] hover:bg-[#FFF0EC] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isTesting ? "Testing..." : "Test Connection"}
          </button>
        </div>
      </div>
    </section>
  );
};

const ConfiguredBrokerList = ({ brokers, activeBroker, brokerHealth, savedCredentials, onManage, onMakeActive, onTest }) => (
  <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 normal-case shadow-sm">
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-bold text-[#0A1438]">Configured Brokers</h2>
        <p className="text-sm text-[#79829E]">Saved broker connections for this account.</p>
      </div>
    </div>
    {brokers.length === 0 ? (
      <div className="rounded border border-dashed border-slate-300 p-4 text-sm font-semibold text-[#79829E]">
        No broker configured yet. Add a broker to start live trading.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-[#79829E]">
            <tr>
              <th className="px-3 py-3">Broker</th>
              <th className="px-3 py-3">Active</th>
              <th className="px-3 py-3">Credentials</th>
              <th className="px-3 py-3">Connection</th>
              <th className="px-3 py-3">Last tested</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {brokers.map((broker) => {
              const health = brokerHealth.find((item) => item?.broker === broker.key);
              const missing = toArray(health?.missing_credentials);
              const hasCredentials = Object.keys(toObject(savedCredentials[broker.key])).length > 0 || broker.key === activeBroker;
              const connection = formatStatus(health?.login_status, missing.length ? "Missing credentials" : "Not tested");
              return (
                <tr key={broker.key} className="align-middle">
                  <td className="px-3 py-3 font-bold text-[#252F4A]">{displayValue(broker.name)}</td>
                  <td className="px-3 py-3">
                    {broker.key === activeBroker ? <StatusBadge value="Active" tone="connected" /> : <span className="text-[#79829E]">-</span>}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge value={hasCredentials ? "Saved" : "Missing"} tone={hasCredentials ? "connected" : "missing"} />
                  </td>
                  <td className="px-3 py-3">
                    <BrokerStatusBadge value={connection} />
                  </td>
                  <td className="px-3 py-3 text-[#4B5675]">{formatDateTime(health?.last_test_at) || "Not tested"}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => onManage(broker.key)} className="rounded border border-slate-300 px-3 py-1.5 font-bold text-[#252F4A] hover:bg-slate-50">
                        Manage
                      </button>
                      {broker.key !== activeBroker ? (
                        <button type="button" onClick={() => onMakeActive(broker.key)} className="rounded border border-[#FF5733] px-3 py-1.5 font-bold text-[#FF5733] hover:bg-[#FFF0EC]">
                          Make Active
                        </button>
                      ) : null}
                      <button type="button" onClick={() => onTest(broker.key)} className="rounded border border-[#FF5733] px-3 py-1.5 font-bold text-[#FF5733] hover:bg-[#FFF0EC]">
                        Test
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

const AvailableBrokerDrawer = ({ open, brokers, onClose, onSelect }) => {
  if (!open) return null;
  return (
    <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 normal-case shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#0A1438]">Add or Change Broker</h2>
          <p className="text-sm text-[#79829E]">Choose from supported brokers. Configured brokers stay in the compact list.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded border border-slate-300 px-3 py-1.5 text-sm font-bold text-[#252F4A] hover:bg-slate-50">
          Close
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {brokers.map((broker) => (
          <button
            key={broker.key}
            type="button"
            onClick={() => onSelect(broker.key)}
            disabled={broker.status?.enabled === false}
            className="rounded border border-slate-200 p-4 text-left hover:border-[#FF5733] hover:bg-[#FFF7F4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <p className="font-bold text-[#252F4A]">{displayValue(broker.name)}</p>
            <p className="mt-1 text-xs text-[#79829E]">{broker.status?.enabled === false ? "Coming soon" : formatStatus(broker.status?.status, "Ready")}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

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
  const [connectingRedirectBroker, setConnectingRedirectBroker] = useState("");
  const [isBrokerPanelOpen, setIsBrokerPanelOpen] = useState(false);
  const [isConfiguringBroker, setIsConfiguringBroker] = useState(false);
  const [healthError, setHealthError] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

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
      setHealthError("");
      const response = await fetchFastApiGetData("api/brokers/status", {}, accessToken);
      if (response?.success) {
        setBrokerHealth(toArray(response.data).length ? response.data : Object.keys(toObject(response.data)).length ? [response.data] : []);
      }
    } catch (error) {
      console.error(error);
      setHealthError(error.message || "Unable to refresh broker status.");
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
    const params = new URLSearchParams(window.location.search);
    const callbackBroker = params.get("broker");
    if (["aliceblue", "zerodha"].includes(callbackBroker)) {
      const callbackStatus = params.get("status");
      const message = params.get("message");
      const brokerName = callbackBroker === "zerodha" ? "Kite" : "AliceBlue";
      if (callbackStatus === "connected") {
        toast.success(message || `${brokerName} connected`);
      } else if (callbackStatus === "failed") {
        toast.error(message || `${brokerName} connection failed`);
      }
      params.delete("broker");
      params.delete("status");
      params.delete("message");
      const nextQuery = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`,
      );
    }
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

  const openManageBroker = (brokerKey) => {
    setSelectedBroker(brokerKey);
    setIsConfiguringBroker(true);
    setIsBrokerPanelOpen(false);
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
        setIsConfiguringBroker(false);
        await fetchBrokerList();
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

  const handleTestConnection = async (brokerKey = selectedBroker) => {
    const brokerToTest = typeof brokerKey === "string" ? brokerKey : selectedBroker;
    if (!brokerToTest) return;
    setIsTesting(true);
    try {
      const response = await postFastApiJsonData(`api/brokers/${brokerToTest}/test`, {}, accessToken);
      if (!response?.success) {
        throw new Error(response?.data?.message || response?.message || "Broker connection failed.");
      }
      await fetchBrokerHealth();
      const brokerMeta = brokerList.find((broker) => broker.key === brokerToTest);
      toast.success(`${displayValue(brokerMeta?.name) || brokerToTest} connected successfully.`);
    } catch (error) {
      toast.error(error.message || "Unable to test broker connection.");
      await fetchBrokerHealth();
    } finally {
      setIsTesting(false);
    }
  };

  const redirectBrokerConfig = {
    aliceblue: {
      path: "api/brokers/aliceblue/connect-url",
      label: "AliceBlue",
    },
    zerodha: {
      path: "api/brokers/kite/login-url",
      label: "Kite",
    },
  };

  const handleConnectRedirectBroker = async (brokerKey = selectedBroker) => {
    const config = redirectBrokerConfig[brokerKey];
    if (!config) return;
    setConnectingRedirectBroker(brokerKey);
    try {
      const response = await fetchFastApiGetData(config.path, {}, accessToken);
      const loginUrl = displayValue(response?.data?.login_url || response?.data?.loginUrl);
      if (!response?.success || !loginUrl) {
        throw new Error(response?.message || `Unable to create ${config.label} connect URL.`);
      }
      window.location.assign(loginUrl);
    } catch (error) {
      toast.error(error.message || `Unable to start ${config.label} connection.`);
      setConnectingRedirectBroker("");
    }
  };

  const handleMakeActive = async (brokerKey) => {
    setIsSaving(true);
    try {
      const response = await postFastApiJsonData(`api/brokers/${brokerKey}/credentials`, {
        values: {},
        activate: true,
      }, accessToken);
      if (!response?.success) {
        throw new Error(response?.message || "Unable to activate broker.");
      }
      setActiveBroker(brokerKey);
      setSelectedBroker(brokerKey);
      await fetchBrokerList();
      await fetchBrokerHealth();
      toast.success("Active broker updated");
    } catch (error) {
      toast.error(error.message || "Unable to activate broker.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedBrokerMeta = brokerList.find((broker) => broker.key === selectedBroker);
  const selectedHealth = brokerHealth.find((health) => health?.broker === selectedBroker);
  const isRedirectBroker = Boolean(redirectBrokerConfig[selectedBroker]);
  const selectedSavedCredentials = toObject(savedCredentials[selectedBroker]);
  const hasSavedCredentials = Object.keys(selectedSavedCredentials).length > 0 || Boolean(savedApiId);
  const configuredBrokers = brokerList.filter((broker) => (
    broker.key === activeBroker || Object.keys(toObject(savedCredentials[broker.key])).length > 0
  ));
  const activeBrokerMeta = brokerList.find((broker) => broker.key === activeBroker);
  const activeHealth = brokerHealth.find((health) => health?.broker === activeBroker);
  const activeSavedCredentials = toObject(savedCredentials[activeBroker]);
  const activeHasCredentials = activeBroker === "paper" || Object.keys(activeSavedCredentials).length > 0;
  const isActiveRedirectBroker = Boolean(redirectBrokerConfig[activeBroker]);
  const advancedBrokerKey = selectedBroker || activeBroker;
  const advancedBrokerMeta = brokerList.find((broker) => broker.key === advancedBrokerKey);
  const advancedHealth = brokerHealth.find((health) => health?.broker === advancedBrokerKey);
  const advancedSavedCredentials = toObject(savedCredentials[advancedBrokerKey]);

  if (isLoading) {
    return <BrokerSetupSkeleton />;
  }

  const renderCredentialForm = () => {
    if (!isConfiguringBroker || !selectedBroker) return null;
    return (
      <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 normal-case shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#79829E]">Broker Setup</p>
            <h2 className="mt-1 text-xl font-bold text-[#0A1438]">
              {displayValue(selectedBrokerMeta?.name) || selectedBroker}
            </h2>
            {displayValue(selectedBrokerMeta?.status?.notes) ? (
              <p className="mt-1 text-sm text-[#4B5675]">{displayValue(selectedBrokerMeta.status.notes)}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setIsConfiguringBroker(false)}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm font-bold text-[#252F4A] hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        {isRedirectBroker ? (
          <div className="rounded border border-blue-200 bg-blue-50 p-4 text-blue-900">
            <p className="font-bold">{displayValue(selectedBrokerMeta?.name)} redirect authentication</p>
            <p className="mt-1 text-sm">
              {displayValue(selectedBrokerMeta?.name)} connects through broker login redirect. Secret tokens are stored only on the backend.
            </p>
            {selectedSavedCredentials?.alice_client_id ? (
              <p className="mt-2 text-sm">Client ID: {displayValue(selectedSavedCredentials.alice_client_id)}</p>
            ) : null}
            {selectedSavedCredentials?.kiteUserId ? (
              <p className="mt-2 text-sm">Kite User ID: {displayValue(selectedSavedCredentials.kiteUserId)}</p>
            ) : null}
            <button
              type="button"
              onClick={() => handleConnectRedirectBroker(selectedBroker)}
              disabled={connectingRedirectBroker === selectedBroker}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-[#FF5733] px-4 py-2 font-bold uppercase text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {connectingRedirectBroker === selectedBroker ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <ExternalLink aria-hidden="true" className="h-4 w-4" />}
              {hasSavedCredentials ? `Reconnect ${displayValue(selectedBrokerMeta?.name)}` : `Connect ${displayValue(selectedBrokerMeta?.name)}`}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-bold">Credential risk</p>
              <p className="mt-1">
                Broker credentials can permit account access and order placement. Saved secret fields are masked; type a new value only when replacing one.
              </p>
            </div>
            {brokerFields.map((field, index) => {
              const normalizedField = toObject(field);
              const fieldId = displayValue(normalizedField.id);
              const inputType = displayValue(normalizedField.type) || "text";
              const secret = isSecretField(normalizedField);

              return (
                <div key={fieldId || index} className="mb-4">
                  <label className="mb-1 block text-sm font-bold text-[#252F4A]">{displayValue(normalizedField.label) || fieldId}</label>
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
                    <p className="mt-1 text-xs text-[#4B5675]">Saved value is present. Keep the mask to leave it unchanged.</p>
                  ) : null}
                </div>
              );
            })}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !selectedBroker}
                className="rounded-md bg-[#FF5733] px-4 py-2 font-bold uppercase text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : hasSavedCredentials ? "Save Credentials" : "Configure Broker"}
              </button>
            </div>
          </>
        )}
      </section>
    );
  };

  const renderAdvancedDetails = () => (
    <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 normal-case shadow-sm">
      <button
        type="button"
        onClick={() => setAdvancedOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <h2 className="text-lg font-bold text-[#0A1438]">Advanced Details</h2>
          <p className="text-sm text-[#79829E]">Technical broker status and debug fields.</p>
        </div>
        <ChevronDown className={`h-5 w-5 text-[#4B5675] transition ${advancedOpen ? "rotate-180" : ""}`} />
      </button>
      {advancedOpen ? (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {[
            ["Broker", displayValue(advancedBrokerMeta?.name) || advancedBrokerKey],
            ["Registry", formatStatus(advancedBrokerMeta?.status?.status)],
            ["Enabled", advancedBrokerMeta?.status?.enabled === false ? "Coming soon" : "Wired"],
            ["Login raw", formatStatus(advancedHealth?.login_status)],
            ["Websocket raw", formatStatus(advancedHealth?.websocket_status)],
            ["Token status", formatStatus(advancedHealth?.token_status, "Not available")],
            ["Client ID", displayValue(advancedSavedCredentials?.alice_client_id || advancedSavedCredentials?.kiteUserId || advancedSavedCredentials?.client_id || advancedSavedCredentials?.apikey)],
            ["Last tested", formatDateTime(advancedHealth?.last_test_at)],
            ["Connected at", formatDateTime(advancedHealth?.connected_at)],
            ["Last verified", formatDateTime(advancedHealth?.last_verified_at)],
            ["Last order result", displayValue(advancedHealth?.last_order_result)],
            ["Last error", displayValue(advancedHealth?.last_error)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 rounded border border-slate-200 px-3 py-2">
              <span className="text-sm font-semibold text-[#79829E]">{label}</span>
              <span className="text-right text-sm font-bold text-[#252F4A]">{value || "-"}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );

  return (
    <div className="mx-auto w-full px-6 py-4 max-lg:px-3">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1438]">Broker API</h1>
          <p className="text-sm font-semibold normal-case text-[#79829E]">Manage broker connection, credentials, and health.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsBrokerPanelOpen((open) => !open)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#FF5733] px-4 py-2 font-bold uppercase text-white transition hover:bg-orange-600"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add Broker
        </button>
      </div>

      {loadError ? <div className="mb-5"><ErrorState message={loadError} onRetry={fetchBrokerList} /></div> : null}
      {healthError ? (
        <div className="mb-5 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold normal-case text-amber-900">
          {healthError}
        </div>
      ) : null}

      <ActiveBrokerCard
        activeBrokerMeta={activeBrokerMeta}
        activeHealth={activeHealth}
        activeHasCredentials={activeHasCredentials}
        isTesting={isTesting}
        isRedirectBroker={isActiveRedirectBroker}
        isConnectingRedirectBroker={connectingRedirectBroker === activeBroker}
        onPrimaryAction={() => handleConnectRedirectBroker(activeBroker)}
        onTestConnection={() => handleTestConnection(activeBroker)}
        onManage={() => openManageBroker(activeBroker || selectedBroker)}
      />

      <ConfiguredBrokerList
        brokers={configuredBrokers}
        activeBroker={activeBroker}
        brokerHealth={brokerHealth}
        savedCredentials={savedCredentials}
        onManage={openManageBroker}
        onMakeActive={handleMakeActive}
        onTest={handleTestConnection}
      />

      <AvailableBrokerDrawer
        open={isBrokerPanelOpen}
        brokers={brokerList}
        onClose={() => setIsBrokerPanelOpen(false)}
        onSelect={openManageBroker}
      />

      {renderCredentialForm()}
      {renderAdvancedDetails()}
    </div>
  );
};

export default BrokerSetup;
