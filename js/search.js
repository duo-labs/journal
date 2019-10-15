/*************************************************
 * A fork from:
 *  Academic
 *  https://github.com/gcushen/hugo-academic
 *
 *  In-built Fuse based search algorithm.
 **************************************************/

/* ---------------------------------------------------------------------------
* Configuration.
* --------------------------------------------------------------------------- */

// Configure Fuse.
let fuseOptions = {
    shouldSort: true,
    includeMatches: true,
    tokenize: true,
    threshold: 0.0,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 2,
    keys: [
      {name:'title', weight:0.99}, /* 1.0 doesn't work o_O */
      {name:'tags', weight:0.6},
      {name:'summary', weight:0.5},
      {name:'authors.name', weight:0.5},
      {name:'authors.id', weight:0.5},
    ]
  };
  
  // Configure summary.
  let summaryLength = 70;
  
  /* ---------------------------------------------------------------------------
  * Functions.
  * --------------------------------------------------------------------------- */
  
  // Get query from URI.
  function getSearchQuery(name) {
    return decodeURIComponent((location.search.split(name + '=')[1] || '').split('&')[0]).replace(/\+/g, ' ');
  }
  
  // Set query in URI without reloading the page.
  function updateURL(url) {
    if (history.pushState) {
      window.history.pushState({path:url}, '', url);
    }
  }
  
  // Pre-process new search query.
  function initSearch(force, fuse) {
    let query = $("#search-box").val();
  
    // If query deleted, clear results.
    if ( query.length < 1) {
      $('#search-results').empty();
    }
  
    // Check for timer event (enter key not pressed) and query less than minimum length required.
    if (!force && query.length < fuseOptions.minMatchCharLength)
      return;
  
    // Do search.
    $('#search-results').empty();
    search(query, fuse);
    let newURL = window.location.protocol + "//" + window.location.host + window.location.pathname + '?q=' + encodeURIComponent(query) + window.location.hash;
    updateURL(newURL);
  }
  
  // Perform search.
  function search(query, fuse) {
    let results = fuse.search(query);
    // console.log({"results": results});
  
    $('#search-result-count').text(results.length)
    if (results.length > 0) {
      parseResults(query, results);
    }
    $("#search-results-container").show()
  }
  
  // Parse search results.
  function parseResults(query, results) {
    $.each( results, function(key, value) {
      let snippet = value.item.summary;
      let snippetHighlights = [];

      if ( fuseOptions.tokenize ) {
        snippetHighlights.push(query);
      } 

      // Load and render the author template
      let authors = $("<div></div>")
      $.each(value.item.authors, function(i, author) {
        let authorTemplate = $("#search-hit-author-template").html();
        let authorTemplateData = {
          name: author.name,
          relpermalink: author.relpermalink,
          id: author.id,
          avatar: author.avatar,
        }
        authors.append(render(authorTemplate, authorTemplateData))
      })
  
      // Load template.
      var template = $('#search-hit-fuse-template').html();
      // Parse template.
      let templateData = {
        key: key,
        title: value.item.title,
        date: value.item.date,
        date_str: value.item.date_str,
        reading_time: value.item.reading_time,
        relpermalink: value.item.relpermalink,
        snippet: snippet,
        authors: authors.html()
      };
      let output = render(template, templateData);
      $('#search-results').append(output);
  
      // Highlight search terms in result.
      $.each( snippetHighlights, function(hlKey, hlValue){
        $("#summary-"+key).mark(hlValue);
      });
  
    });
  }
  
  function render(template, data) {
    // Replace placeholders with their values.
    let key, find, re;
    for (key in data) {
      find = '\\{\\{\\s*' + key + '\\s*\\}\\}';  // Expect placeholder in the form `{{x}}`.
      re = new RegExp(find, 'g');
      template = template.replace(re, data[key]);
    }
    return template;
  }
  
  /* ---------------------------------------------------------------------------
  * Initialize.
  * --------------------------------------------------------------------------- */
  
  if (typeof Fuse === 'function') {
  // Wait for Fuse to initialize.
    $.getJSON("../index.json", function (search_index) {
      let fuse = new Fuse(search_index, fuseOptions);
  
      // On page load, check for search query in URL.
      if (query = getSearchQuery('q')) {
        $("body").addClass('searching');
        $("#search-box").val(query);
        $("#search-box").focus();
        initSearch(true, fuse);
      }
  
      // On search box key up, process query.
      $('#search-box').keyup(function (e) {
        clearTimeout($.data(this, 'searchTimer')); // Ensure only one timer runs!
        if (e.keyCode == 13) {
          initSearch(true, fuse);
        } else {
          $(this).data('searchTimer', setTimeout(function () {
            initSearch(false, fuse);
          }, 250));
        }
      });
    });
  }