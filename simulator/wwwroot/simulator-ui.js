import { FossilRuntime } from "/fossil-runtime.js";
import { LayoutRenderer } from "/layout-renderer.js";

const elements = {
  status: document.querySelector("#app-status"),
  watch: document.querySelector("#watch"),
  display: document.querySelector("#display"),
  hands: document.querySelector("#hands"),
  common: document.querySelector("#common-json"),
  response: document.querySelector("#response-json"),
  log: document.querySelector("#event-log"),
  state: document.querySelector("#state-name"),
  handState: document.querySelector("#hand-state"),
  timerCount: document.querySelector("#timer-count"),
  lastAction: document.querySelector("#last-action"),
};

const renderer = new LayoutRenderer(
  elements.display,
  elements.hands,
  appendLog
);

const runtime = new FossilRuntime({
  onLog: entry => appendLog(entry.kind, entry.value, entry.at),
  onMoveHands: move => {
    const state = renderer.moveHands(move);
    elements.handState.textContent = `${state.h.toFixed(1)}Â° / ${state.m.toFixed(1)}Â°`;
  },
  onDraw: draw => renderer.renderDrawResponse(draw).catch(reportError),
  onAction: action => {
    elements.lastAction.textContent = `${action.type}${action.Se ? " (kill)" : ""}`;
  },
  onGenericEvent: event => {
    if (event?.type === "double_tap") {
      illuminate();
    }
    appendLog("generic-event", event);
  },
  onResponse: response => {
    elements.response.textContent = JSON.stringify(response, null, 2);
  },
  onState: state => {
    elements.state.textContent = state.state || "â€”";
    elements.timerCount.textContent = String(state.timers.length);
  },
});

async function loadApplication() {
  try {
    renderer.layoutCache.clear();
    renderer.clear();

    const [statusResponse, manifestResponse, sourceResponse] = await Promise.all([
      fetch("/api/status"),
      fetch("/api/app/manifest"),
      fetch("/api/app/source"),
    ]);

    if (!statusResponse.ok || !manifestResponse.ok || !sourceResponse.ok) {
      throw new Error("Could not load application files from the local server");
    }

    const status = await statusResponse.json();
    const manifest = await manifestResponse.json();
    const source = await sourceResponse.text();

    elements.status.textContent =
      `${status.identifier} ${status.version ? `v${status.version}` : ""} â€” ${status.appPath}`;

    await runtime.load(source, manifest);
    elements.common.value = JSON.stringify(runtime.common, null, 2);
  } catch (error) {
    reportError(error);
    elements.status.textContent = "Application load failed";
  }
}

function sendUiEvent(eventName) {
  try {
    switch (eventName) {
      case "visible":
        runtime.dispatchSystemState("background", "visible");
        break;
      case "hidden":
        runtime.dispatchSystemState("visible", "hidden");
        break;
      case "background":
        runtime.dispatchSystemState("visible", "background");
        break;
      case "common_update":
        runtime.dispatch("common_update");
        break;
      case "double_tap":
        illuminate();
        runtime.dispatch("double_tap");
        break;
      default:
        runtime.dispatch(eventName);
        break;
    }
  } catch (error) {
    reportError(error);
  }
}

function illuminate() {
  elements.watch.classList.add("lit");
  window.clearTimeout(illuminate.timeout);
  illuminate.timeout = window.setTimeout(
    () => elements.watch.classList.remove("lit"),
    3000
  );
}

function appendLog(kind, value, at = new Date().toISOString()) {
  const item = document.createElement("li");
  item.className = kind;
  const printable = typeof value === "string"
    ? value
    : JSON.stringify(value);
  item.textContent = `${at.slice(11, 23)} [${kind}] ${printable}`;
  elements.log.append(item);
  elements.log.scrollTop = elements.log.scrollHeight;

  while (elements.log.children.length > 500) {
    elements.log.firstElementChild.remove();
  }
}

function reportError(error) {
  appendLog(
    "error",
    error instanceof Error ? error.stack || error.message : String(error)
  );
}

document.querySelectorAll("[data-event]").forEach(button => {
  button.addEventListener("click", () => sendUiEvent(button.dataset.event));
});

document.querySelector("#reload-app").addEventListener("click", loadApplication);
document.querySelector("#toggle-light").addEventListener("click", illuminate);
document.querySelector("#clear-log").addEventListener("click", () => {
  elements.log.replaceChildren();
});
document.querySelector("#apply-common").addEventListener("click", () => {
  try {
    const value = JSON.parse(elements.common.value);
    runtime.setCommon(value);
    appendLog("common", value);
  } catch (error) {
    reportError(error);
  }
});

window.addEventListener("keydown", event => {
  if (event.target instanceof HTMLTextAreaElement) {
    return;
  }

  const mapping = {
    ArrowUp: event.shiftKey ? "top_hold" : "top_short_press_release",
    Enter: event.shiftKey ? "middle_hold" : "middle_short_press_release",
    ArrowDown: event.shiftKey ? "bottom_hold" : "bottom_short_press_release",
  };

  const mapped = mapping[event.key];
  if (mapped) {
    event.preventDefault();
    sendUiEvent(mapped);
  }
});

loadApplication();

const WATCH_BUTTON_HOLD_MS = 650;

document.querySelectorAll("[data-watch-button]").forEach(button => {
  let holdTimer = null;
  let held = false;
  let activePointerId = null;

  const position = button.dataset.watchButton;

  const cleanup = (pointerId, sendReleaseEvent) => {
    if (activePointerId === null || pointerId !== activePointerId) {
      return;
    }

    const wasHeld = held;
    activePointerId = null;
    held = false;

    if (holdTimer !== null) {
      window.clearTimeout(holdTimer);
      holdTimer = null;
    }

    button.classList.remove("pressed");

    try {
      if (button.hasPointerCapture?.(pointerId)) {
        button.releasePointerCapture(pointerId);
      }
    } catch {
      // The browser may already have released pointer capture.
    }

    if (sendReleaseEvent) {
      sendUiEvent(
        wasHeld
          ? `${position}_long_press_release`
          : `${position}_short_press_release`
      );
    }
  };

  button.addEventListener("pointerdown", event => {
    if (activePointerId !== null) {
      return;
    }

    event.preventDefault();
    activePointerId = event.pointerId;
    held = false;
    button.classList.add("pressed");
    button.setPointerCapture?.(event.pointerId);

    sendUiEvent(`${position}_press`);

    holdTimer = window.setTimeout(() => {
      holdTimer = null;

      if (activePointerId === event.pointerId) {
        held = true;
        sendUiEvent(`${position}_hold`);
      }
    }, WATCH_BUTTON_HOLD_MS);
  });

  button.addEventListener("pointerup", event => {
    event.preventDefault();
    cleanup(event.pointerId, true);
  });

  button.addEventListener("pointercancel", event => {
    cleanup(event.pointerId, false);
  });

  button.addEventListener("lostpointercapture", event => {
    cleanup(event.pointerId, false);
  });

  button.addEventListener("click", event => {
    event.preventDefault();
  });

  button.addEventListener("contextmenu", event => {
    event.preventDefault();
  });
});
