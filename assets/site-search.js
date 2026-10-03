var SITE_SEARCH_INDEX = [
  { title: "Home", url: "index.html", keywords: "home main homepage" },
  { title: "Mass schedule", url: "index.html#mass-schedule", keywords: "mass schedule times sunday saturday daily first friday" },
  { title: "Contact & office hours", url: "index.html#contact", keywords: "contact phone email address office hours telephone location" },
  { title: "Submit Feedback", url: "index.html#feedback", keywords: "feedback comment concern suggestion message complaint" },
  { title: "Request a Certificate", url: "request-certificate.html", keywords: "certificate baptismal confirmation marriage burial death request document" },
  { title: "Book a Service", url: "book-service.html", keywords: "book booking service wedding baptism funeral mass intention blessing confession" },
  { title: "Track a Request", url: "track-request.html", keywords: "track status reference number progress check" },
  { title: "Parish Office login", url: "parish-office.html", keywords: "login staff admin office dashboard sign in" }
];

(function () {
  var input = document.getElementById('siteSearchInput');
  var results = document.getElementById('siteSearchResults');
  if (!input || !results) return;

  function renderResults(query) {
    var q = query.trim().toLowerCase();
    if (!q) { results.classList.remove('show'); results.innerHTML = ''; return; }
    var matches = SITE_SEARCH_INDEX.filter(function (item) {
      return item.title.toLowerCase().indexOf(q) !== -1 || item.keywords.indexOf(q) !== -1;
    });
    if (matches.length === 0) {
      results.innerHTML = '<div class="ssr-empty">No matches for "' + query + '"</div>';
    } else {
      results.innerHTML = matches.map(function (item) {
        return '<a href="' + item.url + '">' + item.title + '</a>';
      }).join('');
    }
    results.classList.add('show');
  }

  input.addEventListener('input', function () { renderResults(input.value); });
  input.addEventListener('focus', function () { if (input.value.trim()) renderResults(input.value); });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.site-search')) {
      results.classList.remove('show');
    }
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var firstLink = results.querySelector('a');
      if (firstLink) window.location.href = firstLink.getAttribute('href');
    } else if (e.key === 'Escape') {
      results.classList.remove('show');
      input.blur();
    }
  });
})();