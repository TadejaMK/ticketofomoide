(function () {
  "use strict";

  var STORAGE_KEY = "memoryTicket.collection";
  var THEME_KEY = "memoryTicket.theme";

  var els = {
    dropZone: document.getElementById("dropZone"),
    photoInput: document.getElementById("photoInput"),
    dropText: document.getElementById("dropText"),
    titleInput: document.getElementById("titleInput"),
    placeInput: document.getElementById("placeInput"),
    dateInput: document.getElementById("dateInput"),
    noteInput: document.getElementById("noteInput"),
    seatInput: document.getElementById("seatInput"),
    saveBtn: document.getElementById("saveBtn"),
    downloadBtn: document.getElementById("downloadBtn"),
    statusMsg: document.getElementById("statusMsg"),
    ticket: document.getElementById("ticket"),
    ticketPhoto: document.getElementById("ticketPhoto"),
    ticketTitle: document.getElementById("ticketTitle"),
    ticketPlace: document.getElementById("ticketPlace"),
    ticketDate: document.getElementById("ticketDate"),
    ticketNote: document.getElementById("ticketNote"),
    ticketSeat: document.getElementById("ticketSeat"),
    ticketSerial: document.getElementById("ticketSerial"),
    collectionGrid: document.getElementById("collectionGrid"),
    collectionEmpty: document.getElementById("collectionEmpty"),
    themeToggle: document.getElementById("themeToggle"),
    themeLabel: document.getElementById("themeLabel"),
    modalOverlay: document.getElementById("modalOverlay"),
    modalClose: document.getElementById("modalClose"),
    modalTicket: document.getElementById("modalTicket"),
    modalPhoto: document.getElementById("modalPhoto"),
    modalTitle: document.getElementById("modalTitle"),
    modalPlace: document.getElementById("modalPlace"),
    modalDate: document.getElementById("modalDate"),
    modalNote: document.getElementById("modalNote"),
    modalSeat: document.getElementById("modalSeat"),
    modalSerial: document.getElementById("modalSerial"),
    modalLoadBtn: document.getElementById("modalLoadBtn"),
    modalDownloadBtn: document.getElementById("modalDownloadBtn"),
    modalDeleteBtn: document.getElementById("modalDeleteBtn")
  };

  var currentPhotoData = null;
  var currentSerial = makeSerial();
  var activeModalItem = null;

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (e) {
    }
  }

  function initTheme() {
    var savedTheme = getStoredTheme() || "light";
    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      els.themeLabel.textContent = "Dark";
    } else {
      document.documentElement.removeAttribute("data-theme");
      els.themeLabel.textContent = "Light";
    }
  }

  els.themeToggle.addEventListener("click", function () {
    var isDark = document.documentElement.hasAttribute("data-theme");
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      setStoredTheme("light");
      els.themeLabel.textContent = "Light";
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      setStoredTheme("dark");
      els.themeLabel.textContent = "Dark";
    }
  });

  function makeSerial() {
    var n = Math.floor(Math.random() * 900000) + 100000;
    return "TCK-" + n;
  }

  function formatDate(value) {
    if (!value) return "26.09.2026";
    var parts = value.split("-");
    if (parts.length !== 3) return value;
    return parts[2] + "." + parts[1] + "." + parts[0];
  }

  function readFileAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function shrinkImage(dataUrl, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        var w = Math.round(img.width * scale);
        var h = Math.round(img.height * scale);
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  function setStatus(msg, good) {
    els.statusMsg.textContent = msg;
    els.statusMsg.classList.toggle("is-good", !!good);
  }

  function loadCollection() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCollection(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  function updatePreview() {
    var title = (els.titleInput.value || "UNTITLED MEMORY").toUpperCase();
    var place = (els.placeInput.value || "SOMEWHERE").toUpperCase();
    var date = formatDate(els.dateInput.value);
    var note = els.noteInput.value || "Add a note to remember it by.";
    var seat = (els.seatInput.value || "GA").toUpperCase();

    els.ticketTitle.textContent = title;
    els.ticketPlace.textContent = place;
    els.ticketDate.textContent = date;
    els.ticketNote.textContent = note;
    els.ticketSeat.textContent = seat;
    els.ticketSerial.textContent = currentSerial;

    if (currentPhotoData) {
      els.ticketPhoto.style.backgroundImage = "url(" + currentPhotoData + ")";
      els.ticketPhoto.classList.add("has-image");
    } else {
      els.ticketPhoto.style.backgroundImage = "none";
      els.ticketPhoto.classList.remove("has-image");
    }
  }

  [els.titleInput, els.placeInput, els.dateInput, els.noteInput, els.seatInput]
    .forEach(function (el) { el.addEventListener("input", updatePreview); });

  function handleFile(file) {
    if (!file || file.type.indexOf("image/") !== 0) {
      setStatus("Please choose an image file.");
      return;
    }
    setStatus("Preparing photo...");
    readFileAsDataURL(file)
      .then(function (dataUrl) { return shrinkImage(dataUrl, 900, 0.82); })
      .then(function (smallDataUrl) {
        currentPhotoData = smallDataUrl;
        els.dropText.textContent = file.name;
        updatePreview();
        setStatus("");
      })
      .catch(function () {
        setStatus("Couldn't read that image. Try a different file.");
      });
  }

  els.photoInput.addEventListener("change", function (e) {
    handleFile(e.target.files[0]);
  });

  ["dragover", "dragenter"].forEach(function (evt) {
    els.dropZone.addEventListener(evt, function (e) {
      e.preventDefault();
      els.dropZone.classList.add("is-drag");
    });
  });
  ["dragleave", "drop"].forEach(function (evt) {
    els.dropZone.addEventListener(evt, function (e) {
      e.preventDefault();
      els.dropZone.classList.remove("is-drag");
    });
  });
  els.dropZone.addEventListener("drop", function (e) {
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  });

  function renderCollection() {
    var list = loadCollection();
    els.collectionGrid.innerHTML = "";

    if (!list.length) {
      var empty = document.createElement("p");
      empty.className = "collection__empty";
      empty.id = "collectionEmpty";
      empty.textContent = "Saved stubs will appear here in your browser vault.";
      els.collectionGrid.appendChild(empty);
      return;
    }

    list.slice().reverse().forEach(function (item, index) {
      var card = document.createElement("div");
      card.className = "mini-ticket";
      card.style.animationDelay = (index * 0.05) + "s";
      card.addEventListener("click", function () {
        openModal(item);
      });

      var photo = document.createElement("div");
      photo.className = "mini-ticket__photo";
      if (item.photo) {
        // Keep the image URL out of CSS background-image until the card is near
        // the viewport. This prevents every saved ticket image from loading at once.
        photo.dataset.bg = item.photo;
        photo.setAttribute("aria-label", "Saved memory photo");
      }

      var body = document.createElement("div");
      body.className = "mini-ticket__body";

      var title = document.createElement("div");
      title.className = "mini-ticket__title";
      title.textContent = item.title;

      var meta = document.createElement("div");
      meta.className = "mini-ticket__meta";
      meta.textContent = item.place + " · " + item.date;

      var row = document.createElement("div");
      row.className = "mini-ticket__row";

      var loadBtn = document.createElement("button");
      loadBtn.className = "mini-btn";
      loadBtn.type = "button";
      loadBtn.textContent = "Load";
      loadBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        loadIntoForm(item);
      });

      var delBtn = document.createElement("button");
      delBtn.className = "mini-btn mini-btn--danger";
      delBtn.type = "button";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        deleteFromCollection(item.id);
      });

      row.appendChild(loadBtn);
      row.appendChild(delBtn);
      body.appendChild(title);
      body.appendChild(meta);
      body.appendChild(row);
      card.appendChild(photo);
      card.appendChild(body);
      els.collectionGrid.appendChild(card);
    });
    var lazyPhotos = els.collectionGrid.querySelectorAll(".mini-ticket__photo[data-bg]");

    if ("IntersectionObserver" in window) {
      var photoObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var target = entry.target;
          if (target.dataset.bg) {
            target.style.backgroundImage = "url(" + target.dataset.bg + ")";
            target.classList.add("is-loaded");
            delete target.dataset.bg;
          }

          observer.unobserve(target);
        });
      }, {
        rootMargin: "250px 0px"
      });

      lazyPhotos.forEach(function (photo) {
        photoObserver.observe(photo);
      });
    } else {
      lazyPhotos.forEach(function (photo) {
        photo.style.backgroundImage = "url(" + photo.dataset.bg + ")";
        photo.classList.add("is-loaded");
        delete photo.dataset.bg;
      });
    }
  }

  function openModal(item) {
    activeModalItem = item;
    els.modalTitle.textContent = item.title;
    els.modalPlace.textContent = item.place;
    els.modalDate.textContent = item.date;
    els.modalNote.textContent = item.note;
    els.modalSeat.textContent = item.seat;
    els.modalSerial.textContent = item.serial;

    if (item.photo) {
      els.modalPhoto.style.backgroundImage = "url(" + item.photo + ")";
      els.modalPhoto.classList.add("has-image");
    } else {
      els.modalPhoto.style.backgroundImage = "none";
      els.modalPhoto.classList.remove("has-image");
    }

    els.modalOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    els.modalOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
    activeModalItem = null;
  }

  els.modalClose.addEventListener("click", closeModal);
  els.modalOverlay.addEventListener("click", function (e) {
    if (e.target === els.modalOverlay) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  els.modalLoadBtn.addEventListener("click", function () {
    if (activeModalItem) {
      loadIntoForm(activeModalItem);
      closeModal();
    }
  });

  els.modalDeleteBtn.addEventListener("click", function () {
    if (activeModalItem) {
      deleteFromCollection(activeModalItem.id);
      closeModal();
    }
  });

  els.modalDownloadBtn.addEventListener("click", function () {
    if (typeof html2canvas === "undefined" || !activeModalItem) return;
    els.modalDownloadBtn.disabled = true;
    setStatus("Rendering ticket...");

    var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    fontsReady.then(function () {
      return html2canvas(els.modalTicket, { backgroundColor: null, scale: 3, useCORS: true });
    }).then(function (canvas) {
      var safeName = (activeModalItem.titleRaw || activeModalItem.title || "memory-ticket").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      canvas.toBlob(function (blob) {
        if (!blob) {
          els.modalDownloadBtn.disabled = false;
          return;
        }
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.download = safeName + ".png";
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        els.modalDownloadBtn.disabled = false;
      }, "image/png");
    }).catch(function () {
      els.modalDownloadBtn.disabled = false;
    });
  });

  function loadIntoForm(item) {
    els.titleInput.value = item.titleRaw || item.title;
    els.placeInput.value = item.placeRaw || item.place;
    els.dateInput.value = item.rawDate || "";
    els.noteInput.value = item.note === "Add a note to remember it by." ? "" : item.note;
    els.seatInput.value = item.seat;
    currentPhotoData = item.photo;
    currentSerial = item.serial;
    els.dropText.textContent = item.photo ? "Photo loaded" : "Click or drop an image";
    updatePreview();
    window.scrollTo({ top: document.getElementById("make").offsetTop - 20, behavior: "smooth" });
    setStatus("Loaded into the editor.", true);
  }

  function deleteFromCollection(id) {
    var list = loadCollection().filter(function (i) { return i.id !== id; });
    saveCollection(list);
    renderCollection();
    setStatus("Ticket deleted.", true);
  }

  els.saveBtn.addEventListener("click", function () {
    updatePreview();
    var item = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      title: els.ticketTitle.textContent,
      titleRaw: els.titleInput.value,
      place: els.ticketPlace.textContent,
      placeRaw: els.placeInput.value,
      date: els.ticketDate.textContent,
      rawDate: els.dateInput.value,
      note: els.ticketNote.textContent,
      seat: els.ticketSeat.textContent,
      serial: currentSerial,
      photo: currentPhotoData,
    };
    var list = loadCollection();
    list.push(item);
    var ok = saveCollection(list);
    renderCollection();

    els.ticket.classList.add("ticket-saved-pulse");
    setTimeout(function () {
      els.ticket.classList.remove("ticket-saved-pulse");
    }, 400);

    if (ok) {
      setStatus("Saved to your vault collection.", true);
      currentSerial = makeSerial();
      updatePreview();
    } else {
      setStatus("Couldn't save — storage may be full.");
    }
  });

  els.downloadBtn.addEventListener("click", function () {
    if (typeof html2canvas === "undefined") {
      setStatus("Download library failed to load.");
      return;
    }
    els.downloadBtn.disabled = true;
    setStatus("Rendering your ticket...");

    var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

    fontsReady.then(function () {
      return html2canvas(els.ticket, { backgroundColor: null, scale: 3, useCORS: true });
    }).then(function (canvas) {
      var safeName = (els.titleInput.value || "memory-ticket").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      canvas.toBlob(function (blob) {
        if (!blob) {
          els.downloadBtn.disabled = false;
          setStatus("Couldn't generate the PNG.");
          return;
        }
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.download = safeName + ".png";
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        els.downloadBtn.disabled = false;
        setStatus("Downloaded as PNG.", true);
      }, "image/png");
    }).catch(function () {
      els.downloadBtn.disabled = false;
      setStatus("Something went wrong rendering the image.");
    });
  });

  (function init() {
    initTheme();
    var today = new Date();
    els.dateInput.value = today.toISOString().slice(0, 10);
    updatePreview();
    renderCollection();
  })();
})();
