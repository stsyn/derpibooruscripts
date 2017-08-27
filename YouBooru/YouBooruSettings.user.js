// ==UserScript==
// @name         YourBooru:Settings
// @namespace    http://tampermonkey.net/
// @include      *://trixiebooru.org/settings
// @include      *://derpibooru.org/settings
// @include      *://www.trixiebooru.org/settings
// @include      *://www.derpibooru.org/settings
// @include      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/settings
// @include      *://*.orzgs6djmvrg633souxg64th.*.*/settings
// @include      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/settings
// @include      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/settings
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js
// @version      0.3
// @description  Feedz
// @author       stsyn
// @grant        none
// ==/UserScript==

(function() {
	'use strict';
	var feedz;
	var config;
	let svd = localStorage._ydb;
	if (svd === undefined) return;
	else {
		try {
			feedz = JSON.parse(svd);
		}
		catch (e) {
			console.log('Cannot get cached feeds');
		}
	}
	svd = localStorage._ydb_config;
	if (svd !== undefined) {
		try {
			config = JSON.parse(svd);
		}
		catch (e) {
			console.log('Cannot get configs');
		}
	}

	function register() {
		let date = new Date();
		let x = localStorage._ydb_main;
		if (x == undefined) x = {};
		else x = JSON.parse(x);
		x.settings = {};
		x.settings.timestamp = date.getTime();
		x.settings.version = GM_info.script.version;
		localStorage._ydb_main = JSON.stringify(x);
	}

	function resetCaches() {
		for (let i=0; i<feedz.length; i++) {
			if (feedz[i] == undefined) continue;
			feedz[i].cachedResp = '';
			feedz[i].saved = 0;
			feedz[i].responsed = 0;
		}
		localStorage._ydb = JSON.stringify(feedz);
	}

	function write() {
		localStorage._ydb = JSON.stringify(feedz);
	}

	function writeConfig() {
		localStorage._ydb_config = JSON.stringify(config);
	}

	function putLine(e, f, i) {
		let l = document.createElement('div');
		if (f == undefined) {
			l.style.display = 'none';
			return;
		}
		let x = document.createElement('span');
		l.style.marginBottom = '.5em';
		x.innerHTML = 'Name ';
		l.appendChild(x);

		x = document.createElement('input');
		x.type = 'text';
		x.value = f.name;
		x.style.width = '15em';
		x.id = i;
		x.className = 'input';
		x.addEventListener('input', function() {feedz[this.id].name = this.value; write();});
		l.appendChild(x);

		x = document.createElement('span');
		x.style.marginLeft = '.5em';
		x.innerHTML = 'Sort ';
		l.appendChild(x);

		x = document.createElement('input');
		x.type = 'text';
		x.value = f.sort;
		x.id = i;
		x.style.width = '5em';
		x.className = 'input';
		x.addEventListener('input', function() {feedz[this.id].sort = this.value; write();});
		l.appendChild(x);

		x = document.createElement('span');
		x.style.marginLeft = '.5em';
		x.innerHTML = 'Direction';
		l.appendChild(x);

		x = document.createElement('input');
		x.type = 'text';
		x.value = f.sd;
		x.id = i;
		x.style.width = '4em';
		x.className = 'input';
		x.addEventListener('input', function() {feedz[this.id].sd = this.value; write();});
		l.appendChild(x);

		x = document.createElement('span');
		x.style.marginLeft = '.5em';
		x.innerHTML = 'Cache (in minutes)';
		l.appendChild(x);

		x = document.createElement('input');
		x.type = 'text';
		x.value = f.cache;
		x.id = i;
		x.style.width = '3em';
		x.className = 'input';
		x.addEventListener('input', function() {feedz[this.id].cache = parseInt(this.value); write();});
		l.appendChild(x);

		x = document.createElement('span');
		x.innerHTML = ' ... or update each (in minutes)';
		l.appendChild(x);

		x = document.createElement('input');
		x.type = 'text';
		x.value = f.ccache;
		x.id = i;
		x.style.width = '4em';
		x.className = 'input';
		x.addEventListener('input', function() {feedz[this.id].ccache = parseInt(this.ccache); write();});
		l.appendChild(x);

		if (i > 0) {
			x = document.createElement('span');
			x.style.marginLeft = '.5em';
			x.style.float = 'right';
			x.classList = 'button';
			x.innerHTML = '<i class="fa fa-arrow-up"></i>';
			x.addEventListener('click',function() {
				var t = feedz[i];
				feedz[i] = feedz[i-1];
				feedz[i-1] = t;
				write();
				location.hash = '#YourBooru';
				location.reload();
			});
			l.appendChild(x);
		}

		/******************/

		x = document.createElement('span');
		x.innerHTML = '<br>Query ';
		l.appendChild(x);

		x = document.createElement('input');
		x.type = 'text';
		x.value = f.query;
		x.id = i;
		x.className = 'input';
		x.style.width = 'calc(100% - 26em)';
		x.addEventListener('input', function() {
			feedz[this.id].query = this.value;
			feedz[this.id].cachedResp = undefined;
			write();
		});
		l.appendChild(x);

		x = document.createElement('span');
		x.innerHTML = ' Double size ';
		l.appendChild(x);

		x = document.createElement('input');
		x.type = 'checkbox';
		x.checked = f.double;
		x.id = i;
		x.addEventListener('click', function() {
			feedz[this.id].double = this.checked;
			feedz[this.id].cachedResp = undefined;
			write();
		});
		l.appendChild(x);

		x = document.createElement('span');
		x.style.marginLeft = '.5em';
		x.style.marginRight = '0';
		x.id = i;
		x.classList = 'button commission__category';
		x.innerHTML = 'Reset cache';
		x.addEventListener('click',function() {
			feedz[this.id].cachedResp = undefined;
			write();
		});
		l.appendChild(x);

		x = document.createElement('span');
		x.style.marginLeft = '.5em';
		x.style.marginRight = '0';
		x.id = i;
		x.classList = 'button commission__category';
		x.innerHTML = 'Delete';
		x.addEventListener('click',function() {
			feedz.splice(this.id, 1);
			write();
			this.parentNode.style.display = 'none';
		});
		l.appendChild(x);

		if (i<feedz.length-1) {
			x = document.createElement('span');
			x.style.marginLeft = '.5em';
			x.style.float = 'right';
			x.classList = 'button';
			x.innerHTML = '<i class="fa fa-arrow-down"></i>';
			x.addEventListener('click',function() {
				var t = feedz[i];
				feedz[i] = feedz[i+1];
				feedz[i+1] = t;
				write();
				location.reload();
			});
			l.appendChild(x);
		}

		e.appendChild(l);
	}

	register();
	let cont = document.createElement('div');
	cont.className = 'block__tab hidden';
	cont.setAttribute('data-tab','YourBooru');
	document.getElementById('js-setting-table').insertBefore(cont, document.querySelector('[data-tab="local"]').nextSibling);

	let tab = document.createElement('a');
	tab.href = '#';
	tab.setAttribute('data-click-tab','YourBooru');
	tab.innerHTML = 'YourBooru';
	document.getElementsByClassName('block__header')[0].appendChild(tab);

	let el;
	let ax = JSON.parse(localStorage._ydb_main);

	el = document.createElement('div');
	el.className = 'block block--fixed block--warning';
	el.innerHTML = 'Settings on this tab are saved in the current browser. They are independent of whether you are logged in or not.<br>Every setting will apply when you change anything.';
	cont.appendChild(el);
	if (ax.feeds != undefined) {
		el = document.createElement('h4');
		el.innerHTML = 'Feeds';
		cont.appendChild(el);

		let el2 = document.createElement('label');
		el2.innerHTML = 'Do not remove watchlist ';
		cont.appendChild(el2);
		el = document.createElement('input');
		el.type = 'checkbox';
		el.checked = config.feeds.doNotRemoveWatchList;
		el.addEventListener('change', function() {config.feeds.doNotRemoveWatchList = this.checked; writeConfig();});
		el2.appendChild(el);

		el2 = document.createElement('p');
		el2.innerHTML = 'Images in each feed: ';
		cont.appendChild(el2);
		el = document.createElement('input');
		el.type = 'text';
		el.value = config.feeds.imagesInFeeds;
		el.style.width = '3em';
		el.className = 'input';
		el.addEventListener('input', function() {config.feeds.imagesInFeeds = parseInt(this.value); writeConfig();});
		el2.appendChild(el);

		el2 = document.createElement('label');
		el2.innerHTML = 'Watch link on the right side ';
		cont.appendChild(el2);
		el = document.createElement('input');
		el.type = 'checkbox';
		el.checked = config.feeds.watchFeedLinkOnRightSide;
		el.addEventListener('change', function() {config.feeds.watchFeedLinkOnRightSide = this.checked; writeConfig();});
		el2.appendChild(el);

		el2 = document.createElement('label');
		el2.innerHTML = '<br>Remove unneeded content from HTML (disable if issues happens (but it will fill up your localStorage!))';
		cont.appendChild(el2);
		el = document.createElement('input');
		el.type = 'checkbox';
		el.checked = config.feeds.optimizeLS;
		el.addEventListener('change', function() {config.feeds.optimizeLS = this.checked; writeConfig();});
		el2.appendChild(el);

		let fel = document.createElement('div');
		cont.appendChild(fel);

		el2 = document.createElement('span');
		el2.classList = 'button';
		el2.innerHTML = 'Add feed';
		el2.addEventListener('click',function() {
			if (feedz != undefined) for (let i=0; i<=feedz.length; i++) {
				if (feedz[i] == undefined) {
					feedz[i] = {
						name:'New feed',
						query:'*',
						sort:'',
						sd:'desc',
						cache:30,
						double:false
					};
					write();
					break;
				}
			}
			location.reload();
		});
		cont.appendChild(el2);

		el2 = document.createElement('span');
		el2.classList = 'button commission__category';
		el2.innerHTML = 'Reset feeds cache';
		el2.style.marginLeft = '1em';
		el2.style.marginRight = '6em';
		el2.addEventListener('click',resetCaches);
		cont.appendChild(el2);

		el2 = document.createElement('input');
		el2.type = 'checkbox';
		el2.id = 'ydb_reset';
		cont.appendChild(el2);

		el2 = document.createElement('span');
		el2.classList = 'button commission__category';
		el2.innerHTML = 'Reset everything';
		el2.style.marginLeft = '.5em';
		el2.style.marginRight = '6em';
		el2.addEventListener('click', function() {
			if (document.getElementById('ydb_reset').checked) {
				feedz = undefined;
				write();
				location.href = '/';
			}
			else {
				alert('Mark checkbox first!');
			}
		});
		cont.appendChild(el2);

		el2 = document.createElement('input');
		el2.type = 'checkbox';
		el2.id = 'ydb_feeds_del';
		cont.appendChild(el2);

		el2 = document.createElement('span');
		el2.classList = 'button commission__category';
		el2.innerHTML = 'I uninstalled YourBooru: Feeds.<br>';
		el2.style.marginLeft = '.5em';
		el2.href = '#';
		el2.addEventListener('click', function() {
			if (document.getElementById('ydb_feeds_del').checked) {
				feedz = undefined;
				write();
				ax.feeds = undefined;
				localStorage._ydb_main = JSON.stringify(ax);
				location.reload();
			}
			else {
				alert('Mark checkbox first!');
			}
		});
		cont.appendChild(el2);

		if (feedz != undefined) {
			for (let i=0; i<feedz.length; i++) if (feedz[i] == undefined) {
				feedz.splice(i,1);
				i--;
			};
			for (let i=0; i<feedz.length; i++) putLine(fel, feedz[i], i);
		}
		else {
			fel.classList.add('block--warning');
			fel.classList.add('block');
			fel.classList.add('block--fixed');
			fel.innerHTML = 'Everything is lost! Please visit derpibooru mainpage to reload default feeds and make everything work again!';
		}
	}
	if (ax.settings != undefined) {
		el = document.createElement('h4');
		el.innerHTML = '&nbsp';
		cont.appendChild(el);
		el = document.createElement('h4');
		el.innerHTML = 'Installed plugins';
		cont.appendChild(el);
		let s = '';
		el = document.createElement('p');
		for (let key in ax) {
			if (key == 'feeds') s+='YourBooru: Feeds ';
			else if (key == 'settings') s+='YourBooru: Settings ';
			else s+='id='+key+' ';

			s+='ver. '+ax[key].version;
			s+='<br>';
		}
		el.innerHTML =s;
		cont.appendChild(el);
	}
	let hh = function () {
		if (location.hash!='') {
			let t = location.hash.slice(1);
			if (document.querySelector('a[data-click-tab="'+t+'"]') != null) document.querySelector('a[data-click-tab="'+t+'"]').click();
		}
	};

	for (let i=0; i<document.getElementsByClassName('block__header')[0].childNodes.length; i++) {
		document.getElementsByClassName('block__header')[0].childNodes[i].href = '#'+document.getElementsByClassName('block__header')[0].childNodes[i].getAttribute('data-click-tab');
		document.getElementsByClassName('block__header')[0].childNodes[i].addEventListener('click', function(e) {location.hash = e.target.href.split('#')[1];});
	}
	setTimeout(hh, 500);
})();
