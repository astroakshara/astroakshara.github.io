/*
	Animated sky layer: twinkling stars, slowly flowing stellar streams and
	the occasional shooting star, drawn on a fixed canvas behind the page.
	Stars are concentrated in the upper (sky) part of the background photo and
	fade out towards the horizon. Disabled in light theme and for users who
	prefer reduced motion (a static frame is drawn instead).
*/
(function() {

	var canvas = document.createElement('canvas');
	canvas.id = 'starfield';
	canvas.setAttribute('aria-hidden', 'true');
	document.body.insertBefore(canvas, document.body.firstChild.nextSibling);

	var ctx = canvas.getContext('2d');
	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var dpr = Math.min(window.devicePixelRatio || 1, 2);
	var W = 0, H = 0;
	var stars = [], streams = [], meteors = [];
	var running = false, lastT = 0, nextMeteor = 0;

	// Fraction of the viewport height that is "sky"; stars fade out below it.
	var HORIZON = 0.62;

	function rand(a, b) { return a + Math.random() * (b - a); }

	// Opacity falloff towards the horizon.
	function skyFade(y) {
		var f = 1 - y / (H * HORIZON);
		return f <= 0 ? 0 : Math.min(1, f * 1.6);
	}

	function starColor() {
		// Mostly white, a few blue-ish and warm stars.
		var r = Math.random();
		if (r < 0.15) return '170,200,255';
		if (r < 0.25) return '255,225,190';
		return '255,255,255';
	}

	function buildStars() {
		var count = Math.round((W * H * HORIZON) / 2600);
		count = Math.max(80, Math.min(count, 600));
		stars = [];
		for (var i = 0; i < count; i++) {
			// Bias towards the top of the sky.
			var y = Math.pow(Math.random(), 1.4) * H * HORIZON;
			var big = Math.random() < 0.06;
			stars.push({
				x: Math.random() * W,
				y: y,
				r: big ? rand(1.1, 1.8) : rand(0.3, 1.0),
				base: big ? rand(0.6, 0.95) : rand(0.25, 0.75),
				amp: rand(0.15, 0.5),
				speed: rand(0.6, 2.4),
				phase: Math.random() * Math.PI * 2,
				color: starColor(),
				vx: rand(-0.6, 0.6)
			});
		}
	}

	// A stellar stream is a gently curved band (quadratic Bezier) along which
	// many faint particles flow slowly, with a little scatter perpendicular to it.
	function makeStream(p0, p1, p2, n, width, speed, color) {
		var parts = [];
		for (var i = 0; i < n; i++) {
			parts.push({
				t: Math.random(),
				off: (Math.random() + Math.random() + Math.random() - 1.5) * width,
				r: rand(0.4, 1.2),
				a: rand(0.35, 0.85),
				tw: rand(1, 3),
				ph: Math.random() * Math.PI * 2
			});
		}
		return { p0: p0, p1: p1, p2: p2, parts: parts, speed: speed, color: color };
	}

	function buildStreams() {
		var s = Math.min(W, H) / 900;
		var dens = Math.max(0.5, Math.min(1.4, W / 1400));
		streams = [
			makeStream(
				{ x: -0.1 * W, y: 0.08 * H }, { x: 0.45 * W, y: 0.42 * H }, { x: 1.1 * W, y: 0.12 * H },
				Math.round(380 * dens), 14 * s, 0.006, '200,220,255'
			),
			makeStream(
				{ x: 0.15 * W, y: -0.05 * H }, { x: 0.35 * W, y: 0.3 * H }, { x: 0.95 * W, y: 0.48 * H },
				Math.round(160 * dens), 9 * s, -0.004, '255,230,210'
			),
			makeStream(
				{ x: 1.05 * W, y: 0.3 * H }, { x: 0.75 * W, y: 0.02 * H }, { x: 0.4 * W, y: -0.05 * H },
				Math.round(110 * dens), 7 * s, 0.005, '220,210,255'
			)
		];
	}

	function bez(st, t) {
		var u = 1 - t;
		var x = u * u * st.p0.x + 2 * u * t * st.p1.x + t * t * st.p2.x;
		var y = u * u * st.p0.y + 2 * u * t * st.p1.y + t * t * st.p2.y;
		// Tangent, for the perpendicular scatter.
		var dx = 2 * u * (st.p1.x - st.p0.x) + 2 * t * (st.p2.x - st.p1.x);
		var dy = 2 * u * (st.p1.y - st.p0.y) + 2 * t * (st.p2.y - st.p1.y);
		var len = Math.sqrt(dx * dx + dy * dy) || 1;
		return { x: x, y: y, nx: -dy / len, ny: dx / len };
	}

	function spawnMeteor() {
		var angle = rand(0.25, 0.55) * (Math.random() < 0.5 ? 1 : -1);
		var dir = angle > 0 ? 1 : -1;
		var sp = rand(700, 1100);
		meteors.push({
			x: dir > 0 ? rand(0, W * 0.6) : rand(W * 0.4, W),
			y: rand(0, H * HORIZON * 0.5),
			vx: Math.cos(Math.abs(angle)) * sp * dir,
			vy: Math.sin(Math.abs(angle)) * sp,
			life: 0,
			max: rand(0.6, 1.1),
			len: rand(80, 160)
		});
	}

	function resize() {
		W = window.innerWidth;
		H = window.innerHeight;
		canvas.width = Math.round(W * dpr);
		canvas.height = Math.round(H * dpr);
		canvas.style.width = W + 'px';
		canvas.style.height = H + 'px';
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		buildStars();
		buildStreams();
		if (!running) draw(0, 0);
	}

	function draw(time, dt) {
		var t = time / 1000;
		ctx.clearRect(0, 0, W, H);

		// Stellar streams.
		for (var s = 0; s < streams.length; s++) {
			var st = streams[s];
			for (var i = 0; i < st.parts.length; i++) {
				var p = st.parts[i];
				p.t += st.speed * dt;
				if (p.t > 1) p.t -= 1;
				if (p.t < 0) p.t += 1;
				var b = bez(st, p.t);
				var x = b.x + b.nx * p.off;
				var y = b.y + b.ny * p.off;
				var fade = skyFade(y);
				if (fade <= 0) continue;
				// Fade in/out at the stream ends and twinkle a little.
				var ends = Math.sin(Math.PI * p.t);
				var a = p.a * ends * fade * (0.75 + 0.25 * Math.sin(t * p.tw + p.ph));
				ctx.fillStyle = 'rgba(' + st.color + ',' + a.toFixed(3) + ')';
				ctx.beginPath();
				ctx.arc(x, y, p.r, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		// Twinkling stars.
		for (var j = 0; j < stars.length; j++) {
			var sr = stars[j];
			sr.x += sr.vx * dt;
			if (sr.x < -2) sr.x = W + 2;
			if (sr.x > W + 2) sr.x = -2;
			var tw = sr.base + sr.amp * Math.sin(t * sr.speed + sr.phase);
			var al = Math.max(0, Math.min(1, tw)) * skyFade(sr.y);
			if (al <= 0.01) continue;
			ctx.fillStyle = 'rgba(' + sr.color + ',' + al.toFixed(3) + ')';
			ctx.beginPath();
			ctx.arc(sr.x, sr.y, sr.r, 0, Math.PI * 2);
			ctx.fill();
			if (sr.r > 1.1) {
				// Soft glow for the brighter stars.
				ctx.fillStyle = 'rgba(' + sr.color + ',' + (al * 0.15).toFixed(3) + ')';
				ctx.beginPath();
				ctx.arc(sr.x, sr.y, sr.r * 3.2, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		// Shooting stars.
		for (var m = meteors.length - 1; m >= 0; m--) {
			var me = meteors[m];
			me.life += dt;
			me.x += me.vx * dt;
			me.y += me.vy * dt;
			var k = me.life / me.max;
			if (k >= 1) { meteors.splice(m, 1); continue; }
			var ma = Math.sin(Math.PI * k) * skyFade(me.y);
			var spd = Math.sqrt(me.vx * me.vx + me.vy * me.vy);
			var tx = me.x - me.vx / spd * me.len;
			var ty = me.y - me.vy / spd * me.len;
			var g = ctx.createLinearGradient(me.x, me.y, tx, ty);
			g.addColorStop(0, 'rgba(255,255,255,' + ma.toFixed(3) + ')');
			g.addColorStop(1, 'rgba(255,255,255,0)');
			ctx.strokeStyle = g;
			ctx.lineWidth = 1.4;
			ctx.beginPath();
			ctx.moveTo(me.x, me.y);
			ctx.lineTo(tx, ty);
			ctx.stroke();
		}
	}

	function frame(time) {
		if (!running) return;
		var dt = lastT ? Math.min((time - lastT) / 1000, 0.05) : 0;
		lastT = time;
		if (time > nextMeteor) {
			if (nextMeteor) spawnMeteor();
			nextMeteor = time + rand(4000, 10000);
		}
		draw(time, dt);
		requestAnimationFrame(frame);
	}

	function isLight() {
		return document.body.className.indexOf('theme-light') !== -1;
	}

	function update() {
		var shouldRun = !reduceMotion && !document.hidden && !isLight();
		canvas.style.display = isLight() ? 'none' : '';
		if (shouldRun && !running) {
			running = true;
			lastT = 0;
			requestAnimationFrame(frame);
		} else if (!shouldRun) {
			running = false;
		}
	}

	var resizeTimer;
	window.addEventListener('resize', function() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(resize, 150);
	});
	document.addEventListener('visibilitychange', update);
	// React to the theme toggle (it changes the body class).
	if (window.MutationObserver)
		new MutationObserver(update).observe(document.body, { attributes: true, attributeFilter: ['class'] });

	resize();
	update();

})();
