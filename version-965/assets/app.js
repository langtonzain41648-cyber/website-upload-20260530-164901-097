(function () {
  function queryAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = queryAll("[data-hero-slide]", slider);
    var dots = queryAll("[data-hero-dot]", slider);
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var cards = queryAll("[data-card]");
    var search = document.querySelector("[data-live-search]");
    var typeSelect = document.querySelector("[data-type-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var regionSelect = document.querySelector("[data-region-filter]");
    var empty = document.querySelector("[data-empty]");

    if (!cards.length || (!search && !typeSelect && !yearSelect && !regionSelect)) {
      return;
    }

    function valueOf(element) {
      return element ? element.value.trim() : "";
    }

    function apply() {
      var keyword = valueOf(search).toLowerCase();
      var type = valueOf(typeSelect);
      var year = valueOf(yearSelect);
      var region = valueOf(regionSelect);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          matched = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }
        if (region && card.getAttribute("data-region") !== region) {
          matched = false;
        }

        card.classList.toggle("hidden-card", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [search, typeSelect, yearSelect, regionSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });

    apply();
  }

  window.attachMoviePlayer = function (sourceUrl) {
    var video = document.querySelector("[data-video-player]");
    var mask = document.querySelector("[data-play-mask]");
    var loaded = false;

    if (!video || !sourceUrl) {
      return;
    }

    function bind() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      bind();
      video.controls = true;
      if (mask) {
        mask.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }

    if (mask) {
      mask.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
