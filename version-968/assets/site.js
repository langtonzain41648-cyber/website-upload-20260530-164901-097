(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initHeader();
    initHeroCarousel();
    initFilters();
    initPlayer();
  });

  function initHeader() {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-nav-toggle]');

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle) {
      toggle.addEventListener('click', function () {
        document.body.classList.toggle('nav-open');
      });
    }
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.js-card-filter'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-type-filter]'));
    var count = document.querySelector('[data-filter-count]');
    var currentType = 'all';

    if (!cards.length) {
      return;
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var term = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-filter-text'));
        var type = normalize(card.getAttribute('data-type'));
        var typeMatched = currentType === 'all' || type === normalize(currentType);
        var termMatched = !term || text.indexOf(term) !== -1;
        var shouldShow = typeMatched && termMatched;

        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部内容';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        currentType = chip.getAttribute('data-type-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    players.forEach(function (shell) {
      var button = shell.querySelector('.player-start');
      var video = shell.querySelector('video');
      var source = shell.getAttribute('data-source');

      if (!button || !video || !source) {
        return;
      }

      button.addEventListener('click', function () {
        shell.classList.add('is-playing');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }

        video.src = source;
        video.play().catch(function () {});
      });
    });
  }
})();
