// ==UserScript==
// @name         Derpibooru Search Fixer
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
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YouBooruSettings0.lib.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/SearchFixer.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/SearchFixer.user.js
// @version      0.4.1
// @description  Allows Next/Prev/Random navigation with not id sorting and more stuff
// @author       stsyn
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
	'use strict';

	let main = function() {
	let scriptId = 'ssf';
	let aE = false;
	try {if (GM_info == undefined) {aE = true;}}
	catch(e) {aE = true;}
	try {if (window._YDB_public.settings[scriptId] != undefined) return;}
	catch(e) {}
	if (aE) {if (!window._YDB_public.allowedToRun[scriptId]) return;}
	let sversion = aE?window._YDB_public.version:GM_info.script.version;

	// These settings also may be edited via YourBooru:Settings
	// And it's strongly recomended to install it, you won't lose settings if you update script!
	// https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js

	var settings = {
		//!!!Change to true if you want to use these settings
		override:false,

		//Which sortings type should be fixed
		score:true,
		random:true,
		sizes:true,
		comments:true,
		gallery:true,
		first_seen_at:true,

		//Fix random button
		randomButton:true,

		//Blink on completion
		blink:true,

		//If true, navigation will be fixed while page loading
		preloading:false,

		//With which sortings type find button should be fixed
		scoreUp:true,
		sizesUp:true,
		commentsUp:true,
		everyUp:true,

		//Pregaining image data
		pregain:true
	};

	let findTemp = 0, findIter = 1, TTL = 5;
	let preparam;
	let first_seen;
	let debug = function(id, value, level) {
		try {
			window._YDB_public.funcs.log(id, value, level);
		}
		catch(e) {
			let levels = ['.', '?', '!'];
			console.log('['+levels[level]+'] ['+id+'] '+value);
		};
	};
	let galleryLastImageId;

	//https://habrahabr.ru/post/177559/
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

	function compileQueryComponent(l) {
		return encodeURIComponent(l.replace(new RegExp(' ','g'),'+').replace(new RegExp('%20','g'),'+')).replace(new RegExp('%2B','g'),'+');
	}

	function register() {
		if (window._YDB_public == undefined) window._YDB_public = {};
		if (window._YDB_public.settings == undefined) window._YDB_public.settings = {};
		window._YDB_public.settings.ssf = {
			name:'Search Sorting Fixer',
			version:sversion,
			container:'_ssf',
			link:'/meta/userscript-search-sorting-fixer-003',
			s:[
				{type:'checkbox', name:'Fix score sorting', parameter:'score'},
				{type:'checkbox', name:'Fix random sorting', parameter:'random'},
				{type:'checkbox', name:'Fix size sorting', parameter:'sizes'},
				{type:'checkbox', name:'Fix comments sorting', parameter:'comments'},
				{type:'checkbox', name:'Fix gallery sorting', parameter:'gallery'},
				{type:'checkbox', name:'Fix first_seen_at', parameter:'first_seen_at'},
				{type:'breakline'},
				{type:'checkbox', name:'Fix random button', parameter:'randomButton'},
				{type:'checkbox', name:'Flash on completion', parameter:'blink'},
				{type:'checkbox', name:'Fix buttons on start (except "Find" button)', parameter:'preloading'},
				{type:'breakline'},
				{type:'checkbox', name:'Smart Find button at: score sorting', parameter:'scoreUp'},
				{type:'checkbox', name:'; sizes sorting', parameter:'sizesUp'},
				{type:'checkbox', name:'; comments sorting', parameter:'commentsUp'},
				{type:'checkbox', name:'; unsupported sortings', parameter:'everyUp'}
			]
		};
	}

	//////////////////////////////////////////////
	function unblink(e) {
		e.classList.remove('active');
		e.classList.remove('interaction--upvote');
		e.classList.remove('interaction--downvote');
	}

	function blink(e) {
		if (!settings.blink) return;
		e.classList.add('active');
		e.classList.add('interaction--upvote');
		e.classList.remove('interaction--fave');
		setTimeout(function() {unblink(e);},200);
	}

	function failBlink(e) {
		if (!settings.blink) return;
		e.classList.add('active');
		e.classList.add('interaction--downvote');
		e.classList.remove('interaction--fave');
		setTimeout(function() {unblink(e);},200);
	}

	function complete (target, link) {
		link = link.split('#')[0];
		blink(document.querySelectorAll(target)[0]);
		if (settings.preloading && target != '.js-up') document.querySelectorAll(target)[0].href=link;
		else location.href=link;
	}

	function fail (target) {
		failBlink(document.querySelectorAll(target)[0]);
		if (settings.preloading && target != '.js-up') document.querySelectorAll(target)[0].href='#';
	}

	function request(link, elem, target, level) {
		let req = new XMLHttpRequest();
		debug('SSF','Request: link '+link+', level '+level,1);
		TTL = 5;
		req.link = link;
		req.sel = elem;
		req.level = level;
		req.onreadystatechange = readyHandler(req, target);
		req.open('GET', link);
		req.send();
		return;
	}

	function gainParams(arr) {
        if (arr) return {
            score:parseInt(document.getElementsByClassName('score')[0].innerHTML),
            width:document.querySelector('.image-show-container').dataset.width,
            height:document.querySelector('.image-show-container').dataset.height,
            comments:document.querySelectorAll('.comments_count')[0].innerHTML,
			first_seen_at:first_seen
        };
		if (myURL.params.sf == 'score') return parseInt(document.getElementsByClassName('score')[0].innerHTML);
		if (myURL.params.sf == 'width') return document.querySelector('.image-show-container').dataset.width;
		if (myURL.params.sf == 'height') return document.querySelector('.image-show-container').dataset.height;
		if (myURL.params.sf == 'comments') return document.querySelectorAll('.comments_count')[0].innerHTML;
		if (myURL.params.sf == 'first_seen_at') return first_seen;
	}

	function parse(r, type) {
		let u;
		try {
			u = JSON.parse(r.responseText);
		}
		catch (e) {
			debug ('SSF',e,2);
		}
		let i;
		if (type == 'find') {
			let param;
			if (settings.pregain) param = preparam[myURL.params.sf];
			else param = gainParams();

			if (r.level == 'act' && param == '') {
				findTemp = u.total;
				request('//'+myURL.host+'/search.json?q=%2A', r.sel, 'find', 'pre');
				return;
			}
			if (r.level == 'act' && param != '') {
				findTemp = u.total;
				findIter = parseInt(findTemp/50)+1;
				request(compileXQuery(findIter, true), r.sel, 'find', 'post');
				return;
			}
			else if (r.level == 'post') {
				if (u.search.length > 0) for (let i=0; i<u.search.length; i++) {
					if (u.search[i].id == id) {
						findTemp = ((findIter-1)*50)+i;
						request('//'+myURL.host+'/search.json?q=%2A', r.sel, 'find', 'pre');
						return;
					}
				}
				else {
					return;
				}
				findIter++;
				request(compileXQuery(findIter, true), r.sel, 'find', 'post');
				return;
			}
			else {
				complete(r.sel, compileXQuery(parseInt(findTemp/u.search.length+1), false));
				return;
			}
		}
		if (type == 'nextGalleryLast') {
			//для галерей
			if (u.search.length > 0) complete(r.sel, location.href.replace(id, u.search[0].id));
			else fail(r.sel);
			return;
		}
		if (myURL.params.sf.startsWith('gallery_id')) {
			//для галерей
			if (u.search.length > 0) for (let i=0; i<u.search.length; i++) {
				if (u.search[i].id == id) {

					//нашли якорь
					if (type == 'prev') {
						if (i == 0 && galleryLastImageId != undefined) complete(r.sel, location.href.replace(id, galleryLastImageId));
						else if (i == 0) fail(r.sel);
						else complete(r.sel, location.href.replace(id, u.search[i-1].id));
						return;
					}
					else {
						if (i == u.search.length-1) {
							findIter++;
							request(compileXQuery(findIter, true), r.sel, 'nextGalleryLast', 'post');
						}
						else complete(r.sel, location.href.replace(id, u.search[i+1].id));
						return;
					}
				}
			}
			else {
				return;
			}
			//не нашли
			findIter++;
			galleryLastImageId = u.search[u.search.length-1].id;
			request(compileXQuery(findIter, true), r.sel, type, 'post');
			return;
		}
		if (!myURL.params.sf.startsWith('random')) {
			if (r.level == 'pre') {
				if (u.total == 0) {
					//не удалось найти следующую пикчу по номеру, пробуем теперь реально следующую
					request(compileQuery(type), r.sel, type, 'act');
					return;
				}
				else {
					//нашли с тем же критерием, но другим очком
					complete(r.sel, location.href.replace(id, u.search[0].id));
					return;
				}

			}
			else if (r.level == 'act') {
				if (u.total == 0) {
					//чот нихуя не нашли опять. Видимо, на сей раз реально ничего нет
					fail(r.sel);
				}
				else {
					if (u.total > 1) {
						let param;
						let s = 0;
						if (u.search[s].id == id) s++;
						if (myURL.params.sf == 'score') param='score';
						else if (myURL.params.sf == 'width') param='width';
						else if (myURL.params.sf == 'height') param='height';
						else if (myURL.params.sf == 'comments') param='comment_count';
						else if (myURL.params.sf == 'first_seen_at') param='first_seen_at';
						else param = '';
						if (u.search[s+1][param] == u.search[s][param]) {
							//мы чот нашли, но у соседней по тому же критерию то же самое, нужно уточнить, что ставить
							request(compilePostQuery(type, u.search[s+1][param]), r.sel, type, 'post');
							return;
						}
						else {
							//а все норм, она одна такая
							complete(r.sel, location.href.replace(id, u.search[s].id));
							return;
						}
					}
					else {
						//в запросе ваще одна пихча
						if (u.search[0].id == id) {
							request(compileQuery(type, 1), r.sel, type, 'act');
						}
						else {
							complete(r.sel, location.href.replace(id, u.search[0].id));
						}
						return;
					}
				}
			}
			else if (r.level == 'post') {
				let i=0;
				if (r.sel == '.js-rand' && u.search[0].id == id) i=1;
				if (i==1 && u.total == 1) {
					//рандом высрал только эту пикчу
					fail(r.sel);
				}
				//вот это точно должна идти
				complete(r.sel, location.href.replace(id, u.search[0].id));
				return;
			}
		}
		else {
			if (settings.preload) {
				if (u.total>1) {
					let x = 0;
					if (u.search[0].id == id) x = 1;
					document.querySelectorAll('.js-next')[0].href=location.href.replace(id, u.search[x].id);
					if (u.total>2) {
						if (u.search[x+1].id == id) document.querySelectorAll('.js-prev')[0].href=location.href.replace(id, u.search[x+2].id);
						else document.querySelectorAll('.js-prev')[0].href=location.href.replace(id, u.search[x+1].id);
					}
					else document.querySelectorAll('.js-prev')[0].href=location.href.replace(id, u.search[x].id);
					if (settings.randomButton) {
						if (u.total>3) {
							if (u.search[x+2].id == id) document.querySelectorAll('.js-rand')[0].href=location.href.replace(id, u.search[x+3].id);
							else document.querySelectorAll('.js-rand')[0].href=location.href.replace(id, u.search[x+2].id);
						}
						else document.querySelectorAll('.js-rand')[0].href=location.href.replace(id, u.search[x].id);
					}
				}
				else {
					if (settings.randomButton) fail('.js-rand');
					fail('.js-prev');
					fail('.js-next');
				}
				if (settings.randomButton) blink(document.querySelectorAll('.js-rand')[0]);
				blink(document.querySelectorAll('.js-prev')[0]);
				blink(document.querySelectorAll('.js-next')[0]);
			}
			else {
				if (u.total>1) complete(r.sel, location.href.replace(id, u.search[0].id));
				else fail(r.sel);
			}
		}
	}

	function readyHandler(request, type) {
		return function () {
			if (request.readyState === 4) {
				if (request.status === 200) return parse(request, type);
				else if (request.status === 0) {
					debug('SSF', 'Server refused to answer. Trying again in '+100*(6-TTL)+'ms', 2);
					setTimeout(function() {
						TTL--;
						let req = new XMLHttpRequest();
						req.sel = request.sel;
						req.link = request.link;
						req.level = request.level;
						req.onreadystatechange = readyHandler(req, type);
						req.open('GET', request.link);
						req.send();
					}, 100*(6-TTL));
					return false;
				}
				else {
					debug('SSF', 'Request failed: '+request.status, 2);
					fail(request.sel);
					return false;
				}
			}
		};
	}

	function compilePostQuery(type, v, page) {
		//well, we should find first pic
		let prevUrl = '//'+myURL.host+'/search.json?q=('+myURL.params.q+')';
		let dir = ((myURL.params.sd=='asc'^type=='prev')?'gte':'lte');
		if (myURL.params.sf == "score") {
			prevUrl += ',(score:'+v+')';
		}
		else if (myURL.params.sf == "width") {
			prevUrl += ',(width:'+v+')';
		}
		else if (myURL.params.sf == "height") {
			prevUrl += ',(height:'+v+')';
		}
		else if (myURL.params.sf == "comments") {
			prevUrl += ',(comment_count:'+v+')';
		}
		else if (myURL.params.sf == "first_seen_at") {
			prevUrl += ',(first_seen_at:'+v+')';
		}
		prevUrl+=((type!='find')?('&perpage=1'):('&perpage=50&page='+page))+'&sf=created_at&sd='+((myURL.params.sd=='asc'^type=='prev')?'asc':'desc');
		debug('SSF','Post query: query '+prevUrl,0);
		return prevUrl;
	}

	function compilePreQuery(type) {
		//due to unpredictable sorting mechanism firstly gonna check by id
		findIter = 1;
		findTemp = 9;
		if (type == 'find') return compileLtQuery(1);
		if (myURL.params.sf.startsWith('gallery_id')) return compileXQuery(1, true);
		if (type == 'random' || myURL.params.sf.startsWith("random")) return compileQuery(type);

		let prevUrl = '//'+myURL.host+'/search.json?q=('+myURL.params.q+')';
		let dir = ((myURL.params.sd=='asc'^type=='prev')?'gt':'lt');
		let cscore;
		if (settings.pregain) cscore = preparam[myURL.params.sf];
		else cscore = gainParams();

		if (myURL.params.sf == "score") {
			prevUrl += ',(score:'+cscore+',id.'+dir+':'+id+')';
		}
		else if (myURL.params.sf == "width") {
			prevUrl += ',(width:'+cscore+',id.'+dir+':'+id+')';
		}
		else if (myURL.params.sf == "created_at" && type != "find") {
			prevUrl += ',(id.'+dir+':'+id+')';
		}
		else if (myURL.params.sf == "height") {
			prevUrl += ',(height:'+cscore+',id.'+dir+':'+id+')';
		}
		else if (myURL.params.sf == "comments") {
			prevUrl += ',(comment_count:'+cscore+',id.'+dir+':'+id+')';
		}
		else if (myURL.params.sf == "first_seen_at") {
			prevUrl += ',(first_seen_at:'+cscore+')';
		}
		prevUrl+='&perpage=1&sf=created_at&sd='+((myURL.params.sd=='asc'^type=='prev')?'asc':'desc');
        if (myURL.params.del != undefined && myURL.params.del != '') prevUrl+='&del='+myURL.params.del;
		debug('SSF','Pre query: query '+prevUrl,0);
		return prevUrl;
	}

	function compileQuery(type, delta) {
		let d = 0;
		if (delta != undefined) d = delta*((myURL.params.sd=='asc'^type=='prev')?-1:1);
		let prevUrl = '//'+myURL.host+'/search.json?q=('+myURL.params.q+')';
		if (type !='random' && !myURL.params.sf.startsWith('random')) {
			let cscore;
			if (settings.pregain) cscore = preparam[myURL.params.sf];
			else cscore = gainParams();

			let dir = ((myURL.params.sd=='asc'^(type=='prev' || type=='find'))?'gt':'lt');
			if (myURL.params.sf == "score") {
				prevUrl += ',((score:'+(cscore+d)+',id.'+dir+':'+id+')+||+(score.'+dir+':'+(cscore+d)+'))';
			}
			else if (myURL.params.sf == "width") {
				prevUrl += ',((width:'+(cscore+d)+',id.'+dir+':'+id+')+||+(width.'+dir+':'+(cscore+d)+'))';
			}
			else if (myURL.params.sf == "height") {
				prevUrl += ',((height:'+(cscore+d)+',id.'+dir+':'+id+')+||+(height.'+dir+':'+(cscore+d)+'))';
			}
			else if (myURL.params.sf == "comments") {
				prevUrl += ',((comment_count:'+(cscore+d)+',id.'+dir+':'+id+')+||+(comment_count.'+dir+':'+(cscore+d)+'))';
			}
			else if (myURL.params.sf == "first_seen_at") {
				prevUrl += ',((first_seen_at:'+(cscore+d)+',id.'+dir+':'+id+')+||+(first_seen_at.'+dir+':'+(cscore+d)+'))';
			}
			prevUrl+='&perpage=3&sf='+myURL.params.sf+'&sd='+((myURL.params.sd=='asc'^type=='prev')?'asc':'desc');
		}
		else prevUrl+='&perpage='+(myURL.params.sf.startsWith('random')?4:3)+'&sf=random';
		debug('SSF','Query: query '+prevUrl,0);
		return prevUrl;
	}

	function compileLtQuery(page) {
		let prevUrl = '//'+myURL.host+'/search.json?q=('+myURL.params.q+')';
		let dir = ((myURL.params.sd!='asc')?'gt':'lt');
		let sd = ((myURL.params.sd!='asc')?'asc':'desc');
		let sf = myURL.params.sf;
		let cscore;
		if (settings.pregain) cscore = preparam[myURL.params.sf];
		else cscore = gainParams();

		if (myURL.params.sf == "score") {
			prevUrl += ',(score.'+dir+':'+cscore+')';
		}
		else if (myURL.params.sf == "width") {
			prevUrl += ',(width.'+dir+':'+cscore+')';
		}
		else if (myURL.params.sf == "height") {
			prevUrl += ',(height.'+dir+':'+cscore+')';
		}
		else if (myURL.params.sf == "comments") {
			prevUrl += ',(comment_count.'+dir+':'+cscore+')';
		}
		else if (myURL.params.sf == "first_seen_at") {
			prevUrl += ',(first_seen_at.'+dir+':'+cscore+')';
		}
		else {
			prevUrl += ',(id.'+dir+':'+id+')';
			sf = 'created_at';
		}
		prevUrl+='&page='+page+'&perpage=50&sf='+sf+'&sd='+sd;
		debug('SSF','Gaining offset pagination query: page '+page+', query '+myURL.params.q,0);
        if (myURL.params.del != undefined && myURL.params.del != '') prevUrl+='&del='+myURL.params.del;
		return prevUrl;
	}

	function compileXQuery(page, pp) {
		let sf = myURL.params.sf;
		if (myURL.params.sf == '' || myURL.params.sf == 'wilson' || myURL.params.sf.startsWith('random') || myURL.params.sf == 'relevance') sf = 'created_at';
		debug('SSF','Pagination query: page '+page+', query '+myURL.params.q+', sort '+sf,0);
		return '//'+myURL.host+'/search'+(pp?'.json':'')+'?q='+myURL.params.q+(pp?'&perpage=50':'')+'&sf='+(sf==undefined?'':sf)+'&sd='+
            (myURL.params.sd==undefined?'':myURL.params.sd)+'&page='+page+((myURL.params.del != undefined && myURL.params.del != '')?'&del='+myURL.params.del:'');
	}

	function crLink(sel, level, type) {
		if (myURL.params.sf == 'first_seen_at' && first_seen == undefined) setTimeout(crLink, 10, sel, level, type);
		else {
			if (myURL.params.sf == 'first_seen_at' && type != 'find') request(compilePostQuery(type, first_seen), sel, type, 'post');
			else request(compilePreQuery(type), sel, type, (myURL.params.sf == 'created_at' && type != "find"?'post':level));
		}
	};

	function fetchFirstSeen(id) {
		fetch('/'+id+'.json')
		.then(function(response) {
			return response.json();
		})
		.then(function(response) {
			first_seen = response.first_seen_at;
			preparam.first_seen_at = first_seen;
		});
	};

	//adding a button, pushes query in header search
	function pushQuery(withup) {
        document.head.appendChild(InfernoAddElem('style',{type:"text/css", innerHTML:`
@media(max-width: 800px) {

.header__search .dropdown__content, .header__search:hover .dropdown__content {
display:flex;
font-size:14px;
width:auto;
min-width:auto !important
}
}
`},[]));
		document.querySelector('form.header__search').classList.add('dropdown');
		document.querySelector('form.header__search').appendChild(
			InfernoAddElem('span',{className:'dropdown__content', style:'position:static;min-width:0;z-index:1'},[
				InfernoAddElem('select',{id:'_ydb_s_qpusher_sf',className:'input header__input', style:'display:inline;width:5em', name:'sf', size:1},[
					InfernoAddElem('option',{value:'created_at', innerHTML:'created_at'},[]),
					InfernoAddElem('option',{value:'first_seen_at', innerHTML:'first_seen_at'},[]),
					InfernoAddElem('option',{value:'score', innerHTML:'score'},[]),
					InfernoAddElem('option',{value:'wilson', innerHTML:'wilson'},[]),
					InfernoAddElem('option',{value:'relevance', innerHTML:'relevance'},[]),
					InfernoAddElem('option',{value:'width', innerHTML:'width'},[]),
					InfernoAddElem('option',{value:'height', innerHTML:'height'},[]),
					InfernoAddElem('option',{value:'comments', innerHTML:'comments'},[]),
					InfernoAddElem('option',{value:'random', innerHTML:'random'},[]),
				]),
				InfernoAddElem('select',{id:'_ydb_s_qpusher_sd',className:'input header__input', style:'display:inline;width:3.5em', name:'sd', size:1},[
					InfernoAddElem('option',{value:'desc', innerHTML:'desc'},[]),
					InfernoAddElem('option',{value:'asc', innerHTML:'asc'},[])
				])
			]));
		if (withup) {
            document.querySelector('form.header__search').insertBefore(
				InfernoAddElem('a',{id:'_ydb_s_finder',title:'Find this image position in entered query', style:'height:28px;padding:0', className:'header__link header__search__button'}, [
					InfernoAddElem('i',{className:'fa',style:'color:#fff; width:28px; line-height:28px; text-align:center; font-size:110%; vertical-align:super;',innerHTML:'\uF03C'}, [])
				]),document.querySelector('form.header__search>a.header__search__button'));
			document.querySelector('form.header__search').insertBefore(
				InfernoAddElem('a',{id:'_ydb_s_qpusher',title:'Push search query to url bar', style:'height:28px;padding:0', href:location.href, className:'header__link header__search__button'}, [
					InfernoAddElem('i',{className:'fa fa-arrow-up',style:'color:#fff; width:28px; line-height:28px; text-align:center; font-size:110%; vertical-align:super;'}, [])
				]),document.querySelector('form.header__search>a.header__search__button'));
			document.getElementById('_ydb_s_qpusher').hash = '';
		}

		if (myURL.params.sf != undefined && myURL.params.sf.startsWith('gallery_id')) addElem('option',{value:myURL.params.sf, innerHTML:'gallery'},document.getElementById('_ydb_s_qpusher_sf'));
        if (myURL.params.sf == '') myURL.params.sf = 'created_at';
        if (myURL.params.sd == '') myURL.params.sd = 'desc';
        let x = myURL.params.sf;
		if (myURL.params.sf != undefined && myURL.params.sf.startsWith('gallery_id')) x = 'gallery_id';
		if (myURL.params.sf != undefined && myURL.params.sf.startsWith('random')) x = 'random';
		if (myURL.params.sf != undefined && document.querySelector('#_ydb_s_qpusher_sf *[value*='+x+']') != undefined) document.querySelector('#_ydb_s_qpusher_sf *[value*='+x+']').selected = 'selected';
		if (myURL.params.sd != undefined && document.querySelector('#_ydb_s_qpusher_sd *[value='+myURL.params.sd+']') != undefined) document.querySelector('#_ydb_s_qpusher_sd *[value='+myURL.params.sd+']').selected = 'selected';

		let ch = function(e,arg,first) {
		};

		let chall = function() {
			let s = location.search;
			let es = ['form.header__search .input','#_ydb_s_qpusher_sf','#_ydb_s_qpusher_sd', '#del'];
			let args = ['q','sf','sd','del'];
			for (let i=0; i<es.length; i++) {
				let e = document.querySelector(es[i]);
                if (e == undefined) continue;
				let val = e.value;
				let arg = args[i];
				if (i == 0) {
					if (window._YDB_public.funcs != undefined && window._YDB_public.funcs.tagAliases != undefined)
						val = window._YDB_public.funcs.tagAliases(e.value,{});
				}
				let t = compileQueryComponent(val);
				/*if (myURL.params[arg] == "" || myURL.params[arg] == undefined) {
					if (location.search == "" && i==0) s += '?'+arg+'='+val;
					else s += '&'+arg+'='+val;
				}
				else {
                    s = s.replace(new RegExp(arg+'='+myURL.params[arg]+'(%3A\\d{7}|)',''), arg+'='+val);
                }*/
				myURL.params[arg] = t;
				s = '?';
				for (let x in myURL.params) {
					s += (s!='?'?'&':'') + x + '=' + myURL.params[x];
				}
			}
			document.getElementById('_ydb_s_qpusher').search = s;
			console.log(s);
		};

		if (document.getElementById('_ydb_s_qpusher')) setTimeout(function() {
			document.querySelector('form.header__search .input').addEventListener('input', function(e) {chall();});
			document.querySelector('#_ydb_s_qpusher_sf').addEventListener('input', function(e) {chall();});
			document.querySelector('#_ydb_s_qpusher_sd').addEventListener('input', function(e) {chall();});
            if (document.querySelector('#del')) document.querySelector('#del').addEventListener('input', function(e) {chall();});
		}, 200);

		//fetching tags
		let t = document.querySelectorAll('.tag.dropdown');
		for (let j=0; j<t.length; j++) {
			ChildsAddElem('span',{dataset:{tag:t[j].dataset.tagName}, className:'tag__dropdown__link'}, t[j].getElementsByClassName('dropdown__content')[0],[
				InfernoAddElem('a',{style:'cursor:pointer', innerHTML:'Set query ', events:[{t:'click',f:function(e){
					document.querySelector('form.header__search .input').value=e.target.parentNode.dataset.tag;
					chall();
				}}]},[]),
				InfernoAddElem('a',{style:'cursor:pointer', innerHTML:'[+]', events:[{t:'click',f:function(e){
					document.querySelector('form.header__search .input').value+=(document.querySelector('form.header__search .input').value.trim == ''?'':',')+e.target.parentNode.dataset.tag;
					chall();
				}}]},[])
			]);
		}

		if (document.getElementById('_ydb_s_finder') != undefined) document.getElementById('_ydb_s_finder').addEventListener('click',function(e) {
			commonClickAction(e);
			myURL = parseURL(document.getElementById('_ydb_s_qpusher').href);
            console.log(myURL);
			crLink('#_ydb_s_finder', 'act', 'find');
		});
	}


	////////////////////////////////

	function execute() {
		let url, req;
		if (!myURL.params.sf.startsWith('random')) {
			crLink('.js-prev', 'pre', 'prev');
			crLink('.js-next', 'pre', 'next');

		}
		if (settings.randomButton || myURL.params.sf.startsWith('random')) {
			crLink('.js-rand', 'post', 'random');
		}
	}

	function commonClickAction(e) {
		e.preventDefault();
		if (settings.blink) {
			let elem = e.target;
			if (elem.classList.contains('fa')) elem = elem.parentNode;
			elem.classList.add('interaction--fave');
			elem.classList.add('active');
		}
		myURL = parseURL(location.href);
	}

		/////////////////////////////////

	if (localStorage._ssf == undefined || settings.override) {
		localStorage._ssf = JSON.stringify(settings);
	}
	else {
		try {
			var settings2 = JSON.parse(localStorage._ssf);
			if (settings2.pregain == undefined) {
				settings2.pregain = true;
				localStorage._ssf = JSON.stringify(settings2);
			}
			settings = settings2;
		}
		catch(e) {
			localStorage._ssf = JSON.stringify(settings);
		}
	}
	if (settings.first_seen_at == undefined) settings.first_seen_at = true;
	register();
	let myURL = parseURL(location.href);
	if (myURL.sf != undefined) if (myURL.params.sf.startsWith('gallery_id')) return;
	let id = parseInt(myURL.path.slice(1));


	if (isNaN(id)) {
		id = myURL.path.split('/');
		if (id[1] == 'images');
		id = parseInt(id[2]);
	}

	pushQuery(!isNaN(id));
    if (!isNaN(id) && settings.pregain) preparam = gainParams(true);

	if (
		!isNaN(id) &&
		myURL.params.sf != undefined &&
		myURL.params.sf != "" &&
		!(myURL.params.sf == 'created_at' && (myURL.params.del == undefined || myURL.params.del == '')) &&
		myURL.params.sf != 'wilson' &&
		myURL.params.sf != 'relevance' &&
		!(myURL.params.sf == 'score' && !settings.score) &&
		!(myURL.params.sf == 'comments' && !settings.comments) &&
		!(myURL.params.sf == 'first_seen_at' && !settings.first_seen_at) &&
		!(myURL.params.sf.startsWith('random') && !settings.random) &&
		!(myURL.params.sf.startsWith('gallery_id') && !settings.gallery) &&
		!((myURL.params.sf == 'width' || myURL.params.sf == 'height') && !settings.sizes)
	) {
		if (!(myURL.params.sf.startsWith('gallery_id'))) myURL.params.sf = myURL.params.sf.split('%')[0];
		if (myURL.params.sf == 'first_seen_at') fetchFirstSeen(id);
		if (settings.preloading) execute();
		else {
			document.querySelectorAll('.js-next')[0].addEventListener('click',function(e) {
				commonClickAction(e);
				crLink('.js-next', myURL.params.sf.startsWith('random')?'post':'pre', myURL.params.sf.startsWith('random')?'random':'next');
			});
			document.querySelectorAll('.js-prev')[0].addEventListener('click',function(e) {
				commonClickAction(e);
				crLink('.js-prev', myURL.params.sf.startsWith('random')?'post':'pre', myURL.params.sf.startsWith('random')?'random':'prev');
			});
			document.querySelectorAll('.js-rand')[0].addEventListener('click',function(e) {
				commonClickAction(e);
				crLink('.js-rand', 'post', 'random');
			});
		}
	}

	if (!isNaN(id) && (
		(myURL.params.sf == 'score' && settings.scoreUp) ||
		(myURL.params.sf == 'comments' && settings.comments) ||
		(myURL.params.sf == 'first_seen_at' && settings.first_seen_at) ||
		(myURL.params.sf != undefined && myURL.params.sf.startsWith('gallery_id') && settings.gallery) ||
		((myURL.params.sf == 'width' || myURL.params.sf == 'height') && settings.sizesUp) ||
		(( ((myURL.params.sf == undefined || myURL.params.sf == '') && myURL.params.q != undefined && myURL.params.q != '' && myURL.params.q != '%2A')
          || myURL.params.sf == 'wilson' || myURL.params.sf == 'created_at' || (myURL.params.sf != undefined && myURL.params.sf.startsWith('random')) || myURL.params.sf == 'relevance') && settings.everyUp)

	)) {
		document.querySelectorAll('.js-up')[0].addEventListener('click',function(e) {
			commonClickAction(e);
			crLink('.js-up', 'act', 'find');
		});
	}
	};

	let aE = false;
	try {if (GM_info == undefined) {aE = true;}}
	catch(e) {aE = true;}
	if (!aE) main();
	else {
		let ax = JSON.parse(localStorage._ydb_host);
		if (ax.browser == 'firefox') main();
		else {
			let code = '('+main.toString()+')();';
			addElem('script',{innerHTML:code},document.head);
		}
	}
})();
