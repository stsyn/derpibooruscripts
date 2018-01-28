// ==UserScript==
// @name         YourBooru:Feeds
// @namespace    http://tampermonkey.net/

// @include      *://trixiebooru.org/*
// @include      *://derpibooru.org/*
// @include      *://www.trixiebooru.org/*
// @include      *://www.derpibooru.org/*
// @include      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/*
// @include      *://*.orzgs6djmvrg633souxg64th.*.*/*
// @include      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/*
// @include      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/*

// @exclude      *://trixiebooru.org/adverts/*
// @exclude      *://derpibooru.org/adverts/*
// @exclude      *://www.trixiebooru.org/adverts/*
// @exclude      *://www.derpibooru.org/adverts/*
// @exclude      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude      *://*.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*
// @exclude      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooru.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooru.user.js
// @version      0.4.20
// @description  Feedz
// @author       stsyn
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
	'use strict';
	let privated = false;
	var data={};

	/*
       Please install YourBooru:Settings to adjust feeds and settings in normal way.
       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js

	   These configs work from this place until you install YourBooru:Settings
    */

	var config = {
		/* Enable if you need to override YourBooru:Settings */
		/* Deprecated since 0.4 */
		//forceScriptConfig:false,
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
	var feedz = [
		{
			name:'Hot',
			query:'first_seen_at.gte:6 hours ago',
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
			query:'__ydb_LastYearsAlt',
			sort:'score',
			sd:'desc',
			cache:0,
			ccache:1440
		},
		{
			name:'Watch it again',
			query:'my:watched, first_seen_at.lte:1 years ago',
			sort:'random',
			sd:'desc',
			cache:5
		},
		{
			name:'Upvoted',
			query:'my:upvotes',
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
			ccache:0,
			double:true
		}
	];

	var feedzCache = [];
	var feedzURLs = [];
	var f_s_c;
	var debug;

	/********************

	Please, stop there

	 ********************/

    function parseURL(url) {
		var a = document.createElement('a');
		a.href = url;
		return {
			source: url,
			protocol: a.protocol.replace(':',''),
			host: a.hostname,
			port: a.port,
			query: a.search,
			params: (function(){
				var ret = {},
					seg = a.search.replace(/^\?/,'').split('&'),
					len = seg.length, i = 0, s;
				for (;i<len;i++) {
					if (!seg[i]) { continue; }
					s = seg[i].split('=');
					ret[s[0]] = s[1];
				}
				return ret;
			})(),
			file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
			hash: a.hash.replace('#',''),
			path: a.pathname.replace(/^([^\/])/,'/$1'),
			relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
			segments: a.pathname.replace(/^\//,'').split('/')
		};
	}

	function resetCache(module, element) {
		let id = element.parentNode.dataset.id;
		let svd = localStorage._ydb_caches;
		if (svd !== undefined) {
			try {
				let cache = JSON.parse(svd);
				cache[id] = undefined;
				localStorage._ydb_caches = JSON.stringify(cache);
			}
			catch (e) {}
		}
	}

	function register() {
		if (window._YDB_public == undefined) window._YDB_public = {};
		if (window._YDB_public.settings == undefined) window._YDB_public.settings = {};
		window._YDB_public.settings.feeds = {
			name:'Feeds',
			container:'_ydb_feeds',
			version:GM_info.script.version,
			s:[
				{type:'checkbox', name:'Do not remove watchlist', parameter:'doNotRemoveWatchList'},
				{type:'breakline'},
				{type:'input', name:'Images in each feed:', parameter:'imagesInFeeds', validation:{type:'int',min:1,max:50}},
				{type:'breakline'},
				{type:'checkbox', name:'Watch link on the right side', parameter:'watchFeedLinkOnRightSide'},
				{type:'breakline'},
				{type:'checkbox', name:'Remove unneeded content from HTML', parameter:'optimizeLS'},
				{type:'array', parameter:'feedz', addText:'Add feed', customOrder:true, s:[
					[
						{type:'input', name:'Name', parameter:'name',styleI:{width:'33.5em', marginRight:'.5em'}},
						{type:'select', name:'Sorting', parameter:'sort',styleI:{marginRight:'.5em'}, values:[
							{name:'Creation date', value:'created_at'},
							{name:'Score', value:'score'},
							{name:'Wilson score', value:'wilson'},
							{name:'Relevance', value:'relevance'},
							{name:'Width', value:'width'},
							{name:'Height', value:'height'},
							{name:'Comments', value:'comments'},
							{name:'Random', value:'random'}
						]},
						{type:'select', name:'Direction', parameter:'sd',styleI:{marginRight:'.5em'}, values:[
							{name:'Descending', value:'desc'},
							{name:'Ascending', value:'asc'}
						]}
					],
					[
						{type:'input', name:'Cache (minutes)', parameter:'cache',styleI:{width:'3em', marginRight:'.4em'}, validation:{type:'int',min:0,max:99999}},
						{type:'input', name:'... or update each (used if previous is 0)', parameter:'ccache',styleI:{width:'3.2em', marginRight:'.4em'}, validation:{type:'int',min:0,max:99999}},
						{type:'checkbox', name:'Double size', parameter:'double',styleI:{marginRight:'.4em'}},
						{type:'checkbox', name:'Show on mainpage', parameter:'mainPage',styleI:{marginRight:'.4em'}},
						{type:'buttonLink', attrI:{title:'Copy this link and paste it somewhere to share that feed!',target:'_blank'},styleI:{marginRight:'.5em'}, name:'Share', i:function(module,elem) {
							let f = module.saved.feedz[elem.parentNode.dataset.id];
							if (f == undefined) {
								elem.innerHTML = '------';
								return;
							}
							elem.href = '/search?name='+encodeURIComponent(f.name)+'&q='+
								encodeURIComponent(window._YDB_public.funcs.tagAliases(f.query, {legacy:false})).replace(/\%20/g,'+')+
								'&sf='+f.sort+'&sd='+f.sd+'&cache='+f.cache+'&ccache='+f.ccache;
						}},
						{type:'button', name:'Reset cache', action:resetCache}
					],[
						{type:'textarea', name:'Query', parameter:'query',styleI:{width:'calc(100% - 11em)'}}
					]
				], template:{name:'New feed',sort:'',sd:'',cache:'30',ccache:'0',query:'*',double:false,mainPage:true}}
			],
			onChanges:{
				feedz:{
					sort:resetCache,
					sd:resetCache,
					query:resetCache,
					double:resetCache
				}
			}
		};
		try {
			debug = window._YDB_public.funcs.log;
		}
		catch(e) {
			debug = function(id, value, level) {

				let levels = ['.', '?', '!'];
				console.log('['+levels[level]+'] ['+id+'] '+value);
			};
		}
	}

	function resizeEverything() {
		let ccont = document.getElementsByClassName('column-layout__main')[0];
		let mwidth = parseInt(ccont.clientWidth) - 14;
		let twidth = parseInt(mwidth/parseInt(config.imagesInFeeds*(privated?1.2:1))-8);
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

		for (let i=0; i<document.getElementsByClassName('_ydb_row_resizable').length; i++) {
            let c = document.getElementsByClassName('_ydb_row_resizable')[i];
            let s = twidth+22+7;
			if (c.classList.contains('_ydb_row_double')) s*=2;
			c.style.height = s+'px';
        }
	}

	function preRun() {
		f_s_c = localStorage._ydb_feeds;
		if (f_s_c == undefined) {
			legacyPreRun();
			debug('YDB:F','Data conversion to 0.4.5+ format done', 0);
			f_s_c = {};
			for (let k in config) f_s_c[k] = config[k];
			f_s_c.feedz = feedz;
			localStorage.removeItem('_ydb');
			localStorage.removeItem('_ydb_config');
			localStorage._ydb_feeds = JSON.stringify(f_s_c);
		}
		else f_s_c = JSON.parse(f_s_c);

		//conversion
		feedz = f_s_c.feedz;
		config = f_s_c;

		//caches
		let svd = localStorage._ydb_caches;
		if (svd !== undefined) {
			try {
				feedzCache = JSON.parse(svd);
			}
			catch (e) {
				debug('YDB:F','Cannot get feeds cache', 1);
			}
		}
		svd = localStorage._ydb_cachesUrls;
		if (svd !== undefined) {
			try {
				feedzURLs = JSON.parse(svd);
			}
			catch (e) {
				debug('YDB:F','Cannot get feeds URLCache', 1);
			}
		}

		for (let i=0; i<feedz.length; i++) {
			if (feedz[i] != null) feedz[i].loaded = false;
			if (feedz[i].cachedResp != undefined) {
				feedzCache[i] = feedz[i].cachedResp;
				delete feedz[i].cachedResp;
			}
			if (feedz[i].cachedQuery != undefined) {
				feedzURLs[i] = feedz[i].cachedQuery;
				delete feedz[i].cachedQuery;
			}
		}
	}

	function legacyPreRun() {
		let svd = localStorage._ydb;
		if (svd !== undefined) {
			if (JSON.parse(svd).length !== undefined) {
				try {
					feedz = JSON.parse(svd);
				}
				catch (e) {
					debug('YDB:F','Cannot get feeds. Should be loaded default', 1);
				}
			}
			else {
				debug('YDB:F','Cannot get feeds. Should be loaded default', 1);
			}
		}
		for (let i=0; i<feedz.length; i++) {
			if (feedz[i] != null) feedz[i].loaded = false;
			if (feedz[i].cachedResp != undefined) {
				feedzCache[i] = feedz[i].cachedResp;
				delete feedz[i].cachedResp;
			}
			if (feedz[i].cachedQuery != undefined) {
				feedzURLs[i] = feedz[i].cachedQuery;
				delete feedz[i].cachedQuery;
			}
		}

		if (!config.forceScriptConfig) {
			svd = localStorage._ydb_config;
			if (svd !== undefined) {
				try {
					let svd2 = JSON.parse(svd);
					if (svd2.feeds !== undefined) config = svd2.feeds;
				}
				catch (e) {
				debug('YDB:F','Cannot get configs', 1);
				}
			}
			let c2 = {};
			c2.feeds = config;
			localStorage._ydb_config = JSON.stringify(c2);
		}
	}

	function write(w) {
		localStorage._ydb_feeds = JSON.stringify(f_s_c);
		localStorage._ydb_caches = JSON.stringify(feedzCache);
		localStorage._ydb_cachesUrls = JSON.stringify(feedzURLs);
	}

	function postRun() {
		resizeEverything();
		let x = JSON.parse(JSON.stringify(f_s_c));
		for (let i=0; i<x.feedz.length; i++) {
			for (let key in x.feedz[i]) {
				if (key=='loaded' || key=='container' || key=='temp' || key=='reload' || key=='internalId' || key=='url' || key == 'observer' || key == 'postprocessors') delete x.feedz[i][key];
			}

		}
		write(x);
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

	function getYearsAltQuery() {
		let date = new Date();
		let c = '(';
		let cc = 'first_seen_at:';
		for (let i = date.getFullYear() - 1; i>2011; i--)
			c+=(c==='('?'':' || ')+cc+i+'-'+((date.getMonth()+1)<10?('0'+(date.getMonth()+1)):(date.getMonth()+1))+'-'+(date.getDate()<10?('0'+date.getDate()):date.getDate());
		return c+')';
	}

	function getNotSeenYetQuery(f) {
		let gc = parseInt(f.saved);
		if (isNaN(gc)) gc = 0;
		if (gc == undefined) gc = 0;
		gc*=60000;
		let t = new Date(parseInt(gc));
		return '(created_at.gte:'+t.toISOString()+')';
	}

	function getNotSeenYetQueryNoNew(f) {
		let gc = parseInt(f.saved);
		if (isNaN(gc)) gc = 0;
		if (gc == undefined) gc = 0;
		gc*=60000;
		let t = new Date(gc);
		let t2 = new Date();
		return '(created_at.gte:'+t.toISOString()+', created_at.lte:'+t2.toISOString()+')';
	}

	function spoileredQuery() {
		if (document.getElementsByClassName('js-datastore')[0].dataset.spoileredTagList == undefined) return;
		let tl = JSON.parse(document.getElementsByClassName('js-datastore')[0].dataset.spoileredTagList);
		let tags = tl.reduce(function(prev, cur, i, a) {
			if (localStorage['bor_tags_'+cur] == undefined) return '[Unknown]';
			return prev + JSON.parse(localStorage['bor_tags_'+cur]).name+(i+1 == a.length?'':' || ');
		}, '');
		tags = '('+tags+')';
		if (document.getElementsByClassName('js-datastore')[0].dataset.spoileredFilter != "") tags += ' || '+document.getElementsByClassName('js-datastore')[0].dataset.spoileredFilter;
		return tags;
	}

	function customQueries(f) {
		let tx = f.query;
		if (window._YDB_public.funcs == undefined || window._YDB_public.funcs.tagAliases == undefined) {
			tx = tx.replace('__ydb_LastYearsAlt', getYearsAltQuery());
			tx = tx.replace('__ydb_LastYears', getYearsQuery());
			tx = tx.replace('__ydb_Spoilered', spoileredQuery());
		}
		else tx = window._YDB_public.funcs.tagAliases(tx, {legacy:true});

		tx = tx.replace('__ydb_SinceLeavedNoNew', getNotSeenYetQueryNoNew(f));
		tx = tx.replace('__ydb_SinceLeaved', getNotSeenYetQuery(f));
		return tx;
	}

	/*********************************/

	function compileURL(f, act) {
		let tx = customQueries(f);
		let s = '/search?q='+encodeURIComponent(tx.replace(new RegExp(' ','g'),'+')).replace(new RegExp('%2B','g'),'+')+'&sf='+f.sort+'&sd='+f.sd;
		if (act && (window._YDB_public.funcs != undefined || window._YDB_public.funcs.feedURLs != undefined)) {
			for (let i in window._YDB_public.funcs.feedURLs) s += window._YDB_public.funcs.feedURLs[i](f);
		}
		return s;
	}

	function compileJSONURL(f, act) {
		let tx = customQueries(f);
		let s = '/search.json?q='+encodeURIComponent(tx.replace(new RegExp(' ','g'),'+')).replace(new RegExp('%2B','g'),'+')+'&sf='+f.sort+'&sd='+f.sd;
		if (act && (window._YDB_public.funcs != undefined || window._YDB_public.funcs.feedURLs != undefined)) {
			for (let i in window._YDB_public.funcs.feedURLs) s += window._YDB_public.funcs.feedURLs[i](f);
		}
		return s;
	}

	function getFeed(feed, id) {
		let req = new XMLHttpRequest();
		req.feed = feed;
		req.onreadystatechange = readyHandler(req, id);
		req.open('GET', compileURL(feed, true));
		req.send();
	}

	function spoiler(event) {
		if ((event.target.width==1) && (event.target.height==1)) {
			let x = event.target.parentNode.parentNode.parentNode;
			let video = false;
			if (x.classList.contains('media-box__content')) {
				x = x.childNodes[0];
				video = true;
			}
			let spx = JSON.parse(x.getAttribute('data-image-tags'));
			let fls = data.spoilers;
			let mx = 999999999;
			let n = '', s = null;
			for (let i=0; i<spx.length; i++) {
				for (let j=0; j<fls.length; j++) {
					if (spx[i] == fls[j]) {
						if (localStorage['bor_tags_'+spx[i]] != undefined) {
							let u = JSON.parse(localStorage['bor_tags_'+spx[i]]);
							let a = u.images;
							n += (n==''?'':', ')+u.name;
							if (a < mx) {
								if (u.spoiler_image_uri != null) {
									mx = a;
									s = u.spoiler_image_uri;
								}
							}
						}
					}
				}
			}
			let ux = x.querySelector('.media-box__overlay.js-spoiler-info-overlay');
			ux.classList.remove('hidden');
			ux.innerHTML = n;
			let ix = event.target;
			let xx = ix;
			if (video) {
				ix = ux.parentNode.getElementsByTagName('video')[0];
				xx = x.getElementsByTagName('img')[0];
			}
			let ax = ix.parentNode.parentNode;
			if (data.spoilerType == 'off') {
				ux.classList.add('hidden');
				if (video) {
					ix.classList.remove('hidden');
					xx.classList.add('hidden');
				}
				else ix.src = x.getAttribute('data-thumb');
			}
			else {
				if (s == null) s = '/tagblocked.svg';
				xx.src = s;
				xx.style.position = 'absolute';
				xx.style.left = '0';
				xx.style.top = '0';
				if (data.spoilerType != 'static') {
					let ac = data.spoilerType;
					if (ac == 'hover') ac = 'mouseenter';
					ax.addEventListener(ac, function(e) {
						if (!ux.classList.contains('hidden')) {
							if (!video) {
								ix.style.position = 'static';
								ix.spoiler = ix.src;
								ix.src = x.getAttribute('data-thumb');
							}
							else {
								ix.classList.remove('hidden');

								let s = document.createElement('source');
								s.src = x.getAttribute('data-thumb').replace('gif','webm');
								s.type = 'video/webm';
								ix.appendChild(s);

								s = document.createElement('source');
								s.src = x.getAttribute('data-thumb').replace('gif','mp4');
								s.type = 'video/mp4';
								ix.appendChild(s);

								xx.classList.add('hidden');
							}
							ux.classList.add('hidden');
							e.preventDefault();
						}
					});
					ax.addEventListener('mouseleave', function(e) {
						if (ux.classList.contains('hidden')) {
							if (!video) {
								ix.style.position = 'absolute';
								ix.src = ix.spoiler;
							}
							else {
								ix.classList.add('hidden');
								for (let i=ix.childNodes.length-1; i>=0; i--) ix.removeChild(ix.childNodes[i]);
								xx.classList.remove('hidden');
							}
							ux.classList.remove('hidden');
						}
					});
				}
			}
		}
	}

	function readyHandler(request, id) {
		return function () {
			if (request.readyState === 4) {
				if (request.status === 200) return parse(request, id);
				else if (request.status === 0) {
					debug('YDB:F','Server timeout',2);
					request.feed.container.innerHTML = 'Server timeout. Retry?';
					feedAfterload(request,'Server timeout. Retry?',id, true);
					return false;
				}
				else {
					debug('YDB:FS','Request failed. Response '+request.status,2);
					request.feed.container.innerHTML = 'Request failed ('+request.status+'). Retry?';
					feedAfterload(request,'Request failed ('+request.status+'). Retry?',id);
					return false;
				}
			}
		};
	}

	function feedAfterload(r,cc,id,notcache) {
		feedzURLs[id] = compileURL(r.feed);
		r.feed.url.href = feedzURLs[id];
		r.feed.temp.innerHTML = '';
		r.feed.loaded = true;
		r.feed.responsed = parseInt(config.imagesInFeeds*1.2);

		feedzCache[id] = cc;
		if (!notcache) {
			r.feed.saved = parseInt(Date.now() / 60000);
		}
		let left=0;
		for (let i=0; i<feedz.length; i++) if (feedz[i] != null) if (privated || feedz[i].mainPage) if (!feedz[i].loaded) {
			left++;
		};
		if (left>0) return;
		postRun();
	}

	function parse(r, id) {
		r.feed.temp.innerHTML = r.responseText;
		let votes =r.feed.temp.querySelector('.js-datastore').getAttribute('data-interactions');
		if (votes !== undefined) votes = JSON.parse(votes);

		let pc = r.feed.temp.querySelector('.block__content.js-resizable-media-container');
		let c = r.feed.container;
		let mwidth = parseInt(cont.clientWidth) - 14;
		let twidth = parseInt(mwidth/parseInt(config.imagesInFeeds*(privated?1.2:1))-8);

		if (pc === null) c.innerHTML = 'Empty feed';
		else {
			if (r.feed.postprocessors != undefined && r.feed.postprocessors.length != undefined) {
				for (let i=0; i<r.feed.postprocessors.length; i++) {
					if (window._YDB_public.funcs.feedPP[r.feed.postprocessors[i]] != undefined) window._YDB_public.funcs.feedPP[r.feed.postprocessors[i]](r.feed);
				}
			}
			for (let i=0; i<parseInt(config.imagesInFeeds*(r.feed.double?2:1)*1.2); i++) {
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
					let temp = (JSON.parse(elem.querySelector('.media-box__content .image-container').getAttribute('data-uris')));
					elem.querySelector('.media-box__content .image-container').setAttribute('data-thumb', temp.thumb.replace('webm','gif'));
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

				elem.getElementsByClassName('media-box__header')[0].style.width = twidth+'px';
				elem.getElementsByClassName('media-box__content--large')[0].style.width = twidth+'px';
				elem.getElementsByClassName('media-box__content--large')[0].style.height = twidth+'px';
				if (twidth < 240) {
					elem.getElementsByClassName('media-box__header')[0].classList.add('media-box__header--small');
				}
				else {
					elem.getElementsByClassName('media-box__header')[0].classList.remove('media-box__header--small');
				}

				elem.classList.add('_ydb_resizible');
				if (elem.querySelector('.media-box__content .image-container.thumb a img') !== null) elem.querySelector('.media-box__content--large .image-container.thumb a img').onload = spoiler;
				if (twidth < 240) {
					elem.getElementsByClassName('media-box__header')[0].classList.add('media-box__header--small');
				}
				if (i>=parseInt(config.imagesInFeeds*(privated?1.2:1)*(r.feed.double?2:1))) elem.classList.add('hidden');
				c.appendChild(pc.childNodes[0]);
			}
		}

		/*r.feed.observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type == 'attributes') {
                    let u = mutation.target.classList;
                    if (u.contains('interaction--fave') || u.contains('interaction--upvote') || u.contains('interaction--downvote')) {
                        feedzCache[id] = r.feed.container.innerHTML;
                        localStorage._ydb_caches = JSON.stringify(feedzCache);
                    }
                }
            });
        });
        r.feed.observer.observe(r.feed.container, {attributes: true, childList: true, characterData: true, subtree:true });*/

		feedAfterload(r, c.innerHTML, id);
        if (window._YDB_public.funcs != undefined && window._YDB_public.funcs.upvoteDownvoteDisabler != undefined) window._YDB_public.funcs.upvoteDownvoteDisabler(c, true);
	}

	function fillParsed(feed, id) {
		let c = feed.container;
		if ((feedzCache[id] == null) || (feedzCache[id].length < 50 )) {
			if (feedzCache[id] == null) c.innerHTML = 'Empty feed';
			else c.innerHTML = feedzCache[id];
		}
		else {
			c.innerHTML = feedzCache[id];
			for (let i=0; i<parseInt(config.imagesInFeeds*1.2)*(feed.double?2:1); i++) {
				let elem = c.childNodes[i];
				if (elem.querySelector('.media-box__content .image-container.thumb a img') !== null) elem.querySelector('.media-box__content--large .image-container.thumb a img').onload = spoiler;
				let mwidth = parseInt(cont.clientWidth) - 14;
				let twidth = parseInt(mwidth/parseInt(config.imagesInFeeds*(privated?1.2:1))-8);
				elem.getElementsByClassName('media-box__header')[0].style.width = twidth+'px';
				elem.getElementsByClassName('media-box__content--large')[0].style.width = twidth+'px';
				elem.getElementsByClassName('media-box__content--large')[0].style.height = twidth+'px';
				if (twidth < 240) {
					elem.getElementsByClassName('media-box__header')[0].classList.add('media-box__header--small');
				}
				else {
					elem.getElementsByClassName('media-box__header')[0].classList.remove('media-box__header--small');
				}
                if (i>=parseInt(config.imagesInFeeds*(privated?1.2:1)*(feed.double?2:1))) elem.classList.add('hidden');
                else elem.classList.remove('hidden');
			}
		}
		/*feed.observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type == 'attributes') {
                    let u = mutation.target.classList;
                    if (u.contains('interaction--fave') || u.contains('interaction--upvote') || u.contains('interaction--downvote')) {
                        feedzCache[id] = feed.container.innerHTML;
                        localStorage._ydb_caches = JSON.stringify(feedzCache);
                    }
                }
            });
        });
        feed.observer.observe(feed.container, {attributes: true, childList: true, characterData: true, subtree:true });*/

        if (window._YDB_public.funcs != undefined && window._YDB_public.funcs.upvoteDownvoteDisabler != undefined) window._YDB_public.funcs.upvoteDownvoteDisabler(c, true);
		feed.temp.innerHTML = '';
		feed.loaded = true;
		feed.url.href = feedzURLs[id];
		for (let i=0; i<feedz.length; i++) if (feedz[i] != null) if (privated || feedz[i].mainPage) if (!feedz[i].loaded) return;
		postRun();
	}

	function init() {
		register();
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
		for (i=0; i<feedz.length; i++) feedz[i].loaded = false;
		for (i=0; i<feedz.length; i++) {
			let f = feedz[i];
			if (f == null) continue;
			if (f.mainPage == undefined) f.mainPage = true;
			if (!(privated || f.mainPage)) continue;
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
			ut.innerHTML = ' Browse feed';
			f.url.appendChild(ut);
			head.appendChild(f.url);

			elem.appendChild(head);
			let container = document.createElement('div');
			container.className = 'block__content js-resizable-media-container';
			f.container = container;
			elem.appendChild(container);

			let mwidth = parseInt(cont.clientWidth) - 14;
			let twidth = parseInt(mwidth/parseInt(config.imagesInFeeds*(privated?1.2:1))-8);
			let s = twidth+22+7;
			if (f.double) s*=2;
			container.style.height = s+'px';
            container.classList.add('_ydb_row_resizable');
            if (f.double) container.classList.add('_ydb_row_double');

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
			f.internalId = i;
			f.reload.addEventListener('click', function() {
				feedzCache[f.internalId] = undefined;
				f.saved = 0;
				f.container.innerHTML = '';
				getFeed(f, f.internalId);
			});

			f.saved = parseInt(f.saved);
			f.cache = parseInt(f.cache);
			f.ccache = parseInt(f.ccache);
			if (feedzCache[i] == undefined) {
				getFeed(f, i);
				debug('YDB:F','Requested update to feed "'+f.name+'". Reason "No cache found"', '1');
			}
			else if (feedzCache[i].startsWith('Server timeout.')) {
				getFeed(f, i);
				debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Not finished loading"', '1');
			}
			else if (compileURL(f) != feedzURLs[i]) {
				getFeed(f, i);
				debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Feed url changed"', '1');
			}
			else if (parseInt(config.imagesInFeeds*1.2) != feedz[i].responsed) {
				getFeed(f, i);
				debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Changed setting imageInFeeds"', '1');
			}
			else if (ptime > (f.saved+f.cache))
			{
				if ((f.ccache !== undefined) && (f.ccache>0) && (!isNaN(f.ccache))) {
					if (parseInt(ptime/f.ccache) > parseInt(f.saved/f.ccache)) {
						getFeed(f, i);
						debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Scheduled update"', '1');
					}
					else fillParsed(f, i);
				}
				else {
					getFeed(f, i);
					debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Cache lifetime expired"', '1');
				}
			}
			else if (feedzURLs[i] == undefined) getFeed(f, i);
			else fillParsed(f, i);
		}

		window.addEventListener("resize", resizeEverything);
		if (config.doNotRemoveWatchList && config.hasWatchList) cont.appendChild(cont.childNodes[1]);
	}

	/*********************************/

	function YB_insertFeed(u) {
		var f = {};
		let i;
		for (i=0; i<feedz.length; i++) {
			if (feedz[i].name == decodeURIComponent(u[1])) {
				f = feedz[i];
				break;
			}
		}
		f.loaded = false;
		f.name = decodeURIComponent(u[1]);
		f.query = decodeURIComponent(u[2]).replace(/\+/g,' ');
		f.sort = u[3];
		f.sd = u[4];
		f.cache = u[5];
		f.ccache = u[6];
		feedz[i] = f;
		write();

		if (window._YDB_public.funcs.backgroundBackup!=undefined) window._YDB_public.funcs.backgroundBackup(function() {
			if (history.length == 1) close();
			else history.back();
		});
	}


	function YB_insertFeed2(u) {
		var f = {};
		let i;
        console.log(feedz);
		for (i=0; i<feedz.length; i++) {
			if (feedz[i].name == document.querySelector('#searchform [name="name"]').value) {
				f = feedz[i];
				break;
			}
		}
		f.loaded = false;
		f.name = document.querySelector('#searchform [name="name"]').value;
		f.query = document.querySelector('#searchform [name="q"]').value;
		f.sort = document.querySelector('#searchform [name="sf"]').value;
		f.sd = document.querySelector('#searchform [name="sd"]').value;
		f.cache = parseInt(document.querySelector('#searchform [name="cache"]').value);
		f.ccache = parseInt(document.querySelector('#searchform [name="ccache"]').value);
        if (isNaN(f.cache) || f.cache<0) f.cache = 30;
        if (isNaN(f.ccache) || f.ccache<0) f.ccache = 60;
		feedz[i] = f;
		write();

		if (window._YDB_public.funcs.backgroundBackup!=undefined) window._YDB_public.funcs.backgroundBackup(function() {
			if (history.length == 1) close();
			else location.href = '/settings#YourBooru';
		});
	}

	function YB_feedsPage() {
		cont = document.getElementById('content');
		cont.className = 'column-layout__main';
		document.querySelector('#content .walloftext').style.display = 'none';
		addElem('span',{},cont);
		addElem('span',{},cont);
		privated = true;
		setTimeout(init, 10);
	}

	function YB_addFeed(u) {
		document.querySelector('#content h1').innerHTML = 'Add feed';
		var c = document.querySelector('#content .walloftext');
		if (u.length>6) {
			c.innerHTML = 'Name: '+decodeURIComponent(u[1]);
			c.innerHTML += '<br>Query: <a href="/search?q='+u[2]+'&sf='+u[3]+'&sd='+u[4]+'">'+decodeURIComponent(u[2]).replace(/\\+/g,' ')+'</a>';
			c.innerHTML += '<br>Sorting type: '+u[3];
			c.innerHTML += '<br>Sorting direction: '+u[4];
			c.innerHTML += '<br>Update interval: '+(u[5]==0?'each'+u[6]:u[5])+' minutes';
			let x = true;
			for (let i=0; i<feedz.length; i++) {
				if (feedz[i].name == decodeURIComponent(u[1])) {
					c.innerHTML += '<br><br><b>There is saved feed with that name!</b>';
					c.innerHTML += '<br><br><span id="yy_add" class="button">Replace</span> <span id="yy_include" class="button">Rename automatically</span> <span id="yy_cancel" class="button">Cancel</span>';
					x = false;
					break;
				}
			}
			if (x) c.innerHTML += '<br><br><span id="yy_add" class="button">Add feed</span> <span id="yy_cancel" class="button">Cancel</span> <span id="yy_include"></span>';


			document.getElementById('yy_cancel').addEventListener('click', function() {
				if (history.length == 1) close();
				else history.back();
			});

			document.getElementById('yy_add').addEventListener('click', function() {
				YB_insertFeed(u);
			});

			document.getElementById('yy_include').addEventListener('click', function() {
				u[1] = decodeURIComponent(u[1])+'_'+parseInt(65536*Math.random());
				YB_insertFeed(u);
			});
		}
		else c.innerHTML = 'Not enough parameters, impossible to add!';
	}

    function YB_feedButton() {
        let e = InfernoAddElem('a',{href:location.href+'&name=New+feed&cache=30&ccache=0',title:'Create feed'},[
            InfernoAddElem('i',{className:'fa',innerHTML:'\uF09E'},[]),
            InfernoAddElem('span',{innerHTML:' Create feed'},[])
        ]);
        document.querySelector('.block__header.flex .flex__right').insertBefore(e,document.querySelector('.block__header.flex .flex__right').firstChild);
    }

	function YB_addFeed2(u) {
        let uniqueCheck = function(p) {
            let x = false;
            for (let i=0; i<feedz.length; i++) {
                if (feedz[i].name == p) {
                    x = true;
                    break;
                }
            }
            return x;
        };
        let alreadyHas = uniqueCheck(decodeURIComponent(u.params.name).replace(/\+/g,' '));

        let e = InfernoAddElem('div',{},[
            InfernoAddElem('h1',{className:'',innerHTML:'Add feed '},[]),
            InfernoAddElem('div',{className:'block js-imagelist-info'},[
                InfernoAddElem('div',{className:'block__content'},[
                    InfernoAddElem('span',{innerHTML:'Name: '},[]),
                    InfernoAddElem('input',{value:decodeURIComponent(u.params.name).replace(/\+/g,' '),name:'name',className:'input',events:[{t:'input',f:function(e) {
                        alreadyHas = uniqueCheck(e.target.value);
                        if (!alreadyHas) {
                            document.getElementById('yy_warn').classList.add('hidden');
                            document.getElementById('yy_add').value = 'Add feed';
                        }
                        else {
                            document.getElementById('yy_warn').classList.remove('hidden');
                            document.getElementById('yy_add').value = 'Replace';
                        }
                    }}]},[]),
                    InfernoAddElem('span',{innerHTML:' That feed already exists!', id:'yy_warn', className:'flash--warning '+(alreadyHas?'':'hidden')},[]),
                    InfernoAddElem('br',{},[]),
                    InfernoAddElem('br',{},[]),
                    InfernoAddElem('span',{innerHTML:'Update: '},[]),
                    InfernoAddElem('span',{id:'yy_cache'},[
                        InfernoAddElem('span',{innerHTML:'after '},[]),
                        InfernoAddElem('input',{value:decodeURIComponent(u.params.cache),name:'cache',className:'input',events:[{t:'input',f:function(e) {
                            if (e.target.value == '0' || e.target.value == '') {
                                document.getElementById('yy_ccache').style.opacity = '1';
                                document.querySelector('#yy_ccache input').removeAttribute('disabled');
                            }
                            else {
                                document.getElementById('yy_cache').style.opacity = '1';
                                document.getElementById('yy_ccache').style.opacity = '.2';
                                document.querySelector('#yy_ccache input').setAttribute('disabled',true);
                            }
                        }}]},[])
                    ]),
                    InfernoAddElem('span',{id:'yy_ccache'},[
                        InfernoAddElem('span',{innerHTML:' each '},[]),
                        InfernoAddElem('input',{value:decodeURIComponent(u.params.ccache),name:'ccache',className:'input',events:[{t:'input',f:function(e) {
                            if (e.target.value == '0' || e.target.value == '') {
                                document.getElementById('yy_cache').style.opacity = '1';
                                document.querySelector('#yy_cache input').removeAttribute('disabled');
                            }
                            else {
                                document.getElementById('yy_ccache').style.opacity = '1';
                                document.getElementById('yy_cache').style.opacity = '.2';
                                document.querySelector('#yy_cache input').setAttribute('disabled',true);
                            }
                        }}]},[])
                    ]),
                    InfernoAddElem('span',{innerHTML:' minutes'},[]),
                    InfernoAddElem('br',{},[]),
                    InfernoAddElem('br',{},[]),
                    InfernoAddElem('span',{},[
                        InfernoAddElem('input',{type:'button',className:'button',id:"yy_add",value:(alreadyHas?'Replace':'Add feed')},[]),
                        InfernoAddElem('span',{innerHTML:' '},[]),
                        InfernoAddElem('span',{className:'button',id:"yy_cancel",innerHTML:'Cancel'},[]),
                        InfernoAddElem('span',{className:'button',id:"yy_include",style:'display:none',innerHTML:'Rename automatically'},[])
                    ])
                ])
            ])
        ]);

        //document.getElementById('imagelist_container').insertBefore(e,document.querySelector('#imagelist_container .block__content.js-resizable-media-container'));
        //document.getElementById('searchform').lastChild.style.marginBottom = '0';
        document.getElementById('searchform').appendChild(e);

        if (u.params.cache == 0) {
            document.getElementById('yy_cache').style.opacity = '.2';
            document.querySelector('#yy_cache input').setAttribute('disabled',true);
        }
        else {
            document.getElementById('yy_ccache').style.opacity = '.2';
            document.querySelector('#yy_ccache input').setAttribute('disabled',true);
        }

        document.getElementById('yy_cancel').addEventListener('click', function() {
            if (history.length == 1) close();
            else {
                let q = '';
                for (let i in u.params) {
                    if (i != 'name' && i != 'cache' && i != 'ccache') q+=i+'='+u.params[i]+'&';
                }
                location.search = q;
            }
        });

        document.getElementById('yy_add').addEventListener('click', function() {
            YB_insertFeed2(u);
        });

        document.getElementById('yy_include').addEventListener('click', function() {
            u.params.name = decodeURIComponent(u.params.name)+'_'+parseInt(65536*Math.random());
            YB_insertFeed2(u);
        });

        document.getElementById('container').insertBefore(InfernoAddElem('div',{className:'flash flash--success', innerHTML:'Feed editing panel is located on the bottom'},[]),document.getElementById('content'));
	}

	function YDB() {
		let x = location.search.slice(1);
		if (location.search == "") YB_createEmpty();
		else if (location.search == "?") YB_createEmpty();
		else {
			let u = x.split('?');
			if (u[0] == "addFeed") YB_addFeed(u);
			else if (u[0] == "feeds") YB_feedsPage();
		}
	}

	addElem('a',{className:'header__link',href:'/pages/yourbooru?feeds', innerHTML:'Feeds'},document.querySelector('.header--secondary .header__dropdown .dropdown__content'));
	var cont = document.getElementsByClassName('column-layout__main')[0];
	if (location.pathname == '/' || location.pathname == '') setTimeout(init, 10);
	else {
		if (location.pathname == "/pages/yourbooru") {
			preRun();
			YDB();
		}
        else if (location.pathname == "/search" || location.pathname == '/search/index') {
			preRun();
            let u = parseURL(location.href);
            if (u.params.name != undefined) YB_addFeed2(u);
            else YB_feedButton();
        }
		register();
	}
})();
