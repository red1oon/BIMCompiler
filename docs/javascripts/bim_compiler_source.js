// Independent GitHub stats fetch for the bim-compiler repo widget.
//
// Not a reuse of mkdocs-material's built-in source-widget fetch: that fetch is a
// module-level singleton (bundle.js `Os`), shared by every element with
// data-md-component="source" — a second such element would just replay the FIRST
// repo's cached stats. This widget deliberately isn't tagged data-md-component, so
// the theme never touches it; this script owns its own fetch, its own cache key
// (sessionStorage "__source_bimcompiler", distinct from the theme's "__source"),
// and builds the same markup shape (ul.md-source__facts > li.md-source__fact--*)
// the theme uses, so the existing theme CSS renders it identically.
(function () {
  function formatCount(n) {
    if (n > 999) {
      var round = (n - 950) % 1000 > 99 ? 1 : 0;
      return ((n + 1e-6) / 1000).toFixed(round) + "k";
    }
    return String(n);
  }

  function renderFacts(repo, stats) {
    var label = repo.querySelector("#bim-compiler-repository");
    if (!label || label.dataset.rendered) return;
    label.dataset.rendered = "1";
    var ul = document.createElement("ul");
    ul.className = "md-source__facts";
    ["stars", "forks"].forEach(function (key) {
      if (typeof stats[key] !== "number") return;
      var li = document.createElement("li");
      li.className = "md-source__fact md-source__fact--" + key;
      li.textContent = formatCount(stats[key]);
      ul.appendChild(li);
    });
    label.appendChild(ul);
    repo.classList.add("md-source__repository--active");
  }

  function fetchStats(owner, name, cacheKey) {
    var cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        return Promise.resolve(JSON.parse(cached));
      } catch (e) {
        /* fall through to a fresh fetch */
      }
    }
    return fetch("https://api.github.com/repos/" + owner + "/" + name)
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        if (!data) return null;
        var stats = { stars: data.stargazers_count, forks: data.forks_count };
        sessionStorage.setItem(cacheKey, JSON.stringify(stats));
        return stats;
      })
      .catch(function () {
        return null;
      });
  }

  function renderTotals(a, b) {
    var el = document.getElementById("repo-totals");
    if (!el || !a || !b) return;
    el.textContent = "Σ " + (a.stars + b.stars) + "/" + (a.forks + b.forks);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var repo = document.getElementById("bim-compiler-source");
    if (!repo) return;

    var compilerStats = fetchStats("red1oon", "BIMCompiler", "__source_bimcompiler");
    var ootbStats = fetchStats("red1oon", "bim-ootb", "__source_bimootb_totals");

    compilerStats.then(function (stats) {
      if (stats) renderFacts(repo, stats);
    });

    Promise.all([compilerStats, ootbStats]).then(function (results) {
      renderTotals(results[0], results[1]);
    });
  });
})();
