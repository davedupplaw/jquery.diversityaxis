// From http://www.west-wind.com/Weblog/posts/517320.aspx
$.fn.makeAbsolute = function(rebase) {
    return this.each(function() {
        var el = $(this);
        var pos = el.position();
        el.css({ position: "absolute",
            marginLeft: 0, marginTop: 0,
            top: pos.top, left: pos.left });
        if (rebase)
            el.remove().appendTo("body");
    });
}