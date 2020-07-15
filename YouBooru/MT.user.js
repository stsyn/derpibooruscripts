// ==UserScript==
// @name         YDB:MT
// @version      0.1.15
// @author       stsyn

// @include      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/adverts\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*\.json.*/

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/CreateElement.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/MT.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/MT.user.js

// @grant        unsafeWindow
// @grant        GM_addStyle
// ==/UserScript==

// if you can't find any info about this, then you don't need it.

(function() {
  'use strict';

  let debug = function(id, value, level) {
    try {
      unsafeWindow._YDB_public.funcs.log(id, value, level);
    }
    catch(e) {
      let levels = ['.', '?', '!'];
      console.log('['+levels[level]+'] ['+id+'] '+value);
    }
  };

  let id = parseInt(location.pathname.slice(1));
  if (isNaN(id)) {
    id = location.pathname.split('/');
    if (id[1] == 'images');
    id = parseInt(id[2]);
  }

  function fetchJson(verb, endpoint, body) {
    const data = {
      method: verb,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': unsafeWindow.booru.csrfToken,
      },
    };

    if (body) {
      body._method = verb;
      data.body = JSON.stringify(body);
    }

    return fetch(endpoint, data);
  }

  function ajaxDupes() {
    const container = document.querySelector('.grid.grid--dupe-report-list');
    if (container) {
      container.querySelectorAll('.grid--dupe-report-list__cell:not(.hide-desktop)').forEach((c, i) => {
        c.dataset.index = i;
        c.querySelectorAll('a[data-method="post"][href*="reject"]').forEach(item => {
          item.addEventListener('click', e => {
            e.stopPropagation();
            e.preventDefault();
            const elem = e.target.closest('a');
            fetchJson('POST',elem.href)
              .then(response => {
              const parent = elem.closest('.grid--dupe-report-list__cell');
              const ix = parseInt(parent.dataset.index);
              for (let k = parseInt(ix/4)*4; k<parseInt(ix/4)*4+4; k++) {
                container.getElementsByClassName('grid--dupe-report-list__cell')[k].classList.add('hide-desktop');
                container.getElementsByClassName('grid--dupe-report-list__cell')[k].classList.add('hide-mobile');
              }
            })

          });
        });
      });
    }
  }

  function syncDupesDespoil() {
    const container = document.querySelector('.grid.grid--dupe-report-list:not(._ydb_sync_patched)');
    const FireEvent = function (Element, EventName) {
      if (Element) {
        if (Element.fireEvent) {
          Element.fireEvent('on' + EventName);
        }
        else {
          const evObj = document.createEvent('Events');
          evObj.initEvent(EventName, true, false);
          Element.dispatchEvent(evObj);
        }
      }
    }

    let despoil = function (e, type) {
      let parent = e.target.closest('.grid--dupe-report-list__cell');
      if (parent.dataset.index % 4 == 0) parent = parent.nextSibling;
      else parent = parent.previousSibling;
      if (parent.querySelector('.media-box__overlay.js-spoiler-info-overlay').innerHTML == '' ||
          (!!parent.querySelector('.media-box__overlay.js-spoiler-info-overlay.hidden') ^ type == 'mouseleave')) return;
      setTimeout(function() {FireEvent(parent.querySelector('.image-container a'), type);}, 1);
    };

    if (container) {
      container.querySelectorAll('.grid--dupe-report-list__cell:not(.hide-desktop)').forEach((c, i) => {
        c.dataset.index = i;
        for (let j=0; j<c.querySelectorAll('.image-container').length; j++) {
          const el = c.querySelectorAll('.image-container')[j];
          if (unsafeWindow.booru.spoilerType == 'click') el.querySelector('a').addEventListener('click', e => despoil(e, 'click'));
          if (unsafeWindow.booru.spoilerType == 'hover') el.querySelector('a').addEventListener('mouseenter', e => despoil(e, 'mouseenter'));
          el.querySelector('a').addEventListener('mouseleave', e => despoil(e, 'mouseleave'));

          if (!isNaN(id) && parseInt(el.dataset.imageId) == id && c.querySelector('a[data-method="post"] .button')) {
            c.querySelector('a[data-method="post"] .button').innerHTML = '<i class="fa fa-arrow-down"></i> Keep This';
          }
        }
      });
      container.classList.add('_ydb_sync_patched');
    }
    setTimeout(syncDupesDespoil, 500);
  }

  function fixDupes() {
    document.querySelectorAll('.grid.grid--dupe-report-list:not(._ydb_patched)').forEach(ts => {
      let incomplete = false;
      ts.querySelectorAll('.image-container.thumb_small').forEach(es => {
        const p = es.querySelector('picture img');
        if (p) {
          if (p.src.indexOf('derpicdn.net/assets/1x1') > -1) {
            incomplete = true;
            return;
          }
        }
        es.querySelector('a').style.lineHeight = '150px';
        es.style.minWidth = '150px';
        es.style.minHeight = '150px';
      });
      if (!incomplete) ts.classList.add('_ydb_patched');
    });
    setTimeout(fixDupes, 500);
  }

  function error(name, e) {
    debug('YDB:MT',name+' crashed during startup. '+e.stack,2);
  }

  function hideTools() {
    let styleElem;
    document.addEventListener('keydown', e => {
      if (e.keyCode == 72) {
        if (!(e.altKey || e.ctrlKey || e.metaKey || "INPUT" === document.activeElement.tagName || "TEXTAREA" === document.activeElement.tagName)) {
          if (styleElem) styleElem.media = 'all';
          else styleElem = GM_addStyle('.js-staff-action{display:none !important}');
        }
      }
    });
    document.addEventListener('keyup', e => {
      if (e.keyCode == 72) {
        if (!(e.altKey || e.ctrlKey || e.metaKey || "INPUT" === document.activeElement.tagName || "TEXTAREA" === document.activeElement.tagName))
          styleElem.media = 'none';
      }
    });
  }

  function isThingReported(target) {
    const m = document.querySelector('a[href="/admin/reports"]');
    if (!m) return;

    //image
    let c = document.querySelector('.block__tab[data-tab="administration"]');
    if (c) {
      c.insertBefore(createElement('a',{href:'/admin/reports?rq=image_id%3A'+id+'&commit=Search',style:'margin-bottom:4px;display:inline-block'}, 'Show reports regarding this image'), c.firstChild);
    }

    //more to come
  }

  function fixPollCount() {
    let voteTab, adminTab, loadButton, container, recalcButton, recalcFromField, recalcFrom, onlyArtists, onlyActive;
    let voters = new Set();

    async function filterByJoinDate() {
      let progressBar;

      function nameEncode(name) {
        function makeSlug(name) {
          return name.replace(/\-/g,'-dash-').replace(/\+/g,'-plus-').replace(/\:/g,'-colon-').replace(/\./g,'-dot-').replace(/\//g,'-fwslash-').replace(/\\/g,'-bwslash-').replace(/ /g,'+');
        }
        return encodeURI(makeSlug(name)).replace(/\&lt;/g,'%3C').replace(/\#/,'%23').replace(/%/g, '%25');
      }

      function getData(name) {
        return fetch('/profiles/' + nameEncode(name))
        .then(resp => resp.text())
        .then(resp => {
          const container = createElement('div', {innerHTML: resp});
          return {
            name,
            active: !!container.querySelector('.table--stats__sparkline svg rect:nth-child(-n+60):not([height="0"])'),
            artist: !!container.querySelector('.tag_list .tag[data-tag-category="origin"]'),
            joinDate: new Date(container.getElementsByTagName('time')[0].dateTime)
          }
        })
      }

      function recalc() {
        recalcFrom = new Date(recalcFromField.value);
        Array.from(container.querySelectorAll('.interaction-user-list-item')).forEach(item => {
          const userData = castedData2.find(i => item.innerText.trim() === i.name);
          if (!userData || userData.joinDate > recalcFrom) item.classList.add('discarded');
          else if (userData && onlyActive.checked && !userData.active) item.classList.add('discarded');
          else if (userData && onlyArtists.checked && !userData.artist) item.classList.add('discarded');
          else item.classList.remove('discarded');
        });
        voters = new Set();
        countVotes();
      }

      voteTab.appendChild(progressBar = createElement('div'))

      loadButton.style.display = 'none';
      const castedData1 = Array.from(voters)
      //.filter((_, i) => i < 20);
      const castedData2 = [];

      for (let i = 0; i < castedData1.length; i++) {
        const name = castedData1[i];
        castedData2.push(await getData(name))
        progressBar.innerHTML = ((i + 1) * 100 / castedData1.length).toFixed(2) + '%';
      }
      progressBar.style.display = 'none';

      voteTab.appendChild(createElement('div', [
        recalcButton = createElement('button.button.button--state-warning.js-staff-action', {events: {click: recalc}}, 'Consider only votes from accounts older than '),
        ' ',
        recalcFromField = createElement('input.input', { type: 'date' }),
        ' Count only active between 90-30 days ago: ',
        onlyActive = createElement('input', { type: 'checkbox' }),
        ' Count only artists: ',
        onlyArtists = createElement('input', { type: 'checkbox' })
      ]));
      console.warn(castedData2);
    }

    function countVotes() {
      Array.from(container.querySelectorAll('.interaction-user-list-item:not(.discarded)')).forEach(item => voters.add(item.innerText.trim()));
      const totalCount = Array.from(voters).length;

      Array.from(voteTab.getElementsByClassName('poll-option-list')[0].childNodes).forEach(voteItem => {
        const countContainer = voteItem.getElementsByClassName('poll-option__counts')[0];
        if (countContainer) {
          let hasYourSelf = false;
          const optionName = voteItem.getElementsByClassName('poll-option__label')[0].innerText.trim();

          const anchor = Array.from(container.getElementsByTagName('h5')).find(item => item.innerText.trim() === optionName);
          let nextVoter = anchor.nextSibling;
          let count = 0;
          while (nextVoter && nextVoter.classList.contains('interaction-user-list-item')) {
            if (!nextVoter.classList.contains('discarded')) {
              if (nextVoter.innerText.trim() === unsafeWindow.booru.userName) hasYourSelf = true;
              count++;
            }
            nextVoter = nextVoter.nextSibling;
          }

          const percentage = count / totalCount * 100;
          clearElement(countContainer);
          fillElement(countContainer, [
            ['span', [
              ['b', percentage.toFixed(2)],
              '% ',
              ['strong', `${count}/${totalCount}`],
              ` vote${count === 1 ? '' : 's'}`
            ]
            ]]);
          voteItem.getElementsByClassName('poll-bar__image')[0].style.width = percentage + '%';
          voteItem.getElementsByClassName('poll-bar__image')[0].style.opacity = hasYourSelf ? '1' : '0.6';
        } else {
          // ended
          if (voteItem.lastChild.nodeValue.match(/with (\d+)/)) {
            const totalVotes = voteItem.lastChild.nodeValue.match(/with (\d+)/)[1];
            voteItem.lastChild.nodeValue = ` with ${totalVotes} votes (${totalCount} voters).`;
          }
          // in process
          else if (voteItem.lastChild.nodeValue.match(/\. (\d+)/)) {
            const totalVotes = voteItem.lastChild.nodeValue.match(/\. (\d+) votes/)[1];
            voteItem.lastChild.nodeValue = `. ${totalVotes} votes (${totalCount} voters) cast.`;
          }
        }
      });
    }

    if ((voteTab = document.querySelector('[data-tab="voting"]')) && (adminTab = document.querySelector('[data-tab="voters"]'))) {
      fetch(location.pathname + '/poll/votes')
      .then(resp => resp.text())
      .then(resp => {
        container = createElement('div', {innerHTML: resp});
        countVotes();

        voteTab.appendChild(loadButton = createElement('button.button.button--state-warning.js-staff-action', {events: {click: filterByJoinDate}}, 'Gain data for join date split'));
      })
    }
  }

  function handleAliases() {
    const href = location.pathname.split('/');
    if (!(href.pop() === 'aliases')) return;
    const profileUrl = href.pop();

    const now = new Date();
    const recentString = (now.getFullYear() - 1).toString() + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + (now.getDate()).toString().padStart(2, '0');
    const methods = ['IP + FP', 'IP', 'FP'];
    const container = document.getElementById('content');
    const renderPlace = createElement('div');
    const parser = new DOMParser();
    const userUrlCache = new Map();
    let renderPlaceData = [];

    function prepareRenderPlace() {
      renderPlaceData = methods.map((name, index) => {
        let areaTop, areaHidden;
        renderPlace.appendChild(createElement('div', [
          ['h4', name],
          ['table.table', [
            renderTableHead(),
            areaTop = createElement('tbody')]
          ],
          ['input.toggle-box', {id: '_alias_'+index, type: 'checkbox'}],
          ['label', {for: '_alias_'+index}, 'Older collisions'],
          ['div.toggle-box-container', [
            ['table.table', [
              renderTableHead(),
              areaHidden = createElement('tbody')]
            ]
          ]]
        ]));
        return {areaTop, areaHidden}
      });
    }

    function renderTableHead() {
      return ['thead', [
        ['tr', [
          ['td', 'User'],
          ['td', 'Creation Date'],
          ['td', 'Ban Status'],
          ['td', 'IP Collision Date'],
          ['td', 'FP Collision Date'],
        ]]
      ]];
    }

    function makeTableLine(item) {
      return createElement('tr', [item.user, item.date, item.ban, ['td', item.ipCollision], ['td', item.fpCollision]]);
    }

    function renderData(data) {
      data.reduce((acc, item) => {
        const methodId = methods.indexOf(item.method);
        if (methodId === -1) methodId = 2;
        acc[methodId].push(item);
        return acc;
      }, [[], [], []])
        .forEach((items, index) => {
        const listing = items.sort((a, b) => {
          if (a.ipCollision < b.ipCollision) return 1;
          if (a.ipCollision > b.ipCollision) return -1;
          if (a.fpCollision < b.fpCollision) return 1;
          if (a.fpCollision > b.fpCollision) return -1;
          const timeA = a.date.childNodes[0].dateTime;
          const timeB = b.date.childNodes[0].dateTime;
          if (timeA < timeB) return 1;
          if (timeA > timeB) return -1;
          return 0;
        }).reduce((acc, item) => {
          if ((!item.ipCollision || item.ipCollision.split('/') < recentString) &&
             (!item.fpCollision || item.fpCollision.split('/') < recentString)) {
            acc[1].push(item);
          }
          else acc[0].push(item);
          return acc;
        }, [[], []]).map(itemGroup => {
          return itemGroup.map(makeTableLine);
        });
        const areaTop = renderPlaceData[index].areaTop;
        const areaHidden = renderPlaceData[index].areaHidden;
        clearElement(areaTop);
        clearElement(areaHidden);
        fillElement(areaTop, listing[0]);
        fillElement(areaHidden, listing[1]);
      });
    }

    const lines = Array.from(container.querySelectorAll('tbody tr')).map(item => {
      const data = {
        user: item.childNodes[0],
        userName: item.childNodes[0].innerText,
        method: item.childNodes[1].innerText,
        date: item.childNodes[2],
        ban: item.childNodes[3],
        ipCollision: item.childNodes[1].innerText.includes('IP') ? 'loading...' : '',
        fpCollision: item.childNodes[1].innerText.includes('FP') ? 'loading...' : ''
      };

      userUrlCache.set(data.user.childNodes[0].href.split('/').pop(), data);

      return data;
    });

    function collisionParse(content, field) {
      Array.from(content.querySelectorAll('#content>ul>li')).forEach(item => {
        if (item.querySelectorAll('ul>li').length > 1) {
          const originCollision = item.querySelector(`li>a[href*="profiles/${profileUrl}"]`).parentNode.querySelector('time').dateTime.split('T')[0];
          Array.from(item.querySelectorAll('ul>li')).forEach(line => {
            const userUri = line.querySelector('a').href.split('/').pop();
            if (userUri === profileUrl) return;
            if (userUrlCache.get(userUri)[field] == 'loading...' || userUrlCache.get(userUri)[field].split('/').pop() < originCollision) {
              userUrlCache.get(userUri)[field] = originCollision + '/' + line.querySelector('time').dateTime.split('T')[0];
            }
          });
        }
      });
      renderData(lines);
    }

    fetchJson('GET', `/profiles/${profileUrl}/ip_history`)
    .then(response => response.text())
    .then(resp => {
      const doc = createElement('div', {innerHTML: resp});
      collisionParse(doc, 'ipCollision');
    });
    fetchJson('GET', `/profiles/${profileUrl}/fp_history`)
    .then(response => response.text())
    .then(resp => {
      const doc = createElement('div', {innerHTML: resp});
      collisionParse(doc, 'fpCollision');
    });

    prepareRenderPlace();
    container.removeChild(container.querySelector('table'));
    container.appendChild(renderPlace);
    renderData(lines);
  }

  try {ajaxDupes();} catch(e) {error("ajaxDupes", e)};
  setTimeout(() => {try {fixDupes();} catch(e) {error("fixDupes", e)};}, 300);
  setTimeout(() => {try {syncDupesDespoil();} catch(e) {error("syncDupesDespoil", e)};}, 300);
  try {hideTools();} catch(e) {error("hideTools", e)};
  try {isThingReported();} catch(e) {error("isThingReported", e)};
  try {handleAliases();} catch(e) {error("handleAliases", e)};
  try {fixPollCount();} catch(e) {error("fixPollCount", e)};
})();
