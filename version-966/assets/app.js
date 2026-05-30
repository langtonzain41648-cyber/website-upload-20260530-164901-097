function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function initMenus() {
  var button = document.querySelector("[data-menu-button]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", function() {
    panel.classList.toggle("is-open");
  });
}

function initSearchForms() {
  document.querySelectorAll("[data-search-form]").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      if (!value) {
        event.preventDefault();
        window.location.href = "search.html";
      }
    });
  });
}

function initHero() {
  var root = document.querySelector("[data-hero]");
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
  var prev = root.querySelector("[data-hero-prev]");
  var next = root.querySelector("[data-hero-next]");
  var index = 0;

  function show(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle("is-active", i === index);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
  }

  if (prev) {
    prev.addEventListener("click", function() {
      show(index - 1);
    });
  }

  if (next) {
    next.addEventListener("click", function() {
      show(index + 1);
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  setInterval(function() {
    show(index + 1);
  }, 5000);
}

function uniqueSorted(cards, key) {
  var values = cards.map(function(card) {
    return card.getAttribute("data-" + key) || "";
  }).filter(Boolean);
  return Array.from(new Set(values)).sort(function(a, b) {
    return b.localeCompare(a, "zh-Hans-CN");
  });
}

function fillSelect(select, values) {
  if (!select) {
    return;
  }
  values.forEach(function(value) {
    var option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function initCardFilters() {
  var panels = document.querySelectorAll("[data-filter-panel]");
  panels.forEach(function(panel) {
    var section = panel.closest("section") || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
    var search = panel.querySelector("[data-card-search]");
    var region = panel.querySelector("[data-card-select='region']");
    var type = panel.querySelector("[data-card-select='type']");
    var year = panel.querySelector("[data-card-select='year']");

    fillSelect(region, uniqueSorted(cards, "region"));
    fillSelect(type, uniqueSorted(cards, "type"));
    fillSelect(year, uniqueSorted(cards, "year"));

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var y = year ? year.value : "";

      cards.forEach(function(card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var visible = (!q || haystack.indexOf(q) !== -1) &&
          (!r || card.getAttribute("data-region") === r) &&
          (!t || card.getAttribute("data-type") === t) &&
          (!y || card.getAttribute("data-year") === y);
        card.classList.toggle("is-filtered-out", !visible);
      });
    }

    [search, region, type, year].forEach(function(input) {
      if (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      }
    });
  });
}

function initMoviePlayer(src) {
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  if (!video || !overlay || !src) {
    return;
  }
  var attached = false;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
  }

  function start() {
    attach();
    overlay.classList.add("is-hidden");
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function() {});
    }
  }

  overlay.addEventListener("click", start);
  video.addEventListener("click", function() {
    if (video.paused) {
      start();
    }
  });
}

ready(function() {
  initMenus();
  initSearchForms();
  initHero();
  initCardFilters();
});
