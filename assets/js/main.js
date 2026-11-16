/* ЭРА МИЛОСЕРДИЯ — скрипты: меню, появление блоков, чтение документов. */
(function () {
  'use strict';
  var doc = document;
  doc.documentElement.classList.add('js');

  /* ---------- меню ---------- */
  var nav = doc.querySelector('.nav');
  var burger = doc.querySelector('.nav__burger');
  var groups = [].slice.call(doc.querySelectorAll('.menu__group'));

  function closeGroups(except) {
    groups.forEach(function (g) {
      if (g !== except) {
        g.classList.remove('is-open');
        g.querySelector('.menu__toggle').setAttribute('aria-expanded', 'false');
      }
    });
  }
  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }
  if (burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      if (open) groups.forEach(function (g) {            // на телефоне проекты видны сразу
        g.classList.add('is-open');
        g.querySelector('.menu__toggle').setAttribute('aria-expanded', 'true');
      });
    });
  }
  groups.forEach(function (g) {
    var t = g.querySelector('.menu__toggle');
    t.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !g.classList.contains('is-open');
      closeGroups(g);
      g.classList.toggle('is-open', open);
      t.setAttribute('aria-expanded', String(open));
    });
  });
  doc.addEventListener('click', function (e) {
    if (!e.target.closest('.menu__group') && !e.target.closest('.nav__burger')) closeGroups();
    if (nav && nav.classList.contains('is-open') && !e.target.closest('.nav__bar')) closeNav();
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeGroups(); closeNav(); }
  });

  /* ---------- появление блоков при прокрутке ---------- */
  // Проверка по событию прокрутки, а не IntersectionObserver: тот молчит во вкладке без отрисовки
  // (фоновая вкладка, предпросмотр), и блоки оставались невидимыми.
  var items = [].slice.call(doc.querySelectorAll('.reveal'));
  function reveal() {
    var h = window.innerHeight || doc.documentElement.clientHeight;
    items = items.filter(function (el) {
      if (el.getBoundingClientRect().top < h * 0.94) { el.classList.add('is-in'); return false; }
      return true;
    });
    if (!items.length) {
      window.removeEventListener('scroll', reveal);
      window.removeEventListener('resize', reveal);
    }
  }
  if (items.length) {
    window.addEventListener('scroll', reveal, { passive: true });
    window.addEventListener('resize', reveal);
    window.addEventListener('load', reveal);
    window.addEventListener('beforeprint', function () { items.forEach(function (el) { el.classList.add('is-in'); }); });
    reveal();
  }

  /* ---------- чтение документов: страницы PDF картинками в окне ---------- */
  var dataEl = doc.getElementById('docs-data');
  var reader = doc.getElementById('reader');
  if (dataEl && reader && typeof reader.showModal === 'function') {
    var DOCS = JSON.parse(dataEl.textContent);
    var pagesBox = reader.querySelector('.reader__pages');
    var titleEl = reader.querySelector('.reader__title');
    var countEl = reader.querySelector('.reader__count');
    var dl = reader.querySelector('.reader__download');

    var openDoc = function (slug, title) {
      var d = DOCS[slug];
      if (!d) return false;
      pagesBox.innerHTML = '';
      d.pages.forEach(function (size, i) {
        var img = doc.createElement('img');
        img.src = 'assets/docs/' + slug + '/p' + (i + 1) + '.webp';
        img.width = size[0]; img.height = size[1];
        img.alt = title + ' — страница ' + (i + 1) + ' из ' + d.pages.length;
        if (i > 0) img.loading = 'lazy';
        pagesBox.appendChild(img);
      });
      titleEl.textContent = title;
      countEl.textContent = 'страниц: ' + d.pages.length;
      dl.href = 'assets/docs/' + d.file;
      dl.setAttribute('download', d.file);
      reader.showModal();
      pagesBox.scrollTop = 0;
      return true;
    };

    doc.addEventListener('click', function (e) {
      var a = e.target.closest('[data-doc]');
      if (a && openDoc(a.getAttribute('data-doc'), a.getAttribute('data-title') || '')) {
        e.preventDefault();
        history.replaceState(null, '', '#' + a.getAttribute('data-doc'));
      }
    });
    reader.addEventListener('click', function (e) {
      if (e.target === reader || e.target.closest('.reader__close')) reader.close();
    });
    reader.addEventListener('close', function () {
      pagesBox.innerHTML = '';
      history.replaceState(null, '', location.pathname + location.search);
    });
    // прямая ссылка вида dokumenty.html#ustav сразу открывает документ
    var hash = location.hash.slice(1);
    if (hash && DOCS[hash]) {
      var link = doc.querySelector('[data-doc="' + hash + '"]');
      if (link) openDoc(hash, link.getAttribute('data-title') || '');
    }
  }
})();
