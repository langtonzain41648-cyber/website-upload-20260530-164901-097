function getQuery() {
  var params = new URLSearchParams(window.location.search);
  return (params.get("q") || "").trim();
}

function uniq(list) {
  return Array.from(new Set(list.filter(Boolean))).sort(function(a, b) {
    return b.localeCompare(a, "zh-Hans-CN");
  });
}

function fill(id, values) {
  var select = document.getElementById(id);
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

function card(movie) {
  var tag = movie.tags && movie.tags.length ? movie.tags[0] : movie.type;
  return [
    '<article class="movie-card">',
    '<a class="poster-link" href="' + movie.file + '">',
    '<span class="poster-wrap">',
    '<img loading="lazy" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
    '<span class="poster-gradient"></span>',
    '<span class="quality-badge">高清</span>',
    '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
    '</span>',
    '<span class="card-body">',
    '<strong class="card-title">' + escapeHtml(movie.title) + '</strong>',
    '<span class="card-line">' + escapeHtml(movie.oneLine || movie.summary || "") + '</span>',
    '<span class="card-meta"><em>' + escapeHtml(tag) + '</em><b>' + escapeHtml(movie.region) + '</b></span>',
    '</span>',
    '</a>',
    '</article>'
  ].join("");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, function(char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char];
  });
}

function initSearchPage() {
  var input = document.getElementById("searchInput");
  var region = document.getElementById("regionFilter");
  var type = document.getElementById("typeFilter");
  var year = document.getElementById("yearFilter");
  var results = document.getElementById("searchResults");
  var movies = window.MOVIES || [];
  if (!input || !results) {
    return;
  }

  fill("regionFilter", uniq(movies.map(function(movie) { return movie.region; })));
  fill("typeFilter", uniq(movies.map(function(movie) { return movie.type; })));
  fill("yearFilter", uniq(movies.map(function(movie) { return movie.year; })));

  input.value = getQuery();

  function render() {
    var q = input.value.trim().toLowerCase();
    var r = region.value;
    var t = type.value;
    var y = year.value;
    var list = movies.filter(function(movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine, movie.summary].join(" ").toLowerCase();
      return (!q || haystack.indexOf(q) !== -1) &&
        (!r || movie.region === r) &&
        (!t || movie.type === t) &&
        (!y || movie.year === y);
    });
    results.innerHTML = list.slice(0, 240).map(card).join("");
  }

  [input, region, type, year].forEach(function(element) {
    element.addEventListener("input", render);
    element.addEventListener("change", render);
  });

  render();
}

ready(initSearchPage);
