/*
	Stellar by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$main = $('#main');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Nav.
		var $nav = $('#nav');

		if ($nav.length > 0) {

			// Shrink effect.
				$main
					.scrollex({
						mode: 'top',
						enter: function() {
							$nav.addClass('alt');
						},
						leave: function() {
							$nav.removeClass('alt');
						},
					});

			// Links.
				var $nav_a = $nav.find('a');

				$nav_a
					.scrolly({
						speed: 1000,
						offset: function() { return $nav.height(); }
					})
					.on('click', function() {

						var $this = $(this);

						// External link? Bail.
							if ($this.attr('href').charAt(0) != '#')
								return;

						// Deactivate all links.
							$nav_a
								.removeClass('active')
								.removeClass('active-locked');

						// Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
							$this
								.addClass('active')
								.addClass('active-locked');

					})
					.each(function() {

						var	$this = $(this),
							id = $this.attr('href'),
							$section = $(id);

						// No section for this link? Bail.
							if ($section.length < 1)
								return;

						// Scrollex.
							$section.scrollex({
								mode: 'middle',
								initialize: function() {

									// Deactivate section.
										if (browser.canUse('transition'))
											$section.addClass('inactive');

								},
								enter: function() {

									// Activate section.
										$section.removeClass('inactive');

									// No locked links? Deactivate all links and activate this section's one.
										if ($nav_a.filter('.active-locked').length == 0) {

											$nav_a.removeClass('active');
											$this.addClass('active');

										}

									// Otherwise, if this section's link is the one that's locked, unlock it.
										else if ($this.hasClass('active-locked'))
											$this.removeClass('active-locked');

								}
							});

					});

		}

	// Scrolly.
		$('.scrolly').scrolly({
			speed: 1000
		});

	// Theme toggle.
		var theme = localStorage.getItem('theme') || 'dark';

		var applyTheme = function(nextTheme) {
			theme = nextTheme;
			$body
				.removeClass('theme-dark theme-light')
				.addClass('theme-' + theme);
			$('.theme-toggle')
				.attr('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')
				.attr('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
			localStorage.setItem('theme', theme);
		};

		applyTheme(theme);

		$('.theme-toggle').on('click', function() {
			applyTheme(theme === 'dark' ? 'light' : 'dark');
		});

	// Image carousels.
		$('.photo-strip').each(function() {
			var $carousel = $(this),
				$images = $carousel.children('img');

			if ($images.length < 2)
				return;

			var index = 0,
				timerId;

			$carousel
				.addClass('carousel')
				.attr('tabindex', '0');

			$images
				.addClass('carousel-slide')
				.eq(0)
				.addClass('active');

			$carousel.append('<button class="carousel-arrow carousel-prev" type="button" aria-label="Previous image"></button>');
			$carousel.append('<button class="carousel-arrow carousel-next" type="button" aria-label="Next image"></button>');

			var show = function(nextIndex) {
				index = (nextIndex + $images.length) % $images.length;
				$images.removeClass('active').eq(index).addClass('active');
			};

			var start = function() {
				timerId = window.setInterval(function() {
					show(index + 1);
				}, 4500);
			};

			var restart = function() {
				window.clearInterval(timerId);
				start();
			};

			$carousel.find('.carousel-prev').on('click', function() {
				show(index - 1);
				restart();
			});

			$carousel.find('.carousel-next').on('click', function() {
				show(index + 1);
				restart();
			});

			start();
		});

	// Travel map. Add a country here with ISO code plus lon/lat to update it.
		var travelCountries = [
			{ code: 'IN', name: 'India', region: 'Asia', lon: 78.9, lat: 20.6 },
			{ code: 'MY', name: 'Malaysia', region: 'Asia', lon: 102.0, lat: 4.2 },
			{ code: 'GB', name: 'United Kingdom', region: 'Europe', lon: -3.4, lat: 55.4 },
			{ code: 'NL', name: 'Netherlands', region: 'Europe', lon: 5.3, lat: 52.1 },
			{ code: 'ES', name: 'Spain', region: 'Europe', lon: -3.7, lat: 40.4 },
			{ code: 'CA', name: 'Canada', region: 'North America', lon: -106.3, lat: 56.1 },
			{ code: 'US', name: 'United States', region: 'North America', lon: -98.6, lat: 39.8 }
		];

		var $travelMap = $('.travel-map[data-map="world"]');

		if ($travelMap.length) {
			var cssVar = function(name, fallback) {
				var value = window.getComputedStyle($body[0]).getPropertyValue(name).trim();
				return value || fallback;
			};

			if (window.jsVectorMap) {
				var travelledCodes = travelCountries.map(function(country) {
						return country.code;
					}),
					travelledByCode = {};

				$travelMap.css('min-height', '32em');

				travelCountries.forEach(function(country) {
					travelledByCode[country.code] = country;
				});

				new jsVectorMap({
					selector: '.travel-map[data-map="world"]',
					map: 'world',
					backgroundColor: 'transparent',
					selectedRegions: travelledCodes,
					zoomButtons: true,
					regionStyle: {
						initial: {
							fill: cssVar('--map-land', '#eaddef'),
							fillOpacity: 1,
							stroke: cssVar('--panel-border', 'rgba(138, 63, 142, 0.28)'),
							strokeWidth: 0.5
						},
						hover: {
							fill: cssVar('--button-bg-hover', '#f48bbf')
						},
						selected: {
							fill: cssVar('--map-marker', '#b92f82')
						},
						selectedHover: {
							fill: cssVar('--button-bg-hover', '#f48bbf')
						}
					},
					onRegionTooltipShow: function(event, tooltip, code) {
						if (travelledByCode[code])
							tooltip.text(travelledByCode[code].name + ' - travelled');
					}
				});

				return;
			}

			var project = function(lon, lat) {
				return {
					x: ((lon + 180) / 360) * 1000,
					y: ((90 - lat) / 180) * 500
				};
			};

			var markers = travelCountries.map(function(country) {
				var point = project(country.lon, country.lat);
				return '<g class="travel-marker" tabindex="0"><circle cx="' + point.x.toFixed(1) + '" cy="' + point.y.toFixed(1) + '" r="8"></circle><text x="' + (point.x + 13).toFixed(1) + '" y="' + (point.y + 4).toFixed(1) + '">' + country.name + '</text></g>';
			}).join('');

			$travelMap.html(
				'<svg class="world-map" viewBox="0 0 1000 500" role="img" aria-label="World map with visited countries highlighted">' +
					'<path class="land" d="M91 168 L151 118 L239 126 L285 171 L260 236 L190 259 L112 230 Z" />' +
					'<path class="land" d="M246 297 L313 312 L334 382 L303 454 L247 430 L222 355 Z" />' +
					'<path class="land" d="M455 132 L531 96 L640 122 L681 183 L626 225 L516 213 L443 174 Z" />' +
					'<path class="land" d="M498 222 L570 241 L606 330 L557 421 L502 370 L467 282 Z" />' +
					'<path class="land" d="M638 167 L742 122 L878 152 L918 231 L843 275 L739 245 L655 214 Z" />' +
					'<path class="land" d="M777 332 L867 327 L913 380 L881 429 L786 420 L743 370 Z" />' +
					markers +
				'</svg>'
			);
		}

})(jQuery);
