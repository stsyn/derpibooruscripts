// ==UserScript==
// @name         DB Badges
// @version      0.0
// @author       stsyn
// @include      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*\/awards\/new/
// @require      https://github.com/stsyn/createElement/raw/master/min/es5.js
// ==/UserScript==

(function() {
  'use strict';

  const badges = [
    268, // philo
    269, // baloon
  ];

  const container = document.getElementById('content');
  const select = document.getElementById('award_badge_id');
  const hint = document.getElementById('award_label');
  container.insertBefore(createElement('div', {style: {marginBotton: '3px'}}, badges.map(id => {
    const option = select.querySelector(`option[value="${id}"]`);
    return ['button.button', { onclick: () => {
      select.value = id;
      hint.value = option.dataset.setValue || ''; } }, option.innerText]
  })), container.querySelector('form'));
})();
