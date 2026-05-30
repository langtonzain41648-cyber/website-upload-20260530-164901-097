(function() {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function() {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var heroCards = Array.prototype.slice.call(document.querySelectorAll("[data-hero-card]"));
    var heroBgs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-bg]"));
    var heroDots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var heroIndex = 0;

    function setHero(index) {
        if (!heroCards.length) {
            return;
        }
        heroIndex = (index + heroCards.length) % heroCards.length;
        heroCards.forEach(function(card, i) {
            card.classList.toggle("is-active", i === heroIndex);
        });
        heroBgs.forEach(function(bg, i) {
            bg.classList.toggle("is-active", i === heroIndex);
        });
        heroDots.forEach(function(dot, i) {
            dot.classList.toggle("is-active", i === heroIndex);
        });
    }

    if (heroCards.length) {
        setHero(0);
        heroDots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                setHero(i);
            });
        });
        window.setInterval(function() {
            setHero(heroIndex + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilter(scope) {
        var root = scope || document;
        var input = root.querySelector("[data-search-input]");
        var yearSelect = root.querySelector("[data-year-filter]");
        var typeSelect = root.querySelector("[data-type-filter]");
        var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card, .rank-item"));
        var empty = root.querySelector("[data-empty-state]");
        var q = normalize(input ? input.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var visible = 0;

        cards.forEach(function(card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-tags")
            ].join(" "));
            var ok = true;
            if (q && haystack.indexOf(q) === -1) {
                ok = false;
            }
            if (year && card.getAttribute("data-year") !== year) {
                ok = false;
            }
            if (type && card.getAttribute("data-type") !== type) {
                ok = false;
            }
            card.classList.toggle("hidden-card", !ok);
            if (ok) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    var filterRoots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
    filterRoots.forEach(function(root) {
        var controls = Array.prototype.slice.call(root.querySelectorAll("[data-search-input], [data-year-filter], [data-type-filter]"));
        controls.forEach(function(control) {
            control.addEventListener("input", function() {
                applyFilter(root);
            });
            control.addEventListener("change", function() {
                applyFilter(root);
            });
        });
        applyFilter(root);
    });

    var heroForm = document.querySelector("[data-hero-search]");
    if (heroForm) {
        heroForm.addEventListener("submit", function(event) {
            event.preventDefault();
            var input = heroForm.querySelector("input");
            var q = input ? input.value.trim() : "";
            if (q) {
                window.location.href = "./rank.html?q=" + encodeURIComponent(q);
            }
        });
    }

    var initialQuery = new URLSearchParams(window.location.search).get("q");
    if (initialQuery) {
        var firstSearch = document.querySelector("[data-search-input]");
        if (firstSearch) {
            firstSearch.value = initialQuery;
            var root = firstSearch.closest("[data-filter-root]");
            applyFilter(root || document);
        }
    }

    function prepareVideo(video) {
        if (!video || video.dataset.ready === "1") {
            return;
        }
        var src = video.getAttribute("data-stream");
        if (!src) {
            return;
        }
        video.dataset.ready = "1";
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        } else {
            video.src = src;
        }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-play-target]")).forEach(function(button) {
        button.addEventListener("click", function() {
            var id = button.getAttribute("data-play-target");
            var video = document.getElementById(id);
            var shell = button.closest(".player-shell");
            prepareVideo(video);
            if (video) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === "function") {
                    playPromise.then(function() {
                        if (shell) {
                            shell.classList.add("is-playing");
                        }
                    }).catch(function() {
                        if (shell) {
                            shell.classList.remove("is-playing");
                        }
                    });
                } else if (shell) {
                    shell.classList.add("is-playing");
                }
            }
        });
    });

    Array.prototype.slice.call(document.querySelectorAll(".movie-video")).forEach(function(video) {
        video.addEventListener("click", function() {
            prepareVideo(video);
        });
        video.addEventListener("play", function() {
            var shell = video.closest(".player-shell");
            if (shell) {
                shell.classList.add("is-playing");
            }
        });
        video.addEventListener("pause", function() {
            var shell = video.closest(".player-shell");
            if (shell && video.currentTime === 0) {
                shell.classList.remove("is-playing");
            }
        });
    });
})();
