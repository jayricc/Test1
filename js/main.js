/* ============================================================
   PIXEL VERDICT — Main JavaScript
   Live search, genre filter, scroll animations
   ============================================================ */

(function () {
  'use strict';

  /* ── Smooth scroll for in-page anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── IntersectionObserver: animate cards on scroll ── */
  const observerOptions = {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  };

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.index
          ? parseInt(entry.target.dataset.index, 10) * 80
          : 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        cardObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  function initCardObserver() {
    document.querySelectorAll('.review-card').forEach((card, i) => {
      card.dataset.index = i;
      cardObserver.observe(card);
    });
  }

  /* ── Live search + genre filter ── */
  const searchInput = document.getElementById('search-input');
  const genreFilter = document.getElementById('genre-filter');
  const resultsCount = document.getElementById('results-count');
  const noResults = document.querySelector('.no-results');

  function normalise(str) {
    return str.toLowerCase().trim();
  }

  function filterCards() {
    const query = searchInput ? normalise(searchInput.value) : '';
    const genre = genreFilter  ? normalise(genreFilter.value) : '';
    const allCards = Array.from(document.querySelectorAll('.review-card'));

    let visibleCount = 0;

    allCards.forEach(card => {
      const title     = normalise(card.dataset.title  || '');
      const cardGenre = normalise(card.dataset.genre  || '');

      const matchTitle = query === '' || title.includes(query);
      const matchGenre = genre === '' || cardGenre === genre;

      if (matchTitle && matchGenre) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResults) {
      noResults.classList.toggle('visible', visibleCount === 0);
    }

    if (resultsCount) {
      resultsCount.textContent = `${visibleCount} review${visibleCount !== 1 ? 's' : ''}`;
    }
  }

  if (searchInput) searchInput.addEventListener('input', filterCards);
  if (genreFilter) genreFilter.addEventListener('change', filterCards);

  /* ── Highlight active nav link ── */
  function setActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href') || '';
      const isHome = (path.endsWith('index.html') || path === '/' || path.endsWith('/Test1/') || path.endsWith('/Test1'))
        && (href === 'index.html' || href === './' || href === '../index.html' || href === '#');
      const inReviews = path.includes('/reviews/');
      const linkIsReviews = href.includes('reviews');

      if (isHome && (href === 'index.html' || href === '../index.html')) {
        link.classList.add('active');
      } else if (inReviews && linkIsReviews) {
        link.classList.add('active');
      }
    });
  }

  /* ── Score colour helper (exposed globally for review pages) ── */
  window.getScoreClass = function (score) {
    const n = parseFloat(score);
    if (n >= 9)   return 'score-green';
    if (n >= 8)   return 'score-teal';
    if (n >= 6)   return 'score-yellow';
    return 'score-red';
  };

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    initCardObserver();
    setActiveNav();

    // Apply score colours to any [data-score] elements in the DOM
    document.querySelectorAll('[data-score]').forEach(el => {
      el.classList.add(window.getScoreClass(el.dataset.score));
    });

    // Initialise results count label
    if (resultsCount) {
      const total = document.querySelectorAll('.review-card').length;
      resultsCount.textContent = `${total} review${total !== 1 ? 's' : ''}`;
    }
  });
})();
