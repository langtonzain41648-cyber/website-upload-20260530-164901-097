(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupSiteSearch() {
        var forms = document.querySelectorAll("[data-site-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (value) {
                    window.location.href = "./movies.html?q=" + encodeURIComponent(value);
                } else {
                    window.location.href = "./movies.html";
                }
            });
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(i);
                start();
            });
        });

        show(0);
        start();
    }

    function setupFilters() {
        var grid = document.querySelector("[data-movie-grid]");
        var form = document.querySelector("[data-filter-form]");
        if (!grid || !form) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
        var keyword = form.querySelector("[data-filter-keyword]");
        var region = form.querySelector("[data-filter-region]");
        var type = form.querySelector("[data-filter-type]");
        var genre = form.querySelector("[data-filter-genre]");
        var sort = form.querySelector("[data-filter-sort]");
        var empty = document.querySelector("[data-empty-result]");
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        if (keyword && q) {
            keyword.value = q;
        }

        function textOf(card) {
            return [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.year,
                card.dataset.category
            ].join(" ").toLowerCase();
        }

        function apply() {
            var qv = keyword ? keyword.value.trim().toLowerCase() : "";
            var rv = region ? region.value : "";
            var tv = type ? type.value : "";
            var gv = genre ? genre.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var ok = true;
                if (qv && textOf(card).indexOf(qv) === -1) {
                    ok = false;
                }
                if (rv && card.dataset.region.indexOf(rv) === -1) {
                    ok = false;
                }
                if (tv && card.dataset.type.indexOf(tv) === -1) {
                    ok = false;
                }
                if (gv && card.dataset.genre.indexOf(gv) === -1) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        function sortCards() {
            if (!sort) {
                return;
            }
            var mode = sort.value;
            var ordered = cards.slice().sort(function (a, b) {
                if (mode === "year") {
                    return (b.dataset.year || "").localeCompare(a.dataset.year || "");
                }
                if (mode === "title") {
                    return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                }
                return Number(a.querySelector(".movie-score").textContent) < Number(b.querySelector(".movie-score").textContent) ? 1 : -1;
            });
            ordered.forEach(function (card) {
                grid.appendChild(card);
            });
            cards = ordered;
        }

        form.addEventListener("input", apply);
        form.addEventListener("change", function () {
            sortCards();
            apply();
        });
        form.addEventListener("reset", function () {
            window.setTimeout(function () {
                sortCards();
                apply();
            }, 0);
        });
        sortCards();
        apply();
    }

    window.initializeMoviePlayer = function (source, videoId, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !source) {
            return;
        }
        var hls;
        var attached = false;

        function playVideo() {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
            } else {
                video.src = source;
            }
        }

        function start() {
            attachSource();
            overlay.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            playVideo();
        }

        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupSiteSearch();
        setupHeroSlider();
        setupFilters();
    });
})();
