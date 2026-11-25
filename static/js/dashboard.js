(function () {
  "use strict";
  var MAX_MB = parseInt(document.body.dataset.maxMb || "10", 10);
  var MAX_BYTES = MAX_MB * 1024 * 1024;
  var OK_EXT = [".pdf", ".png", ".jpg", ".jpeg"];

  var $ = function (id) { return document.getElementById(id); };
  var form = $("upload-form"), fileInput = $("file"), drop = $("drop");
  var picked = $("picked"), pickedName = $("picked-name"), pickedSize = $("picked-size");
  var btn = $("analyze-btn"), formErr = $("form-err"), results = $("results");
  var sEmpty = $("state-empty"), sLoad = $("state-loading"), sErr = $("state-error"), sRes = $("state-result");

  /* Safe DOM builder: API text is only ever set via textContent. */
  function el(tag, cls, text, kids) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null && text !== "") n.textContent = text;
    (kids || []).forEach(function (k) { if (k) n.appendChild(k); });
    return n;
  }
  function icon(path) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", "20"); s.setAttribute("height", "20");
    s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", "1.8");
    s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true");
    s.setAttribute("class", "icon");
    var p = document.createElementNS(ns, "path"); p.setAttribute("d", path); s.appendChild(p);
    return s;
  }
  var ICON_ALERT = "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01";
  var ICON_FILE = "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6";

  function fmtSize(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB"; }
  function ext(name) { var i = name.lastIndexOf("."); return i < 0 ? "" : name.slice(i).toLowerCase(); }
  function show(which) {
    sEmpty.hidden = which !== "empty"; sLoad.hidden = which !== "load"; sErr.hidden = which !== "err"; sRes.hidden = which !== "res";
    results.setAttribute("aria-busy", which === "load" ? "true" : "false");
  }
  function setError(msg) { formErr.textContent = msg || ""; formErr.hidden = !msg; }

  function reject(msg) { setFile(null); setError(msg); }
  function setFile(f) {
    setError("");
    if (!f) { fileInput.value = ""; picked.hidden = true; btn.disabled = true; return; }
    if (OK_EXT.indexOf(ext(f.name)) < 0) { reject("Unsupported file type. Please choose a PDF, PNG or JPG."); return; }
    if (f.size === 0) { reject("That file is empty."); return; }
    if (f.size > MAX_BYTES) { reject("File is larger than " + MAX_MB + " MB. Please choose a smaller file."); return; }
    pickedName.textContent = f.name; pickedSize.textContent = fmtSize(f.size);
    picked.hidden = false; btn.disabled = false;
  }
  fileInput.addEventListener("change", function () { setFile(fileInput.files[0] || null); });
  $("picked-clear").addEventListener("click", function () { setFile(null); });
  ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("is-over"); }); });
  drop.addEventListener("drop", function (e) {
    var f = e.dataTransfer && e.dataTransfer.files[0];
    if (f) { try { var dt = new DataTransfer(); dt.items.add(f); fileInput.files = dt.files; } catch (_) {} setFile(f); }
  });

  /* Rendering */
  function statusClass(s) {
    s = (s || "").toLowerCase();
    if (/below|above|high|low|abnormal|outside|elevated/.test(s)) return "status status--warn";
    if (/normal|within|in range|typical/.test(s)) return "status status--ok";
    return "status";
  }
  function row(dl, k, v) { if (v) { dl.appendChild(el("dt", "", k)); dl.appendChild(el("dd", "", v)); } }
  function safeExternalLink(source) {
    if (!source || typeof source.url !== "string") return null;
    try {
      var u = new URL(source.url);
      if (u.protocol !== "https:" && u.protocol !== "http:") return null;
      var a = el("a", "source-link", source.name || "View source");
      a.href = u.href; a.target = "_blank"; a.rel = "noopener noreferrer";
      return a;
    } catch (_) { return null; }
  }

  function renderResult(data, name, lang) {
    sRes.textContent = "";
    sRes.classList.toggle("is-demo", !!data.demo);
    if (data.error) {
      sRes.appendChild(el("div", "analysis-warning fade-in", "", [
        icon(ICON_ALERT),
        el("div", "", "", [
          el("strong", "", "AI analysis needs attention"),
          el("span", "", String(data.error) + " The information below may be incomplete; do not rely on it as a medical interpretation.")
        ])
      ]));
    }
    if (data.demo) {
      sRes.appendChild(el("div", "demo-banner fade-in", "", [icon(ICON_ALERT), el("div", "", "", [
        el("strong", "", "Sample output — not a real analysis"),
        el("span", "", "The AI assistant isn't connected yet, so this is placeholder content. It does not describe your uploaded document and must not be used for any medical decision.")
      ])]));
    }
    var typeLabel = data.document_type === "lab_report" ? "Lab report" : data.document_type === "prescription" ? "Prescription" : "Document";
    var chipCls = "chip " + (data.document_type === "lab_report" ? "chip--lab" : data.document_type === "prescription" ? "" : "chip--unk");

    sRes.appendChild(el("div", "glass panel fade-in", "", [
      el("div", "res-head", "", [el("h2", "", name), el("span", chipCls, (data.demo ? "Sample · " : "") + typeLabel + " · " + lang)])
    ]));

    sRes.appendChild(el("section", "glass panel summary fade-in", "", [el("h2", "", "Summary"), el("p", "", data.summary || "No summary was returned. Check the extracted fields against your original document.")]));

    if (data.medicines && data.medicines.length) {
      var cards = el("div", "cards");
      data.medicines.forEach(function (m) {
        var dl = el("dl", "kv");
        row(dl, "Dosage", m.dosage); row(dl, "Frequency", m.frequency); row(dl, "Timing", m.timing); row(dl, "Duration", m.duration);
        var it = el("article", "item", "", [el("h3", "", m.name || "Medicine", m.strength ? [el("small", "", m.strength)] : [])]);
        it.appendChild(dl);
        if (m.purpose) it.appendChild(el("p", "", m.purpose));
        if (Array.isArray(m.important_information) && m.important_information.length) {
          it.appendChild(el("h4", "item-subhead", "Important information"));
          var ul = el("ul"); m.important_information.forEach(function (t) { ul.appendChild(el("li", "", String(t))); }); it.appendChild(ul);
        }
        if (Array.isArray(m.common_information) && m.common_information.length) {
          it.appendChild(el("h4", "item-subhead", "Additional medicine information"));
          var common = el("ul"); m.common_information.forEach(function (t) { common.appendChild(el("li", "", String(t))); }); it.appendChild(common);
        }
        if (m.error) it.appendChild(el("p", "item-muted", String(m.error)));
        var sourceLink = safeExternalLink(m.source);
        if (sourceLink) it.appendChild(el("p", "source-row", "", [sourceLink]));
        cards.appendChild(it);
      });
      sRes.appendChild(el("section", "glass panel fade-in", "", [el("h2", "", "Medicines"), cards]));
    }

    if (data.tests && data.tests.length) {
      var tc = el("div", "cards");
      data.tests.forEach(function (t) {
        var it = el("article", "item", "", [el("h3", "", t.name || "Test")]);
        it.appendChild(el("div", "bigval", "", [el("b", "", t.result || "—"), el("span", "", t.unit || "")]));
        if (t.reference_range) it.appendChild(el("p", "", "Reference range: " + t.reference_range));
        if (t.status) it.appendChild(el("span", statusClass(t.status), t.status));
        if (t.what_it_measures) it.appendChild(el("p", "", t.what_it_measures));
        if (t.explanation) it.appendChild(el("p", "", t.explanation));
        tc.appendChild(it);
      });
      sRes.appendChild(el("section", "glass panel fade-in", "", [el("h2", "", "Test results"), tc]));
    }

    if (data.questions_for_doctor && data.questions_for_doctor.length) {
      var ol = el("ol", "qs");
      data.questions_for_doctor.forEach(function (q) { ol.appendChild(el("li", "", String(q))); });
      sRes.appendChild(el("section", "glass panel fade-in", "", [el("h2", "", "Questions to ask your doctor"), ol]));
    }

    sRes.appendChild(el("div", "note fade-in", "", [icon(ICON_ALERT), el("span", "", data.disclaimer || "")]));
    show("res");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = fileInput.files[0];
    if (!f) { setError("Choose a document first."); return; }
    setError(""); btn.disabled = true; btn.classList.add("is-loading"); show("load");
    var lang = $("language").value;
    var fd = new FormData(); fd.append("file", f); fd.append("language", lang);
    fetch("/api/analyze", { method: "POST", body: fd, credentials: "same-origin" })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; });
      })
      .then(function (r) {
        if (!r) return;
        if (!r.ok) { $("error-msg").textContent = (r.d && r.d.error) || "Something went wrong. Please try again."; show("err"); return; }
        renderResult(r.d, f.name, lang);
        if (window.matchMedia("(max-width:960px)").matches) results.scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch(function () { $("error-msg").textContent = "Can't reach the server. Check your connection and try again."; show("err"); })
      .then(function () { btn.classList.remove("is-loading"); btn.disabled = !fileInput.files[0]; });
  });

  /* Show whether the server has a Gemini key configured; never expose the key. */
  var aiStatus = $("ai-status");
  if (aiStatus) {
    fetch("/api/health", { credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw new Error("health"); return r.json(); })
      .then(function (health) {
        if (health.ai_configured) {
          aiStatus.textContent = "Gemini AI configured";
          aiStatus.classList.add("is-ready");
        } else {
          aiStatus.textContent = "Gemini setup required";
          aiStatus.classList.add("is-missing");
          aiStatus.title = "Add GEMINI_API_KEY to your local .env file to enable AI analysis.";
        }
      })
      .catch(function () {
        aiStatus.textContent = "AI status unavailable";
        aiStatus.classList.add("is-missing");
      });
  }

  /* Top-nav active tab */
  var tabs = document.querySelectorAll(".tabs a");
  tabs.forEach(function (a) { a.addEventListener("click", function () { tabs.forEach(function (t) { t.classList.remove("is-active"); t.removeAttribute("aria-current"); }); a.classList.add("is-active"); a.setAttribute("aria-current", "page"); }); });

  show("empty");
})();
