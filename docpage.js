'use strict';

/* Generate table of contents from h1/h2/h3 tags */
function generate_toc() {
	/* Table of contents */
	var idx = 0, prev = 1, first = true, html = '';
	$('article h1, article h2, article h3').each(function () {
		var e = $(this);
		var text = e.text();
		var id = e.attr('id');
		if (!id) {
			id = 'toc-' + idx++;
		}
		e.attr('data-toc', 'yes');
		var level = e.prop('tagName').substr(1);
		e.attr('id', id);
		if (level > prev) {
			first = true;
		}
		if (!first) {
			html += '</li>';
		}
		first = false;
		for (; level < prev; prev--) {
			html += '</ol>';
			first = true;
		}
		if (level == prev + 1) {
			html += '<ol>';
			prev++;
		} else if (level > prev) {
			throw "Attempted to jump more than one header level";
		}
		html += '<li><a href="#' + id + '" id="li-' + id + '">' + text + '</a>';
	});
	if (!first) {
		html += '</li>';
	}
	for (; prev > 1; prev--) {
		html += '</ol>';
	}
	var toc = $('#toc');
	toc.empty();
	toc.append(html);
}

$(document).ready(function () {
	var current = '';
	/* Generate table of contents from h1/h2/h3 tags */
	generate_toc();
	/* Smooth scroll to sections */
	var scrollToElem = function (target, glow, popping) {
		if (target === '#' || target === '') {
			target = '';
			var top = 0, $target = '', glow = null;
		} else {
			var $target = $(target);
			var glow = glow ? $(glow) : $target;
			var top = $target.offset().top - 40;
		}
		/* Make target glow for a short while to make it easy to spot */
		if (glow) {
			var oldcolor = glow.css('color');
			var oldbgcolor = glow.css('backgroundColor');
			glow.css('color', 'blue');
			glow.css('backgroundColor', 'gold');
			glow.animate({ 'color': oldcolor, 'backgroundColor': oldbgcolor }, 1500);
		}
		/* Smooth scroll animation */
		$('html, body').stop().animate(
			{ scrollTop: top },
			500, 'swing',
			function () {
				if (popping || location.hash === target) {
					if (history.replaceState) {
						history.replaceState(null, null, target);
					}
				} else {
					if (history.pushState) {
						history.pushState(null, null, target);
					} else {
						var id = $target.attr('id');
						$target.attr('id', id + '-nojump');
						location.hash = target;
						$target.attr('id', id);
					}
				}
			});
	}
	/* Set listener for history popstate */
	$(window).on('popstate', function (e) {
		scrollToElem(location.hash, null, true);
	});
	/* Smooth scrolling crossref/toc/title links */
	$('a[href^="#"]').click(function (e) {
		e.preventDefault();
		scrollToElem(this.hash);
	});
	/* Smooth-scroll to TOC when clicking titles */
	$('h1[id], h2[id], h3[id]').click(function (e) {
		e.preventDefault();
		var e = $(this);
		var id = e.attr('id'), target;
		if (e.attr('data-toc')) {
			target = '#li-' + id;
		}
		scrollToElem('#toc', target);
	});
});
