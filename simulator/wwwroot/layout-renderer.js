export class LayoutRenderer {
  constructor(displayCanvas, handsCanvas, logger) {
    this.displayCanvas = displayCanvas;
    this.handsCanvas = handsCanvas;
    this.context = displayCanvas.getContext("2d");
    this.handsContext = handsCanvas.getContext("2d");
    this.logger = logger;
    this.handState = { h: 0, m: 0 };
    this.layoutCache = new Map();
    this.clear();
    this.drawHands(this.handState);
  }

  async renderDrawResponse(drawResponse) {
    const updateType = drawResponse?.update_type ?? "du4";
    const entries = Object.entries(drawResponse || {})
      .filter(([key]) => key !== "update_type");

    if (entries.length === 0) {
      this.logger("renderer", "Draw response contains no node entry");
      return;
    }

    if (updateType === "du4") {
      this.clear();
    }

    for (const [, nodeRequest] of entries) {
      const layoutInfo = nodeRequest?.layout_info ?? {};
      const layoutName = layoutInfo.json_file;
      if (!layoutName) {
        this.logger("renderer", "Missing layout_info.json_file");
        continue;
      }

      const layout = await this.loadLayout(layoutName);
      this.renderLayout(layout, layoutInfo);
    }
  }

  async loadLayout(name) {
    if (this.layoutCache.has(name)) {
      return this.layoutCache.get(name);
    }

    const response = await fetch(`/api/app/layout?name=${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error(`Could not load layout '${name}': ${response.status}`);
    }

    const value = await response.json();
    if (!Array.isArray(value)) {
      throw new Error(`Layout '${name}' is not a JSON array`);
    }

    this.layoutCache.set(name, value);
    return value;
  }

  renderLayout(nodes, layoutInfo) {
    const context = this.context;
    context.save();
    context.beginPath();
    context.arc(120, 120, 120, 0, Math.PI * 2);
    context.clip();

    for (const rawNode of nodes) {
      const node = resolvePlaceholders(rawNode, layoutInfo);
      this.renderNode(node);
    }

    context.restore();
  }

  renderNode(node) {
    const type = node?.type;
    switch (type) {
      case "wapp_template":
        this.renderTemplate(node);
        break;
      case "option_menu":
        this.renderOptionMenu(node);
        break;
      case "text":
      case "text_box":
      case "label":
        this.renderTextNode(node);
        break;
      case "line":
        this.renderLine(node);
        break;
      case "rectangle":
      case "rect":
        this.renderRectangle(node);
        break;
      case "circle":
        this.renderCircle(node);
        break;
      default:
        this.renderUnknownNode(node);
        break;
    }
  }

  renderTemplate(node) {
    const context = this.context;
    const title = node.title_string ?? node.header ?? "";
    if (!title) {
      return;
    }

    context.save();
    context.fillStyle = "#111";
    context.font = "bold 17px Segoe UI, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(title), 120, 32, 170);
    context.strokeStyle = "#444";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(50, 51);
    context.lineTo(190, 51);
    context.stroke();
    context.restore();
  }

  renderOptionMenu(node) {
    const context = this.context;
    const options = Array.isArray(node.options) ? node.options : [];
    const selected = Number(node.option_selected ?? 0);
    const placement = node.placement ?? {};
    const dimension = node.dimension ?? {};
    const left = Number(placement.left ?? 0);
    const top = Number(placement.top ?? 140);
    const width = Number(dimension.width ?? 240);
    const height = Number(dimension.height ?? 75);
    const rowHeight = Math.max(20, height / Math.max(1, options.length));

    context.save();
    context.font = "15px Segoe UI, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    options.forEach((option, index) => {
      const y = top + rowHeight * index;
      const isSelected = index === selected;

      if (isSelected) {
        context.fillStyle = "#111";
        context.fillRect(left + 28, y + 1, width - 56, rowHeight - 2);
        context.fillStyle = "#f1f1e7";
      } else {
        context.fillStyle = "#111";
      }

      context.fillText(
        String(option),
        left + width / 2,
        y + rowHeight / 2,
        width - 68
      );
    });

    context.restore();
  }

  renderTextNode(node) {
    const context = this.context;
    const placement = node.placement ?? {};
    const dimension = node.dimension ?? {};
    const left = Number(placement.left ?? node.left ?? 0);
    const top = Number(placement.top ?? node.top ?? 0);
    const width = Number(dimension.width ?? node.width ?? 240);
    const height = Number(dimension.height ?? node.height ?? 30);
    const text = node.text ?? node.string ?? node.value ?? node.title ?? "";
    const fontSize = Number(node.font_size ?? node.fontSize ?? 16);

    context.save();
    context.fillStyle = node.inversion ? "#f1f1e7" : "#111";
    if (node.inversion) {
      context.fillStyle = "#111";
      context.fillRect(left, top, width, height);
      context.fillStyle = "#f1f1e7";
    }
    context.font = `${node.bold ? "bold " : ""}${fontSize}px Segoe UI, sans-serif`;
    context.textAlign = node.align === "left" ? "left"
      : node.align === "right" ? "right"
      : "center";
    context.textBaseline = "middle";

    const x = context.textAlign === "left" ? left
      : context.textAlign === "right" ? left + width
      : left + width / 2;
    context.fillText(String(text), x, top + height / 2, width);
    context.restore();
  }

  renderLine(node) {
    const context = this.context;
    const x1 = Number(node.x1 ?? node.placement?.left ?? 0);
    const y1 = Number(node.y1 ?? node.placement?.top ?? 0);
    const x2 = Number(node.x2 ?? x1 + (node.dimension?.width ?? 0));
    const y2 = Number(node.y2 ?? y1 + (node.dimension?.height ?? 0));

    context.save();
    context.strokeStyle = "#111";
    context.lineWidth = Number(node.line_width ?? 1);
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.restore();
  }

  renderRectangle(node) {
    const context = this.context;
    const left = Number(node.placement?.left ?? node.left ?? 0);
    const top = Number(node.placement?.top ?? node.top ?? 0);
    const width = Number(node.dimension?.width ?? node.width ?? 10);
    const height = Number(node.dimension?.height ?? node.height ?? 10);

    context.save();
    context.strokeStyle = "#111";
    context.fillStyle = "#111";
    if (node.fill ?? node.filled) {
      context.fillRect(left, top, width, height);
    } else {
      context.strokeRect(left, top, width, height);
    }
    context.restore();
  }

  renderCircle(node) {
    const context = this.context;
    const left = Number(node.placement?.left ?? node.left ?? 0);
    const top = Number(node.placement?.top ?? node.top ?? 0);
    const width = Number(node.dimension?.width ?? node.width ?? 20);
    const height = Number(node.dimension?.height ?? node.height ?? width);

    context.save();
    context.strokeStyle = "#111";
    context.fillStyle = "#111";
    context.beginPath();
    context.ellipse(
      left + width / 2,
      top + height / 2,
      width / 2,
      height / 2,
      0,
      0,
      Math.PI * 2
    );
    if (node.fill ?? node.filled) {
      context.fill();
    } else {
      context.stroke();
    }
    context.restore();
  }

  renderUnknownNode(node) {
    if (node?.visible === false) {
      return;
    }

    const context = this.context;
    const left = Number(node?.placement?.left ?? 4);
    const top = Number(node?.placement?.top ?? 4);
    const width = Math.max(30, Number(node?.dimension?.width ?? 80));
    const height = Math.max(18, Number(node?.dimension?.height ?? 24));

    context.save();
    context.strokeStyle = "#666";
    context.setLineDash([3, 3]);
    context.strokeRect(left, top, width, height);
    context.fillStyle = "#333";
    context.font = "10px Consolas, monospace";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText(String(node?.type ?? "unknown"), left + 2, top + 2, width - 4);
    context.restore();

    this.logger("renderer", `Unsupported layout node: ${node?.type ?? "unknown"}`);
  }

  clear() {
    const context = this.context;
    context.save();
    context.fillStyle = "#dedfd5";
    context.fillRect(0, 0, 240, 240);
    context.strokeStyle = "rgba(0,0,0,0.08)";
    context.lineWidth = 1;

    for (let x = 0; x < 240; x += 8) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, 240);
      context.stroke();
    }
    for (let y = 0; y < 240; y += 8) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(240, y);
      context.stroke();
    }

    context.restore();
  }

  moveHands(move) {
    const relative = Boolean(move?.is_relative);
    const next = {
      h: Number(move?.h ?? 0),
      m: Number(move?.m ?? 0),
    };

    if (relative) {
      next.h += this.handState.h;
      next.m += this.handState.m;
    }

    this.handState = {
      h: normalizeDegrees(next.h),
      m: normalizeDegrees(next.m),
    };
    this.drawHands(this.handState);
    return { ...this.handState };
  }

  drawHands(state) {
    const context = this.handsContext;
    context.clearRect(0, 0, 240, 240);

    drawHand(context, state.h, 63, 5);
    drawHand(context, state.m, 86, 3);

    context.save();
    context.fillStyle = "#202224";
    context.beginPath();
    context.arc(120, 120, 7, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

function resolvePlaceholders(value, layoutInfo) {
  if (typeof value === "string" && value.startsWith("#")) {
    const key = value.slice(1);
    return key in layoutInfo ? layoutInfo[key] : value;
  }

  if (Array.isArray(value)) {
    return value.map(item => resolvePlaceholders(item, layoutInfo));
  }

  if (value && typeof value === "object") {
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = resolvePlaceholders(item, layoutInfo);
    }
    return result;
  }

  return value;
}

function drawHand(context, degrees, length, width) {
  const radians = (degrees - 90) * Math.PI / 180;
  context.save();
  context.strokeStyle = "#1b1d1f";
  context.lineWidth = width;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(120, 120);
  context.lineTo(
    120 + Math.cos(radians) * length,
    120 + Math.sin(radians) * length
  );
  context.stroke();
  context.restore();
}

function normalizeDegrees(value) {
  const result = value % 360;
  return result < 0 ? result + 360 : result;
}
