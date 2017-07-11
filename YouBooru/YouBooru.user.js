// ==UserScript==
// @name         YourBooru
// @namespace    http://tampermonkey.net/
// @include      *://trixiebooru.org/
// @include      *://derpibooru.org/
// @include      *://www.trixiebooru.org/
// @include      *://www.derpibooru.org/
// @include      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/
// @include      *://*.orzgs6djmvrg633souxg64th.*.*/
// @include      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/
// @include      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooru.user.js
// @version      0.2
// @description  Feedz
// @author       stsyn
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
	'use strict';
	var data={};
	var config = {
		/* How many images are showing in the each feed on the derpibooru main page */
		imagesInFeeds:6,
		/* Keep vanilla watchlist on the top of the page */
		doNotRemoveWatchList:true,
		/* Trying to keep image controls alive. But it works ugly :c */
		doNotRemoveControls:true,
		/* This one is pretty clear */
		watchFeedLinkOnRightSide:true,
		/* Removing unneeded content from HTML. Disable if you meet some problems or if you just want to shit up your localstorage */
		optimizeLS:true
	};

	/*
       Please install YourBooruSettings to adjust feeds in normal way.
       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js
    */
	var feedz = [
		{
			name:'Hot',
			query:'created_at.gte:6 hours ago',
			sort:'score',
			sd:'desc',
			cache:5
		},
		{
			name:'Fresh ponuts every day',
			query:'ponut',
			sort:'',
			sd:'desc',
			cache:30
		},
		{
			name:'Your cat\'s derpibooru',
			query:'cat || cat lingerie || behaving like a cat',
			sort:'',
			sd:'desc',
			cache:30
		},
		{
			name:'That day in history',
			query:'__ydb_LastYears',
			sort:'score',
			sd:'desc',
			cache:0,
			ccache:1440
		},
		{
			name:'Watch it again',
			query:'my:watched, created_at.lte:1 years ago',
			sort:'random',
			sd:'desc',
			cache:5
		},
		{
			name:'Recently uploaded',
			query:'*',
			sort:'',
			sd:'desc',
			cache:0,
			ccache:0
		}
	];

	/********************

	Please, stop there

	 ********************/


	function resizeEverything() {
		let ccont = document.getElementsByClassName('column-layout__main')[0];
		let mwidth = parseInt(ccont.clientWidth) - 14;
		let twidth = parseInt(mwidth/config.imagesInFeeds-8);
		for (let i=0; i<document.getElementsByClassName('_ydb_resizible').length; i++) {
			document.getElementsByClassName('_ydb_resizible')[i].getElementsByClassName('media-box__header')[0].style.width = twidth+'px';
			document.getElementsByClassName('_ydb_resizible')[i].getElementsByClassName('media-box__content--large')[0].style.width = twidth+'px';
			document.getElementsByClassName('_ydb_resizible')[i].getElementsByClassName('media-box__content--large')[0].style.height = twidth+'px';
			if (twidth < 240) {
				document.getElementsByClassName('_ydb_resizible')[i].getElementsByClassName('media-box__header')[0].classList.add('media-box__header--small');
			}
			else {
				document.getElementsByClassName('_ydb_resizible')[i].getElementsByClassName('media-box__header')[0].classList.remove('media-box__header--small');
			}
		}
	}

	function preRun() {
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
		for (let i=0; i<feedz.length; i++) if (feedz[i] != null) feedz[i].loaded = false;
	}

	function postRun() {
		resizeEverything();
		localStorage._ydb = JSON.stringify(feedz);
	}

	/*********************************/

	function getYearsQuery() {
		let date = new Date();
		let c = '(';
		let cc = 'created_at:';
		for (let i = date.getFullYear() - 1; i>2011; i--)
			c+=(c==='('?'':' || ')+cc+i+'-'+((date.getMonth()+1)<10?('0'+(date.getMonth()+1)):(date.getMonth()+1))+'-'+(date.getDate()<10?('0'+date.getDate()):date.getDate());
		return c+')';
	}

	function getNotSeenYetQuery(f) {
		let gc = f.saved;
		if (gc == undefined) gc = 0;
		gc*=60000;
		let t = new Date(gc);
		return '(created_at.gte:'+t.toISOString()+')';
	}

	function getNotSeenYetQueryNoNew(f) {
		let gc = f.saved;
		if (gc == undefined) gc = 0;
		gc*=60000;
		let t = new Date(gc);
		let t2 = new Date();
		return '(created_at.gte:'+t.toISOString()+', created_at.lte:'+t2.toISOString()+')';
	}

	function customQueries(f) {
		let tx = f.query.replace('__ydb_LastYears', getYearsQuery());
		tx = tx.replace('__ydb_SinceLeavedNoNew', getNotSeenYetQueryNoNew(f));
		tx = tx.replace('__ydb_SinceLeaved', getNotSeenYetQuery(f));
		return tx;
	}

	/*********************************/

	function compileURL(f) {
		let tx = customQueries(f);
		return '/search?q='+encodeURIComponent(tx.replace(new RegExp(' ','g'),'+')).replace(new RegExp('%2B','g'),'+')+'&sf='+f.sort+'&sd='+f.sd;
	}

	function compileJSONURL(f) {
		let tx = customQueries(f);
		return '/search.json?q='+encodeURIComponent(tx.replace(new RegExp(' ','g'),'+')).replace(new RegExp('%2B','g'),'+')+'&sf='+f.sort+'&sd='+f.sd;
	}

	function getFeed(feed) {
		let req = new XMLHttpRequest();
		req.feed = feed;
		req.onreadystatechange = readyHandler(req);
		req.open('GET', compileURL(feed));
		req.send();
	}

	function spoiler(event) {
		if ((event.target.width==1) && (event.target.height==1)) {
			let x = event.target.parentNode.parentNode.parentNode;
			let spx = JSON.parse(x.getAttribute('data-image-tags'));
			let fls = data.spoilers;
			let mx = 0;
			let n = '', s = '';
			for (let i=0; i<spx.length; i++) {
				for (let j=0; j<fls.length; j++) {
					if (spx[i] == fls[j]) {
						if (localStorage['bor_tags_'+spx[i]] != undefined) {
							let u = JSON.parse(localStorage['bor_tags_'+spx[i]]);
							let a = u.images;
							if (a > mx) {
								mx = a;
								n += (n==''?'':', ')+u.name;
								s = u.spoiler_image_uri;
							}
						}
					}
				}
			}
			let ux = x.querySelector('.media-box__overlay.js-spoiler-info-overlay');
			ux.classList.remove('hidden');
			ux.innerHTML = n;
			if (data.spoilerType == 'off') {
				ux.classList.add('hidden');
				event.target.src = x.getAttribute('data-thumb');
			}
			else {
				if (s == null) s = '/tagblocked.svg';
				event.target.src = s;
				event.target.style.position = 'absolute';
				event.target.style.left = '0';
				event.target.style.top = '0';
				if (data.spoilerType != 'static') {
					let ac = data.spoilerType;
					if (ac == 'hover') ac = 'mouseenter'; 
					event.target.addEventListener(ac, function(e) {
						if (!ux.classList.contains('hidden')) {
							this.style.position = 'static';
							this.spoiler = this.src;
							this.src = x.getAttribute('data-thumb');
							ux.classList.add('hidden');
							e.preventDefault();
						}
					});
					event.target.addEventListener('mouseleave', function(e) {
						if (ux.classList.contains('hidden')) {
							this.style.position = 'absolute';
							this.src = this.spoiler;
							ux.classList.remove('hidden');
						}
					});
				}
			}
		}
	}

	function readyHandler(request) {
		return function () {
			if (request.readyState === 4) {
				if (request.status === 200) return parse(request);
				else if (request.status === 0) {
					console.log ('[YDB]: Server timeout');
					return false;
				}
				else {
					console.log ('[YDB]: Response '+request.status);
					return false;
				}
			}
		};
	}

	function parse(r) {
		r.feed.temp.innerHTML = r.responseText;
		let votes =r.feed.temp.querySelector('.js-datastore').getAttribute('data-interactions');
		if (votes !== undefined) votes = JSON.parse(votes);

		let pc = r.feed.temp.querySelector('.block__content.js-resizable-media-container');
		let c = r.feed.container;
		let mwidth = parseInt(cont.clientWidth) - 14;
		let twidth = parseInt(mwidth/config.imagesInFeeds-8);

		if (pc === null) c.innerHTML = 'Empty feed';
		else for (let i=0; i<config.imagesInFeeds; i++) {
			let elem = pc.childNodes[0];
			if (elem == null) break;
			if (!config.doNotRemoveControls) elem.getElementsByClassName('media-box__header')[0].style.display = 'none';

			let act = 'nope';
			let faved = false;
			for (let j=0; j<votes.length; j++) {
				if (votes[j].image_id == elem.querySelector('.media-box__content .image-container').getAttribute('data-image-id')) {
					if (votes[j].interaction_type == 'voted') {
						if (votes[j].value == 'up') act = 'up';
						else if (votes[j].value == 'down') act = 'down';
					}
					if (votes[j].interaction_type == 'faved') faved = true;
				}
			}

			if (act == 'up') elem.querySelector('.media-box__header .interaction--upvote').classList.add('active');
			else if (act == 'down') elem.querySelector('.media-box__header .interaction--downvote').classList.add('active');
			if (faved) elem.querySelector('.media-box__header .interaction--fave').classList.add('active');

			if (config.optimizeLS) {
				let temp = (JSON.parse(elem.querySelector('.media-box__content .image-container').getAttribute('data-uris'))).thumb_small;
				elem.querySelector('.media-box__content .image-container').setAttribute('data-thumb', temp);
				elem.querySelector('.media-box__content .image-container').removeAttribute('data-download-uri');
				elem.querySelector('.media-box__content .image-container').removeAttribute('data-image-tag-aliases');
				elem.querySelector('.media-box__content .image-container').removeAttribute('data-orig-sha512');
				elem.querySelector('.media-box__content .image-container').removeAttribute('data-sha512');
				elem.querySelector('.media-box__content .image-container').removeAttribute('data-source-url');
				elem.querySelector('.media-box__content .image-container').removeAttribute('data-uris');
				elem.querySelector('.media-box__content .image-container').removeAttribute('data-aspect-ratio');
				elem.querySelector('.media-box__content .image-container').removeAttribute('data-created-at');
				if (elem.querySelector('.media-box__content .image-container img') !== null) elem.querySelector('.media-box__content .image-container img').removeAttribute('alt');
			}

			elem.classList.add('_ydb_resizible');
			if (elem.querySelector('.media-box__content .image-container.thumb a img') !== null) elem.querySelector('.media-box__content--large .image-container.thumb a img').onload = spoiler;
			if (twidth < 240) {
				elem.getElementsByClassName('media-box__header')[0].classList.add('media-box__header--small');
			}
			c.appendChild(pc.childNodes[0]);
		}

		let date = new Date();
		r.feed.cachedQuery = compileURL(r.feed);
		r.feed.url.href = r.feed.cachedQuery;
		r.feed.temp.innerHTML = '';
		r.feed.loaded = true;
		r.feed.responsed = config.imagesInFeeds;

		r.feed.cachedResp = c.innerHTML;
		r.feed.saved = parseInt(date.getTime() / 60000);
		for (let i=0; i<feedz.length; i++) if (feedz[i] != null) if (!feedz[i].loaded) return;
		postRun();
	}

	function fillParsed(feed) {
		let c = feed.container;
		if ((feed.cachedResp == null) || (feed.cachedResp == 'Empty feed')) c.innerHTML = 'Empty feed';
		else {
			c.innerHTML = feed.cachedResp;
			for (let i=0; i<c.childNodes.length; i++) {
				let elem = c.childNodes[i];
				if (elem.querySelector('.media-box__content .image-container.thumb a img') !== null) elem.querySelector('.media-box__content--large .image-container.thumb a img').onload = spoiler;
			}
		}
		feed.temp.innerHTML = '';
		feed.loaded = true;
		feed.url.href = feed.cachedQuery;
		for (let i=0; i<feedz.length; i++) if (feedz[i] != null) if (!feedz[i].loaded) return;
		postRun();
	}

	function init()
	{
		let i;
		data.spoilerType = document.getElementsByClassName('js-datastore')[0].getAttribute('data-spoiler-type');
		data.spoilers = JSON.parse(document.getElementsByClassName('js-datastore')[0].getAttribute('data-spoilered-tag-list'));
		preRun();
		cont.style.minWidth = 'calc(100% - 338px)';
		if (cont.childNodes.length == 1) config.hasWatchList = false;
		else config.hasWatchList = true;
		for (i=0; i<(config.doNotRemoveWatchList?1:2); i++) cont.childNodes[i].style.display = 'none';

		let ptime = new Date();
		ptime = parseInt(ptime.getTime()/60000);
		for (i=0; i<feedz.length; i++) {
			let f = feedz[i];
			if (f == null) continue;
			let elem = document.createElement('div');
			elem.className = 'block';
			let head = document.createElement('div');
			head.className = 'block__header';
			let title = document.createElement('span');
			title.className = 'block__header__title';
			title.innerHTML = f.name;
			head.appendChild(title);
			
			f.url = document.createElement('a');
			if (config.watchFeedLinkOnRightSide) f.url.style.float = 'right';
			let ie = document.createElement('i');
			ie.className = 'fa fa-eye';
			f.url.appendChild(ie);
			let ut = document.createElement('span');
			ut.className = 'hide-mobile';
			ut.innerHTML = ' Watch feed';
			f.url.appendChild(ut);
			head.appendChild(f.url);
			
			elem.appendChild(head);
			let container = document.createElement('div');
			container.className = 'block__content js-resizable-media-container';
			f.container = container;
			elem.appendChild(container);
			let shitcontainer = document.createElement('div');
			shitcontainer.style.display = 'none';
			feedz[i].temp = shitcontainer;
			elem.appendChild(shitcontainer);
			cont.appendChild(elem);
			
			f.reload = document.createElement('a');
			if (config.watchFeedLinkOnRightSide) f.reload.style.float = 'right';
			let ie2 = document.createElement('i');
			ie2.className = 'fa';
			ie2.innerHTML = '';
			f.reload.appendChild(ie2);
			let ut2 = document.createElement('span');
			ut2.className = 'hide-mobile';
			ut2.innerHTML = ' Reload feed';
			f.reload.appendChild(ut2);
			head.appendChild(f.reload);
			f.reload.addEventListener('click', function() {
				f.cachedResp = undefined;
				f.saved = 0;
				f.container.innerHTML = '';
				getFeed(f);
			});

			if (f.cachedResp == undefined) getFeed(f);
			else if (ptime > (f.saved+feedz[i].cache))
			{
				if ((f.ccache !== undefined) && (f.ccache>0)) {
					if (parseInt(ptime/f.ccache) > parseInt(f.saved/f.ccache)) getFeed(f);
					else fillParsed(f);
				}
				else getFeed(f);
			}
			else if (config.imagesInFeeds != feedz[i].responsed) getFeed(f);
			else if (f.cachedQuery == undefined) getFeed(f);
			else fillParsed(f);
		}

		window.addEventListener("resize", resizeEverything);
		if (config.doNotRemoveWatchList && config.hasWatchList) cont.appendChild(cont.childNodes[1]);
	}
	var cont = document.getElementsByClassName('column-layout__main')[0];
	setTimeout(init, 222);
})();
