/* Static movie site interactions */
(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function getRootPrefix() {
        var script = qs('script[src$="assets/js/main.js"]');
        if (!script) {
            return '';
        }
        var src = script.getAttribute('src') || '';
        return src.replace('assets/js/main.js', '');
    }

    function initMobileMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initCoverFallback() {
        qsa('[data-cover-image]').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('is-missing');
            });
        });
    }

    function initHeroSlider() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = qsa('[data-hero-slide]', slider);
        var dots = qsa('[data-hero-dot]', slider);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
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

        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                show(current);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalizeText(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initLocalFilters() {
        var container = qs('[data-filter-container]');
        if (!container) {
            return;
        }
        var textInput = qs('[data-filter-text]', container);
        var selects = qsa('[data-filter-select]', container);
        var reset = qs('[data-filter-reset]', container);
        var cards = qsa('.searchable-card');
        var count = qs('[data-filter-count]');

        function getCardText(card) {
            return [
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags
            ].join(' ').toLowerCase();
        }

        function apply() {
            var query = normalizeText(textInput ? textInput.value : '');
            var active = {};
            selects.forEach(function (select) {
                active[select.dataset.filterSelect] = normalizeText(select.value);
            });
            var visible = 0;
            cards.forEach(function (card) {
                var cardText = getCardText(card);
                var matchesText = !query || cardText.indexOf(query) !== -1;
                var matchesSelects = selects.every(function (select) {
                    var key = select.dataset.filterSelect;
                    var value = active[key];
                    return !value || normalizeText(card.dataset[key]) === value;
                });
                var shouldShow = matchesText && matchesSelects;
                card.classList.toggle('is-hidden-card', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = '已更新筛选结果';
            }
        }

        if (textInput) {
            textInput.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        if (reset) {
            reset.addEventListener('click', function () {
                if (textInput) {
                    textInput.value = '';
                }
                selects.forEach(function (select) {
                    select.value = '';
                });
                apply();
            });
        }
    }

    function initSearchPage() {
        var page = qs('[data-search-page]');
        if (!page) {
            return;
        }
        var input = qs('[data-search-input]', page);
        var button = qs('[data-search-button]', page);
        var results = qs('[data-search-results]');
        var count = qs('[data-search-count]');
        var root = getRootPrefix();
        var movies = [];

        function paramsQuery() {
            var params = new URLSearchParams(window.location.search);
            return params.get('q') || '';
        }

        function card(movie) {
            var tags = movie.tags.slice(0, 4).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="movie-card searchable-card">',
                '    <a class="movie-poster" href="' + root + escapeHtml(movie.href) + '">',
                '        <img src="' + root + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-cover-image>',
                '        <span class="poster-badge">' + escapeHtml(movie.rating) + '</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="movie-meta-row">',
                '            <span>' + escapeHtml(movie.year) + '</span>',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '            <span>' + escapeHtml(movie.type) + '</span>',
                '        </div>',
                '        <h3><a href="' + root + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.one_line) + '</p>',
                '        <div class="tag-list">' + tags + '</div>',
                '    </div>',
                '</article>'
            ].join('\n');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function search() {
            var query = normalizeText(input.value);
            if (!query) {
                results.innerHTML = '';
                count.textContent = '输入关键词后显示结果';
                return;
            }
            var terms = query.split(/\s+/).filter(Boolean);
            var matched = movies.filter(function (movie) {
                var haystack = normalizeText([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    movie.tags.join(' '),
                    movie.one_line
                ].join(' '));
                return terms.every(function (term) {
                    return haystack.indexOf(term) !== -1;
                });
            }).slice(0, 120);
            results.innerHTML = matched.map(card).join('\n');
            count.textContent = '已显示相关结果';
            initCoverFallback();
        }

        fetch(root + 'assets/data/movies.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                movies = data;
                var initial = paramsQuery();
                if (initial) {
                    input.value = initial;
                    search();
                }
            })
            .catch(function () {
                count.textContent = '搜索数据加载失败，请通过分类页浏览影片。';
            });

        button.addEventListener('click', search);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                search();
            }
        });
    }

    function initPlayer() {
        var video = qs('[data-video-src]');
        var button = qs('[data-play-trigger]');
        var status = qs('[data-player-status]');
        if (!video || !button) {
            return;
        }
        var source = video.dataset.videoSrc;
        var started = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function attachSource() {
            if (started) {
                return Promise.resolve();
            }
            started = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放源已加载，正在播放。');
                        resolve();
                    });
                    hls.on(window.Hls.Events.ERROR, function () {
                        setStatus('播放源加载异常，请稍后重试或检查网络。');
                    });
                });
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('已使用浏览器原生 HLS 播放能力。');
                return Promise.resolve();
            }
            video.src = source;
            setStatus('已绑定播放源，当前浏览器可能需要 HLS 支持。');
            return Promise.resolve();
        }

        button.addEventListener('click', function () {
            button.classList.add('is-hidden');
            attachSource().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setStatus('播放已准备，请再次点击播放器开始。');
                    });
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initCoverFallback();
        initHeroSlider();
        initLocalFilters();
        initSearchPage();
        initPlayer();
    });
}());
