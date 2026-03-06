/**
 * Leyoxa – app.js
 * Mobile nav toggle + scroll-sticky nav + smooth anchor scrolling
 */
(function () {
    'use strict';

    /* ── Mobile nav toggle ─────────────────────────────────────── */
    var toggle = document.querySelector('#topnav .navbar-toggle');
    var nav    = document.getElementById('navigation');

    if (toggle && nav) {
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            toggle.classList.toggle('open');
            nav.classList.toggle('open');
        });

        // Close menu when a link inside it is tapped (single-page anchors)
        nav.addEventListener('click', function (e) {
            var link = e.target.closest('a');
            if (link && window.innerWidth < 992) {
                toggle.classList.remove('open');
                nav.classList.remove('open');
            }
        });

        // Close on outside tap
        document.addEventListener('click', function (e) {
            if (!toggle.contains(e.target) && !nav.contains(e.target)) {
                toggle.classList.remove('open');
                nav.classList.remove('open');
            }
        });
    }

    /* ── Sticky / scroll nav state ─────────────────────────────── */
    var topnav = document.getElementById('topnav');

    function onScroll() {
        if (!topnav) return;
        if (window.scrollY > 50) {
            topnav.classList.add('nav-sticky');
            topnav.classList.add('scroll');
        } else {
            topnav.classList.remove('nav-sticky');
            topnav.classList.remove('scroll');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    /* ── Smooth scroll for in-page anchor links ─────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var id = this.getAttribute('href');
            if (id === '#') return;
            var target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ── Feather icons ──────────────────────────────────────────────────── */
    function initFeather() {
        if (window.feather) { feather.replace(); }
    }
    // Feather is deferred — run after DOM ready and again after load to be safe
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFeather);
    } else {
        initFeather();
    }
    window.addEventListener('load', initFeather);

    /* ── Counter animation (about page stats) ───────────────────────────── */
    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) return;
        var duration = 1500;
        var start = 0;
        var step = Math.ceil(target / (duration / 16));
        var timer = setInterval(function () {
            start += step;
            if (start >= target) { start = target; clearInterval(timer); }
            el.textContent = start;
        }, 16);
    }

    var counters = document.querySelectorAll('.counter-value');
    if (counters.length) {
        if ('IntersectionObserver' in window) {
            var cio = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            counters.forEach(function (c) { cio.observe(c); });
        } else {
            counters.forEach(animateCounter);
        }
    }

})();
