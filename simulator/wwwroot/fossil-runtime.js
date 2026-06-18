export class FossilRuntime {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.app = null;
    this.manifest = null;
    this.timers = new Map();
    this.startedAt = performance.now();
    this.lastResponse = {};
    this.common = createDefaultCommon();
    this._activeResponse = null;
  }

  async load(source, manifest) {
    this.dispose();
    this.manifest = manifest;
    this.startedAt = performance.now();

    const runtime = this;
    const StateMachine = createStateMachineClass(runtime);
    const globals = {
      state_machine: StateMachine,
      localization_snprintf: (...args) => formatString(...args),
      req_data: (...args) => runtime.handleRequestData(...args),
      start_timer: (...args) => runtime.startTimer(...args),
      stop_timer: (...args) => runtime.stopTimer(...args),
      is_this_timer_expired: (...args) => runtime.isTimerExpired(...args),
      now: () => Math.floor(performance.now() - runtime.startedAt),
      get_unix_time: () => Math.floor(Date.now() / 1000),
      save_node_persist: nodeName => runtime.savePersist(nodeName),
      stop_req_timeout: () => {},
      is_this_query_expired: () => false,
      enable_time_telling: () => currentHandAngles(),
      disable_time_telling: () => {},
      get_common: () => runtime.common,
      common: runtime.common,
    };

    const names = Object.keys(globals);
    const values = Object.values(globals);
    const factory = new Function(
      ...names,
      `${source}\n//# sourceURL=fossil-app.js`
    );

    const app = factory(...values);
    if (!app || typeof app !== "object") {
      throw new Error("app.js did not return an application object");
    }
    if (typeof app.handler !== "function") {
      throw new Error("Application object has no handler(event, response)");
    }

    app.node_name = app.node_name || manifest.identifier || "simulatedApp";
    app.package_name = app.package_name || app.node_name;
    this.app = app;
    this.restorePersist();

    if (typeof app.init === "function") {
      app.init();
    }

    this.log("runtime", `Loaded ${app.node_name}`);
    this.dispatchSystemState("background", "visible");
  }

  dispose() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer.handle);
    }
    this.timers.clear();
    this.app = null;
    this.lastResponse = {};
    this.emitState();
  }

  dispatch(type, payload = {}) {
    if (!this.app) {
      throw new Error("No app is loaded");
    }

    const event = { type, ...payload };
    const response = {};
    this._activeResponse = response;

    this.log("event", event);

    try {
      this.app.handler(event, response);
      this.lastResponse = response;
      this.processResponse(response);
      this.log("response", response);
    } catch (error) {
      this.log("error", error instanceof Error ? error.stack || error.message : error);
      throw error;
    } finally {
      this._activeResponse = null;
      this.emitState();
    }

    return response;
  }

  dispatchSystemState(oldState, newState) {
    return this.dispatch("system_state_update", {
      de: true,
      ze: oldState,
      le: newState,
    });
  }

  setCommon(nextCommon) {
    if (!nextCommon || typeof nextCommon !== "object" || Array.isArray(nextCommon)) {
      throw new Error("Common data must be a JSON object");
    }
    Object.assign(this.common, nextCommon);
    this.emitState();
  }

  startTimer(nodeName, timerName, timeout) {
    const key = `${nodeName}:${timerName}`;
    this.stopTimer(nodeName, timerName);

    const safeTimeout = Math.max(0, Number(timeout) || 0);
    const dueAt = Date.now() + safeTimeout;
    const handle = setTimeout(() => {
      this.timers.delete(key);
      this.emitState();
      try {
        this.dispatch("timer_expired", {
          __nodeName: nodeName,
          __timerName: timerName,
          node_name: nodeName,
          timer_name: timerName,
          id: timerName,
        });
      } catch {
        // The dispatch path already reports the runtime error.
      }
    }, safeTimeout);

    this.timers.set(key, {
      nodeName,
      timerName,
      timeout: safeTimeout,
      dueAt,
      handle,
    });
    this.log("timer", `Started ${key} for ${safeTimeout} ms`);
    this.emitState();
  }

  stopTimer(nodeName, timerName) {
    const key = `${nodeName}:${timerName}`;
    const timer = this.timers.get(key);
    if (!timer) {
      return;
    }
    clearTimeout(timer.handle);
    this.timers.delete(key);
    this.log("timer", `Stopped ${key}`);
    this.emitState();
  }

  isTimerExpired(event, nodeName, timerName) {
    return event?.type === "timer_expired"
      && (event.__nodeName ?? event.node_name) === nodeName
      && (event.__timerName ?? event.timer_name ?? event.id) === timerName;
  }

  savePersist(nodeName) {
    if (!this.app || nodeName !== this.app.node_name) {
      return;
    }

    const fields = Array.isArray(this.app.persist?.data)
      ? this.app.persist.data
      : [];
    const value = {};

    for (const field of fields) {
      value[field] = structuredCloneSafe(this.app[field]);
    }

    localStorage.setItem(this.persistKey(), JSON.stringify(value));
    this.log("persist", value);
    this.emitState();
  }

  restorePersist() {
    if (!this.app) {
      return;
    }

    const raw = localStorage.getItem(this.persistKey());
    if (!raw) {
      return;
    }

    try {
      const value = JSON.parse(raw);
      for (const [key, item] of Object.entries(value)) {
        this.app[key] = item;
      }
      this.log("persist", `Restored ${Object.keys(value).length} field(s)`);
    } catch (error) {
      this.log("error", `Could not restore persistence: ${error}`);
    }
  }

  clearPersist() {
    if (!this.app) {
      return;
    }
    localStorage.removeItem(this.persistKey());
    this.log("persist", "Cleared");
    this.emitState();
  }

  persistKey() {
    return `fossil-hr-simulator:${this.manifest?.identifier || "app"}:persist`;
  }

  handleRequestData(nodeName, query, timeout, flag) {
    this.log("req_data", { nodeName, query, timeout, flag });
  }

  processResponse(response) {
    if (response.move) {
      this.callbacks.onMoveHands?.(response.move);
    }
    if (response.draw) {
      this.callbacks.onDraw?.(response.draw);
    }
    if (response.action) {
      this.callbacks.onAction?.(response.action);
    }
    if (Array.isArray(response.i)) {
      for (const event of response.i) {
        this.callbacks.onGenericEvent?.(event);
      }
    }
    this.callbacks.onResponse?.(response);
  }

  inspect() {
    const stateMachine = this.app?.state_machine;
    const timers = [...this.timers.values()].map(timer => ({
      nodeName: timer.nodeName,
      timerName: timer.timerName,
      timeout: timer.timeout,
      remaining: Math.max(0, timer.dueAt - Date.now()),
    }));

    return {
      identifier: this.app?.node_name ?? "",
      state: stateMachine?.n ?? this.app?.state ?? "",
      timers,
      common: structuredCloneSafe(this.common),
      persistManifest: structuredCloneSafe(this.app?.persist ?? {}),
      lastResponse: structuredCloneSafe(this.lastResponse),
    };
  }

  emitState() {
    this.callbacks.onState?.(this.inspect());
  }

  log(kind, value) {
    this.callbacks.onLog?.({
      at: new Date().toISOString(),
      kind,
      value: structuredCloneSafe(value),
    });
  }
}

function createStateMachineClass(runtime) {
  return function state_machine(
    self,
    globalHandler,
    stateSpecificHandler,
    unused,
    initialState
  ) {
    this.n = initialState;
    this._response = null;

    this.d = nextState => {
      if (nextState === undefined || nextState === null) {
        return;
      }

      const response = this._response || runtime._activeResponse || {};
      const exitHandler = stateSpecificHandler?.(this.n, "exit");
      if (typeof exitHandler === "function") {
        exitHandler(self, response);
      }

      this.n = nextState;

      const entryHandler = stateSpecificHandler?.(this.n, "entry");
      if (typeof entryHandler === "function") {
        entryHandler(self, response);
      }
    };

    this._ = (event, response) => {
      this._response = response;
      try {
        if (typeof globalHandler === "function") {
          globalHandler(self, this, event, response);
        }

        const duringHandler = stateSpecificHandler?.(this.n, "during");
        if (typeof duringHandler === "function") {
          duringHandler(self, this, event, response);
        }
      } finally {
        this._response = null;
      }
    };
  };
}

function createDefaultCommon() {
  const now = new Date();
  return {
    firmware_version: "SIMULATOR",
    serial_number: "PC-SIM",
    battery_soc: 75,
    battery_voltage: 3900,
    charge_status: 0,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    time_zone_local: -now.getTimezoneOffset(),
    active_minutes: 0,
    total_sleep: 0,
    step_count: 4321,
    step_increase: 0,
    calories: 250,
    distance: 3.2,
    bluetooth_status: 1,
    hr_bpm: 72,
    hr_bpm_resting: 65,
    hr_bpm_peak: 112,
    chance_of_rain: 20,
    weatherInfo: {
      temperature: 21,
      condition: "Clear",
    },
    music_playback_state: 0,
    device_offwrist: false,
  };
}

function currentHandAngles() {
  const now = new Date();
  return {
    h: (now.getHours() % 12) * 30 + now.getMinutes() * 0.5,
    m: now.getMinutes() * 6 + now.getSeconds() * 0.1,
  };
}

function formatString(format, ...values) {
  let index = 0;
  return String(format).replace(/%(?:\.(\d+))?([sd])/g, (_, width, type) => {
    const value = values[index++];
    if (type === "s") {
      return String(value);
    }

    let result = String(Math.trunc(Number(value) || 0));
    if (width) {
      result = result.padStart(Number(width), "0");
    }
    return result;
  });
}

function structuredCloneSafe(value) {
  if (value === undefined) {
    return null;
  }
  try {
    return structuredClone(value);
  } catch {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return String(value);
    }
  }
}
