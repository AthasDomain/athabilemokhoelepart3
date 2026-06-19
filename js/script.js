console.log("JS connected");
/*ABOUT PAGE FUNCTIONALITY*/
(() => {
	// Convert "Our Mission" and "Our Vision" cards into accessible accordions
	function initAboutAccordions() {
		const page = document.querySelector('.about-page');
		if (!page) return;

		const cards = Array.from(page.querySelectorAll('.about-content .card'));
		const targets = cards.filter(c => {
			const h = c.querySelector('h2');
			if (!h) return false;
			const t = h.textContent.trim().toLowerCase();
			return t === 'our mission' || t === 'our vision';
		});
		if (targets.length === 0) return;

		function closeAll(except) {
			targets.forEach(c => {
				if (c === except) return;
				c.classList.remove('open');
				const content = c.querySelector('.accordion-content');
				if (content) content.style.maxHeight = '0px';
			});
		}

		targets.forEach(card => {
			const heading = card.querySelector('h2');
			// wrap remaining content into accordion-content
			let content = card.querySelector('.accordion-content');
			if (!content) {
				content = document.createElement('div');
				content.className = 'accordion-content';
				// move all nodes after the heading into content
				let node = heading.nextSibling;
				const nodes = [];
				while (node) {
					nodes.push(node);
					node = node.nextSibling;
				}
				nodes.forEach(n => content.appendChild(n));
				card.appendChild(content);
			}

			// make heading interactive
			heading.setAttribute('role', 'button');
			heading.setAttribute('tabindex', '0');
			heading.setAttribute('aria-expanded', 'false');

			function open() {
				closeAll(card);
				card.classList.add('open');
				content.style.maxHeight = content.scrollHeight + 'px';
				heading.setAttribute('aria-expanded', 'true');
			}

			function close() {
				card.classList.remove('open');
				content.style.maxHeight = '0px';
				heading.setAttribute('aria-expanded', 'false');
			}

			function toggle() {
				if (card.classList.contains('open')) close(); else open();
			}

			heading.addEventListener('click', toggle);
			heading.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					toggle();
				}
			});

			// initialize closed
			content.style.maxHeight = '0px';
		});
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAboutAccordions); else initAboutAccordions();
})();

/* ABOUT: Slide-up reveal for main sections */
(() => {
	function initAboutSlideUp() {
		const sections = document.querySelectorAll('.about-page > section');
		if (!sections || sections.length === 0) return;

		const obs = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12 });

		sections.forEach(s => obs.observe(s));
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAboutSlideUp);
	} else {
		initAboutSlideUp();
	}
})();

/*CONTACT PAGE FUNCTIONALITY*/
/*ENQUIRIES PAGE FUNCTIONALITY*/
/*IMAGES PAGE FUNCTIONALITY*/
(() => {
	let previewEl = null;
	let hideTimeout = null;

	function createPreview(src, alt) {
		if (previewEl) {
			const img = previewEl.querySelector('img');
			img.src = src;
			img.alt = alt || '';
			previewEl.classList.add('visible');
			document.body.classList.add('preview-open');
			return;
		}

		const overlay = document.createElement('div');
		overlay.className = 'preview-overlay';
		overlay.innerHTML = `<img src="${src}" alt="${alt || ''}"><div class="close-hint">Esc to close</div>`;
		document.body.appendChild(overlay);

		// small delay to allow CSS transitions
		requestAnimationFrame(() => overlay.classList.add('visible'));

		overlay.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
		overlay.addEventListener('mouseleave', scheduleHide);
		overlay.addEventListener('click', removePreview);

		// prevent background scroll while preview is open
		document.body.classList.add('preview-open');

		previewEl = overlay;
		document.addEventListener('keydown', onKeyDown);
	}

	function scheduleHide() {
		clearTimeout(hideTimeout);
		hideTimeout = setTimeout(removePreview, 120);
	}

	function removePreview() {
		clearTimeout(hideTimeout);
		if (!previewEl) return;
		previewEl.classList.remove('visible');
		setTimeout(() => {
			if (previewEl && previewEl.parentNode) previewEl.parentNode.removeChild(previewEl);
			previewEl = null;
		}, 180);
		document.removeEventListener('keydown', onKeyDown);
		document.body.classList.remove('preview-open');
	}

	function onKeyDown(e) {
		if (e.key === 'Escape') removePreview();
	}

	function attachToThumbnails() {
		const thumbs = document.querySelectorAll('.gallery-grid img');
		thumbs.forEach(img => {
			// make keyboard-focusable
			img.tabIndex = 0;

			img.addEventListener('mouseenter', () => createPreview(img.src, img.alt));
			img.addEventListener('focus', () => createPreview(img.src, img.alt));
			img.addEventListener('mouseleave', scheduleHide);
			img.addEventListener('blur', scheduleHide);
			img.addEventListener('click', () => createPreview(img.src, img.alt));
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', attachToThumbnails);
	} else {
		attachToThumbnails();
	}
})();
/*INDEX PAGE FUNCTIONALITY*/
(() => {
	function initIndex() {
		// Smooth scrolling for nav links that reference page sections
		const navLinks = document.querySelectorAll('nav a[href^="#"]');
		if (navLinks && navLinks.length > 0) {
			navLinks.forEach(link => {
				link.addEventListener('click', (e) => {
					const href = link.getAttribute('href');
					if (!href || href === '#') return;
					const target = document.querySelector(href);
					if (!target) return;
					e.preventDefault();
					target.scrollIntoView({ behavior: 'smooth', block: 'start' });
					// update the URL hash without jumping
					history.pushState(null, '', href);
					// for accessibility: focus the section (but don't add to tab order permanently)
					target.setAttribute('tabindex', '-1');
					target.focus({ preventScroll: true });
				});
			});

			// Highlight nav link when its section is in view
			const sections = Array.from(document.querySelectorAll('section[id]'));
			const idToLink = {};
			navLinks.forEach(l => {
				const h = l.getAttribute('href');
				if (h && h.startsWith('#')) idToLink[h.slice(1)] = l;
			});

			if (sections.length > 0) {
				const observer = new IntersectionObserver((entries) => {
					entries.forEach(entry => {
						const id = entry.target.id;
						const link = idToLink[id];
						if (!link) return;
						if (entry.isIntersecting) {
							navLinks.forEach(l => l.classList.remove('active'));
							link.classList.add('active');
						}
					});
				}, { root: null, rootMargin: '0px 0px -40% 0px', threshold: 0.15 });

				sections.forEach(s => observer.observe(s));
			}
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initIndex);
	} else {
		initIndex();
	}
})();

/* Index page functionality carousel removed */
/* Reveal animation for 'Why we do this?' — trigger on hover/focus */
(() => {
	function initWhyRevealHover() {
		const sections = Array.from(document.querySelectorAll('section.content-card'));
		const target = sections.find(s => {
			const h = s.querySelector('h3');
			return h && h.textContent.trim().toLowerCase() === 'why we do this?';
		});
		if (!target) return;

		target.classList.add('will-reveal');

		function show() { target.classList.add('revealed'); }
		function hide() { target.classList.remove('revealed'); }

		target.addEventListener('mouseenter', show);
		target.addEventListener('mouseleave', hide);
		target.addEventListener('focusin', show);
		target.addEventListener('focusout', hide);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initWhyRevealHover);
	} else {
		initWhyRevealHover();
	}
})();

/* INDEX: Did You Know? facts carousel */
(() => {
	function initFactsCarousel() {
		const container = document.querySelector('.facts-list');
		if (!container) return;
		const items = Array.from(container.querySelectorAll('.fact-item'));
		if (items.length <= 1) return;

		let current = 0;
		const INTERVAL = 3000;
		let timer = null;

		// create dots
		const dotsWrap = document.createElement('div');
		dotsWrap.className = 'facts-dots';
		const dots = items.map((_, i) => {
			const btn = document.createElement('button');
			btn.className = 'facts-dot';
			btn.type = 'button';
			btn.setAttribute('aria-label', `Show fact ${i + 1}`);
			btn.dataset.index = i;
			btn.addEventListener('click', () => { goTo(i); restart(); });
			dotsWrap.appendChild(btn);
			return btn;
		});
		container.parentNode.insertBefore(dotsWrap, container.nextSibling);

		function show(i) {
			i = (i + items.length) % items.length;
			items.forEach((it, idx) => {
				if (idx === i) {
					it.style.display = 'block';
					it.classList.add('active');
					it.setAttribute('aria-hidden', 'false');
				} else {
					it.style.display = 'none';
					it.classList.remove('active');
					it.setAttribute('aria-hidden', 'true');
				}
			});
			dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
			current = i;
		}

		function next() { show(current + 1); }
		function start() { stop(); timer = setInterval(next, INTERVAL); }
		function stop() { if (timer) { clearInterval(timer); timer = null; } }
		function goTo(i) { show(i); }
		function restart() { stop(); start(); }

		// pause on hover/focus
		container.addEventListener('mouseenter', stop);
		container.addEventListener('mouseleave', start);
		dotsWrap.addEventListener('mouseenter', stop);
		dotsWrap.addEventListener('mouseleave', start);

		// initialize
		items.forEach(it => it.style.display = 'none');
		show(0);
		start();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initFactsCarousel);
	} else {
		initFactsCarousel();
	}
})();

/* INDEX: Wallpaper interactive parallax */
(() => {
	function initWallpaperInteractive() {
		const elems = document.querySelectorAll('.hero, .about-hero, .enquiry-hero');
		if (!elems || elems.length === 0) return;

		elems.forEach(el => {
			el.addEventListener('mousemove', (e) => {
				const rect = el.getBoundingClientRect();
				const x = ((e.clientX - rect.left) / rect.width) * 100; // 0-100
				const y = ((e.clientY - rect.top) / rect.height) * 100;
				// small movement around center
				const moveX = (x - 50) / 12; // smaller divisor = stronger parallax
				const moveY = (y - 50) / 12;
				el.style.backgroundPosition = `${50 + moveX}% ${50 + moveY}%`;
			});

			el.addEventListener('mouseleave', () => {
				el.style.backgroundPosition = 'center';
			});
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initWallpaperInteractive);
	} else {
		initWallpaperInteractive();
	}
})();
/*SERVICES PAGE FUNCTIONALITY*/
(() => {
	function initServiceFilters() {
		const container = document.querySelector('.service-grid');
		const buttons = Array.from(document.querySelectorAll('.service-filters .filter-btn'));
		if (!container || buttons.length === 0) return;
		const cards = Array.from(container.querySelectorAll('.service-card'));

		function hideCard(card) {
			if (card.classList.contains('hidden')) return;
			card.classList.add('fading-out');
			// wait for transition then remove from layout
			setTimeout(() => {
				card.classList.remove('fading-out');
				card.classList.add('hidden');
			}, 360);
		}

		function showCard(card) {
			if (!card.classList.contains('hidden')) return;
			card.classList.remove('hidden');
			// start from faded state then animate in
			card.classList.add('fading-out');
			requestAnimationFrame(() => requestAnimationFrame(() => {
				card.classList.remove('fading-out');
			}));
		}

		function applyFilter(filter) {
			cards.forEach(card => {
				const cat = card.getAttribute('data-category') || 'environmental';
				if (filter === 'all' || cat === filter) showCard(card); else hideCard(card);
			});
		}

		buttons.forEach(btn => {
			btn.addEventListener('click', () => {
				buttons.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				const f = btn.dataset.filter;
				applyFilter(f);
			});
			btn.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
			});
		});

		// initialize: show all
		applyFilter('all');
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initServiceFilters); else initServiceFilters();
})();

/* SERVICES: staggered slide-up reveal for service cards */
(() => {
	function initServiceStagger() {
		const grid = document.querySelector('.service-grid');
		if (!grid) return;
		const cards = Array.from(grid.querySelectorAll('.service-card'));
		// ensure starting state
		cards.forEach(c => c.classList.remove('visible'));

		const obs = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					cards.forEach((card, i) => {
						setTimeout(() => card.classList.add('visible'), i * 150);
					});
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12 });

		obs.observe(grid);
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initServiceStagger); else initServiceStagger();
})();

/* SERVICES: Event countdown to September 9 (updates every second) */
(() => {
	function initEventCountdown() {
		const timerEl = document.querySelector('.event-timer');
		if (!timerEl) return;
		const daysEl = timerEl.querySelector('.days');
		const hoursEl = timerEl.querySelector('.hours');
		const minutesEl = timerEl.querySelector('.minutes');
		const secondsEl = timerEl.querySelector('.seconds');

		function update() {
			const now = new Date();
			// target: September 9 of this year (month 8). If passed, use next year.
			let target = new Date(now.getFullYear(), 8, 9, 0, 0, 0, 0);
			if (now >= target) target = new Date(now.getFullYear() + 1, 8, 9, 0, 0, 0, 0);

			const diff = target - now;
			if (diff <= 0) {
				daysEl.textContent = '0';
				hoursEl.textContent = '00';
				minutesEl.textContent = '00';
				secondsEl.textContent = '00';
				return;
			}

			const secs = Math.floor(diff / 1000);
			const days = Math.floor(secs / 86400);
			const hours = Math.floor((secs % 86400) / 3600);
			const minutes = Math.floor((secs % 3600) / 60);
			const seconds = secs % 60;

			daysEl.textContent = String(days);
			hoursEl.textContent = String(hours).padStart(2, '0');
			minutesEl.textContent = String(minutes).padStart(2, '0');
			secondsEl.textContent = String(seconds).padStart(2, '0');
		}

		update();
		const id = setInterval(update, 1000);
		// store on element so it can be cleared if needed later
		timerEl._intervalId = id;
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initEventCountdown); else initEventCountdown();
})();

/* SERVICES: Engagement cards accordion (only one open at a time) */
(() => {
	function initEngagementAccordion() {
		const section = document.querySelector('.engagement-section');
		if (!section) return;

		const cards = Array.from(section.querySelectorAll('.engagement-card'));
		if (cards.length === 0) return;

		function closeAll(except) {
			cards.forEach(c => {
				if (c === except) return;
				c.classList.remove('open');
				const content = c.querySelector('.accordion-content');
				if (content) content.style.maxHeight = '0px';
				const h = c.querySelector('h2');
				if (h) h.setAttribute('aria-expanded', 'false');
			});
		}

		cards.forEach(card => {
			const heading = card.querySelector('h2');
			if (!heading) return;

			// wrap remaining nodes into accordion-content
			let content = card.querySelector('.accordion-content');
			if (!content) {
				content = document.createElement('div');
				content.className = 'accordion-content';
				let node = heading.nextSibling;
				const nodes = [];
				while (node) { nodes.push(node); node = node.nextSibling; }
				nodes.forEach(n => content.appendChild(n));
				card.appendChild(content);
			}

			heading.setAttribute('role', 'button');
			heading.setAttribute('tabindex', '0');
			heading.setAttribute('aria-expanded', 'false');

			// initialize closed
			content.style.maxHeight = '0px';

			function open() {
				closeAll(card);
				card.classList.add('open');
				const targetH = content.scrollHeight;
				content.style.maxHeight = targetH + 'px';
				heading.setAttribute('aria-expanded', 'true');
			}

			function close() {
				content.style.maxHeight = '0px';
				card.classList.remove('open');
				heading.setAttribute('aria-expanded', 'false');
			}

			function toggle() {
				if (card.classList.contains('open')) close(); else open();
			}

			heading.addEventListener('click', toggle);
			heading.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
			});
		});
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initEngagementAccordion); else initEngagementAccordion();
})();

/* SERVICES: expandable service cards (Read more) */
(() => {
	function initServiceExpandables() {
		const cards = Array.from(document.querySelectorAll('.service-card'));
		if (!cards.length) return;

		cards.forEach(card => {
			const body = card.querySelector('.service-body');
			const btn = card.querySelector('.read-more');
			if (!body || !btn) return;

			// compute collapsed height = approx 2 lines using line-height
			const style = window.getComputedStyle(body);
			let lineHeight = parseFloat(style.lineHeight);
			if (!lineHeight || isNaN(lineHeight)) {
				// fallback
				const fontSize = parseFloat(style.fontSize) || 16;
				lineHeight = fontSize * 1.2;
			}
			const collapsedH = Math.round(lineHeight * 2);

			// initialize collapsed
			body.style.maxHeight = collapsedH + 'px';

			function expand() {
				card.classList.add('expanded');
				// set to scrollHeight to animate
				const targetH = body.scrollHeight;
				body.style.maxHeight = targetH + 'px';
				btn.textContent = 'Read less';
				btn.setAttribute('aria-expanded', 'true');
			}

			function collapse() {
				// animate from current height to collapsed height
				body.style.maxHeight = body.scrollHeight + 'px';
				// force reflow
				void body.offsetHeight;
				body.style.maxHeight = collapsedH + 'px';
				card.classList.remove('expanded');
				btn.textContent = 'Read more';
				btn.setAttribute('aria-expanded', 'false');
			}

			btn.addEventListener('click', () => {
				if (card.classList.contains('expanded')) collapse(); else expand();
			});

			btn.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
			});
		});
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initServiceExpandables); else initServiceExpandables();
})();

	/* ENQUIRY PAGE: live validation and submit handling */
	(() => {
		function initEnquiryValidation() {
			const form = document.getElementById('enquiry-form');
			if (!form) return;

			const fields = {
				name: form.querySelector('#name'),
				email: form.querySelector('#email'),
				phone: form.querySelector('#phone'),
				subject: form.querySelector('#subject'),
				message: form.querySelector('#message')
			};

			const errors = {
				name: form.querySelector('#name-error'),
				email: form.querySelector('#email-error'),
				phone: form.querySelector('#phone-error'),
				subject: form.querySelector('#subject-error'),
				message: form.querySelector('#message-error')
			};

			const statusEl = document.getElementById('form-status');

			const counterEl = document.getElementById('message-counter');

			// initialize filled state for floating labels
			Object.keys(fields).forEach(k => {
				const el = fields[k];
				if (!el) return;
				if ((el.value || '').trim() !== '') el.classList.add('filled');
			});

			function setError(fieldName, msg) {
				const el = fields[fieldName];
				const err = errors[fieldName];
				if (msg) {
					el.classList.add('invalid');
					el.setAttribute('aria-invalid', 'true');
					err.textContent = msg;
					el.setAttribute('aria-describedby', err.id);
				} else {
					el.classList.remove('invalid');
					el.removeAttribute('aria-invalid');
					err.textContent = '';
					el.removeAttribute('aria-describedby');
				}
			}

			function validEmail(v) {
				return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
			}

			function validPhone(v) {
				const digits = v.replace(/\D/g, '');
				return digits.length >= 9 && digits.length <= 15;
			}

			function validateField(name) {
				const v = (fields[name].value || '');
				const trimmed = v.trim();
				if (name === 'name' || name === 'subject') {
					if (!trimmed) { setError(name, 'This field is required'); return false; }
					setError(name, ''); return true;
				}

				if (name === 'message') {
					// message required and max 500 chars
					if (!trimmed) { setError('message', 'This field is required'); return false; }
					if (v.length > 500) { setError('message', 'Message must be 500 characters or less'); return false; }
					setError('message', ''); return true;
				}
				if (name === 'email') {
					if (!v) { setError('email', 'Email is required'); return false; }
					if (!validEmail(v)) { setError('email', 'Enter a valid email address'); return false; }
					setError('email', ''); return true;
				}
				if (name === 'phone') {
					if (!trimmed) { setError('phone', ''); return true; } // phone optional
					if (!validPhone(trimmed)) { setError('phone', 'Enter a valid phone number'); return false; }
					setError('phone', ''); return true;
				}
				return true;
			}

			Object.keys(fields).forEach(key => {
				const el = fields[key];
				if (!el) return;
				el.addEventListener('input', () => {
					// update floating label filled state
					el.classList.toggle('filled', (el.value || '').trim() !== '');
					if (key === 'message' && counterEl) {
						const len = el.value.length;
						counterEl.textContent = `${len}/500`;
						counterEl.classList.toggle('over', len > 500);
					}
					validateField(key);
				});
				el.addEventListener('blur', () => validateField(key));
			});

			function validateAll() {
				let ok = true;
				Object.keys(fields).forEach(k => { if (!validateField(k)) ok = false; });
				return ok;
			}

			function showSuccess() {
				if (!statusEl) return;
				statusEl.hidden = false;
				statusEl.innerHTML = '<span class="check">&#10003;</span><div>Enquiry submitted successfully.</div>';
				// keep visible for 5 seconds
				setTimeout(() => {
					statusEl.hidden = true;
					statusEl.textContent = '';
				}, 5000);
			}

			form.addEventListener('submit', (e) => {
				e.preventDefault();
				if (!validateAll()) return;
				// simulate successful submission: show message, clear form
				showSuccess();
				form.reset();
				// clear validation states
				Object.keys(fields).forEach(k => setError(k, ''));
			});
		}

		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initEnquiryValidation); else initEnquiryValidation();
	})();

/* ENQUIRY PAGE: FAQ accordion (single-open, smooth slide) */
(() => {
	function initFaqAccordion() {
		const container = document.querySelector('.faq-container');
		if (!container) return;

		const items = Array.from(container.querySelectorAll('.faq-item'));
		if (items.length === 0) return;

		function closeAll(except) {
			items.forEach(it => {
				if (it === except) return;
				it.classList.remove('open');
				const c = it.querySelector('.accordion-content');
				if (c) c.style.maxHeight = '0px';
				const h = it.querySelector('h3');
				if (h) h.setAttribute('aria-expanded', 'false');
			});
		}

		items.forEach(item => {
			const heading = item.querySelector('h3');
			const para = item.querySelector('p');
			if (!heading || !para) return;

			// move paragraph into accordion-content wrapper (if not already moved)
			let content = item.querySelector('.accordion-content');
			if (!content) {
				content = document.createElement('div');
				content.className = 'accordion-content';
				content.appendChild(para);
				item.appendChild(content);
			}

			heading.setAttribute('role', 'button');
			heading.setAttribute('tabindex', '0');
			heading.setAttribute('aria-expanded', 'false');
			content.style.maxHeight = '0px';

			function open() {
				closeAll(item);
				item.classList.add('open');
				const targetH = content.scrollHeight;
				content.style.maxHeight = targetH + 'px';
				heading.setAttribute('aria-expanded', 'true');
			}

			function close() {
				content.style.maxHeight = '0px';
				item.classList.remove('open');
				heading.setAttribute('aria-expanded', 'false');
			}

			function toggle() {
				if (item.classList.contains('open')) close(); else open();
			}

			heading.addEventListener('click', toggle);
			heading.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
			});
		});
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFaqAccordion); else initFaqAccordion();
})();

/* COPY TO CLIPBOARD: contact + map cards */
(() => {
	function initCopyButtons() {
		const buttons = Array.from(document.querySelectorAll('.copy-btn'));
		if (!buttons.length) return;

		buttons.forEach(btn => {
			btn.addEventListener('click', async (e) => {
				// find text to copy: prefer sibling .copy-text, else use closest heading text
				let text = '';
				const parent = btn.parentElement;
				const copyTextEl = parent ? parent.querySelector('.copy-text') : null;
				if (copyTextEl) {
					text = copyTextEl.textContent.trim();
				} else {
					// if button is inside h3 (map-card), use heading text excluding button
					const heading = parent && parent.matches('h3') ? parent : btn.closest('h3');
					if (heading) {
						// clone and remove button to get only text
						const clone = heading.cloneNode(true);
						const btnInside = clone.querySelector('.copy-btn');
						if (btnInside) btnInside.remove();
						text = clone.textContent.trim();
					}
				}

				if (!text) return;

				try {
					await navigator.clipboard.writeText(text);
					// show tooltip
					const tooltip = btn.querySelector('.copy-tooltip');
					if (tooltip) {
						tooltip.hidden = false;
						btn.classList.add('show-tooltip');
						setTimeout(() => {
							tooltip.hidden = true;
							btn.classList.remove('show-tooltip');
						}, 2000);
					}
				} catch (err) {
					// fallback: try execCommand
					const ta = document.createElement('textarea');
					ta.value = text;
					document.body.appendChild(ta);
					ta.select();
					try { document.execCommand('copy'); }
					catch (e) {}
					ta.parentNode.removeChild(ta);
					const tooltip = btn.querySelector('.copy-tooltip');
					if (tooltip) {
						tooltip.hidden = false;
						btn.classList.add('show-tooltip');
						setTimeout(() => {
							tooltip.hidden = true;
							btn.classList.remove('show-tooltip');
						}, 2000);
					}
				}
			});
		});
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCopyButtons); else initCopyButtons();
})();

/* Lazy-load Google Maps iframes in drop-off points using IntersectionObserver */
(() => {
	function initLazyMaps() {
		const placeholders = Array.from(document.querySelectorAll('.map-placeholder'));
		if (!placeholders.length) return;

		const loadMap = (ph) => {
			const src = ph.dataset.src;
			if (!src) return;
			if (ph.dataset.loaded === 'true') return;
			const iframe = document.createElement('iframe');
			iframe.src = src;
			iframe.allowFullscreen = '';
			iframe.referrerPolicy = 'no-referrer-when-downgrade';
			iframe.loading = 'lazy';
			iframe.style.opacity = '0';
			iframe.style.border = '0';
			iframe.style.position = 'absolute';
			iframe.style.left = '0';
			iframe.style.top = '0';
			iframe.style.width = '100%';
			iframe.style.height = '100%';
			iframe.addEventListener('load', () => {
				ph.classList.add('loaded');
				iframe.style.transition = 'opacity 320ms ease';
				requestAnimationFrame(() => { iframe.style.opacity = '1'; });
				const spinner = ph.querySelector('.spinner');
				const text = ph.querySelector('.placeholder-text');
				if (spinner) spinner.style.display = 'none';
				if (text) text.style.display = 'none';
			});
			ph.appendChild(iframe);
			ph.dataset.loaded = 'true';
		};

		const observer = new IntersectionObserver((entries, obs) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					loadMap(entry.target);
					obs.unobserve(entry.target);
				}
			});
		}, { root: null, rootMargin: '200px 0px' });

		placeholders.forEach(p => observer.observe(p));
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLazyMaps); else initLazyMaps();
})();