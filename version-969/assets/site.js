(function () {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function setHeaderState() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            toggle.classList.toggle("is-open");
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var next = carousel.querySelector("[data-hero-next]");
        var prev = carousel.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        carousel.addEventListener("mouseenter", stopTimer);
        carousel.addEventListener("mouseleave", startTimer);
        showSlide(0);
        startTimer();
    });

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function applyFilters(scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var input = scope.querySelector("[data-filter-input]");
        var year = scope.querySelector("[data-filter-year]");
        var type = scope.querySelector("[data-filter-type]");
        var empty = scope.querySelector("[data-empty-state]");
        var query = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var cardYear = normalize(card.getAttribute("data-year"));
            var cardType = normalize(card.getAttribute("data-type"));
            var matched = (!query || text.indexOf(query) !== -1) &&
                (!yearValue || cardYear.indexOf(yearValue) !== -1) &&
                (!typeValue || cardType === typeValue);
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
        var scope = input.closest("main") || document;
        input.addEventListener("input", function () {
            applyFilters(scope);
        });
    });

    document.querySelectorAll("[data-filter-year], [data-filter-type]").forEach(function (select) {
        var scope = select.closest("main") || document;
        select.addEventListener("change", function () {
            applyFilters(scope);
        });
    });

    var searchParams = new URLSearchParams(window.location.search);
    var query = searchParams.get("q");
    var searchInput = document.querySelector("[data-filter-input]");
    if (query && searchInput) {
        searchInput.value = query;
        applyFilters(searchInput.closest("main") || document);
    }
}());

function initMoviePlayer(source, poster) {
    var video = document.getElementById("movie-video");
    var cover = document.getElementById("player-cover");

    if (!video || !source) {
        return;
    }

    if (poster) {
        video.setAttribute("poster", poster);
    }

    function loadStream() {
        if (video.getAttribute("data-ready") === source) {
            return Promise.resolve();
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.setAttribute("data-ready", source);
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (video.hlsPlayer) {
                video.hlsPlayer.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            video.hlsPlayer = hls;
            return new Promise(function (resolve) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.setAttribute("data-ready", source);
                    resolve();
                });
                hls.on(window.Hls.Events.ERROR, function () {
                    resolve();
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            });
        }

        video.src = source;
        video.setAttribute("data-ready", source);
        return Promise.resolve();
    }

    function startPlay() {
        if (cover) {
            cover.classList.add("is-hidden");
        }
        loadStream().then(function () {
            var playAction = video.play();
            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function () {});
            }
        });
    }

    if (cover) {
        cover.addEventListener("click", startPlay);
    }

    video.addEventListener("click", function () {
        if (!video.getAttribute("data-ready")) {
            startPlay();
        }
    });
}
