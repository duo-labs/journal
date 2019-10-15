
(function ($, undefined) {
    "use strict";

    var $document = $(document);

    $document.ready(function () {

        var $postContent = $(".post-content");
        $postContent.fitVids();

        $(".menu-button[href='#'], .nav-cover, .nav-close").on("click", function (e) {
            e.preventDefault();
            $("body").toggleClass("nav-opened nav-closed");
        });

    });

    $("code.language-ipynb-output").parent().css('border', '#6bbf4e 1px solid');

    // Initialize Mermaid
    mermaid.initialize({
        startOnLoad: true
    });

    // R Markdown results in HTML being generated usually including a table of contents.
    // To keep things consistent, we will move the R Markdown TOC into the normal TableOfContents
    // placeholder.
    $("#TOC").attr("id", "TableOfContents").prependTo(".content")

    // Activating Table of Contents entries on scroll.
    // Code inspired by https://codepen.io/joxmar/pen/NqqMEg
    // Cache selectors
    var lastId,
        topMenu = $("#TableOfContents"),
        topMenuHeight = topMenu.outerHeight() + 1,
        // All list items
        menuItems = topMenu.find("a"),
        // Anchors corresponding to menu items
        scrollItems = menuItems.map(function () {
            var item = $($(this).attr("href"));
            if (item.length) { return item; }
        })

    // Bind to scroll
    $(window).scroll(function () {
        // Get container scroll position
        var fromTop = $(this).scrollTop() + topMenuHeight;

        // Get id of current scroll item
        var cur = scrollItems.map(function () {
            if ($(this).offset().top < fromTop)
                return this;
        });
        // Get the id of the current element
        cur = cur[cur.length - 1];
        var id = cur && cur.length ? cur[0].id : "";

        if (lastId !== id) {
            lastId = id;
            // Set/remove active class
            menuItems
                .parent().removeClass("active")
                .end().filter("[href=\\#" + id + "]").parent().addClass("active");
        }
    });


    // Next, can iterate through the table of contents and flatten the list items. This involves
    // iterating through each <li> looking to see if there are any "a" elements. If there
    // aren't, then we'll collapse any underlying <ul> -> <li> elements up to the parent <ul>.
    $("#TableOfContents").find("li").each(function() {
        var links = $(this).children("a")
        if (links.length) { return }
        // If this is empty, then we should take any child <ul> elements and 
        // collapse them up a layer
        $(this).children("ul").children("li").prependTo($(this).parent("ul"))
        $(this).remove()
    })

    // Setup the hoverable heading anchor links (need to do this through JS since Hugo doesn't)
    // let us customize the header HTML
    $(".post-content :header").each(function() {
        var elem = $("<a>", {"class": "icon-anchor anchor-link", "href": "#" + this.id})
        elem.prependTo($(this))
    })
    $(".post-content :header").hover(
        function() { $(this).find(".anchor-link").show() },
        function() { $(this).find(".anchor-link").hide() }
    )
})(jQuery);