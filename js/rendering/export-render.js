/**
 * Drawora — Export Rendering, SVG, PDF, and Export Dialog
 * Off-screen high-res rendering, vector SVG serialization, minimal PDF binary builder,
 * board thumbnail generator, and export modal logic.
 */
(function (D) {
  "use strict";

  function renderPageToCanvas(page, options = {}) {
    const scale = options.scale || 1;
    const transparent = Boolean(options.transparent);
    const objects = options.objects || (page.id === D.state.currentPageId ? D.state.objects : page.objects || []);

    let minX = 0;
    let minY = 0;
    let width = page.width;
    let height = page.height;

    if (options.scope === "selection" && options.bounds) {
      minX = options.bounds.x;
      minY = options.bounds.y;
      width = Math.max(options.bounds.width, 20);
      height = Math.max(options.bounds.height, 20);
    }

    const expCanvas = document.createElement("canvas");
    expCanvas.width = Math.max(1, Math.round(width * scale));
    expCanvas.height = Math.max(1, Math.round(height * scale));
    const ectx = expCanvas.getContext("2d");
    if (!ectx) return expCanvas;

    ectx.scale(scale, scale);
    ectx.translate(-minX, -minY);

    const surface = typeof D.pageSurface === "function" ? D.pageSurface(page) : page.surface;
    if (!transparent) {
      ectx.fillStyle = surface.paperColor || "#ffffff";
      ectx.fillRect(minX, minY, width, height);
      if (options.scope !== "selection" && typeof D.drawPagePattern === "function") {
        D.drawPagePattern(ectx, page.width, page.height, surface, (p) => p);
      }
    }

    for (const object of objects) {
      if (!object || object.hidden) continue;
      drawObjectToContext(ectx, object);
    }

    return expCanvas;
  }

  function drawObjectToContext(targetCtx, object) {
    const rotation = object.rotation || 0;
    const flipX = !D.isImage(object) && object.flipX;
    const flipY = !D.isImage(object) && object.flipY;
    targetCtx.save();
    if (rotation || flipX || flipY) {
      const center = D.getCenter(object);
      targetCtx.translate(center.x, center.y);
      targetCtx.rotate(rotation);
      targetCtx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      targetCtx.translate(-center.x, -center.y);
    }
    drawSingleObjectToContext(targetCtx, object);
    targetCtx.restore();
  }

  function drawSingleObjectToContext(targetCtx, object) {
    if (object.type === "stroke") {
      drawStrokeToContext(targetCtx, object);
    } else if (object.type === "sticky") {
      drawStickyToContext(targetCtx, object);
    } else if (object.type === "text") {
      drawTextBoxToContext(targetCtx, object);
    } else if (object.type === "image") {
      drawPictureToContext(targetCtx, object);
    } else if (object.type === "link") {
      drawLinkToContext(targetCtx, object);
    } else if (object.type === "table") {
      drawTableToContext(targetCtx, object);
    } else if (object.type === "file") {
      drawFileCardToContext(targetCtx, object);
    } else {
      drawShapeToContext(targetCtx, object);
    }
  }

  function drawStrokeToContext(targetCtx, stroke) {
    if (stroke.tool === "eraser") return;
    const points = stroke.points;
    if (!points || points.length === 0) return;
    targetCtx.save();
    targetCtx.strokeStyle = stroke.color || "#0f172a";
    targetCtx.fillStyle = stroke.color || "#0f172a";
    targetCtx.lineWidth = Math.max(stroke.size || 2, 1);
    targetCtx.lineCap = "round";
    targetCtx.lineJoin = "round";
    if (stroke.tool === "highlighter") {
      targetCtx.globalAlpha = 0.35;
      targetCtx.lineWidth = (stroke.size || 16) * 1.5;
    } else if (stroke.tool === "marker") {
      targetCtx.globalAlpha = 0.75;
    }
    if (points.length === 1) {
      targetCtx.beginPath();
      targetCtx.arc(points[0].x, points[0].y, targetCtx.lineWidth / 2, 0, Math.PI * 2);
      targetCtx.fill();
    } else {
      targetCtx.beginPath();
      targetCtx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        targetCtx.lineTo(points[i].x, points[i].y);
      }
      targetCtx.stroke();
    }
    targetCtx.restore();
  }

  function drawStickyToContext(targetCtx, object) {
    targetCtx.save();
    targetCtx.shadowColor = "rgba(0,0,0,0.12)";
    targetCtx.shadowBlur = 6;
    targetCtx.shadowOffsetY = 2;
    targetCtx.fillStyle = object.fill || "#fef08a";
    targetCtx.beginPath();
    if (typeof targetCtx.roundRect === "function") {
      targetCtx.roundRect(object.x, object.y, object.width, object.height, 8);
    } else {
      targetCtx.rect(object.x, object.y, object.width, object.height);
    }
    targetCtx.fill();
    targetCtx.shadowColor = "transparent";
    if (object.stroke && object.strokeSize) {
      targetCtx.strokeStyle = object.stroke;
      targetCtx.lineWidth = object.strokeSize;
      targetCtx.stroke();
    }
    drawWrappedTextToContext(targetCtx, object);
    targetCtx.restore();
  }

  function drawTextBoxToContext(targetCtx, object) {
    targetCtx.save();
    if (object.fill) {
      targetCtx.fillStyle = object.fill;
      targetCtx.fillRect(object.x, object.y, object.width, object.height);
    }
    if (object.stroke && object.strokeSize) {
      targetCtx.strokeStyle = object.stroke;
      targetCtx.lineWidth = object.strokeSize;
      targetCtx.strokeRect(object.x, object.y, object.width, object.height);
    }
    drawWrappedTextToContext(targetCtx, object);
    targetCtx.restore();
  }

  function drawPictureToContext(targetCtx, object) {
    const asset = D.imageAssets.get(object.assetId || object.imageId);
    const sourceEl = asset ? (asset.source || asset) : null;
    if (!sourceEl) return;
    targetCtx.save();
    if (object.opacity != null && object.opacity < 1) targetCtx.globalAlpha = object.opacity;
    if (object.shadow) {
      targetCtx.shadowColor = "rgba(0,0,0,0.25)";
      targetCtx.shadowBlur = 10;
      targetCtx.shadowOffsetY = 4;
    }
    const naturalW = sourceEl.naturalWidth || sourceEl.width || 1;
    const naturalH = sourceEl.naturalHeight || sourceEl.height || 1;
    const sx = object.cropX != null ? object.cropX * naturalW : (object.crop ? object.crop.sx : 0);
    const sy = object.cropY != null ? object.cropY * naturalH : (object.crop ? object.crop.sy : 0);
    const sw = object.cropW != null ? object.cropW * naturalW : (object.crop ? object.crop.sw : naturalW);
    const sh = object.cropH != null ? object.cropH * naturalH : (object.crop ? object.crop.sh : naturalH);
    const r = object.radius || 0;
    if (r > 0) {
      targetCtx.beginPath();
      if (typeof targetCtx.roundRect === "function") {
        targetCtx.roundRect(object.x, object.y, object.width, object.height, r);
      } else {
        targetCtx.rect(object.x, object.y, object.width, object.height);
      }
      targetCtx.clip();
    }
    targetCtx.drawImage(sourceEl, sx, sy, sw, sh, object.x, object.y, object.width, object.height);
    if (object.stroke && object.strokeSize) {
      targetCtx.strokeStyle = object.stroke;
      targetCtx.lineWidth = object.strokeSize;
      targetCtx.strokeRect(object.x, object.y, object.width, object.height);
    }
    targetCtx.restore();
  }

  function drawLinkToContext(targetCtx, object) {
    targetCtx.save();
    targetCtx.fillStyle = object.fill || "rgba(15, 118, 110, 0.08)";
    targetCtx.strokeStyle = object.stroke || "#0f766e";
    targetCtx.lineWidth = 1;
    targetCtx.beginPath();
    if (typeof targetCtx.roundRect === "function") {
      targetCtx.roundRect(object.x, object.y, object.width, object.height, 6);
    } else {
      targetCtx.rect(object.x, object.y, object.width, object.height);
    }
    targetCtx.fill();
    targetCtx.stroke();
    targetCtx.fillStyle = "#0f766e";
    targetCtx.font = `600 ${object.fontSize || 14}px sans-serif`;
    const label = object.text || object.href || "Link";
    targetCtx.fillText(label, object.x + 10, object.y + object.height / 2 + 5, object.width - 20);
    targetCtx.restore();
  }

  function drawTableToContext(targetCtx, object) {
    targetCtx.save();
    targetCtx.strokeStyle = object.stroke || "#0f172a";
    targetCtx.lineWidth = Math.max(object.strokeSize || 1, 1);
    targetCtx.fillStyle = object.fill || "#ffffff";
    targetCtx.fillRect(object.x, object.y, object.width, object.height);
    targetCtx.strokeRect(object.x, object.y, object.width, object.height);

    const layout = D.tableLayout(object);
    for (let r = 0; r < object.cells.length; r++) {
      for (let c = 0; c < (object.cells[r] || []).length; c++) {
        const cell = object.cells[r][c];
        if (!cell) continue;
        const rect = D.tableCellRect(object, r, c);
        if (!rect) continue;
        if (cell.fill) {
          targetCtx.fillStyle = cell.fill;
          targetCtx.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
        targetCtx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        if (cell.text) {
          targetCtx.save();
          targetCtx.beginPath();
          targetCtx.rect(rect.x, rect.y, rect.width, rect.height);
          targetCtx.clip();
          targetCtx.fillStyle = cell.color || "#0f172a";
          const weight = cell.bold ? "bold " : "";
          const style = cell.italic ? "italic " : "";
          targetCtx.font = `${style}${weight}${cell.fontSize || 14}px sans-serif`;
          targetCtx.fillText(cell.text, rect.x + D.TABLE_PAD, rect.y + 16, rect.width - D.TABLE_PAD * 2);
          targetCtx.restore();
        }
      }
    }
    targetCtx.restore();
  }

  function drawFileCardToContext(targetCtx, object) {
    targetCtx.save();
    targetCtx.fillStyle = object.fill || "#ffffff";
    targetCtx.strokeStyle = object.stroke || "#d6d3d1";
    targetCtx.lineWidth = 1;
    targetCtx.beginPath();
    if (typeof targetCtx.roundRect === "function") {
      targetCtx.roundRect(object.x, object.y, object.width, object.height, 8);
    } else {
      targetCtx.rect(object.x, object.y, object.width, object.height);
    }
    targetCtx.fill();
    targetCtx.stroke();
    targetCtx.fillStyle = "#0f172a";
    targetCtx.font = `600 13px sans-serif`;
    targetCtx.fillText(object.fileName || "File", object.x + 40, object.y + 24, object.width - 50);
    targetCtx.restore();
  }

  function drawShapeToContext(targetCtx, object) {
    targetCtx.save();
    targetCtx.fillStyle = object.fill || "transparent";
    targetCtx.strokeStyle = object.stroke || "#0f172a";
    targetCtx.lineWidth = Math.max(object.strokeSize || 2, 1);
    if (object.type === "line" || object.type === "arrow") {
      targetCtx.beginPath();
      targetCtx.moveTo(object.x1, object.y1);
      targetCtx.lineTo(object.x2, object.y2);
      targetCtx.stroke();
      if (object.type === "arrow") {
        const headlen = 12;
        const dx = object.x2 - object.x1;
        const dy = object.y2 - object.y1;
        const angle = Math.atan2(dy, dx);
        targetCtx.fillStyle = object.stroke || "#0f172a";
        targetCtx.beginPath();
        targetCtx.moveTo(object.x2, object.y2);
        targetCtx.lineTo(
          object.x2 - headlen * Math.cos(angle - Math.PI / 6),
          object.y2 - headlen * Math.sin(angle - Math.PI / 6)
        );
        targetCtx.lineTo(
          object.x2 - headlen * Math.cos(angle + Math.PI / 6),
          object.y2 - headlen * Math.sin(angle + Math.PI / 6)
        );
        targetCtx.closePath();
        targetCtx.fill();
      }
      targetCtx.restore();
      return;
    }

    if (object.type === "rect") {
      if (object.fill) targetCtx.fillRect(object.x, object.y, object.width, object.height);
      targetCtx.strokeRect(object.x, object.y, object.width, object.height);
    } else if (object.type === "roundrect") {
      targetCtx.beginPath();
      if (typeof targetCtx.roundRect === "function") {
        targetCtx.roundRect(object.x, object.y, object.width, object.height, 12);
      } else {
        targetCtx.rect(object.x, object.y, object.width, object.height);
      }
      if (object.fill) targetCtx.fill();
      targetCtx.stroke();
    } else if (object.type === "ellipse") {
      targetCtx.beginPath();
      targetCtx.ellipse(
        object.x + object.width / 2,
        object.y + object.height / 2,
        Math.abs(object.width / 2),
        Math.abs(object.height / 2),
        0,
        0,
        Math.PI * 2
      );
      if (object.fill) targetCtx.fill();
      targetCtx.stroke();
    } else if (object.type === "triangle") {
      targetCtx.beginPath();
      targetCtx.moveTo(object.x + object.width / 2, object.y);
      targetCtx.lineTo(object.x + object.width, object.y + object.height);
      targetCtx.lineTo(object.x, object.y + object.height);
      targetCtx.closePath();
      if (object.fill) targetCtx.fill();
      targetCtx.stroke();
    } else if (object.type === "diamond") {
      targetCtx.beginPath();
      targetCtx.moveTo(object.x + object.width / 2, object.y);
      targetCtx.lineTo(object.x + object.width, object.y + object.height / 2);
      targetCtx.lineTo(object.x + object.width / 2, object.y + object.height);
      targetCtx.lineTo(object.x, object.y + object.height / 2);
      targetCtx.closePath();
      if (object.fill) targetCtx.fill();
      targetCtx.stroke();
    } else if (object.type === "star") {
      const cx = object.x + object.width / 2;
      const cy = object.y + object.height / 2;
      const rx = Math.abs(object.width / 2);
      const ry = Math.abs(object.height / 2);
      targetCtx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 1 : 0.45;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const px = cx + rx * r * Math.cos(angle);
        const py = cy + ry * r * Math.sin(angle);
        if (i === 0) targetCtx.moveTo(px, py);
        else targetCtx.lineTo(px, py);
      }
      targetCtx.closePath();
      if (object.fill) targetCtx.fill();
      targetCtx.stroke();
    } else {
      targetCtx.beginPath();
      targetCtx.rect(object.x, object.y, object.width, object.height);
      if (object.fill) targetCtx.fill();
      targetCtx.stroke();
    }
    targetCtx.restore();
  }

  function drawWrappedTextToContext(targetCtx, object) {
    if (!object.text) return;
    targetCtx.save();
    targetCtx.fillStyle = object.color || "#0f172a";
    const weight = object.bold ? "bold " : "";
    const style = object.italic ? "italic " : "";
    targetCtx.font = `${style}${weight}${object.fontSize || 16}px sans-serif`;
    const lines = String(object.text).split("\n");
    const pad = 10;
    const lineHeight = (object.fontSize || 16) * (object.lineHeight || 1.35);
    let currY = object.y + pad + (object.fontSize || 16) * 0.85;
    for (const line of lines) {
      let x = object.x + pad;
      if (object.align === "center") x = object.x + object.width / 2 - targetCtx.measureText(line).width / 2;
      else if (object.align === "right") x = object.x + object.width - pad - targetCtx.measureText(line).width;
      targetCtx.fillText(line, x, currY, object.width - pad * 2);
      currY += lineHeight;
    }
    targetCtx.restore();
  }

  function generateSvgForPage(page, options = {}) {
    const transparent = Boolean(options.transparent);
    const objects = options.objects || (page.id === D.state.currentPageId ? D.state.objects : page.objects || []);
    let minX = 0;
    let minY = 0;
    let width = page.width;
    let height = page.height;

    if (options.scope === "selection" && options.bounds) {
      minX = Math.round(options.bounds.x);
      minY = Math.round(options.bounds.y);
      width = Math.round(Math.max(options.bounds.width, 20));
      height = Math.round(Math.max(options.bounds.height, 20));
    }

    const surface = typeof D.pageSurface === "function" ? D.pageSurface(page) : page.surface;
    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">\n`;

    if (!transparent) {
      svg += `  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="${surface.paperColor || "#ffffff"}"/>\n`;
    }

    for (const object of objects) {
      if (!object || object.hidden) continue;
      svg += objectToSvg(object);
    }

    svg += `</svg>\n`;
    return svg;
  }

  function objectToSvg(object) {
    const rot = object.rotation
      ? ` transform="rotate(${((object.rotation * 180) / Math.PI).toFixed(2)} ${D.getCenter(object).x} ${D.getCenter(object).y})"`
      : "";
    if (object.type === "stroke") {
      if (object.tool === "eraser" || !object.points || object.points.length === 0) return "";
      const color = object.color || "#0f172a";
      const size = object.size || 2;
      const opacity = object.tool === "highlighter" ? 0.35 : object.tool === "marker" ? 0.75 : 1;
      const d = object.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
      return `  <path d="${d}" fill="none" stroke="${color}" stroke-width="${size}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"${rot}/>\n`;
    }
    if (object.type === "rect") {
      const fill = object.fill || "none";
      const stroke = object.stroke || "#0f172a";
      const sw = object.strokeSize || 1;
      return `  <rect x="${object.x}" y="${object.y}" width="${object.width}" height="${object.height}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${rot}/>\n`;
    }
    if (object.type === "roundrect") {
      const fill = object.fill || "none";
      const stroke = object.stroke || "#0f172a";
      const sw = object.strokeSize || 1;
      return `  <rect x="${object.x}" y="${object.y}" width="${object.width}" height="${object.height}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${rot}/>\n`;
    }
    if (object.type === "ellipse") {
      const fill = object.fill || "none";
      const stroke = object.stroke || "#0f172a";
      const sw = object.strokeSize || 1;
      const cx = object.x + object.width / 2;
      const cy = object.y + object.height / 2;
      return `  <ellipse cx="${cx}" cy="${cy}" rx="${Math.abs(object.width / 2)}" ry="${Math.abs(object.height / 2)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${rot}/>\n`;
    }
    if (object.type === "text" || object.type === "sticky") {
      let out = `  <g${rot}>\n`;
      if (object.type === "sticky") {
        out += `    <rect x="${object.x}" y="${object.y}" width="${object.width}" height="${object.height}" rx="8" fill="${object.fill || "#fef08a"}"/>\n`;
      }
      const lines = String(object.text || "").split("\n");
      const pad = 10;
      const fontSize = object.fontSize || 16;
      const lineHeight = fontSize * (object.lineHeight || 1.35);
      let currY = object.y + pad + fontSize * 0.85;
      for (const line of lines) {
        let x = object.x + pad;
        let anchor = "start";
        if (object.align === "center") {
          x = object.x + object.width / 2;
          anchor = "middle";
        } else if (object.align === "right") {
          x = object.x + object.width - pad;
          anchor = "end";
        }
        out += `    <text x="${x}" y="${currY}" font-family="sans-serif" font-size="${fontSize}" font-weight="${object.bold ? "bold" : "normal"}" font-style="${object.italic ? "italic" : "normal"}" fill="${object.color || "#0f172a"}" text-anchor="${anchor}">${D.escapeXml(line)}</text>\n`;
        currY += lineHeight;
      }
      out += `  </g>\n`;
      return out;
    }
    if (object.type === "line" || object.type === "arrow") {
      const stroke = object.stroke || "#0f172a";
      const sw = object.strokeSize || 2;
      return `  <line x1="${object.x1}" y1="${object.y1}" x2="${object.x2}" y2="${object.y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"${rot}/>\n`;
    }
    return `  <rect x="${object.x}" y="${object.y}" width="${object.width}" height="${object.height}" fill="${object.fill || "none"}" stroke="${object.stroke || "#0f172a"}" stroke-width="1"${rot}/>\n`;
  }

  function buildMinimalPdf(pagesDataUrls) {
    const encoder = new TextEncoder();
    const parts = [];
    let byteLength = 0;

    function addChunk(uint8) {
      parts.push(uint8);
      byteLength += uint8.length;
    }

    function addAscii(str) {
      addChunk(encoder.encode(str));
    }

    // PDF 1.4 header with binary comment marker
    addAscii("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

    const xrefs = [];
    let objCount = 0;

    function startObj() {
      objCount++;
      xrefs[objCount] = byteLength;
      addAscii(`${objCount} 0 obj\n`);
      return objCount;
    }

    function endObj() {
      addAscii("endobj\n");
    }

    // Object 1: Catalog
    const catalogId = startObj();
    addAscii("<< /Type /Catalog /Pages 2 0 R >>\n");
    endObj();

    // Object 2: Pages tree root
    const pageCount = pagesDataUrls.length;
    const pageObjIds = [];
    for (let i = 0; i < pageCount; i++) {
      pageObjIds.push(3 + i * 3);
    }
    startObj();
    addAscii(`<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageCount} >>\n`);
    endObj();

    for (let i = 0; i < pageCount; i++) {
      const pageData = pagesDataUrls[i];
      const pageObjId = pageObjIds[i];
      const contentObjId = pageObjId + 1;
      const imgObjId = pageObjId + 2;

      const pw = Math.round(pageData.width);
      const ph = Math.round(pageData.height);
      const imgW = Math.round(pageData.pixelWidth || pageData.width);
      const imgH = Math.round(pageData.pixelHeight || pageData.height);

      const rawBase64 = pageData.dataUrl.split(",")[1];
      const binaryStr = atob(rawBase64);
      const imgBytes = new Uint8Array(binaryStr.length);
      for (let j = 0; j < binaryStr.length; j++) {
        imgBytes[j] = binaryStr.charCodeAt(j);
      }

      // Page Object
      startObj();
      addAscii(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Contents ${contentObjId} 0 R /Resources << /XObject << /Im1 ${imgObjId} 0 R >> >> >>\n`
      );
      endObj();

      // Content Stream: Scale image to fill page
      const contentStream = `q\n${pw} 0 0 ${ph} 0 0 cm\n/Im1 Do\nQ\n`;
      const contentBytes = encoder.encode(contentStream);
      startObj();
      addAscii(`<< /Length ${contentBytes.length} >>\nstream\n${contentStream}endstream\n`);
      endObj();

      // Image XObject with actual image pixel dimensions and JPEG stream
      startObj();
      addAscii(
        `<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`
      );
      addChunk(imgBytes);
      addAscii("\nendstream\n");
      endObj();
    }

    // Cross-reference table
    const startXref = byteLength;
    addAscii("xref\n");
    addAscii(`0 ${objCount + 1}\n`);
    addAscii("0000000000 65535 f \r\n");
    for (let i = 1; i <= objCount; i++) {
      const offsetStr = String(xrefs[i]).padStart(10, "0");
      addAscii(`${offsetStr} 00000 n \r\n`);
    }

    // Trailer
    addAscii("trailer\n");
    addAscii(`<< /Size ${objCount + 1} /Root ${catalogId} 0 R >>\n`);
    addAscii("startxref\n");
    addAscii(`${startXref}\n%%EOF\n`);

    return new Blob(parts, { type: "application/pdf" });
  }

  function drawThumbObject(target, object) {
    target.save();
    if (object.rotation) {
      const center = D.getCenter(object);
      target.translate(center.x, center.y);
      target.rotate(object.rotation);
      target.translate(-center.x, -center.y);
    }
    if (object.type === "stroke") {
      target.strokeStyle = object.color || "#0f172a";
      target.lineWidth = Math.max(object.size || 2, 2);
      target.lineCap = "round";
      target.lineJoin = "round";
      if (object.points && object.points.length > 0) {
        target.beginPath();
        target.moveTo(object.points[0].x, object.points[0].y);
        for (let i = 1; i < object.points.length; i++) {
          target.lineTo(object.points[i].x, object.points[i].y);
        }
        target.stroke();
      }
    } else if (object.type === "rect" || object.type === "roundrect") {
      target.fillStyle = object.fill || "transparent";
      target.strokeStyle = object.stroke || "#0f172a";
      target.lineWidth = Math.max(object.strokeSize || 1, 1);
      if (object.fill) target.fillRect(object.x, object.y, object.width, object.height);
      target.strokeRect(object.x, object.y, object.width, object.height);
    } else if (object.type === "ellipse") {
      target.fillStyle = object.fill || "transparent";
      target.strokeStyle = object.stroke || "#0f172a";
      target.lineWidth = Math.max(object.strokeSize || 1, 1);
      target.beginPath();
      target.ellipse(
        object.x + object.width / 2,
        object.y + object.height / 2,
        Math.abs(object.width / 2),
        Math.abs(object.height / 2),
        0,
        0,
        Math.PI * 2
      );
      if (object.fill) target.fill();
      target.stroke();
    } else if (object.type === "text" || object.type === "sticky") {
      if (object.type === "sticky") {
        target.fillStyle = object.fill || "#fef08a";
        target.fillRect(object.x, object.y, object.width, object.height);
      }
      target.fillStyle = object.color || "#0f172a";
      target.font = `bold ${Math.max(object.fontSize || 16, 12)}px sans-serif`;
      const text = String(object.text || "").split("\n")[0] || "";
      target.fillText(text.slice(0, 24), object.x + 6, object.y + 18, object.width - 12);
    } else if (object.type === "table") {
      target.strokeStyle = object.stroke || "#0f172a";
      target.lineWidth = 1;
      target.strokeRect(object.x, object.y, object.width, object.height);
      const cols = (object.colW || []).length || 3;
      const rows = (object.rowH || []).length || 3;
      for (let c = 1; c < cols; c++) {
        const cx = object.x + (object.width / cols) * c;
        target.beginPath();
        target.moveTo(cx, object.y);
        target.lineTo(cx, object.y + object.height);
        target.stroke();
      }
      for (let r = 1; r < rows; r++) {
        const ry = object.y + (object.height / rows) * r;
        target.beginPath();
        target.moveTo(object.x, ry);
        target.lineTo(object.x + object.width, ry);
        target.stroke();
      }
    } else {
      const bounds = D.getLocalBounds(object);
      target.fillStyle = object.fill || "rgba(15, 118, 110, 0.25)";
      target.strokeStyle = object.stroke || "#0f766e";
      target.lineWidth = 1;
      target.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      target.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
    target.restore();
  }

  function generateBoardThumbnail(pages, currentPageId, width = 240, height = 150) {
    try {
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = width;
      thumbCanvas.height = height;
      const tctx = thumbCanvas.getContext("2d");
      if (!tctx) return "";

      tctx.fillStyle = "#e7e5e4";
      tctx.fillRect(0, 0, width, height);

      const targetPage = (pages && pages.find((p) => p.id === currentPageId)) || (pages && pages[0]);
      if (!targetPage) return thumbCanvas.toDataURL("image/webp", 0.85);

      const pad = 12;
      const availW = width - pad * 2;
      const availH = height - pad * 2;
      const scale = Math.min(availW / targetPage.width, availH / targetPage.height);
      const pw = targetPage.width * scale;
      const ph = targetPage.height * scale;
      const ox = (width - pw) / 2;
      const oy = (height - ph) / 2;
      const surface = typeof D.pageSurface === "function" ? D.pageSurface(targetPage) : targetPage.surface;

      tctx.shadowColor = "rgba(0, 0, 0, 0.12)";
      tctx.shadowBlur = 8;
      tctx.shadowOffsetY = 2;
      tctx.fillStyle = surface.paperColor || "#ffffff";
      tctx.fillRect(ox, oy, pw, ph);
      tctx.shadowColor = "transparent";

      tctx.save();
      tctx.beginPath();
      tctx.rect(ox, oy, pw, ph);
      tctx.clip();
      tctx.translate(ox, oy);
      tctx.scale(scale, scale);

      if (typeof D.drawPagePattern === "function") {
        D.drawPagePattern(tctx, targetPage.width, targetPage.height, surface, (pixels) => pixels / scale);
      }

      const pageObjects = targetPage.id === D.state.currentPageId ? D.state.objects : targetPage.objects || [];
      for (const object of pageObjects) {
        if (!object || object.hidden) continue;
        drawThumbObject(tctx, object);
      }

      tctx.restore();

      tctx.strokeStyle = "rgba(0,0,0,0.12)";
      tctx.lineWidth = 1;
      tctx.strokeRect(ox, oy, pw, ph);

      return thumbCanvas.toDataURL("image/webp", 0.85);
    } catch {
      return "";
    }
  }

  async function generateExportPreview() {
    if (!D.exportFormatSelect) return;
    const format = D.exportFormatSelect.value;
    const scope = D.exportScopeSelect.value;
    const scale = Number(D.exportScaleSelect.value) || 1;
    const transparent = D.exportTransparentBg.checked;

    if (D.exportPreviewBadge) {
      D.exportPreviewBadge.textContent = `${format.toUpperCase()} · ${
        scope === "selection" ? "Selection" : scope === "all" ? `${D.state.pages.length} Pages` : "Current Page"
      }`;
    }
    if (D.exportPreviewPlaceholder) D.exportPreviewPlaceholder.hidden = false;
    if (D.exportPreviewImg) D.exportPreviewImg.hidden = true;

    try {
      const page = typeof D.currentPage === "function" ? D.currentPage() : null;
      if (!page) return;

      let bounds = null;
      let objects = page.id === D.state.currentPageId ? D.state.objects : page.objects || [];
      if (scope === "selection") {
        const sel = D.selectedObjects();
        if (sel.length > 0) {
          objects = sel;
          bounds = D.unionBounds(sel.map((o) => D.objectWorldBounds(o)));
        } else {
          bounds = { x: 0, y: 0, width: page.width, height: page.height };
        }
      }

      if (format === "project" || format === "json") {
        if (D.exportPreviewPlaceholder) {
          D.exportPreviewPlaceholder.textContent = `${format === "project" ? "Drawora Project" : "Raw JSON"} (${D.state.pages.length} pages, ${D.state.objects.length} objects)`;
          D.exportPreviewPlaceholder.hidden = false;
        }
        if (D.exportPreviewImg) D.exportPreviewImg.hidden = true;
        if (D.exportInfo) {
          D.exportInfo.textContent = `Ready to download ${D.state.boardName}.${format === "project" ? "drawora" : "json"}`;
        }
        return;
      }

      const prevCanvas = renderPageToCanvas(page, {
        scale: Math.min(scale, 1.5),
        transparent: transparent && (format === "png" || format === "svg"),
        scope,
        bounds,
        objects,
      });

      if (D.exportPreviewImg) {
        D.exportPreviewImg.src = prevCanvas.toDataURL("image/png");
        D.exportPreviewImg.hidden = false;
      }
      if (D.exportPreviewPlaceholder) D.exportPreviewPlaceholder.hidden = true;

      const fullW = bounds ? Math.round(bounds.width * scale) : Math.round(page.width * scale);
      const fullH = bounds ? Math.round(bounds.height * scale) : Math.round(page.height * scale);
      if (D.exportInfo) {
        D.exportInfo.textContent = `Export dimensions: ${fullW} × ${fullH} px (${scale}× scale)`;
      }
    } catch (e) {
      if (D.exportPreviewPlaceholder) {
        D.exportPreviewPlaceholder.textContent = "Preview unavailable";
        D.exportPreviewPlaceholder.hidden = false;
      }
    }
  }

  function syncExportOptionsUI() {
    if (!D.exportFormatSelect) return;
    const format = D.exportFormatSelect.value;
    if (D.exportQualityWrap) D.exportQualityWrap.hidden = format !== "jpg";
    if (D.exportBgWrap) D.exportBgWrap.hidden = format !== "png" && format !== "svg";
    if (D.exportScaleWrap) D.exportScaleWrap.hidden = format === "project" || format === "json";
    if (D.exportScopeWrap) D.exportScopeWrap.hidden = format === "project" || format === "json";
    generateExportPreview();
  }

  function openExportDialog(defaultType = "png") {
    if (!D.exportDialog) return;
    D.exportDialog.hidden = false;
    if (defaultType && D.exportFormatSelect) {
      D.exportFormatSelect.value = defaultType;
    }
    const selCount = D.state.selectedIds.length;
    const selOpt = D.exportScopeSelect ? D.exportScopeSelect.querySelector('option[value="selection"]') : null;
    if (selOpt) selOpt.disabled = selCount === 0;
    if (selCount === 0 && D.exportScopeSelect && D.exportScopeSelect.value === "selection") {
      D.exportScopeSelect.value = "current";
    }
    const cleanName =
      (D.state.boardName || "Drawora-Board").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") ||
      "Drawora-Board";
    if (D.exportFilenameInput) D.exportFilenameInput.value = cleanName;
    syncExportOptionsUI();
    D.trapModalFocus(D.exportDialog);
  }

  function closeExportDialog() {
    if (D.exportDialog) D.exportDialog.hidden = true;
    D.releaseModalFocus();
  }

  async function executeExportDownload() {
    if (!D.exportFormatSelect) return;
    const format = D.exportFormatSelect.value;
    const scope = D.exportScopeSelect.value;
    const scale = Number(D.exportScaleSelect.value) || 2;
    const transparent = D.exportTransparentBg.checked;
    const quality = (Number(D.exportQualityRange.value) || 90) / 100;
    const baseName = (D.exportFilenameInput.value || "Drawora-Export").trim() || "Drawora-Export";

    if (D.exportDownloadBtn) D.exportDownloadBtn.disabled = true;
    if (D.exportInfo) D.exportInfo.textContent = "Generating export...";

    try {
      if (format === "project" || format === "json") {
        const projectData = {
          app: "Drawora",
          version: 1,
          createdAt: D.state.boardCreatedAt || Date.now(),
          exportedAt: Date.now(),
          boardId: D.state.boardId,
          boardName: D.state.boardName,
          pages: typeof D.snapshotPages === "function" ? D.snapshotPages() : D.state.pages,
          currentPageId: D.state.currentPageId,
        };
        const jsonStr = JSON.stringify(projectData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const ext = format === "project" ? "drawora" : "json";
        D.downloadFile(blob, `${baseName}.${ext}`);
        closeExportDialog();
        return;
      }

      if (format === "svg") {
        if (scope === "all" && D.state.pages.length > 1) {
          for (let i = 0; i < D.state.pages.length; i++) {
            const page = D.state.pages[i];
            const svgStr = generateSvgForPage(page, { transparent, scope: "current" });
            const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
            D.downloadFile(blob, `${baseName}_Page_${i + 1}_${page.name.replace(/\s+/g, "_")}.svg`);
          }
        } else {
          const page = typeof D.currentPage === "function" ? D.currentPage() : null;
          let bounds = null;
          let objects = page.id === D.state.currentPageId ? D.state.objects : page.objects || [];
          if (scope === "selection") {
            const sel = D.selectedObjects();
            if (sel.length > 0) {
              objects = sel;
              bounds = D.unionBounds(sel.map((o) => D.objectWorldBounds(o)));
            }
          }
          const svgStr = generateSvgForPage(page, { transparent, scope, bounds, objects });
          const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
          D.downloadFile(blob, `${baseName}.svg`);
        }
        closeExportDialog();
        return;
      }

      if (format === "pdf") {
        const pdfPages = [];
        if (scope === "all" && D.state.pages.length > 1) {
          for (const page of D.state.pages) {
            const pageObjects = page.id === D.state.currentPageId ? D.state.objects : page.objects || [];
            const pCanvas = renderPageToCanvas(page, {
              scale,
              transparent: false,
              scope: "current",
              objects: pageObjects,
            });
            pdfPages.push({
              dataUrl: pCanvas.toDataURL("image/jpeg", quality),
              width: page.width,
              height: page.height,
              pixelWidth: pCanvas.width,
              pixelHeight: pCanvas.height,
            });
          }
        } else {
          const page = typeof D.currentPage === "function" ? D.currentPage() : null;
          let bounds = null;
          let objects = page.id === D.state.currentPageId ? D.state.objects : page.objects || [];
          let targetW = page.width;
          let targetH = page.height;
          if (scope === "selection") {
            const sel = D.selectedObjects();
            if (sel.length > 0) {
              objects = sel;
              bounds = D.unionBounds(sel.map((o) => D.objectWorldBounds(o)));
              targetW = Math.round(Math.max(bounds.width, 20));
              targetH = Math.round(Math.max(bounds.height, 20));
            }
          }
          const pCanvas = renderPageToCanvas(page, {
            scale,
            transparent: false,
            scope,
            bounds,
            objects,
          });
          pdfPages.push({
            dataUrl: pCanvas.toDataURL("image/jpeg", quality),
            width: targetW,
            height: targetH,
            pixelWidth: pCanvas.width,
            pixelHeight: pCanvas.height,
          });
        }
        const pdfBlob = buildMinimalPdf(pdfPages);
        D.downloadFile(pdfBlob, `${baseName}.pdf`);
        D.announceA11y("Export downloaded successfully");
        closeExportDialog();
        return;
      }

      if (format === "png" || format === "jpg") {
        const mime = format === "png" ? "image/png" : "image/jpeg";
        const ext = format === "png" ? "png" : "jpg";

        if (scope === "all" && D.state.pages.length > 1) {
          for (let i = 0; i < D.state.pages.length; i++) {
            const page = D.state.pages[i];
            const pCanvas = renderPageToCanvas(page, {
              scale,
              transparent: transparent && format === "png",
              scope: "current",
            });
            const dataUrl = pCanvas.toDataURL(mime, quality);
            D.downloadFile(dataUrl, `${baseName}_Page_${i + 1}_${page.name.replace(/\s+/g, "_")}.${ext}`);
          }
        } else {
          const page = typeof D.currentPage === "function" ? D.currentPage() : null;
          let bounds = null;
          let objects = page.id === D.state.currentPageId ? D.state.objects : page.objects || [];
          if (scope === "selection") {
            const sel = D.selectedObjects();
            if (sel.length > 0) {
              objects = sel;
              bounds = D.unionBounds(sel.map((o) => D.objectWorldBounds(o)));
            }
          }
          const pCanvas = renderPageToCanvas(page, {
            scale,
            transparent: transparent && format === "png",
            scope,
            bounds,
            objects,
          });
          const dataUrl = pCanvas.toDataURL(mime, quality);
          D.downloadFile(dataUrl, `${baseName}.${ext}`);
        }
        D.announceA11y("Export downloaded successfully");
        closeExportDialog();
      }
    } catch (err) {
      console.error("Drawora: Export failed", err);
      if (D.exportInfo) D.exportInfo.textContent = "Export failed. Please try again.";
      D.announceA11y("Export failed. Please try again.");
    } finally {
      if (D.exportDownloadBtn) D.exportDownloadBtn.disabled = false;
    }
  }

  const exports = {
    renderPageToCanvas,
    drawObjectToContext,
    drawSingleObjectToContext,
    drawStrokeToContext,
    drawStickyToContext,
    drawTextBoxToContext,
    drawPictureToContext,
    drawLinkToContext,
    drawTableToContext,
    drawFileCardToContext,
    drawShapeToContext,
    drawWrappedTextToContext,
    generateSvgForPage,
    objectToSvg,
    buildMinimalPdf,
    drawThumbObject,
    generateBoardThumbnail,
    generateExportPreview,
    syncExportOptionsUI,
    openExportDialog,
    closeExportDialog,
    executeExportDownload,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
