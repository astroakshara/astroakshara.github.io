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
			var syncActiveNavItem = function($link) {
				var $container = $nav.find('ul');

				if (!$link || !$link.length || !$container.length)
					return;

				var container = $container.get(0),
					link = $link.get(0);

				if (!container || !link || container.scrollWidth <= container.clientWidth)
					return;

				var target = link.offsetLeft - ((container.clientWidth - link.offsetWidth) / 2);
				target = Math.max(0, Math.min(target, container.scrollWidth - container.clientWidth));
				container.scrollTo({ left: target, behavior: 'smooth' });
			};

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

							syncActiveNavItem($this);

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
											syncActiveNavItem($this);

										}

									// Otherwise, if this section's link is the one that's locked, unlock it.
										else if ($this.hasClass('active-locked'))
											$this.removeClass('active-locked');

								}
							});

					});

				syncActiveNavItem($nav_a.filter('.active').first());

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

	// Travel map. Add countries to this list to highlight them on the full world map.
		var travelCountries = [
			{ code: 'IN', name: 'India', region: 'Asia', lon: 78.9, lat: 20.6 },
			{ code: 'SA', name: 'Saudi Arabia', region: 'Asia', lon: 45.1, lat: 23.9 },
			{ code: 'GB', name: 'United Kingdom', region: 'Europe', lon: -3.4, lat: 55.4 },
			{ code: 'DE', name: 'Germany', region: 'Europe', lon: 10.4, lat: 51.2 },
			{ code: 'PL', name: 'Poland', region: 'Europe', lon: 19.1, lat: 51.9 },
			{ code: 'BE', name: 'Belgium', region: 'Europe', lon: 4.5, lat: 50.8 },
			{ code: 'FR', name: 'France', region: 'Europe', lon: 2.2, lat: 46.2 },
			{ code: 'PT', name: 'Portugal', region: 'Europe', lon: -8.2, lat: 39.4 },
			{ code: 'IT', name: 'Italy', region: 'Europe', lon: 12.6, lat: 42.8 },
			{ code: 'CH', name: 'Switzerland', region: 'Europe', lon: 8.2, lat: 46.8 },
			{ code: 'AT', name: 'Austria', region: 'Europe', lon: 14.6, lat: 47.5 },
			{ code: 'TH', name: 'Thailand', region: 'Asia', lon: 100.9, lat: 15.9 },
			{ code: 'MY', name: 'Malaysia', region: 'Asia', lon: 102.0, lat: 4.2 },
			{ code: 'VA', name: 'Vatican City', region: 'Europe', lon: 12.45, lat: 41.9 },
			{ code: 'ES', name: 'Spain', region: 'Europe', lon: -3.7, lat: 40.4 },
			{ code: 'NO', name: 'Norway', region: 'Europe', lon: 8.5, lat: 60.5 },
			{ code: 'AD', name: 'Andorra', region: 'Europe', lon: 1.6, lat: 42.5 },
			{ code: 'US', name: 'United States', region: 'North America', lon: -98.6, lat: 39.8 },
			{ code: 'LK', name: 'Sri Lanka', region: 'Asia', lon: 80.7, lat: 7.9 },
			{ code: 'AL', name: 'Albania', region: 'Europe', lon: 20.2, lat: 41.2 },
			{ code: 'GR', name: 'Greece', region: 'Europe', lon: 21.8, lat: 39.1 },
			{ code: 'CZ', name: 'Czechia', region: 'Europe', lon: 15.5, lat: 49.8 },
			{ code: 'MC', name: 'Monaco', region: 'Europe', lon: 7.42, lat: 43.74 },
			{ code: 'IE', name: 'Ireland', region: 'Europe', lon: -8.2, lat: 53.3 },
			{ code: 'NL', name: 'Netherlands', region: 'Europe', lon: 5.3, lat: 52.1 },
			{ code: 'NP', name: 'Nepal', region: 'Asia', lon: 84.1, lat: 28.4 },
			{ code: 'FI', name: 'Finland', region: 'Europe', lon: 26.0, lat: 64.0 },
			{ code: 'EE', name: 'Estonia', region: 'Europe', lon: 25.5, lat: 58.7 },
			{ code: 'CA', name: 'Canada', region: 'North America', lon: -106.3, lat: 56.1 }
		];

		var $travelMap = $('.travel-map[data-map="world"]');

		if ($travelMap.length) {
			$.get('images/world-map.svg', function(markup) {
				$travelMap.html(markup);
				var $mapSvg = $travelMap.find('svg.world-map');

				travelCountries.forEach(function(country) {
					var $shape = $mapSvg.find('.land[data-code="' + country.code + '"]');

					if ($shape.length) {
						$shape.addClass('travelled').find('title').text(country.name + ' - travelled');
						return;
					}

					// Mark very small countries that are not drawn separately at this map scale.
					var marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle'),
						title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
					marker.setAttribute('class', 'land travelled country-marker');
					marker.setAttribute('data-code', country.code);
					marker.setAttribute('cx', (((country.lon + 180) / 360) * 1000).toFixed(2));
					marker.setAttribute('cy', (((90 - country.lat) / 180) * 500).toFixed(2));
					marker.setAttribute('r', '2.8');
				title.textContent = country.name + ' - travelled';
					marker.appendChild(title);
					$mapSvg[0].appendChild(marker);
				});
			}, 'text').fail(function() {
				$travelMap.text('The world map could not be loaded.');
			});
		}

})(jQuery);
