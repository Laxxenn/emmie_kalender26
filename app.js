(function () {
  "use strict";

  var DECEMBER = 11; // JS months are 0-based
  var MONTH_NAME = "December";
  var params = new URLSearchParams(location.search);
  var PREVIEW = params.has("preview") || CONFIG.unlockAll === true;
  var YEAR = CONFIG.year || new Date().getFullYear();
  var STORE_KEY = "xmas-calendar-opened-" + YEAR;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var grid = document.getElementById("grid");
  var panel = document.getElementById("panel");
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  document.title = CONFIG.title;
  document.getElementById("title").textContent = CONFIG.title;
  document.getElementById("subtitle").textContent = CONFIG.subtitle || "";

  /* Opened doors are remembered in this browser only. */
  function loadOpened() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveOpened(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }
  var opened = loadOpened();

  function isUnlocked(dayNumber) {
    if (PREVIEW) return true;
    return new Date() >= new Date(YEAR, DECEMBER, dayNumber, 0, 0, 0);
  }

  /* Stable shuffle so the layout is the same on every visit. */
  function seededShuffle(items, seed) {
    var a = items.slice();
    var s = seed >>> 0;
    function rand() {
      s += 0x6d2b79f5;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  function setStatus() {
    var el = document.getElementById("status");
    var total = CONFIG.days.length;
    if (PREVIEW) {
      el.textContent = "Preview: every door is unlocked. Remove ?preview from the address to see the real dates.";
      return;
    }
    var openCount = CONFIG.days.filter(function (d) { return isUnlocked(d.day); }).length;
    if (openCount === 0) {
      el.textContent = "The first door opens on " + MONTH_NAME + " 1.";
    } else if (openCount >= total) {
      el.textContent = "All " + total + " doors are open.";
    } else {
      el.textContent = openCount + " of " + total + " doors are open. The next one opens on " +
        MONTH_NAME + " " + (openCount + 1) + ".";
    }
  }

  function buildDoor(day) {
    var li = document.createElement("li");
    li.className = "slot";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "door";
    btn.dataset.day = day.day;

    var inside = document.createElement("span");
    inside.className = "inside";
    var leaf = document.createElement("span");
    leaf.className = "leaf";
    var num = document.createElement("span");
    num.className = "num";
    num.textContent = day.day;
    leaf.appendChild(num);
    btn.appendChild(inside);
    btn.appendChild(leaf);

    var unlocked = isUnlocked(day.day);
    if (!unlocked) {
      btn.classList.add("is-locked");
      btn.setAttribute("aria-label", "Door " + day.day + ", locked until " + MONTH_NAME + " " + day.day);
    } else {
      btn.classList.add(opened.indexOf(day.day) !== -1 ? "is-open" : "is-ready");
      btn.setAttribute("aria-label", "Door " + day.day);
    }

    btn.addEventListener("click", function () { onDoorClick(day, btn); });
    li.appendChild(btn);
    return li;
  }

  function onDoorClick(day, btn) {
    if (!isUnlocked(day.day)) {
      toast("Door " + day.day + " opens on " + MONTH_NAME + " " + day.day + ".");
      return;
    }
    if (opened.indexOf(day.day) === -1) {
      opened.push(day.day);
      saveOpened(opened);
    }
    btn.classList.remove("is-ready");
    btn.classList.add("is-open");
    setTimeout(function () { showPanel(day); }, reduceMotion ? 0 : 450);
  }

  function resolveUrl(link) {
    try { return new URL(link, location.href).href; } catch (e) { return link; }
  }

  function makeQrSvg(text) {
    var qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 16, scalable: true });
  }

  function showPanel(day) {
    document.getElementById("panel-date").textContent = MONTH_NAME + " " + day.day;
    document.getElementById("panel-title").textContent = day.title || "Door " + day.day;
    document.getElementById("panel-message").textContent = day.message || "";

    var figure = document.getElementById("panel-figure");
    var img = document.getElementById("panel-image");
    if (day.image) {
      img.onerror = function () { figure.hidden = true; };
      img.src = day.image;
      img.alt = day.imageAlt || "";
      figure.hidden = false;
    } else {
      figure.hidden = true;
      img.removeAttribute("src");
    }

    var qrBox = document.getElementById("panel-qr");
    var qrArt = document.getElementById("panel-qr-art");
    var linkEl = document.getElementById("panel-link");
    var emptyEl = document.getElementById("panel-empty");
    qrArt.innerHTML = "";

    var hasQr = false;
    if (day.qr) {
      var qrImg = document.createElement("img");
      qrImg.alt = "QR code for door " + day.day;
      qrImg.src = day.qr;
      qrArt.appendChild(qrImg);
      hasQr = true;
    } else if (day.link) {
      try {
        qrArt.innerHTML = makeQrSvg(resolveUrl(day.link));
        hasQr = true;
      } catch (e) {
        hasQr = false; // link too long for a QR code
      }
    }

    if (day.link) {
      linkEl.href = resolveUrl(day.link);
      linkEl.hidden = false;
    } else {
      linkEl.hidden = true;
    }

    qrBox.hidden = !(hasQr || day.link);
    qrArt.hidden = !hasQr;
    emptyEl.hidden = !!(day.message || day.image || hasQr || day.link);

    if (typeof panel.showModal === "function") panel.showModal();
    else panel.setAttribute("open", "");
  }

  document.getElementById("panel-close").addEventListener("click", function () { panel.close(); });
  panel.addEventListener("click", function (e) {
    if (e.target === panel) panel.close(); // click on the backdrop
  });

  var days = CONFIG.days.slice().sort(function (a, b) { return a.day - b.day; });
  if (CONFIG.shuffle) days = seededShuffle(days, 2026);
  days.forEach(function (d) { grid.appendChild(buildDoor(d)); });
  setStatus();
})();
