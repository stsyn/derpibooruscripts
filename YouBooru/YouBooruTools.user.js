// ==UserScript==
// @name         YourBooru:Tools
// @namespace    http://tampermonkey.net/
// @version      0.7.7
// @description  Some UI tweaks and more
// @author       stsyn

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

// @require      https://raw.githubusercontent.com/blueimp/JavaScript-MD5/master/js/md5.min.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/tagDB0.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/badgesDB0.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YouBooruSettings0UW.lib.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/DerpibooruImitation0UW.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/DerpibooruCSRFPatch.lib.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruTools.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruTools.user.js
// @grant        unsafeWindow
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
	let main = function() {
	let scriptId = 'tools';
	let aE = false;
	try {if (GM_info == undefined) {aE = true;}}
	catch(e) {aE = true;}
	try {if (unsafeWindow._YDB_public.settings[scriptId] != undefined) return;}
	catch(e){}
	if (aE) {if (!window._YDB_public.allowedToRun[scriptId]) return;}
	let sversion = aE?window._YDB_public.version:GM_info.script.version;

    let processing = {};
    let result;
	let version = 0;
	let artists = [];
	let isEditors = [];
	let bps = ['princess luna','tempest shadow','starlight glimmer','rarity','oc:blackjack','princess celestia'];
	let sps = [{name:'solo',image:'https://derpicdn.net/img/view/2016/8/22/1231050.png'},
			   {name:'patreon preview',image:'https://derpicdn.net/img/view/2016/6/3/1169448.png'},
			   {name:'80s',image:'https://derpicdn.net/img/view/2016/5/5/1147241.png'},
			   {name:'op is trying to start shit',image:'https://derpicdn.net/img/view/2015/8/28/967369.jpg'},
			   {name:'twilight sparkle (alicorn)',image:'https://derpicdn.net/img/view/2014/12/1/776065.png'},
			   {name:'milf',image:'https://derpicdn.net/img/view/2013/9/21/431956.png'},
			   {name:'canon x oc',image:'https://derpicdn.net/img/view/2013/7/20/379005.png'},
			   {name:'simple background',image:'https://derpicdn.net/img/view/2013/5/6/317918.png'},
			   {name:'bad dragon',image:'https://derpicdn.net/img/view/2013/4/24/307465.png'},
			   {name:'bedroom eyes',image:'https://derpicdn.net/img/view/2013/4/23/305990.png'},
			   {name:'edit',image:'https://derpicdn.net/img/view/2013/4/22/305629.png'},
			   {name:'artist:hoihoi',image:'https://derpicdn.net/img/view/2013/4/21/303903.png'},
			   {name:'crotchboobs',image:'https://derpicdn.net/img/view/2013/4/22/305692.png'},
			   {name:'foot fetish',image:'https://derpicdn.net/img/view/2013/4/20/303577.png'}
	];
	let best_pony_for_today = bps[parseInt(Math.random()*Math.random()*bps.length)];
	let spoiler_for_today = sps[parseInt(Math.random()*sps.length)];
	let hidden = {
		normal:[
			{
				big:'https://derpicdn.net/img/view/2017/10/23/large.png',
				small:'https://derpicdn.net/img/2017/10/23/1568696/medium.png'
			}
		],
		pony:[
			{
				big:'https://derpicdn.net/img/2012/11/24/161576/large.png',
				small:'https://derpicdn.net/img/2012/11/24/161576/medium.png'
			}
		]
	};
	let debug = function(id, value, level) {
		try {
			unsafeWindow._YDB_public.funcs.log(id, value, level);
		}
		catch(e) {
			let levels = ['.', '?', '!'];
			console.log('['+levels[level]+'] ['+id+'] '+value);
		}
	};
    let style = `
body[data-theme*="dark"] ._ydb_green {
background: #5b9b26;
color: #e0e0e0  !important;
}

body ._ydb_green {
background: #67af2b !important;
color: #fff !important;
}

body[data-theme*="dark"] ._ydb_orange{
background: #8b5b26;
color: #e0e0e0  !important;
}

body ._ydb_orange {
background: #9f6f2b !important;
color: #fff !important;
}

._ydb_t_patched {
overflow-y:hidden;
}

.ydb_t_block.block__content:not(.hidden) {
display:block;
}

body[data-theme*="dark"] .spoiler ._ydb_greentext {
color: #782c21;
}
body[data-theme*="dark"] ._ydb_greentext,
body[data-theme*="dark"] .spoiler:hover ._ydb_greentext,
body[data-theme*="dark"] .spoiler-revealed ._ydb_greentext {
color: #66e066;
}

.spoiler ._ydb_greentext {
color: #e88585;
}
._ydb_greentext,
.spoiler:hover ._ydb_greentext,
.spoiler-revealed ._ydb_greentext {
color: #0a0;
}
`;

    let tagDB ={normal:{character:["twilight sparkle","rainbow dash","pinkie pie","fluttershy","rarity","applejack","princess luna","princess celestia","spike","trixie","derpy hooves","scootaloo","sweetie belle","sunset shimmer","apple bloom","vinyl scratch","starlight glimmer","queen chrysalis","dj pon-3","princess cadance","discord","lyra heartstrings","big macintosh","octavia melody","shining armor","nightmare moon","sci-twi","bon bon","sweetie drops","soarin'","spitfire","sonata dusk","king sombra","maud pie","adagio dazzle","flash sentry","doctor whooves","time turner","cheerilee","diamond tiara","gilda","angel bunny","aria blaze","zecora","silver spoon","royal guard","berry punch","berryshine","braeburn","daring do"],'content-official':["equestria girls","rainbow rocks","my little pony: the movie","friendship games","legend of everfree"],'content-fanmade':["fallout equestria"],error:["artist needed","source needed","dead source","useless source url"],oc:["oc","oc only"],origin:["screencap","edit","edited screencap","derpibooru exclusive","alternate version","color edit"],rating:["safe","explicit","questionable","suggestive","grimdark","semi-grimdark", "grotesque"],spoiler:[]},regulars:{oc:/^oc:/g,origin:/^(artist:|editor:|colorist:)/g,spoiler:/^spoiler:/g,'content-fanmade':/^(comic:|fanfic:|artpack:|art pack:|tumblr:)/g},list:{oc:[],origin:[]}};
    function _getTagDB() {
        try {
            tagDB = getTagDB();
            colorTags();
        }
        catch(e) {setTimeout(_getTagDB,500);}
    }
    _getTagDB();

	//probably that should be in library...
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

	function fetchJson(verb, endpoint, body) {
		if (!endpoint.startsWith('https://'+location.hostname)) endpoint = 'https://'+location.hostname+endpoint;
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

    function write(ls2) {
        localStorage._ydb_tools = JSON.stringify(ls2);
    }

    function register() {
		//addElem('style',{type:'text/css',innerHTML:style},document.head);
        GM_addStyle(style);
        if (unsafeWindow._YDB_public == undefined) unsafeWindow._YDB_public = {};
        if (unsafeWindow._YDB_public.settings == undefined) unsafeWindow._YDB_public.settings = {};
		unsafeWindow._YDB_public.settings.toolsUB = {
            name:'Tools (Userbase)',
            container:'_ydb_toolsUBLocal',
            version:sversion,
			hidden:true
		};
		unsafeWindow._YDB_public.settings.tools = {
            name:'Tools',
            container:'_ydb_tools',
			link:'/meta/youboorutools-0524-everything-what-you-ever-imagined-and-even-more',
            version:sversion,
            s:[
                {type:'header', name:'Notifications'},
                {type:'checkbox', name:'Reset', parameter:'reset'},
                {type:'checkbox', name:'Force hiding (Ignorantia non est argumentum!)', parameter:'force'},
                {type:'header', name:'UI'},
                {type:'checkbox', name:'Bigger search fields', parameter:'patchSearch'},
                {type:'checkbox', name:'Deactive downvote if upvoted (and reverse)', parameter:'deactivateButtons'},
                {type:'checkbox', name:'Hide images immediately', parameter:'fastHide'},
                {type:'checkbox', name:'Old headers style', parameter:'oldHead'},
                {type:'breakline'},
                {type:'checkbox', name:'Hide obvious badges', parameter:'hideBadges'},
                {type:'checkbox', name:' and not really obvious', parameter:'hideBadgesX'},
                {type:'checkbox', name:' and donation based implications', parameter:'hideBadgesP'},
                {type:'breakline'},
                {type:'input', name:'Shrink comments and posts longer than (px)', parameter:'shrinkComms', validation:{type:'int',min:280, default:500}},
                {type:'breakline'},
                {type:'checkbox', name:'Button to shrink expanded posts', parameter:'shrinkButt'},
                {type:'breakline'},
                {type:'checkbox', name:'Greentext (don\'t tell TSP about it)', parameter:'greenText',eventsI:{change:function (e) {
					if ((document.body.dataset.userName == 'The Frowning Pony') || (document.body.dataset.userName == 'The Smiling Pony')) {
						alert(errorMessages[errorLog++%errorMessages.length]);
						e.target.checked = false;
					}
				}}},
                {type:'breakline'},
                {type:'checkbox', name:'Use endless related images search', parameter:'similar'},
                {type:'breakline'},
                {type:'header', name:'Custom spoilers'},
				{type:'button', name:'Enforce update', action:function() {
						localStorage._ydb_tools_ctags = '[]';
						customSpoilerCheck(true, ls.spoilers);
					}
				},
                {type:'breakline'},
                {type:'breakline'},
                {type:'text', name:'Spoiler', styleS:{width:'30%', textAlign:'center',display:'inline-block'}},
                {type:'text', name:'Image URL', styleS:{width:'70%', textAlign:'center',display:'inline-block'}},
                {type:'array', parameter:'spoilers', addText:'Add', customOrder:false, s:[
                    [
                        {type:'input', name:'', parameter:'name',styleI:{width:'calc(35% - 5.7em)'},validation:{type:'unique'}},
                        {type:'input', name:'', parameter:'image',styleI:{width:'65%'}}
                    ]
                ], template:{name:spoiler_for_today.name,image:spoiler_for_today.image, w:false}},
                {type:'breakline'},
                {type:'header', name:'Tag aliases'},
                {type:'checkbox', name:'Show actual query in page header', parameter:'oldName'},
                {type:'checkbox', name:'As short queries as possible', parameter:'compress', styleS:{display:'none'}},
                {type:'breakline'},
                {type:'breakline'},
                {type:'text', name:'Aliase', styleS:{width:'30%', textAlign:'center',display:'inline-block'}},
                {type:'text', name:'Original tag', styleS:{width:'70%', textAlign:'center',display:'inline-block'}},
                {type:'array', parameter:'aliases', addText:'Add', customOrder:false, s:[
                    [
                        {type:'input', name:'', parameter:'a',styleI:{width:'calc(40% - 10px - 12.25em)'},validation:{type:'unique'}},
                        {type:'textarea', name:'', parameter:'b',styleI:{width:'60%'}},
                        {type:'input', name:'', parameter:'c',styleI:{display:'none'}},
                        {type:'checkbox', name:'As watchlist', parameter:'w'}
                    ]
                ], template:{a:'best_pony',b:best_pony_for_today, w:false}},
                {type:'breakline'},
                {type:'header', name:'Shortcuts'},
                {type:'breakline'},
                {type:'text', name:'Name', styleS:{width:'30%', textAlign:'center',display:'inline-block'}},
                {type:'text', name:'Actual link', styleS:{width:'70%', textAlign:'center',display:'inline-block'}},
                {type:'array', parameter:'shortcuts', addText:'Add', customOrder:false, s:[
                    [
                        {type:'input', name:'', parameter:'name',styleI:{width:'calc(40% - 10px - 5em)'}},
                        {type:'input', name:'', parameter:'link',styleI:{width:'60%'}},
                    ]
                ], template:{name:'Somepony is watching you',link:'/search?q=looking+at+you%2C+score.gte%3A100&random_image=y&sd=desc&sf=created_at'}},
            ],
            onChanges:{
				spoilers:{
					_:function(module,data, cb) {
						customSpoilerCheck(true, data);
					}
				},
                aliases:{
                    _:function(module,data, cb) {
                        for (let i=0; i<data.length; i++) {
                            if (data[i].changed) {
                                data[i].changed = false;
                                if (data[i].w) {
                                    unsafeWindow._YDB_public.handled++;
                                    let t = InfernoAddElem('div',{},[
                                        InfernoAddElem('h1',{},[]),,
                                        InfernoAddElem('div',{className:'wallcontainer'},[]),
                                        InfernoAddElem('div',{className:'walloftext'},[])
                                    ]);
                                    t = unsafeWindow._YDB_public.funcs.callWindow([t]);
                                    processing[data[i].a] = true;
                                    YB_checkList(data[i], t);
                                    let process = function() {
                                        if (!processing[data[i].a]) {
                                            data[i] = result;
                                            unsafeWindow._YDB_public.handled--;
                                            t.classList.add('hidden');
                                            //cb(module,data, result);
                                        }
                                        else setTimeout(process, 100);
                                    };
                                    process();
                                }
                            }
                        }
                    },
                    b:function(m, el, cb) {
                        m.changed = true;
                    },
                    w:function(m, el, cb) {
                        if (el.checked) m.changed = true;
                    }
                }
            }
        };
        if (unsafeWindow._YDB_public.funcs == undefined) unsafeWindow._YDB_public.funcs = {};
        unsafeWindow._YDB_public.funcs.tagAliases = tagAliases;
        unsafeWindow._YDB_public.funcs.tagComplexParser = goodParse;
        unsafeWindow._YDB_public.funcs.tagSimpleParser = simpleParse;
		unsafeWindow._YDB_public.funcs.tagComplexCombine = goodCombine;
		unsafeWindow._YDB_public.funcs.tagSimpleCombine = simpleCombine;
		unsafeWindow._YDB_public.funcs.searchForDuplicates = searchForDuplicates;
		unsafeWindow._YDB_public.funcs.upvoteDownvoteDisabler = function(elem, inital) {
			commentButtons(elem, inital);
			deactivateButtons(elem, inital);
			hiddenImg(elem, inital);
		};
    }

    //reader
    let ls, fl;
    let svd = localStorage._ydb_tools;
    try {
        ls = JSON.parse(svd);
        fl = ls.hidden;
        if (ls.hidden == undefined || ls.reset) {
            ls.hidden = {};
            fl = ls.hidden;
            ls.reset = false;
            write(ls);
        }
    }
    catch (e) {
        ls = {};
        ls.hidden = {};
        ls.force = false;
        ls.reset = false;
		ls.version = version;
        fl = ls.hidden;
    }
    register();
    if (ls.patchSearch == undefined) {
        ls.patchSearch = true;
        write(ls);
    }
	if (ls.version == undefined) {
		ls.version = version;
        write(ls);
	}
	if (ls.shrinkComms == undefined) {
		ls.shrinkComms = 500;
        write(ls);
	}
	if (ls.fastHide == undefined) {
		ls.fastHide = true;
        write(ls);
	}
	if (ls.oldHead == undefined) {
		ls.oldHead = true;
        write(ls);
	}
	if (ls.hideBadges == undefined) {
		ls.hideBadges = true;
		ls.hideBadgesX = false;
        write(ls);
	}

	if ((document.body.dataset.userName == 'The Frowning Pony') || (document.body.dataset.userName == 'The Smiling Pony')) {
		ls.greenText = false;
		localStorage._fucken_grin_ = 'caught';
        write(ls);
	}
	else if (localStorage._fucken_grin_ == 'caught' && ls.greenText) {
		alert('It\'s still you? :P');
		ls.greenText = false;
        write(ls);
	}
	if (ls.greenText == undefined) {
		ls.greenText = true;
		if (localStorage._fucken_grin_ == 'caught') ls.greenText = false;
        write(ls);
	}
	let errorMessages = ['Nope', 'Nope', 'N-nope!', 'Stahp it', 'You don\'t want it', 'Go ewey', 'Look, I don\'t want permaban, so, stop it c:', 'Plz', ':c', 'why u so bad?'];
	let errorLog = 0;

    //flashes
    function flashNotifies() {
        for (let i=0; i<document.getElementsByClassName('flash--site-notice').length; i++) {
            let e = document.getElementsByClassName('flash--site-notice')[i];
            let z = md5(e.innerHTML);
            if (fl[z] == '1' || ls.force)
                e.style.display = 'none';
            else {
                let x = document.createElement('a');
                x.style.float = 'right';
                x.innerHTML = '[X]';
                x.href = 'javascript://';
                x.addEventListener('click', function(u) {
                    e.style.display = 'none';
                    fl[z] = '1';
                    write(ls);
                });
                e.appendChild(x);
            }
        }
    }

    //links at profile and other
    function profileLinks() {
        for (let i=0; i<document.getElementsByClassName('block').length; i++) {
            let e = document.getElementsByClassName('block')[i];
            if (e.getElementsByClassName('block__header__title').length == 0) continue;
            let h = e.getElementsByClassName('block__header__title')[0].innerHTML;
            if (h == 'Recent Uploads' || h == 'Recent Favourites' || h == 'Recent Artwork' || h == 'Watched Images') {
                for (let j=0; j<e.querySelectorAll('.image-container a').length; j++) {
                    let a = e.querySelectorAll('.image-container a')[j];
                    if (a.search == '' || a.search == '?') a.search = e.querySelector('.block__header a').search;
                }
            }
        }
    }

    //bigger search fields
    function bigSearch() {
        let css = 'header ._ydb_t_textarea {resize:none;overflow:hidden;line-height:2em;white-space:pre}'+
            'header ._ydb_t_textarea:focus {max-width:calc(100vw - 350px);margin-top:1.5em;overflow:auto;position:absolute;width:calc(100vw - 350px);height:5em;z-index:5;white-space:pre-wrap}'+
            '#searchform textarea {min-width:100%;max-width:100%;min-height:2.4em;line-height:1.5em;height:7em}';
        //addElem('style',{type:'text/css',innerHTML:css},document.head);
		GM_addStyle(css);
        let x = [document.getElementsByClassName('header__input--search')[0], document.querySelector('.js-search-form input')];
        let x2 = [document.getElementsByClassName('header__search__button')[0], document.querySelector('input[type="submit"][value="Search"]')];
        let y = [];
        for (let i=0; i<x.length; i++) {
            if (x[i] == null) return;
            y[i] = document.createElement('textarea');
            y[i].value = x[i].value;
            y[i].className = x[i].className+' _ydb_t_textarea';
            y[i].name = x[i].name;
            y[i].id = x[i].id;
            y[i].placeholder = x[i].placeholder;
            y[i].autocapitalize = x[i].autocapitalize;
            y[i].addEventListener('keypress',function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    x2[i].click();
                }
            });
            x[i].parentNode.insertBefore(y[i],x[i]);
            x[i].parentNode.removeChild(x[i]);
        }
    }

    //tag tools
    function simpleParse(x) {
        x = x.replace(/\|\|/g, ',');
        x = x.replace(new RegExp(' OR ','g'), ',');
        let y = x.split(',');
        for (let i=0; i<y.length; i++) y[i] = y[i].trim();
        return y;
    }

    function goodParse(x) {
        let yx = {};
        yx.orig = x;
        x = x.replace(/\|\|/g, ', ');
        x = x.replace(/\&\&/g, ', ');
        x = x.replace(/^\(/g, ' ');
        x = x.replace(/^(\s*)(\()/g, '$1 ');
        x = x.replace(/(\))(\s*)$/g, ' $2');
        while (/(,\s*)(\()/g.test(x)) x = x.replace(/(,\s*)(\()/g, '$1 ');
        while (/(\))(\s*,)/g.test(x)) x = x.replace(/(\))(\s*,)/g, ' $2');
        x = x.replace(/^\-/g, ' ');
        x = x.replace(/^\!/g, ' ');
        x = x.replace(/([ ,])\-/g, '$1 ');
        x = x.replace(/([ ,])!/g, '$1 ');
        //x = x.replace(/([ ,])\*/g, '$1 ');
        x = x.replace(/\"/g, ' ');
        x = x.replace(/\~/g, ',');
        x = x.replace(/\^/g, ',');
        x = x.replace(new RegExp(' OR ','g'), ',   ');
        x = x.replace(new RegExp(' AND ','g'), ',    ');
        x = x.replace(new RegExp(' NOT ','g'), ',    ');
        x = x.replace(new RegExp('^NOT ','g'), '    ');
        let y = x.split(',');
        let afix = 0;
        for (let i=0; i<y.length; i++) {
            let tag = {};
            tag.offset = afix;
            tag.length = y[i].length;
            afix+=1+y[i].length;
            let s1 = y[i].replace(/^ +/g,'');
            tag.offset += y[i].length-s1.length;
            tag.length -= y[i].length-s1.length;
            let s2 = s1.replace(/ +$/g,'');
            tag.length -= s1.length-s2.length;
            tag.v = s2;
            y[i] = tag;
        }
        yx.temp = x;
        yx.tags = y;
        return yx;
    }

    function goodCombine(yx) {
        let pos = 0, ns = '';
        for (let i=0; i<yx.tags.length; i++) {
            ns+=yx.orig.substring(pos,yx.tags[i].offset);
            pos+=(yx.tags[i].offset-pos)+yx.tags[i].length;
            ns+=yx.tags[i].v;
        }
        ns+=yx.orig.substring(pos);
        return ns;
    }

    function simpleCombine(y,separator) {
		if (separator == undefined) separator = ' OR ';
        let s = '';
        for (let i=0; i<y.length; i++) s += y[i] + (i<y.length-1?separator:'');
        return s;
    }

    function searchForDuplicates(a) {
        return a.filter(function(a, c, d) {
            return d.indexOf(a) === c
        })
    }

    function readTagTools() {
        let svd = localStorage._ydb_tagtools;
        try {
            svd = JSON.parse(svd);
        }
        catch(e) {
            svd = {};
        }
        return svd;
    }

    function writeTagTools(svd) {
        localStorage._ydb_tagtools = JSON.stringify(svd);
    }

    function getTimestamp() {
        return parseInt(Date.now()/1000);
    }

    function checkAliases() {
        let data = readTagTools();
        for (let i in data) {
            if (data[i].t == null) data[i].t = getTimestamp();
            if (data[i].t+3600<getTimestamp()) {
                delete data[i];
                continue;
            }
        }
        writeTagTools(data);
    }

    function legacyTagAliases(original) {
		let getYesterdayQuery = function(param) {
			let date = new Date(Date.now()-param*24*60*60*1000);
			let c = '(';
			let cc = 'created_at:';
			c+=cc+date.getFullYear()+'-'+((date.getMonth()+1)<10?('0'+(date.getMonth()+1)):(date.getMonth()+1))+'-'+(date.getDate()<10?('0'+date.getDate()):date.getDate());
			return c+')';
		};

        let getYearsQuery = function(param) {
            let date = new Date(Date.now()-param*24*60*60*1000);
            let c = '(';
            let cc = 'created_at:';
            for (let i = date.getFullYear() - 1; i>2011; i--)
                c+=(c==='('?'':' || ')+cc+i+'-'+((date.getMonth()+1)<10?('0'+(date.getMonth()+1)):(date.getMonth()+1))+'-'+(date.getDate()<10?('0'+date.getDate()):date.getDate());
            return c+')';
        };

        let getYearsAltQuery = function(param) {
            let date = new Date(Date.now()-param*24*60*60*1000);
            let c = '(';
            let cc = 'first_seen_at:';
            for (let i = date.getFullYear() - 1; i>2011; i--)
                c+=(c==='('?'':' || ')+cc+i+'-'+((date.getMonth()+1)<10?('0'+(date.getMonth()+1)):(date.getMonth()+1))+'-'+(date.getDate()<10?('0'+date.getDate()):date.getDate());
            return c+')';
        };

        let spoileredQuery = function() {
            if (document.getElementsByClassName('js-datastore')[0].dataset.spoileredTagList == undefined) return;
            let tl = JSON.parse(document.getElementsByClassName('js-datastore')[0].dataset.spoileredTagList);
            let tags = tl.reduce(function(prev, cur, i, a) {
                if (localStorage['bor_tags_'+cur] == undefined) return prev;
				let quotes = (/(\(|\))/.test(tname)?'"':'');
                return prev + quotes + tname + quotes + (i+1 == a.length?'':' || ');
            }, '');
            tags = '('+tags+')';
            if (document.getElementsByClassName('js-datastore')[0].dataset.spoileredFilter != "") tags += ' || '+document.getElementsByClassName('js-datastore')[0].dataset.spoileredFilter;
            return tags;
        };

        function hiddenQuery() {
            if (document.getElementsByClassName('js-datastore')[0].dataset.hiddenTagList == undefined) return;
            let tl = JSON.parse(document.getElementsByClassName('js-datastore')[0].dataset.hiddenTagList);
            let tags = tl.reduce(function(prev, cur, i, a) {
                if (localStorage['bor_tags_'+cur] == undefined) return prev;
				let tname = JSON.parse(localStorage['bor_tags_'+cur]).name;
				let quotes = (/(\(|\))/.test(tname)?'"':'');
                return prev + quotes + tname + quotes + (i+1 == a.length?'':' || ');
            }, '');
            tags = '('+tags+')';
            if (document.getElementsByClassName('js-datastore')[0].dataset.hiddenFilter != "") tags += ' || '+document.getElementsByClassName('js-datastore')[0].dataset.hiddenFilter;
            return tags;
        }

		if (original.startsWith('__ydb')) {
			let param = 0;
			if (!isNaN(parseInt(original.split(':')[1]))) param = parseInt(original.split(':')[1]);
			if (original.startsWith('__ydb_lastyearsalt')) original = getYearsAltQuery(param);
			else if (original.startsWith('__ydb_lastyears')) original = getYearsQuery(param);
			else if (original.startsWith('__ydb_spoilered')) original = spoileredQuery();
			else if (original.startsWith('__ydb_hidden')) original = hiddenQuery();
			else if (original.startsWith('__ydb_yesterday')) original = getYesterdayQuery(1);
			else if (original.startsWith('__ydb_daysago')) original = getYesterdayQuery(param);
		}
        return original;
    }

    function tagAliases(original, opt) {
        let limit = 9999;
        checkAliases();
        let udata = readTagTools();

        let als = {};
        if (ls.aliases != undefined) for (let i=0; i<ls.aliases.length; i++) als[ls.aliases[i].a] = ls.aliases[i].b;
        let iterations = 0;

        let cycledParse = function(orig) {
            let changed = false;
            let tags = goodParse(orig);
            for (let i=0; i<tags.tags.length; i++) {
                if (als[tags.tags[i].v] != undefined) {
                    tags.tags[i].v = '('+als[tags.tags[i].v]+')';
                    changed = true;
                }
            }
            let q2 = goodCombine(tags);
            iterations++;
            if (changed && iterations < 16) q2 = cycledParse(q2);
            return q2;
        };

		let artists = function(orig) {
            let tags = goodParse(orig);
            for (let i=0; i<tags.tags.length; i++) {
                if (tags.tags[i].v.startsWith('@')) {
					if (tags.tags[i].v == '@everyone') continue;
                    tags.tags[i].v = tags.tags[i].v.replace('@','artist:');
                }
            }
            let q2 = goodCombine(tags);
            return q2;
        };

        let compressSyntax = function (orig) {
            let q2 = orig.replace(/ \&\& /g, ',');
			q2 = q2.replace(/ \|\| /g, ' OR ');
			while (q2.indexOf(', ')>-1) q2 = q2.replace(/, /g, ',');
			while (q2.indexOf(' ,')>-1) q2 = q2.replace(/ ,/g, ',');
        	q2 = q2.replace(new RegExp(' AND ','g'), ',');
        	q2 = q2.replace(new RegExp(' NOT ','g'), '-');
        	q2 = q2.replace(new RegExp('^NOT ','g'), '-');
        	q2 = q2.replace(/[ ,\(]!/g, function(str){return str[0]+'-';});
            q2 = q2.replace(/^ +/g,'');
            q2 = q2.replace(/ +$/g,'');
			while (q2.indexOf('  ')>-1) q2 = q2.replace(/  /g, ' ');
            return q2;
        };

        let compressAliases = function (orig) {
            /*let tags = goodParse(orig);
            let tt = getTagShortAliases();
            for (let i=0; i<tags.tags.length; i++) {
                if (tt[tags.tags[i].v] != undefined) {
                    tags.tags[i].v = tt[tags.tags[i].v];
                }
            }
            let q2 = goodCombine(tags);
            return q2;*/

            //disabled for now
            return orig;
        };

        let compressArtists = function (orig) {
            let tags = goodParse(orig);
            for (let i=0; i<tags.tags.length; i++) {
                if (tags.tags[i].v.startsWith('artist:')) {
                    tags.tags[i].v = tags.tags[i].v.replace('artist:','ar*:');
                }
            }
            let q2 = goodCombine(tags);
            return q2;
        };

        let toLowerCase = function (orig) {
            let tags = goodParse(orig);
            for (let i=0; i<tags.tags.length; i++) {
					tags.tags[i].v = tags.tags[i].v.toLowerCase();
            }
            let q2 = goodCombine(tags);
            return q2;
        };

		let unspoilTag = function (orig) {
			let nonce;
			if (unsafeWindow._YDB_public.funcs.getNonce == undefined) nonce = 'unsafe_nonce';
			else nonce = unsafeWindow._YDB_public.funcs.getNonce();
            let tags = goodParse(orig);
            for (let i=0; i<tags.tags.length; i++) {
                if (tags.tags[i].v == '__ydb_unspoil') {
                    tags.tags[i].v = '!__ydb_unspoil:'+md5(document.body.dataset.userName+nonce+original);
                }
            }
            let q2 = goodCombine(tags);
            return q2;
        };

		let smartLegacy = function (orig) {
			let tags = goodParse(orig);
            for (let i=0; i<tags.tags.length; i++) {
                tags.tags[i].v = legacyTagAliases(tags.tags[i].v);
            }
            let q2 = goodCombine(tags);
            return q2;
		};

		//////////////////////////////////////////////////////

        let q2 = toLowerCase(original);
		let q = cycledParse(q2);
        if (opt.legacy) q = smartLegacy(q);
		q = artists(q);
		if (q.length > limit) q = compressSyntax(q);
        if (q.length > limit) q = compressAliases(q);
        if (q.length > limit) q = compressArtists(q);
		q = unspoilTag(q);

        if (q!=q2) {
			debug('YDB:T','Query '+original+' compressed to '+q,0);
            udata[md5(q)] = {q:original, t:getTimestamp()};
            writeTagTools(udata);
        }
        return q;
    }

	function unspoil(cont) {
		let work = function (elem) {
			let ux = elem.querySelector('.media-box__overlay.js-spoiler-info-overlay');
			if (ux.innerHTML == '') return;

			let ix = elem.querySelector('video');
			let xx = elem.querySelector('a img');
			let x = elem.querySelector('.image-container');
			let s = JSON.parse(x.getAttribute('data-uris')).thumb;
			if (localStorage.serve_hidpi && !/\.gif$/.test(s) && !/\.webm$/.test(s)) {
				xx.srcset = s + " 1x, " + JSON.parse(x.getAttribute('data-uris')).medium + " 2x";
			}
			if (s.indexOf('.webm')>-1) ux.innerHTML = 'Webm';
			else ux.classList.add('hidden');
			if (ix) {
				ix.classList.remove('hidden');

				let s = document.createElement('source');
				s.src = JSON.parse(x.getAttribute('data-uris')).thumb;
				s.type = 'video/webm';
				ix.appendChild(s);

				xx.classList.add('hidden');
				xx.parentNode.removeChild(xx);
			}
			else {
				xx.src = JSON.parse(x.getAttribute('data-uris')).thumb.replace('.webm','.gif');
			}
            let clone = x.cloneNode(true);
            x.parentNode.replaceChild(clone, x);
		};
		let work2 = function (elem) {
			let ux = elem.querySelector('.block--warning');
			let x = elem.querySelector('.image-show');
			ux.classList.add('hidden');
			x.classList.remove('hidden');
		};
		if (cont != undefined) {
			if (cont.querySelectorAll('.media-box').length > 0) for (let i=0; i<cont.querySelectorAll('.media-box').length; i++) {
				work(cont.querySelectorAll('.media-box')[i]);
			}
			else if (cont.classList.contains('image-show-container')) work2(cont);
		}
	}

    function aliases() {
		if (document.querySelector('#searchform > .block .block__header.flex') != undefined) {
			document.querySelector('#searchform > .block .block__header.flex').insertBefore(
				InfernoAddElem('div',{className:'dropdown block__header__dropdown-tab'},[
					InfernoAddElem('a',{innerHTML:'YDB tags '},[
						InfernoAddElem('span',{dataset:{clickPreventdefault:true}},[
							InfernoAddElem('i',{className:'fa fa-caret-down'},[])
						])
					]),
					InfernoAddElem('div',{className:'dropdown__content'},[
						InfernoAddElem('a',{dataset:{searchAdd:'__ydb_LastYears:0',searchShowHelp:''},innerHTML:'Created at that day of previous years'},[]),
						InfernoAddElem('a',{dataset:{searchAdd:'__ydb_LastYearsAlt:0',searchShowHelp:''},innerHTML:'First seen at that day of previous years'},[]),
						InfernoAddElem('a',{dataset:{searchAdd:'__ydb_Spoilered',searchShowHelp:''},innerHTML:'Spoilered by filter'},[]),
						InfernoAddElem('a',{dataset:{searchAdd:'__ydb_Hidden',searchShowHelp:''},innerHTML:'Hidden by filter'},[]),
						InfernoAddElem('a',{dataset:{searchAdd:'__ydb_Unspoil',searchShowHelp:''},innerHTML:'Unspoil result'},[]),
						InfernoAddElem('a',{dataset:{searchAdd:'__ydb_Yesterday',searchShowHelp:''},innerHTML:'Uploaded yesterday'},[]),
						InfernoAddElem('a',{dataset:{searchAdd:'__ydb_DaysAgo:2',searchShowHelp:''},innerHTML:'Uploaded X days ago'},[])
					])
				]),
			document.querySelector('#searchform > .block .block__header.flex .flex__right'));
		}
		let q = document.getElementsByClassName('header__input--search')[0].value;
		let qc = goodParse(q);
		let data = readTagTools();
        let s = md5(document.getElementsByClassName('header__input--search')[0].value);

		for (let i=0; i<qc.tags.length; i++) {
			if (qc.tags[i].v.startsWith('__ydb_unspoil')) {
				let n = qc.tags[i].v.split(':').pop();
				if (unsafeWindow._YDB_public.funcs.getNonce == undefined) {
					document.getElementById('container').insertBefore(InfernoAddElem('div',{className:'flash flash--warning', innerHTML:'YDB:Settings 0.9.1+ strongly recommended! Using unsafe nonce.'},[]),document.getElementById('content'));
				}

				let nonce;
				if (unsafeWindow._YDB_public.funcs.getNonce == undefined) nonce = 'unsafe_nonce';
				else nonce = unsafeWindow._YDB_public.funcs.getNonce();

				if (data[s] == undefined) {
					document.getElementById('container').insertBefore(InfernoAddElem('div',{className:'flash flash--warning', innerHTML:'Query lifetime expired. Please search again.'},[]),document.getElementById('content'));
					break;
				}

				let hash = md5(document.body.dataset.userName+nonce+data[s].q);
				if (hash != n) {
					document.getElementById('container').insertBefore(InfernoAddElem('div',{className:'flash flash--warning', innerHTML:'Invalid or outdated token!'},[]),document.getElementById('content'));
					break;
				}
				if (document.getElementsByClassName('js-resizable-media-container')[0] != undefined) unspoil(document.getElementsByClassName('js-resizable-media-container')[0]);
				else if (document.getElementsByClassName('image-show-container')[0] != undefined) unspoil(document.getElementsByClassName('image-show-container')[0]);

			}
		}

        if (data[s] != undefined) {
            document.getElementsByClassName('header__input--search')[0].value = data[s].q;
            if (document.querySelector('#imagelist_container .block__header__title') != undefined && !ls.oldName) {
                let x = document.querySelector('#imagelist_container .block__header__title').innerHTML;
                x = x.slice(0,14)+data[s].q;
                document.querySelector('#imagelist_container .block__header__title').innerHTML = x;
            }
            if (document.querySelector('.js-search-form .input') != undefined) document.querySelector('.js-search-form .input').value = data[s].q;

            data[s].t = getTimestamp();
        }
        /*if (ls.aliases != undefined) */{
            let aliaseParse = function(el) {
                el.value = tagAliases(el.value, {legacy:true});
            };

            document.getElementsByClassName('header__search__button')[0].addEventListener('click',function() {aliaseParse(document.getElementsByClassName('header__input--search')[0]);});
            if (document.querySelector('input[type="submit"][value="Search"]')!=undefined)
                document.querySelector('input[type="submit"][value="Search"]').addEventListener('click',function() {aliaseParse(document.querySelector('.js-search-form .input'));});
        }
    }

    function asWatchlist() {
        if (ls.aliases != undefined) for (let i=0; i<ls.aliases.length; i++) {
            if (ls.aliases[i].w) {
                let s = simpleParse(ls.aliases[i].b);
                let ts = {};
                for (let j=0; j<s.length; j++) {
                    ts[s[j]] = true;
                }
                let t = document.querySelectorAll('.tag.dropdown');
                for (let j=0; j<t.length; j++) {
                    let isEnabled = false;
                    if (ts[t[j].dataset.tagName]) isEnabled = true;
                    addElem('a',{dataset:{a:ls.aliases[i].a, tag:t[j].dataset.tagName},events:[{t:'click',f:function(e) {
                        let d = e.target.dataset;
                        let l = JSON.parse(localStorage._ydb_tools);
                        for (let k=0; k<l.aliases.length; k++) {
                            if (l.aliases[k].a == d.a && l.aliases[k].w) {
                                let s = simpleParse(l.aliases[k].b);
                                for (let j2=0; j2<s.length; j2++) {
                                    if (s[j2] == d.tag) {
                                        s.splice(j2,1);
                                        l.aliases[k].b = simpleCombine(s);
                                        write(l);
                                        e.target.innerHTML = d.a+' (+)';
                                        if (unsafeWindow._YDB_public.funcs.backgroundBackup!=undefined) unsafeWindow._YDB_public.funcs.backgroundBackup();
                                        return;
                                    }
                                }
                                s.push(d.tag);
                                l.aliases[k].b = simpleCombine(s);
                                write(l);
                                e.target.innerHTML = d.a+' (-)';
                                if (unsafeWindow._YDB_public.funcs.backgroundBackup!=undefined) unsafeWindow._YDB_public.funcs.backgroundBackup();
                                return;
                            }
                        }
                        e.target.innerHTML = d.a+' (?)';
                    }}],className:'tag__dropdown__link', style:{cursor:'pointer'}, innerHTML:ls.aliases[i].a+' ('+(isEnabled?'-':'+')+')'}, t[j].getElementsByClassName('dropdown__content')[0]);
                }
            }
        }
    }

    //colored tags
    function colorTags() {
        let checker = function (target, method) {
            for (let i=0; i<document.querySelectorAll(target).length; i++) {
                let x = document.querySelectorAll(target)[i];
                for (let i=0; i<x.getElementsByClassName('tag').length; i++) {
                    let gotten = false;
                    let y = x.getElementsByClassName('tag')[i];
                    let z;
                    if (method == 'standart') z = y.getElementsByTagName('a')[0].dataset.tagName;
                    else if (method == 'suggested') {
                        z = '';
                        let t = y.getElementsByTagName('span')[0].innerHTML;
                        for (let j=0; j<t.split(' ').length-1; j++) z+=(j==0?'':' ')+t.split(' ')[j];
                    }
                    for (let tcat in tagDB.regulars) {
                        if (tagDB.regulars[tcat].test(z)) {
                            tagDB.regulars[tcat].test(z); //DON'T ASK ME WHY, BUT WITHOUT IT THIS THING DOESN'T WORK
                            y.dataset.tagCategory = tcat;
                            gotten = true;
                            break;
                        }
                    }
                    if (gotten) continue;
                    for (let tcat in tagDB.normal) {
                        for (let j=0; j<tagDB.normal[tcat].length; j++) {
                            if (tagDB.normal[tcat][j] == z) {
                                y.dataset.tagCategory = tcat;
                                gotten = true;
                                break;
                            }
                        }
                        if (gotten) continue;
                    }
                }
            }
        };
        checker('.js-taginput', 'standart');
        checker('.suggested_tags', 'suggested');
        setTimeout(colorTags,500);
    }

	//greenText
	function greentext(e) {
		let parser = function(et) {
			for (let i=0; i<et.childNodes.length; i++) {
				let el = et.childNodes[i];
				if (el.tagName != undefined) {
					if (el.tagName != 'A') parser(el);
				}
				else {
					let x = el.textContent.replace(/^\s+/g,'');
					let els = [el];
					let z = el.nextSibling;
					while (z != undefined && z.tagName != 'BR' && z.tagName != 'BLOCKQUOTE') {
						els.push(z);
						if (z.outerHTML != undefined) x += z.outerHTML;
						else x += z.textContent;
						z = z.nextSibling;
					}
					if (x.startsWith('>')) {
						let t = InfernoAddElem('span',{className:'_ydb_greentext',innerHTML:x},[]);
						et.insertBefore(t,el);
						for (let j=0; j<els.length; j++) {
							et.removeChild(els[j]);
						}
					}
				}
			}
		};
		parser(e);
	}

	//spoilers
	//help
	function YDBSpoilersHelp() {
		for (let i=0; i<document.getElementsByClassName('textile_help').length; i++) {
			document.getElementsByClassName('textile_help')[i].insertBefore(InfernoAddElem('span',{},[
				InfernoAddElem('ins',{innerHTML:'YDB Spoilers:'},[]),
				InfernoAddElem('span',{innerHTML:' +'},[]),
				InfernoAddElem('strong',{innerHTML:'$'},[]),
				InfernoAddElem('span',{innerHTML:'Spoiler name+[bq]Spoiler body[/bq], [bq]'},[]),
				InfernoAddElem('strong',{innerHTML:'$'},[]),
				InfernoAddElem('span',{innerHTML:'Nameless spoiler body[/bq] ([bq] can be replaced with [spoiler])'},[]),
				InfernoAddElem('br',{},[])
			]), document.getElementsByClassName('textile_help')[i].getElementsByTagName('strong')[0]);
		}
	}

	function YDBSpoilers(e) {
		let hideBlock = function(e) {
			let u = e.target;
			while (!u.classList.contains('block__header')) u = u.parentNode;
			let x = u.nextSibling;
			x.classList.toggle('hidden');
			u.getElementsByClassName('fa')[0].innerHTML = (x.classList.contains('hidden')?'\uF061':'\uF063');
		};

		setTimeout(function() {
			e.querySelectorAll('._ydb_spoil:not(._ydb_spoil_patched)').forEach(function(x) {
				x.addEventListener('click', hideBlock);
				x.classList.add('_ydb_spoil_patched');
			});
		}, 100);

		for (let i=0; i<e.querySelectorAll('ins').length; i++) {
			let el = e.querySelectorAll('ins')[i];
			if (el.innerHTML.startsWith('$')) {
				if (el.style.display == 'none') continue;
				let uid = '_ydb_spoil';
				let h = InfernoAddElem('div',{className:'block'},[
					InfernoAddElem('div',{className:'block__header'},[
						InfernoAddElem('a',{className:uid},[
							InfernoAddElem('i', {className:'fa', innerHTML:'\uF061'}),
							InfernoAddElem('span',{innerHTML:' '+el.innerHTML.slice(1)},[])
						])
					])
				]);

				let n = el.nextSibling;
				while (n.tagName !='BLOCKQUOTE' && !(n.classList != undefined && n.classList.contains('spoiler'))) {
					n = n.nextSibling;
					if (n == undefined) break;
				};
				if (n == undefined) break;
				h.appendChild(n);
				n.classList.add('block__content');
				n.classList.add('hidden');
				n.classList.remove('spoiler');
				n.classList.add('ydb_t_block');
				n.style.margin = 0;
				el.style.display = 'none';
				el.parentNode.insertBefore(h,el);
				YDBSpoilers(n);
			}
		}
		for (let i=0; i<e.querySelectorAll('blockquote, .spoiler').length; i++) {
			let el = e.querySelectorAll('blockquote, .spoiler')[i];
			if (el.innerHTML.startsWith('$')) {
				let uid = '_ydb_spoil';
				let h = InfernoAddElem('div',{className:'block'},[
					InfernoAddElem('div',{className:'block__header'},[
						InfernoAddElem('a',{className:uid},[
							InfernoAddElem('i', {className:'fa', innerHTML:'\uF061'}),
							InfernoAddElem('span',{innerHTML:' Spoiler'},[])
						])
					])
				]);
				el.innerHTML = el.innerHTML.slice(1);
				el.parentNode.insertBefore(h,el);
				h.appendChild(el);
				el.classList.add('block__content');
				el.classList.add('hidden');
				el.classList.remove('spoiler');
				el.classList.add('ydb_t_block');
				el.style.margin = 0;
			}
		}
	}

	//bad links fixes
    function urlSearchInElem(e) {
        let exclude = [];
        for (let i=0; i<e.querySelectorAll('a').length; i++) exclude.push(e.querySelectorAll('a')[i].href);
        for (let i=0; i<e.querySelectorAll('img').length; i++) exclude.push(e.querySelectorAll('img')[i].src);
        for (let i=0; i<e.querySelectorAll('.image-show-container').length; i++) exclude.push(e.querySelectorAll('.image-show-container')[i].dataset.sourceUrl);
        e.innerHTML = e.innerHTML.replace(/(https?:\/\/|ftp:\/\/)((?![.,?!;:()]*(\s|$|\"|<))[^\s]){2,}/gim, function(str){
			str = str.replace(/\&amp;/g,'&');
            for (let i=0; i<exclude.length; i++) if (exclude[i] == str) return str;
            for (let i=0; i<exclude.length; i++) if (exclude[i] == str+'/') return str;
            for (let i=0; i<exclude.length; i++) if (exclude[i]+'/' == str) return str;
			if (e.innerText.indexOf(str) < 0) return str;
            let color = getComputedStyle(document.querySelector('footer a')).color;
            return '<a href="'+str+'" style="border-bottom: 1px dotted '+color+'">'+str+'</a>';
        });
    }

    function urlSearch(e) {
        let i;
        for (i=0; i<e.querySelectorAll('.communication__body__text').length; i++) {
			greentext(e.querySelectorAll('.communication__body__text')[i]);
			urlSearchInElem(e.querySelectorAll('.communication__body__text')[i]);
			YDBSpoilers(e.querySelectorAll('.communication__body__text')[i]);
		}
        for (i=0; i<e.querySelectorAll('.profile-about').length; i++) {
			greentext(e.querySelectorAll('.profile-about')[i]);
			urlSearchInElem(e.querySelectorAll('.profile-about')[i]);
			YDBSpoilers(e.querySelectorAll('.profile-about')[i]);
		}
        for (i=0; i<e.querySelectorAll('.image-description').length; i++) {
			greentext(e.querySelectorAll('.image-description')[i]);
			urlSearchInElem(e.querySelectorAll('.image-description')[i]);
			YDBSpoilers(e.querySelectorAll('.image-description')[i]);
		}
    }

	//gallery sort
	function addGalleryOption() {
		if (location.pathname == "/search" || location.pathname == '/search/index') {
			let t = simpleParse(document.querySelector('.js-search-field').value);
			for (let i=0; i<t.length; i++) {
				if (t[i].startsWith('gallery_id')) {
					addElem('option',{value:t[i],innerHTML:'As in gallery #'+t[i].split(':').pop()},document.querySelector('#searchform select[name="sf"]'));
				}
			}
			if (parseURL(location.href).params.sf == undefined) return;
			let sf = parseURL(location.href).params.sf.replace('%3A',':');
			if (sf.startsWith('gallery_id')) {
				document.querySelector('#searchform select[name="sf"] option[value*="'+sf.split(':').pop()+'"]').selected = true;
			}
		}
		else if (location.pathname.startsWith("/galleries")) {
			let id = location.pathname.split('/').pop();
			addElem('a',{href:'/search?q=gallery_id%3A'+id+'&sf=gallery_id%3A'+id+'&sd=desc',innerHTML:'Open in search'},document.querySelector('.block__header--sub'));
		}
	}

	//highlight artist
	function getArtists() {
		if (!((parseInt(location.pathname.slice(1))>=0 && location.pathname.split('/')[2] == undefined) || (location.pathname.split('/')[1] == 'images' && parseInt(location.pathname.split('/')[2])>=0 && location.pathname.split('/')[3] == undefined))) return;
		let initHighlight = function(n, editor) {
			if (document.querySelector('.image_uploader a') != undefined && document.querySelector('.image_uploader a').innerHTML == n) {
				for (let i=0; i<document.querySelectorAll('.image_uploader a').length; i++) {
					document.querySelectorAll('.image_uploader a')[i].classList.add(editor?'_ydb_orange':'_ydb_green');
				}
			}
		}

		let callback = function(r) {
			let x = InfernoAddElem('div',{innerHTML:r.responseText,style:{display:'none'}},[]);
			let exit = function() {

			};
			for (let i=0; i<x.querySelectorAll('.tag-info__more strong').length; i++) {
				let ax = x.querySelectorAll('.tag-info__more strong')[i];
				if (ax.innerHTML == 'Associated Derpibooru users:') {
					let n = ax.nextSibling.nextSibling;
					for (let j=0; j<artists.length; j++) if (n.innerHTML == artists[j]) {
						exit();
						return;
					}
					artists.push(n.innerHTML);
					isEditors.push(r.el.innerHTML.startsWith('editor:') || r.el.innerHTML.startsWith('colorist:'));
					while (n.nextSibling != undefined && n.nextSibling.nextSibling != undefined && n.nextSibling.nextSibling.tagName == 'A') {
						n = n.nextSibling.nextSibling;
						artists.push(n.innerHTML);
					}
					initHighlight(n.innerHTML, r.el.innerHTML.startsWith('editor:') || r.el.innerHTML.startsWith('colorist:'));
					let id;
					if (getUser(n.innerHTML).id == 0) {
						addUserInBase(n.innerHTML, undefined, {tags:[r.el.innerHTML]})
					}
					else {
						let user = getUser(n.innerHTML);
						addUserInBase(user.name, user.id, {tags:[r.el.innerHTML]})
					}
					highlightArtist(document, n.innerHTML, r.el.innerHTML.startsWith('editor:') || r.el.innerHTML.startsWith('colorist:'));
					break;
				}
			}
			exit();
		};

		let readyHandler = function(request) {
            return function () {
                if (request.readyState === 4) {
                    if (request.status === 200) return callback(request);
                    else if (request.status === 0) {
                        return false;
                    }
                    else {
                        return false;
                    }
                }
            };
        };

		let checked=0;
        let get = function(el) {
			if (userbase.artists[el.innerHTML] != undefined && Math.random()*200>1) {
				let n = userbase.users[userbase.artists[el.innerHTML]].name;
				artists.push(n);
				isEditors.push(el.innerHTML.startsWith('editor:') || el.innerHTML.startsWith('colorist:'));
				initHighlight(n,el.innerHTML.startsWith('editor:') || el.innerHTML.startsWith('colorist:'));
				highlightArtist(document, n, el.innerHTML.startsWith('editor:') || el.innerHTML.startsWith('colorist:'));
			}
			else {
				if (checked > 1) return;
				let req = new XMLHttpRequest();
				req.el = el;
				req.u = (userbase.artists[el.innerHTML] != undefined);
				req.onreadystatechange = readyHandler(req);
				req.open('GET', el.href);
				checked++;
				req.send();
			}
        };

		for (let i=0; i<document.querySelectorAll('.tag.dropdown[data-tag-category="origin"] .tag__name').length; i++) {
			let el = document.querySelectorAll('.tag.dropdown[data-tag-category="origin"] .tag__name')[i];
			if (el.innerHTML == 'edit' || el.innerHTML == 'alternate version' || el.innerHTML == 'screencap' || el.innerHTML == 'edited screencap' || el.innerHTML == 'them\'s fightin\' herds' || el.innerHTML == 'derpibooru exclusive') continue;
			get(el);
		}
	}

	function highlightArtist(e, name, editor) {
		let highlight = function(e,n, editor) {
			for (let i=0; i<e.getElementsByClassName('communication__body').length; i++) {
				let el = e.getElementsByClassName('communication__body')[i];
				if (el.querySelector('.communication__body__sender-name a') != undefined && el.querySelector('.communication__body__sender-name a').innerHTML == n) {
					el.querySelector('.communication__body__sender-name a').classList.add(editor?'flash--warning':'flash--success');
				}
			}
		};
		if (name != undefined) highlight(e, name, editor);
		else {
			for (let i=0; i<artists.length; i++) highlight(e, artists[i], isEditors[i]);
		}
	}

	//highlight uploader
	function showUploader(e) {
		if (document.querySelector('.image_uploader a') == undefined) return;
		let n = document.querySelector('.image_uploader a').innerHTML;
		for (let i=0; i<e.getElementsByClassName('communication__body').length; i++) {
			let el = e.getElementsByClassName('communication__body')[i];
			if (el.querySelector('.communication__body__sender-name a') != undefined && el.querySelector('.communication__body__sender-name a').innerHTML == n) {
				addElem('span',{innerHTML:' (OP)'},el.querySelector('.communication__body__sender-name'));

			}
		}
	}

	//compress comments
	function shrinkComms(e) {
		for (let i=0; i<e.querySelectorAll('.block.communication, .profile-about').length; i++) {
			let baseSize = parseInt(ls.shrinkComms);
			let el = e.querySelectorAll('.block.communication, .profile-about')[i];
			if (el.classList.contains('profile-about')) {
				el = el.parentNode;
				//baseSize *= 4;
			}
			if (el.clientHeight == 0) {
				setTimeout(function() {shrinkComms(e)}, 200);
				return;
			}
			if (el.clientHeight > baseSize*1.2+13) {
				let t = el.querySelector('.communication__body__text, .profile-about');
				if (t.classList.contains('_ydb_t_comm_shrink')) continue;
				t.classList.add('_ydb_t_comm_shrink');
				t.style.maxHeight = baseSize*0.8+'px';
				el.style.position = 'relative';
				let x;
				let y = InfernoAddElem('div',{className:'block__content communication__options _ydb_tools_compress', style:{display:'none',textAlign:'center',fontSize:'150%',marginBottom:'2px'}},[
					InfernoAddElem('a',{href:'javascript://', style:{width:'100%',display:'inline-block'}, events:[{t:'click',f:function() {
						t.classList.add('_ydb_t_comm_shrink');
						t.style.maxHeight = baseSize*0.8+'px';
						x.style.display = 'block';
						y.style.display = 'none';
					}}]}, [
						InfernoAddElem('i',{innerHTML:'\uF062',className:'fa'},[]),
						InfernoAddElem('span',{innerHTML:' Shrink '},[]),
						InfernoAddElem('i',{innerHTML:'\uF062',className:'fa'},[])
					])
				]);
				x = InfernoAddElem('div',{className:'block__content communication__options _ydb_tools_expand', style:{position:'absolute',textAlign:'center',fontSize:'150%',bottom:(t.classList.contains('profile-about')?0:(el.querySelector('.communication__options').clientHeight+4))+'px',width:'calc(100% - 14px)'}},[
					InfernoAddElem('a',{href:'javascript://', style:{width:'100%',display:'inline-block'},events:[{t:'click',f:function() {
						t.classList.remove('_ydb_t_comm_shrink');
						t.style.maxHeight = 'none';
						x.style.display = 'none';
						y.style.display = 'block';
					}}]}, [
						InfernoAddElem('i',{innerHTML:'\uF063',className:'fa'},[]),
						InfernoAddElem('span',{innerHTML:' Expand '},[]),
						InfernoAddElem('i',{innerHTML:'\uF063',className:'fa'},[])
					])
				]);
				if (t.classList.contains('profile-about')) {
					if (ls.shrinkButt) el.appendChild(y);
					el.appendChild(x);
				}
				else {
					if (ls.shrinkButt) el.insertBefore(y,el.lastChild);
					el.insertBefore(x,el.lastChild);
				}
			}
			else if (el.clientHeight < baseSize*0.8+13) {
				let t = el.querySelector('.communication__body__text, .profile-about');
				if (t.classList.contains('_ydb_t_comm_shrink') && parseInt(t.style.maxHeight)<t.clientHeight) {
					if (el.getElementsByClassName('_ydb_tools_compress')[0] != undefined) el.removeChild(el.getElementsByClassName('_ydb_tools_compress')[0]);
					el.removeChild(el.getElementsByClassName('_ydb_tools_expand')[0]);
					t.classList.remove('_ydb_t_comm_shrink');
				}
			}
		}
	}

	//compress badges
	function compressBadges(e) {
		if (!ls.hideBadges) return;
		let bd = getBadgesImplications();
		let x = e.querySelectorAll('.badges:not(._ydb_b_checked)');
		for (let i=0; i<x.length; i++) {
			for (let j=0; j<x[i].getElementsByClassName('badge').length; j++) {
				let y = x[i].getElementsByClassName('badge')[j];
				let bname = y.getElementsByTagName('img')[0].title.split('-')[0].trim();
				if (bd.normal[bname] != undefined) {
					for (let k=0; k<bd.normal[bname].length; k++) {
						let ax = x[i].querySelector('img[alt^="'+bd.normal[bname][k]+'"]');
						if (ax != undefined) ax.parentNode.classList.add('hidden');
					}
				}
				if (bd.extreme[bname] != undefined && ls.hideBadgesX) {
					for (let k=0; k<bd.extreme[bname].length; k++) {
						let ax = x[i].querySelector('img[alt^="'+bd.extreme[bname][k]+'"]');
						if (ax != undefined) ax.parentNode.classList.add('hidden');
					}
				}
				if (bd.donations[bname] != undefined && ls.hideBadgesP) {
					for (let k=0; k<bd.donations[bname].length; k++) {
						let ax = x[i].querySelector('img[alt^="'+bd.donations[bname][k]+'"]');
						if (ax != undefined) ax.parentNode.classList.add('hidden');
					}
				}
			}
			x[i].classList.add('_ydb_b_checked');
		}
	}

    //deactivateButtons
	function deactivateButtons(e, inital, itsHide) {
        if (!ls.deactivateButtons) return;
        let work = function(el) {
			if (el.querySelector('.media-box__header--link-row') == undefined) return;
            if (inital) {
                el.addEventListener('DOMNodeInserted',function(e) {
                    setTimeout(function() {deactivateButtons(el,false);}, 100);
                });
                el.querySelector('.media-box__header .interaction--hide').addEventListener('click',function(e) {
                    deactivateButtons(el,false, true);
                });
            }
            try{
            if (el.querySelector('.media-box__header .interaction--upvote.active') != undefined || el.querySelector('.media-box__header .interaction--fave.active') != undefined) {
				el.querySelector('.media-box__header .interaction--hide').classList.add('hidden');
				el.querySelector('.media-box__header .interaction--downvote').classList.add('hidden');
			}
            else {
				el.querySelector('.media-box__header .interaction--hide').classList.remove('hidden');
				el.querySelector('.media-box__header .interaction--downvote').classList.remove('hidden');
            }

			if (el.querySelector('.media-box__header .interaction--downvote.active') != undefined || ((el.querySelector('.media-box__header .interaction--downvote.active') == undefined ^ el.querySelector('.media-box__header .interaction--hide.active') == undefined) ^ itsHide)) {
				el.querySelector('.media-box__header .interaction--upvote').classList.add('hidden');
				el.querySelector('.media-box__header .interaction--fave').classList.add('hidden');
			}
            else {
				el.querySelector('.media-box__header .interaction--upvote').classList.remove('hidden');
				el.querySelector('.media-box__header .interaction--fave').classList.remove('hidden');
            }
            }
            catch (e) {}
        };

        let soloWork = function(el) {
            if (inital) {
                el.addEventListener('DOMNodeInserted',function(e) {
                    setTimeout(function() {deactivateButtons(el,false);}, 100);
                });
                el.querySelector('.interaction--hide').addEventListener('click',function(e) {
                    deactivateButtons(el,false,true);
                });
            }
            if (el.querySelector('.interaction--upvote.active[href="#"]') != undefined || el.querySelector('.interaction--fave.active[href="#"]') != undefined) {
				el.querySelector('.interaction--downvote[href="#"]').classList.add('hidden');
				el.querySelector('.interaction--hide[href="#"]').classList.add('hidden');
			}
            else {
				el.querySelector('.interaction--downvote[href="#"]').classList.remove('hidden');
				el.querySelector('.interaction--hide[href="#"]').classList.remove('hidden');
            }

			if (el.querySelector('.interaction--downvote.active[href="#"]') != undefined || el.querySelector('.interaction--hide.active[href="#"]') != undefined ^ itsHide) {
				el.querySelector('.interaction--upvote[href="#"]').classList.add('hidden');
				el.querySelector('.interaction--fave[href="#"]').classList.add('hidden');
			}
            else {
				el.querySelector('.interaction--upvote[href="#"]').classList.remove('hidden');
				el.querySelector('.interaction--fave[href="#"]').classList.remove('hidden');
            }
        };
        if (e.classList!=undefined && e.classList.contains('media-box')) work(e);
        else if (document.querySelector('.image-metabar .stretched-mobile-links:nth-child(2)') != undefined) soloWork(document.querySelector('.image-metabar .stretched-mobile-links:nth-child(2)'));
		else for (let i=0; i<e.getElementsByClassName('media-box').length; i++) {
			work(e.getElementsByClassName('media-box')[i]);
		}
	}

	//similar images
	function similar() {
		if (document.getElementById('image_old_tag_list') == undefined) return;
		let tags = '('+document.getElementById('image_old_tag_list').value.replace(/\, /g,' || ')+' || *), -(id:'+document.getElementsByClassName('image-show-container')[0].dataset.imageId+')';
		document.querySelectorAll('a[href*="/related/"]').forEach(function(e,i,a) {e.href = '/search?q='+encodeURIComponent(tags).replace(/%20/g,'+')+'&sd=desc&sf=random';});
	}

	function commentButtons(e) {
        let work = function(el) {
			if (el.querySelector('.media-box__header--link-row') == undefined) return;
            el.querySelector('.media-box__header .interaction--comments').href = el.querySelector('.media-box__content a').href+'#comments';
        };

        for (let i=0; i<e.getElementsByClassName('media-box').length; i++) {
			work(e.getElementsByClassName('media-box')[i]);
		}
	}

	function hiddenImg(e, inital, invert) {
		let horsie = (document.querySelector('body[data-theme*="ponyicons"]')?'pony':'normal');
        let im = hidden[horsie][parseInt(Math.random()*hidden[horsie].length)];
		if (!ls.fastHide) return;
		if (parseURL(location.href).params.hidden == '1') return;
        let work = function(el) {
			if (el.querySelector('.media-box__header--link-row') == undefined) return;
            if (inital) {
                el.querySelector('.media-box__header .interaction--hide').addEventListener('click',function(e) {
                    hiddenImg(el,false,true);
                });
            }
			if (el.querySelector('.media-box__header--link-row') == undefined) return;
            if ((el.querySelector('.media-box__header .interaction--hide.active') != undefined ^ invert)) {
				if (el.querySelector('.media-box__content picture img') != undefined) {
					el.querySelector('.image-container').dataset.hthumb = el.querySelector('.media-box__content picture img').src;
					el.querySelector('.image-container').dataset.hsthumb = el.querySelector('.media-box__content picture img').srcset;
					el.querySelector('.media-box__content picture img').src = im.small;
					el.querySelector('.media-box__content picture img').srcset = im.small+' 1x,'+im.big+' 2x';
				}
				else {
					el.querySelector('.media-box__content a video').style.display = 'none';
					ChildsAddElem('picture',{},el.querySelector('.media-box__content a'), [
						InfernoAddElem('img',{src:im.small, srcset:im.small+' 1x,'+im.big+' 2x'},[])
					]);
				}
			}
			else if (!inital) {
				if (el.querySelector('.media-box__content a video') != undefined) {
					el.querySelector('.media-box__content a video').style.display = 'block';
					el.querySelector('.media-box__content a picture').style.display = 'none';
				}
				else {
					el.querySelector('.media-box__content picture img').src = el.querySelector('.image-container').dataset.hthumb;
					el.querySelector('.media-box__content picture img').srcset = el.querySelector('.image-container').dataset.hsthumb;
				}
			}
        };

        if (e.classList!=undefined && e.classList.contains('media-box')) work(e);
        else for (let i=0; i<e.getElementsByClassName('media-box').length; i++) {
			work(e.getElementsByClassName('media-box')[i]);
		}
	}

	//canonical headers
	function oldHeaders() {
		let xs = `#content>.block>.block__header.flex:not(.image-metabar) {flex-wrap: wrap;}`;
		//document.head.appendChild(InfernoAddElem('style',{innerHTML:xs},[]))
		GM_addStyle(xs);
	}

    //target _blank
    //domain fixes
    function linksPatch(doc) {
        let a = doc.getElementsByTagName('a');
        let domains = ['www.trixiebooru.org', 'trixiebooru.org', 'www.derpibooru.org', 'derpibooru.org', 'www.derpiboo.ru', 'derpiboo.ru'];
        for (let i=0; i<a.length; i++) {
            for (let j=0; j<domains.length; j++)
                if (a[i].host != location.host && a[i].host == domains[j]) a[i].host = location.host;
            if (a[i].host != location.host && a[i].host != '') {
				a[i].target = '_blank';
				a[i].rel = 'nofollow noreferrer';
			}
        }
    }

	/////////////////////////////////////////////
	//user aliases
	let UBinterval = 1209600000;
	let userbase = {
		users:{},
		pending:[],
		artists:{}
	};
	let userbase_local = {
		friendlist:[],
		scratchpad:{}
	};
	let userbaseTS = {
		ttu:0,
		lastRun:0,
		fix:0,
		migrated:false
	};
	let userbaseStarted = false;
	let getUserId, getUserName, addUserInBase, UAwrite, UACLwrite, addUserPending, getUser, addUserPendingById;


	function UA(e) {
		let nameIndex = {};
		let nameEncode = function(name) {
			return encodeURI(name.replace(/\-/g,'-dash-').replace(/\+/g,'-plus-').replace(/\:/g,'-colon-').replace(/\./g,'-dot-').replace(/\//g,'-fwslash-').replace(/\\/g,'-bwslash-').replace(/ /g,'+')).replace(/\&lt;/g,'%3C').replace(/\#/,'%2523');
		};

		let getUserByName = function (name) {
			if (nameIndex[name] != undefined) return userbase.users[nameIndex[name]];
			for (let i in userbase.users) {
				nameIndex[userbase.users[i].name] = i;
				if (name == userbase.users[i].name) return userbase.users[i];
			}
			debug('YDB:U','Failed to find user with name "'+name+'".', 0);
			return {id:0,name:'[UNKNOWN USER]',aliases:[],tags:[]}
		};

		let write = function() {
			localStorage._ydb_toolsUB2 = JSON.stringify(userbase);
		};

		let clwrite = function() {
			localStorage._ydb_toolsUBLocal = JSON.stringify(userbase_local);
			if (unsafeWindow._YDB_public.funcs.backgroundBackup!=undefined) unsafeWindow._YDB_public.funcs.backgroundBackup();
		};

		let tswrite = function() {
			localStorage._ydb_toolsUBTS = JSON.stringify(userbaseTS);
		};

		let addPending = function(user) {
			if (userbase.pending.indexOf(user.id) != -1 || user.id == null) return;
			userbase.pending.push(parseInt(user.id));
			debug('YDB:U','User "'+user.name+'" ('+user.id+') added to pending list.', 0);
			write();
		};

		let addPendingById = function(id) {
			if (userbase.pending.indexOf(id) != -1 || id == null) return;
			userbase.pending.push(parseInt(id));
			debug('YDB:U','User with id '+id+' added to pending list.', 0);
			write();
		};

		let removeUser = function(id) {
			let user = userbase.users[id];
			if (user == undefined) return;
			for (let i in user.tags) {
				delete userbase.artists[user.tags[i]];
			}
			if (userbase.pending.indexOf(id) != -1) userbase.pending.splice(userbase.pending.indexOf(id),1);
		};

		let getId = function(name, callback) {
			fetch('/profiles/'+nameEncode(name)+'.json',{method:'GET'})
			.then(function (response) {
				const errorMessage = {fail:true};
				if (!response.ok) {
					debug('YDB:U','Error in response while performing "updateId" on "'+name+'"', 2);
					setTimeout(function() {getId(name, callback)}, 200);
					errorMessage.retry = true;
					return errorMessage;
				}
				if (response.redirected) {
					debug('YDB:U','Redirected response while performing "updateId" on "'+name+'". Encoded to '+nameEncode(name), 2);
					return errorMessage;
				}
				return response.json();
			})
			.then(data => {
				if (data.fail) {
					if (!data.retry) callback();
					return;
				}
				try {
					callback(data.id);
					debug('YDB:U','Received id '+id+' of user "'+id+'".', 0);
				}
				catch(e) {
					debug('YDB:U','Failed to decode ID in reponse while performing "updateId" on "'+name+'". Encoded to '+nameEncode(name), 2);
				}
			});
		};

		let getName = function(id, callback) {

			fetch('/lists/user_comments/'+id,{method:'GET'})
			.then(function (response) {
				const errorMessage = {fail:true};
				if (!response.ok) {
					debug('YDB:U','Error in response while performing "updateName" on user with id '+id, 2);
					return errorMessage;
				}
				if (response.redirected) {
					debug('YDB:U','Redirected response while performing "updateName" on user with id '+id, 2);
					return errorMessage;
				}
				return response.text();
			})
			.then(data => {
				if (data.fail) return;
				try {
					let n = document.createElement('div');
					n.innerHTML = data;
					let name = n.getElementsByTagName('h1')[0].innerHTML.slice(0,-11);
					debug('YDB:U','Received name "'+name+'" of user with id '+id+'.', 0);
					callback(name);
				}
				catch(e) {
					debug('YDB:U','Failed to find userName in reponse while performing "updateName" on user with id '+id+'.', 2);
				}
			});

		};

		let updateId = function(user, callback) {
			getId(user.name, function (id) {
				if (id != undefined) {
					user.id = id;
					user.updated = parseInt(Date.now()/1000);
				}
				callback(user);
			})
		};

		let updateName = function(user, callback) {
			getName(user.id, function (name) {
				if (user.name != undefined && user.name != '[UNKNOWN]' && user.name != name) {
					user.aliases.push(user.name);
					debug('YDB:U','User "'+user.name+'" ('+user.id+') was renamed into "'+name+'".', 0);
				}
				if (user.name != name) {
					user.name = name;
					user.updated = parseInt(Date.now()/1000);
				}
				callback(user);
			})
		};

		let createUser = function(name, id, content) {
			let writeEntry = function(newId) {
				if (newId == undefined) return;
				let user = {id:newId, name:name, aliases:[], tags:[]};
				if (userbase.users[newId] != undefined) {
					let changed = false;
					let oldUser = userbase.users[newId];

					user.aliases = oldUser.aliases;
					user.tags = oldUser.tags;
					user.updated = parseInt(Date.now()/1000);
					//in case of renaming
					if (user.name != oldUser.name) {
						user.aliases.push(oldUser.name);
						debug('YDB:U','User "'+oldUser.name+'" ('+user.id+') was renamed into "'+user.name+'".', 0);
						changed = true;
					}

					//adding aliases
					if (content.aliases != undefined && content.aliases.length>0) {
						for (let i=0; i<content.aliases.length; i++) {
							let found = false;
							if (content.aliases[i] == oldUser.name) found = true;
							for (let j=0; j<oldUser.aliases.length; j++) {
								if (content.aliases[i] == oldUser.aliases[j]) {
									found = true;
									break;
								}
							}
							if (!found) {
								user.aliases.push(content.aliases[i]);
								changed = true;
							}
						}
					}

					//adding artist tags
					if (content.tags != undefined && content.tags.length>0) {
						for (let i=0; i<content.tags.length; i++) {
							let found = false;
							for (let j=0; j<oldUser.tags.length; j++) {
								if (content.tags[i] == oldUser.tags[j]) {
									found = true;
									break;
								}
							}
							if (!found) {
								user.tags.push(content.tags[i]);
								if (userbase.artists[content.tags[i]] != undefined && userbase.artists[content.tags[i]] != user.id) {
									//removing artist tag from user which is no longer connected to it
									let u = userbase.users[userbase.artists[content.tags[i]]];
									if (u.tags.indexOf(content.tags[i]) != -1) u.tags.splice(u.tags.indexOf(content.tags[i]),1);
									debug('YDB:U','Removed tag "'+content.tags[i]+'" from "'+u.name+'" ('+u.id+') because "'+u.name+'" ('+u.id+') has it now.', 0);
								}
								userbase.artists[content.tags[i]] = user.id;
								changed = true;
							}
						}
					}

					if (changed) {
						userbase.users[newId] = user;
						debug('YDB:U','Updated user "'+user.name+'" ('+user.id+').', 1);
						write();
					}
				}
				else {
					//new user
					if (getUserByName(user.name).id != id && getUserByName(user.name).id != 0) {
						//user with this name exists... should recheck old one
						addPending(getUserByName(user.name));
					}

					//adding aliases
					if (content.aliases != undefined && content.aliases.length>0) {
						for (let i=0; i<content.aliases.length; i++) {
							user.aliases.push(content.aliases[i]);
						}
					}

					//adding artist tags
					if (content.tags != undefined && content.tags.length>0) {
						for (let i=0; i<content.tags.length; i++) {
							user.tags.push(content.tags[i]);
							if (userbase.artists[content.tags[i]] != undefined) {
								//removing artist tag from user which is no longer connected to it
								let u = userbase.users[userbase.artists[content.tags[i]]];
								if (u.tags.indexOf(content.tags[i]) != -1) u.tags.splice(u.tags.indexOf(content.tags[i]),1);
								debug('YDB:U','Removed tag "'+content.tags[i]+'" from "'+u.name+'" ('+u.id+') because "'+u.name+'" ('+u.id+') has it now.', 0);
							}
							userbase.artists[content.tags[i]] = user.id;
						}
					}

					userbase.users[newId] = user;
					debug('YDB:U','Created user "'+user.name+'" ('+user.id+').', 1);
					write();
				}
			};
			if (id == undefined) getId(name, writeEntry);
			else writeEntry(id);
		};

		let migrate = function() {

			if (localStorage._ydb_toolsUB == undefined) return;
            let callWindow = function(inside) {
                return ChildsAddElem('div',{className:'_ydb_window block__content'},document.body,inside);
            }
            if (unsafeWindow._YDB_public != undefined && unsafeWindow._YDB_public.funcs != undefined && unsafeWindow._YDB_public.funcs.callWindow != undefined) {
                callWindow = unsafeWindow._YDB_public.funcs.callWindow;
            }
            let win = callWindow([
                InfernoAddElem('h1',{innerHTML:'Renewing userbase...'},[]),
                InfernoAddElem('span',{innerHTML:'Please be patient and don\'t close or navigate tab.'},[]),
                InfernoAddElem('hr',{},[]),
                InfernoAddElem('span',{id:"_ydb_t_ub_status",innerHTML:'Reading...'},[])
            ]);
			try {
				let inline = 0, errors = 0;
				let temp = JSON.parse(localStorage._ydb_toolsUB);
                let done = false;

				let finalize = function() {
					for (let i in temp.artists) {
						if (!isNaN(parseInt(temp.artists[i])) && userbase.users[temp.artists[i]] != undefined) {
							userbase.artists[i] = temp.artists[i];
							userbase.users[userbase.artists[i]].tags.push(i);
						}
					}
					for (let i in userbase_local.scratchpad) userbase.pending.push(i);
					for (let i=0; i<userbase_local.friendlist.length; i++) {
						if (userbase.pending.indexOf(userbase_local.friendlist[i]) != -1)
							userbase.pending.push(userbase_local.friendlist[i]);
					}
					write();
					userbaseTS.migrated = true;
					tswrite();
					if (errors == 0) debug('YDB:U','Database was successfully migrated to new version.', 1);
					else debug('YDB:U','Database was migrated to new version with '+errors+' missed entries.', 1);
					if (win != undefined) win.style.display = 'none';
				};

				let writeEntry = function(user) {
					if (user.id != undefined) {
						userbase.users[user.id] = user;
					}
                    else errors++;
					inline--;
					if (inline == 0 && done) finalize();
				};

				for (let i in temp.users) {
					inline++;
					let user = {
						name:i,
						id:temp.users[i].id,
						aliases:temp.users[i].aliases,
						tags:[],
						updated:parseInt(Date.now()/1000)
					};
					if (user.id == undefined || isNaN(user.id)) updateId(user, function() {writeEntry(user)});
					else writeEntry(user);
				}
                done = true;
                if (inline == 0) finalize();
				document.getElementById('_ydb_t_ub_status').innerHTML = 'Waiting for responses... If it takes too long (more than 5 seconds) reload page.';
			}
			catch (e) {
				debug('YDB:U', 'Failed to migrate a database! '+e, 2);
			}
		};

		let fixDupesInNames = function() {
			for (let id in userbase.users) {
				let user = userbase.users[id];
				let name = user.name;
				for (let i=0; i<user.aliases.length; i++) {
					if (user.aliases[i] == name) {
						user.aliases.splice(i, 1);
						i--;
					}
				}
				for (let i=0; i<user.aliases.length-1; i++) {
					name = user.aliases[i];
					for (let j=i+1; j<user.aliases.length; j++) {
						if (user.aliases[j] == name) {
							user.aliases.splice(j, 1);
							j--;
						}
					}
				}
			}
			write();
		};

		if (!userbaseStarted) {
			getUserId = function (name, callback) {return getId(name, callback);};
			getUserName = function (id, callback) {return getName(id, callback);};
			getUser = function (name) {return getUserByName(name);};
			addUserInBase = function (name, id, content) {createUser(name, id, content);};
			addUserPending = function(user) {addPending(user);};
			addUserPendingById = function(id) {addPendingById(id);};
			UAwrite = function (name, id) {write();};
			UACLwrite = function (name, id) {clwrite();};

			//чтение
			//metadata
			try {
				let temp = JSON.parse(localStorage._ydb_toolsUBTS);
				userbaseTS = temp;
			}
			catch(e) {
				if (userbase.ttu != undefined) {
					userbaseTS.ttu = userbase.ttu;
					userbaseTS.lastRun = userbase.lastRun;
				}
			}

			//cloud database
			try {
				let temp = JSON.parse(localStorage._ydb_toolsUBLocal);
				userbase_local = temp;
			}
			catch(e) {}

			//database
			try {
				let temp = JSON.parse(localStorage._ydb_toolsUB2);
				userbase = temp;
			}
			catch(e) {
				if (localStorage._ydb_toolsUB != undefined) migrate();
				else {
					userbaseTS.migrated = true;
					tswrite();
				}
			}

			//cleaning updates
			for (let i=0; i<userbase.pending.length; i++) {
				userbase.pending[i] = parseInt(userbase.pending[i]);
				if (userbase.pending[i] == 0 || isNaN(userbase.pending[i])) {
					userbase.pending.splice(i,1);
					i--;
				}
				else {
					for (let j=0; j<i; j++) {
						if (userbase.pending[i] == userbase.pending[j]) {
							userbase.pending.splice(i,1);
							i--;
							break;
						}
					}
				}
			}

			//pending updates
			if (!userbaseTS.checkedDupes) {
				fixDupesInNames();
				userbaseTS.checkedDupes = true;
				tswrite();
			}
			if (userbase.pending.length>0) {
				userbaseTS.ttu -= (Date.now()-userbaseTS.lastRun);
				if (userbaseTS.ttu <= 0) {
					if (userbaseTS.lastRun == 0) userbaseTS.ttu = 0;
					if (userbase.users[userbase.pending[0]] == undefined) createUser('[UNKNOWN]', userbase.pending[0], {});
					updateName(userbase.users[userbase.pending[0]], function(user) {
						debug('YDB:U','Updated user "'+user.name+'" ('+user.id+').', 1);
						userbase.pending.shift();
						if (userbase_local.friendlist.indexOf(user.id) != -1 || userbase_local.scratchpad[user.id] != undefined)
							userbase.pending.push(user.id);
						userbaseTS.lastRun = Date.now();
						userbaseTS.ttu += UBinterval/userbase.pending.length;
						userbaseTS.ttu = parseInt(userbaseTS.ttu);
						userbaseTS.checkedDupes = false;
						tswrite();
						write();
					});
				}
				tswrite();
			}

			userbaseStarted = true;
			let touched = false;

			//filling friends
			for (let i=0; i<userbase_local.friendlist.length; i++) {
				if (userbase.users[userbase_local.friendlist[i]] == undefined) {
					createUser('[UNKNOWN]', userbase_local.friendlist[i], {});
					addPending(i);
				}
				touched = true;
			}
			//filling scratchpad
			for (let i in userbase_local.scratchpad) {
				if (userbase.users[i] == undefined) {
					createUser('[UNKNOWN]', i, {});
					addPending(i);
				}
				touched = true;
			}

			//writing in cloud storage
			if (touched) write();

			//gathering old names from profile page
			if (document.querySelector('.profile-top__name-header') != undefined) {
				let name = document.querySelector('.profile-top__name-header').innerHTML.slice(0, -10);
				if (getUserByName(name).id == 0) {
					if (document.querySelector('.profile-top__name-header').nextSibling.tagName == undefined) {
						let t = document.querySelector('.profile-top__name-header').nextSibling.wholeText;
						t = t.substring(21,t.length-2).trim();
						let aliases = [t];
						let id = document.querySelector('a[href*="/lists/user_comments"]').href.split('/').pop();

						createUser(name, id, {aliases:aliases});
					}
				}
				let a = getUserByName(name).aliases;
				if (a.length>0) {
					let ae = [];
					for (let i=0;i<a.length; a++) {
						ae.push(InfernoAddElem('div',{className:'alternating-color block__content', innerHTML:a[i]},[]));
					}
					ae.unshift(InfernoAddElem('div',{className:'block__header'},[
						InfernoAddElem('span',{className:'block__header__title',innerHTML:'Also known as:'},[])
					]));
					document.querySelector('.column-layout__left').insertBefore(
						InfernoAddElem('div',{className:'block'},ae)
					,document.querySelector('.column-layout__left').firstChild);
				}
			}
		}

		if (e == undefined) return;

        //checking posts and comments
		for (let i=0; i<e.getElementsByClassName('communication__body').length; i++) {
			let el = e.getElementsByClassName('communication__body')[i];
			let eln = el.querySelector('.communication__body__sender-name a');
			if (eln == undefined) continue;
			let ele = el.querySelector('.communication__body__sender-name');
			let name = eln.innerHTML;
			//scratchpad content and previous names
			if (getUserByName(name).id != 0) {
				let user = getUserByName(name);
				if (userbase_local.scratchpad[user.id] != undefined) {
					eln.title = userbase_local.scratchpad[user.id];
				}
				if (user.aliases.length>0) {
					let s = InfernoAddElem('div',{style:{width:'100px',fontSize:'.86em'}},[
						InfernoAddElem('span',{innerHTML:'AKA '},[]),
						InfernoAddElem('strong',{innerHTML:user.aliases.join(', ')},[]),
						InfernoAddElem('br',{},[])
					]);
					if (!(el.parentNode.querySelector('.flex__fixed.spacing-right').lastChild.classList != undefined && el.parentNode.querySelector('.flex__fixed.spacing-right').lastChild.classList.contains('post-image-container')))
						el.parentNode.querySelector('.flex__fixed.spacing-right').insertBefore(s,el.parentNode.querySelector('.flex__fixed.spacing-right').lastChild);
				}
				//continue;
			}
			//gather aliases
			let alias = ele.nextSibling;
			while (!(alias.classList != undefined && alias.classList.contains('communication__body__text'))) {
				if (alias.classList != undefined && alias.classList.contains('small-text')) {
					let t = alias.innerHTML;
					t = t.substring(21,t.length-2).trim();
                    if (getUserByName(name).id != 0) {
						let user = getUserByName(name);
                        let has = (user.aliases.indexOf(t) != -1);
                        if (has) break;
                        user.aliases.push(t);
						user.updated = parseInt(Date.now()/1000);
                        write();
                    }
                    else {
                        createUser(name, undefined, {aliases:[t]});
                    }
					break;
				}
				alias = alias.nextSibling;
			}
		}

	}

    ////////////////////////////////////////////////

	function scratchPad() {
		let getPreview = function() {
			let previewTab = document.querySelector('.ydb_scratchpad .communication__body__text');
			let body = document.getElementById('_ydb_scratchpad').value;
			let path = '/posts/preview';

            fetchJson('POST', path, { body, anonymous:false})
			.then(function (response) {
				const errorMessage = '<div>Preview failed to load!</div>';
				if (!response.ok)
					return errorMessage;
				return response.text();
				})
			.then(data => {
				let cc = InfernoAddElem('div',{innerHTML:data},[]);
				previewTab.innerHTML = cc.getElementsByClassName('communication__body__text')[0].innerHTML;
                DB_processImages(previewTab.parentNode);
				listRunInComms(previewTab.parentNode);
			});
		}
		if (document.querySelector('.profile-top__name-header') != undefined) {
			let name = document.querySelector('.profile-top__name-header').innerHTML.slice(0, -10);
			let id = document.querySelector('a[href*="/lists/user_comments"]').href.split('/').pop();
			let content = '';
			if (userbase_local.scratchpad[id] != undefined) content = userbase_local.scratchpad[id];
			document.querySelector('.column-layout__left').insertBefore(
				InfernoAddElem('div',{className:'block ydb_scratchpad'},[
					InfernoAddElem('div',{className:'block__header'},[
						InfernoAddElem('span',{className:'block__header__title',innerHTML:'Private scratchpad'},[])
					]),
					InfernoAddElem('div',{className:'block__content'},[
						InfernoAddElem('div',{className:'block'},[
							InfernoAddElem('div',{className:'communication__body__text'},[])
						]),
						InfernoAddElem('textarea',{className:'input input--wide', value:content, id:'_ydb_scratchpad', placeholder:''},[]),
						InfernoAddElem('span',{innerHTML:'Do not use for passwords!'},[]),
						InfernoAddElem('input',{type:'button', className:"button input--wide",value:'Update',events:[{t:'click',f:function(e) {
							if (userbase_local.scratchpad[id] == undefined) {
								if (userbase.users[id] == undefined) {
									addUserInBase(name, id, {});
								}
							}
							userbase_local.scratchpad[id] = document.getElementById('_ydb_scratchpad').value;
							updateCSRF(() => {
                                UACLwrite();
                                getPreview();
                                e.target.classList.add('button--state-success');
                                setTimeout(function() {e.target.classList.remove('button--state-success');}, 200);
                            });
						}}]},[])
					])
				])
			,document.querySelector('.column-layout__left').firstChild);
			getPreview();
		}
	}

	//mark as read
	function readAll() {
		if (location.pathname.startsWith('/notifications')) {
			document.getElementById('content').insertBefore(InfernoAddElem('span',{style:{fontSize:'150%'}},[
				InfernoAddElem('a',{innerHTML:'Read all',href:'#',events:[{t:'click', f:function() {
					document.querySelectorAll('a[data-click-markread]').forEach(function(e,i,a) {
						e.click();
					});
				}}]},[]),
				InfernoAddElem('span',{innerHTML:' | '},[]),
				InfernoAddElem('a',{innerHTML:'Read merging',href:'#',events:[{t:'click', f:function() {
					document.querySelectorAll('a[data-click-markread]').forEach(function(e,i,a) {
						if (e.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.wholeText.startsWith(' merged image'))
							e.click();
					});
				}}]},[])
			]),document.getElementById('content').childNodes[1]);
		}
	}

	//filling
	function resizeEverything(inital) {
		let ccont = document.getElementsByClassName('column-layout__main')[0];
		if (ccont == undefined) return;
		let mwidth = parseInt(ccont.clientWidth) - 14;
		let twidth = parseInt(mwidth/5-8);
		for (let i=0; i<document.getElementsByClassName('js-resizable-media-container').length; i++) {
			let el = document.getElementsByClassName('js-resizable-media-container')[i];
			for (let j=0; j<el.querySelectorAll('.media-box:not(._ydb_resizible)').length; j++) {
				let eli = el.querySelectorAll('.media-box:not(._ydb_resizible)')[j];
				eli.style.width = twidth+'px';
				eli.getElementsByClassName('media-box__header')[0].style.width = twidth+'px';
				eli.getElementsByClassName('media-box__content')[0].style.width = twidth+'px';
				eli.getElementsByClassName('media-box__content')[0].style.height = twidth+'px';
				if (twidth < 150) {
					eli.getElementsByClassName('media-box__header')[0].classList.remove('media-box__header--large');
					eli.getElementsByClassName('media-box__header')[0].classList.add('media-box__header--small');
					eli.getElementsByClassName('media-box__content')[0].classList.remove('media-box__content--large');
					eli.getElementsByClassName('media-box__content')[0].classList.add('media-box__content--small');
					eli.getElementsByClassName('image-container')[0].classList.remove('thumb');
					eli.getElementsByClassName('image-container')[0].classList.add('thumb_small');
					eli.getElementsByClassName('image-container')[0].dataset.size = 'thumb_small';
					if (eli.querySelector('[src*="derpicdn.net"]') != undefined) eli.querySelector('[src*="derpicdn.net"]').src =  eli.querySelector('[src*="derpicdn.net"]').src.replace('/thumb.','/thumb_small.');
					if (eli.querySelector('[src*="derpicdn.net"]') != undefined) eli.querySelector('[src*="derpicdn.net"]').srcset =  eli.querySelector('[src*="derpicdn.net"]').srcset.replace('/thumb.','/thumb_small.');
				}
				else {
					eli.getElementsByClassName('media-box__content')[0].classList.add('media-box__content--large');
					eli.getElementsByClassName('media-box__content')[0].classList.remove('media-box__content--small');
					eli.getElementsByClassName('image-container')[0].classList.add('thumb');
					eli.getElementsByClassName('image-container')[0].classList.remove('thumb_small');
					eli.getElementsByClassName('image-container')[0].dataset.size = 'thumb';
					eli.getElementsByClassName('media-box__header')[0].classList.add('media-box__header--large');
					eli.getElementsByClassName('media-box__header')[0].classList.remove('media-box__header--small');
					if (eli.querySelector('[src*="derpicdn.net"]') != undefined) eli.querySelector('[src*="derpicdn.net"]').src = eli.querySelector('[src*="derpicdn.net"]').src.replace('/thumb_small.','/thumb.');
					if (eli.querySelector('[src*="derpicdn.net"]') != undefined) eli.querySelector('[src*="derpicdn.net"]').srcset =  eli.querySelector('[src*="derpicdn.net"]').srcset.replace('/thumb_small.','/thumb.');
				}
			}
		}
		if (document.getElementsByClassName('js-resizable-media-container').length > 0 && inital) unsafeWindow.addEventListener('resize',resizeEverything);
	}

    //selfbadges
    function badge(core) {
        return true;
        let x = [];
        x = core.querySelectorAll('.communication__body__sender-name');
        for (let i=0; i<x.length; i++) {
            if (x[i].innerHTML.indexOf('St@SyaN') > -1) {
                let b = document.createElement('div');
                b.innerHTML = 'YourBooru dev';
                b.className = 'label label--purple label--block label--small';
                let p = x[i].parentNode;
                p.insertBefore(b, p.getElementsByClassName('label')[0]);
            }
        }
        if (core.querySelector('.profile-top__name-header') != null) {
            x = core.querySelector('.profile-top__name-header');
            if (x.innerHTML.indexOf('St@SyaN') > -1) {
                let b = document.createElement('div');
                b.innerHTML = 'YourBooru dev';
                b.className = 'label label--purple label--block';
                let p = x.parentNode;
                p.insertBefore(b, p.getElementsByClassName('label')[0]);
            }
        }
    }

	//broken preview
	function fixDupes() {
		let cs = document.querySelectorAll('.grid.grid--dupe-report-list:not(._ydb_patched)');
		for (let i=0; i<cs.length; i++) {
			let es = cs[i].querySelectorAll('.image-container.thumb_small');
			for (let j=0; j<es.length; j++) {
				let p = es[j].querySelector('a img');
				if (p != undefined) {
					if (p.src.indexOf('derpicdn.net/assets/1x1') > -1) {
						DB_processImages(es[j].parentNode);
					}
				}
				es[j].querySelector('a').style.lineHeight = '150px';
				es[j].style.minWidth = '150px';
				es[j].style.minHeight = '150px';
			}
			cs[i].classList.add('_ydb_patched');
		}
		setTimeout(fixDupes, 500);
	}

	//custom spoilers
	function customSpoilerApply(spoiler) {
		let ax = JSON.parse(localStorage._ydb_tools_ctags);
		if (ax == undefined) ax = {};
		if (typeof ax == 'object' && Array.isArray(ax)) {
			let cx = {};
			for (let i=0; i<ax.length; i++) cx[ax[i]] = true;
			ax = cx;
			localStorage._ydb_tools_ctags = JSON.stringify(ax);
		}
		// for (let i=0; i<ax.length; i++) if (ax[i] == spoiler.name) return;

		for (let i in localStorage) {
			if (/bor_tags_\d+/.test(i)) {
				let s = JSON.parse(localStorage[i]);
				try {
					if (s.name == spoiler.name && !(s.spoiler_image_uri == spoiler.image)) {
						s.spoiler_image_uri_old = s.spoiler_image_uri;
						s.spoiler_image_uri = spoiler.image;
						ax[spoiler.name] = true;
						debug('YDB:T','Spoiler '+spoiler.name+' successfully added.',1);
						localStorage[i] = JSON.stringify(s);
						localStorage._ydb_tools_ctags = JSON.stringify(ax);
						return true;
					}
				}
				catch (e) {
					debug('YDB:T','Spoiler '+spoiler.name+' cannot be added — unknown reason.',2);
					return false;
				}
			}
		}
		debug('YDB:T','Spoiler '+spoiler.name+' cannot be added — entry does not found.',2);
		return false;
	}

	function customSpoilerRemove(spoiler) {
		let ax = JSON.parse(localStorage._ydb_tools_ctags);
		if (ax == undefined) ax = {};
		if (typeof ax == 'object' && Array.isArray(ax)) {
			let cx = {};
			for (let i=0; i<ax.length; i++) cx[ax[i]] = true;
			ax = cx;
			localStorage._ydb_tools_ctags = JSON.stringify(ax);
		}
		let trigger = false;

		for (let j=0; j<ax.length; j++) if (ax[j] == spoiler.name) {
			trigger = true;
			break;
		}

		if (!trigger) return;

		for (let i in localStorage) {
			if (/bor_tags_\d+/.test(i)) {
				let s = JSON.parse(localStorage[i]);
				if (s.name == spoiler.name) {
					s.spoiler_image_uri = s.spoiler_image_uri_old;
					ax[spoiler.name] = false;
					debug('YDB:T','Spoiler '+spoiler.name+' successfully removed.',1);
				}
			}
		}
		localStorage._ydb_tools_ctags = JSON.stringify(ax);
	}

	function customSpoilerCheck(forced, spoilers) {
        if (spoilers == undefined) return;
		if (!forced && Math.random()>0.1) return;

		//check for activation
		let ax;
		try {
			ax = JSON.parse(localStorage._ydb_tools_ctags);
		}
		catch (e) {
			localStorage._ydb_tools_ctags = '{}';
			ax = {};
		}
		if (ax == undefined) ax = [];
		for (let i=0; i<spoilers.length; i++) {
			customSpoilerApply(spoilers[i]);
		}

		//check for deactivation
		ax = JSON.parse(localStorage._ydb_tools_ctags);
		if (ax == undefined) ax = {};
		for (let i in ax) {
			let trigger = false;
			if (ax[i]) for (let j=0; j<spoilers.length; j++) {
				if (i == spoilers[j].name) {
					trigger = true;
					break;
				}
			}
			if (!trigger) customSpoilerRemove(spoilers[j]);
		}
	}

    function appendCustomNav() {
        let sh = ls.shortcuts;
        if (sh == undefined || sh.length == 0) return;
        let rootLink = '#';
        let links = sh.map(function (sh) {
            if (sh.name != '_root_')
                return InfernoAddElem('a',{innerHTML:sh.name, className:'header__link', href:sh.link, rel:'nofollow noreferrer'},[]);
            else {
                rootLink = sh.link;
                return InfernoAddElem('a',{innerHTML:'', className:'hidden', href:sh.link, rel:'nofollow noreferrer'},[]);
            }
        });
        document.querySelector('.header.header--secondary .hide-mobile').insertBefore(InfernoAddElem('div', {className:'dropdown header__dropdown'}, [
            InfernoAddElem('a', {className:'header__link', href:rootLink}, [
                InfernoAddElem('i', {className:'fa fa-external-link-alt'}, []),
                InfernoAddElem('span', {innerHTML:' '}, []),
                InfernoAddElem('span', {dataset:{clickPreventdefault:true},className:'fa fa-caret-down'}, [])
            ]),
            InfernoAddElem('div', {className:'dropdown__content'}, links)
        ]), document.querySelector('.header.header--secondary .hide-mobile').firstChild);
    }

	// contacts module
	function contacts() {
		if (document.querySelector('.js-burger-links a.header__link[href*="messages"]') == undefined) return;
		let cc = document.querySelector('.js-burger-links a.header__link[href*="messages"]');
		cc.querySelector('i').classList.add('fa-address-book');
		cc.querySelector('i').classList.remove('fa-envelope');
		cc.lastChild.data = ' Contacts';
		cc.href='/pages/yourbooru?contactList';

		if (location.pathname.startsWith('/messages/new')) {
			let x = [];
			for (let i=0; i<userbase_local.friendlist.length; i++) {
				x.push(InfernoAddElem('span',{className:'button',innerHTML:userbase.users[userbase_local.friendlist[i]].name,events:[{t:'click',f:function() {
                    document.getElementById('recipient').value = userbase.users[userbase_local.friendlist[i]].name;
                }}]}));
			}

			document.querySelector('.block__tab.communication-edit__tab .field .field').insertBefore(
				InfernoAddElem('div',{},x),
			document.getElementById('recipient'));
		}

		if (document.getElementsByClassName('profile-top__name-and-links')[0] != undefined) {
			let uid = document.querySelector('a[href*="/lists/user_comments"]').href.split('/').pop();
			let added = false;
			for (let i=0; i<userbase_local.friendlist.length; i++) {
				if (uid == userbase_local.friendlist[i]) {
					added = true;
					break;
				}
			}
			if (!added) document.getElementsByClassName('profile-top__options__column')[0].appendChild(
				InfernoAddElem('li',{},[
					InfernoAddElem('a',{href:'javascript://',innerHTML:'Add to contacts', events:[{t:'click',f:function(e) {
						let name = document.querySelector('.profile-top__name-header').innerHTML.slice(0, -10);
						addUserInBase(name, uid, {});
						userbase_local.friendlist.push(uid);
						addUserPendingById(uid);
						document.getElementsByClassName('profile-top__options__column')[0].lastChild.classList.add('hidden');
						UACLwrite();
					}}]},[])
				])
			);
		}
	}

	function YDB_contacts() {
		document.querySelector('#content h1').innerHTML = 'Contact list';
		let c = document.querySelector('#content .walloftext');
		c.innerHTML = '';

		let users = [];

		let nameEncode = function(name) {
			return encodeURI(name.replace(/\+/g,'-plus-').replace(/\-/g,'-dash-').replace(/\./g,'-dot-').replace(/\//g,'-fwslash-').replace(/\\/g,'-bwslash-').replace(/ /g,'+'));
		};

		let removeUser = function(user) {
			for (let i=0; i<userbase_local.friendlist.length; i++) if (user.id == userbase_local.friendlist[i]) {
				userbase_local.friendlist.splice(i, 1);
				break;
			}
			for (let i=0; i<userbase.pending.length; i++) if (user.id == userbase.pending[i]) {
				userbase.pending.splice(i, 1);
				break;
			}
		};

		let fetchAvatara = function(user, target) {
			let callback = function(req) {
				try {
					let x;
					x = JSON.parse(req.responseText).avatar_url;
					if (x != undefined) {
						target.src = x;
						user.avatar = x;
						debug('YDB:U','Got avatar from '+user.name+'.', 0);
					}
					else {
						user.avatar = '';
						debug('YDB:U','Got empty avatar from '+user.name+'.', 0);
					}
				}
				catch(e) {
					debug('YDB:U','Failed to get avatar from '+user.name+'.', 2);
				}
				user.avatarTS = parseInt(Date.now()/1000);
				UAwrite();
			};
			let readyHandler = function(request) {
				return function () {
					if (request.readyState === 4) {
						if (request.status === 200) return callback(request);
						else if (request.status === 0) {
							return false;
						}
						else {
							debug('YDB:U','Failed to get avatar from '+user.name+'.', 2);
							return false;
						}
					}
				};
			};

			let get = function() {
				let req = new XMLHttpRequest();
				let url = '/profiles/'+nameEncode(user.name)+'.json';
				req.onreadystatechange = readyHandler(req);
				req.open('GET', url);
				req.send();
			};
			get();
		};

		let generateLine = function(user) {
			if (user == undefined) return InfernoAddElem('div',{className:'alternating-color block__content flex flex--center-distributed flex--centered'},[
					InfernoAddElem('div',{style:{flexBasis:'48px'}},[]),
					InfernoAddElem('span',{className:'flex__grow',style:'padding-left:1em'},[
						InfernoAddElem('span',{innerHTML:'[USER NOT FOUND]'},[])
					]),
					InfernoAddElem('a',{className:'interaction--downvote',style:{padding:'0 12px'}, events:[{t:'click',f:function(){removeUser(user);}}]},[
						InfernoAddElem('i',{className:'fa fa-trash-alt'},[]),
						InfernoAddElem('span',{className:'hide-mobile',innerHTML:' Remove'},[])
					])
				]);
			if (user.name == '[UNKNOWN]') {
				addUserPending(user);
				getUserName(user.id, function(e) {user.name = e; UAwrite();});
			}
			return InfernoAddElem('div',{dataset:{username:user.name},className:'alternating-color block__content flex flex--center-distributed flex--centered'},[
				InfernoAddElem('div',{style:{flexBasis:'48px'}},[
					InfernoAddElem('img',{width:48,height:48},[])
				]),
				InfernoAddElem('a',{className:'flex__grow',style:{paddingLeft:'1em'},href:'/profiles/'+nameEncode(user.name)},[
					InfernoAddElem('span',{innerHTML:user.name},[])
				]),
				InfernoAddElem('span',{className:'flex__grow',style:{paddingLeft:'1em'}},[
					InfernoAddElem('span',{innerHTML:userbase_local.scratchpad[user.id]==undefined?'':
						userbase_local.scratchpad[user.id].split('\n')[0].substring(0, 100)
					},[])
				]),
				InfernoAddElem('a',{style:{padding:'0 12px'}, href:'/messages/new?to_id='+user.id},[
					InfernoAddElem('i',{className:'fa fa-envelope'},[]),
					InfernoAddElem('span',{className:'hide-mobile',innerHTML:' Send message'},[])
				]),
				InfernoAddElem('a',{style:{padding:'0 12px'}, href:'/messages?with='+user.id},[
					InfernoAddElem('i',{className:'fa fa-clock'},[]),
					InfernoAddElem('span',{className:'hide-mobile',innerHTML:' Chat history'},[])
				]),
				InfernoAddElem('a',{className:'interaction--downvote',style:{padding:'0 12px'}, href:'javascript://', events:[{t:'click',f:function(){removeUser(user);}}]},[
					InfernoAddElem('i',{className:'fa fa-trash-alt'},[]),
					InfernoAddElem('span',{className:'hide-mobile',innerHTML:' Remove'},[])
				])
			]);
		};

		let render = function () {
			cont.innerHTML = '';
			let x = [];
			for (let i=0; i<users.length; i++) {
				let user = users[i];
				let line = generateLine(user);
				if (user.avatar == undefined || user.avatarTS+24*60*60<Date.now()/1000) {
					setTimeout(function() {fetchAvatara(user,line.querySelector('img'));}, 50*i);
				}
				else {
					line.querySelector('img').src = user.avatar;
				}
				x.push(line);
			}

			if (userbase_local.friendlist.length == 0) {
				x.push(InfernoAddElem('div',{},[
					InfernoAddElem('div',{innerHTML:'Your contact list is empty.'},[]),
					InfernoAddElem('img',{src:'https://derpicdn.net/img/2013/4/2/285856/medium.png'},[])
				]));
			}
			cont.appendChild(InfernoAddElem('div',{},x));
		};

		for (let i=0; i<userbase_local.friendlist.length; i++) {
			let user = userbase.users[userbase_local.friendlist[i]];
			users.push(user);
		}

		users.sort(function(a,b) {return a.name<b.name?-1:(a.name>b.name?1:0);});

		let cont = addElem('div',{className:'block',style:{width:'100%'}}, c);
		render();
	}

	function YDB_Userlist() {
		document.querySelector('#content h1').innerHTML = 'Userlist debug';
		let c = document.querySelector('#content .walloftext');
		c.innerHTML = '';

		let generateLine = function(user) {
            if (user == undefined)
                return InfernoAddElem('div',{className:'alternating-color block__content flex flex--center-distributed flex--centered'},[
                    InfernoAddElem('span',{className:'flex__grow',style:{paddingLeft:'1em'}},[
                        InfernoAddElem('a',{innerHTML:'Name', events:[{t:'click',f:function() {sortby='name';render();}}]},[])
                    ]),
                    InfernoAddElem('span',{className:'flex__grow',style:{paddingLeft:'1em'}},[
                        InfernoAddElem('a',{innerHTML:'ID', events:[{t:'click',f:function() {sortby='id';render();}}]},[])
                    ]),
                    InfernoAddElem('span',{className:'flex__grow',style:{paddingLeft:'1em'}},[
                        InfernoAddElem('a',{innerHTML:'Updated', events:[{t:'click',f:function() {sortby='updated';render();}}]},[])
                    ]),
                    InfernoAddElem('span',{className:'flex__grow',style:{padding:'0 12px'}},[
                        InfernoAddElem('a',{innerHTML:'[Auto]', events:[{t:'click',f:function() {sortby='auto';render();}}]},[])
                    ]),
                    InfernoAddElem('span',{className:'flex__grow',style:{padding:'0 12px'}},[])
                ]);
			return InfernoAddElem('div',{className:'alternating-color block__content flex flex--center-distributed flex--centered'},[
				InfernoAddElem('span',{className:'flex__grow',style:{paddingLeft:'1em'}},[
					InfernoAddElem('span',{innerHTML:user.name},[])
				]),
				InfernoAddElem('span',{className:'flex__grow',style:{paddingLeft:'1em'}},[
					InfernoAddElem('span',{innerHTML:user.id},[])
				]),
				InfernoAddElem('span',{className:'flex__grow',style:{paddingLeft:'1em'}},[
					InfernoAddElem('span',{innerHTML:user.updated},[])
				]),
				InfernoAddElem('span',{className:'flex__grow',style:{padding:'0 12px'}},[
					InfernoAddElem('span',{innerHTML:user.aliases.join(', ')},[])
				]),
				InfernoAddElem('span',{className:'flex__grow',style:{padding:'0 12px'}},[
					InfernoAddElem('span',{innerHTML:user.tags.join(', ')},[])
				])
			]);
		};

        let render = function() {
            if (sortby != 'auto') tusers.sort(function (a,b) {
                if (a[sortby] > b[sortby]) {
                    return 1;
                }
                if (a[sortby] < b[sortby]) {
                    return -1;
                }
                return 0;
            });
            else {
                tusers = [];
                for (let i in userbase.users) {
                    tusers.push(userbase.users[i]);
                }
            }

            container.innerHTML = '';

            container.appendChild(generateLine());
            for (let i=0; i<tusers.length; i++)
                container.appendChild(generateLine(tusers[i]));
        };

        let tusers = [];
        let sortby = 'auto';
		let container = ChildsAddElem('div',{id:'_ydb_userlist',className:'block',style:{width:'100%'}}, c, []);
        render();

	}

	function YDB_TestSpoiler() {
		document.querySelector('#content h1').innerHTML = 'Applying spoilers...';
		let c = document.querySelector('#content .walloftext');
		c.innerHTML = '';

		if (ls.spoilers == undefined) ls.spoilers = [];

		let generateLine = function(spoiler, state) {
			return InfernoAddElem('div',{className:'alternating-color block__content flex flex--center-distributed flex--centered'},[
				InfernoAddElem('span',{className:'flex__grow',style:{paddingLeft:'1em'}},[
					InfernoAddElem('span',{innerHTML:spoiler},[])
				]),
				InfernoAddElem('span',{className:'flex__grow',style:{paddingLeft:'1em'}},[
					InfernoAddElem('span',{innerHTML:state},[])
				])
			]);
		};
		let x = [];

		for (let i=0; i<sps.length; i++) {
			let triggered = false;
			if (ls.spoilers != undefined) for (let j=0; j<ls.spoilers.length; j++) {
				if (ls.spoilers[j].name == sps[i].name) {
					c.appendChild(generateLine(sps[i].name, 'Exists already'));
					triggered = true;
					break;
				}
			}
			if (!triggered) {
				ls.spoilers.push(sps[i]);
				customSpoilerApply(sps[i]);
				c.appendChild(generateLine(sps[i].name, 'Added'));
			}
		}

		c.appendChild(generateLine(' ', ' '));
		c.appendChild(generateLine('Saving...', ' '));
		write(ls);
		if (unsafeWindow._YDB_public.funcs.backgroundBackup!=undefined) {
			unsafeWindow._YDB_public.funcs.backgroundBackup(function(state) {
				if (state) c.appendChild(generateLine('Backupped succesfully, returning...', ' '));
				else c.appendChild(generateLine('Failed to backup, returning anyway...', ' '));
				setTimeout(function() {
					/*if (history.length == 1) close();
					else history.back();*/
				}, 200);
			});
			c.appendChild(generateLine('Backupping...', ' '));
		}

	}

    //fixing watchlist
    function YB_checkList(o, elems) {
		let stop = false;
        elems.querySelector('h1').innerHTML = 'Checking watchlist tags...';
        let c = elems.querySelector('.wallcontainer');
        let t = addElem('div',{id:'_ydb_temp', style:{display:'none'}}, document.getElementById('content'));
        c.innerHTML = 'This may take few seconds. Do not close this page until finished<br><br>';
		c.appendChild(InfernoAddElem('a',{innerHTML:'Abort', events:[{t:'click',f:function(e) {stop = true;}}]},[]));
		c.appendChild(InfernoAddElem('br',{},[]));
		c.appendChild(InfernoAddElem('br',{},[]));
        c = elems.querySelector('.walloftext');

        let y = simpleParse(o.b);
        for (let i=0; i<y.length; i++) y[i] = y[i].trim();
		c.appendChild(InfernoAddElem('span',{innerHTML:y.length+' tags detected.<br>'},[]));

        let parse = function (request) {
            try {
                t.innerHTML = request.responseText;
                y[request.id] = t.getElementsByClassName('tag')[0].dataset.tagName;
				c.firstChild.innerHTML+=y[request.id];
                t.innerHTML = '';
            }
            catch (e) {
				c.firstChild.innerHTML+='[PARSE ERROR] '+e;
				debug('YDB:T','[PARSE ERROR] '+e+' for '+y[request.id],2);
            }
            if (request.id < y.length) get(request.id+1);
            return;
        };

        let readyHandler = function(request) {
            return function () {
                if (request.readyState === 4) {
                    if (request.status === 200) return parse(request);
                    else if (request.status === 0) {
						c.firstChild.innerHTML+='[ERROR]';
                        if (request.id < y.length) return get(request.id+1);
                        return false;
                    }
                    else {
						c.firstChild.innerHTML+='[ERROR]';
                        if (request.id < y.length) return get(request.id+1);
                        return false;
                    }
                }
            };
        };

        let get = function(i) {
            if (i == y.length || stop) {
                finish();
                return;
            }
			c.insertBefore(InfernoAddElem('span',{innerHTML:'<br>'+y[i]+' -> '},[]), c.firstChild);
            let req = new XMLHttpRequest();
            req.id = i;
            req.onreadystatechange = readyHandler(req);
            req.open('GET', '/tags/'+encodeURIComponent(y[i].replace(/\-/g,'-dash-').replace(/\./g,'-dot-').replace(/ /g,'+').replace(/\:/g,'-colon-')));
            req.send();
        };

        let finish = function() {
            y = searchForDuplicates(y);
            o.b = simpleCombine(y);
            result = o;
            processing[o.a] = false;
        };
        if (y.length>0) get(0);
    }

    function YDB() {
        let x = location.search.slice(1);
        if (location.search == "") return;
        else if (location.search == "?") return;
        else {
            let u = x.split('?');
			if (u[0] == 'contactList') YDB_contacts();
			else if (u[0] == 'usersDebug') YDB_Userlist();
			else if (u[0] == 'toolsSpoilerTest') YDB_TestSpoiler();
        }
    }

	function listRunInComms(targ) {
    	badge(targ);
		UA(targ);
		urlSearch(targ);
		linksPatch(targ);
		showUploader(targ);
		compressBadges(targ);
		setTimeout(function() {shrinkComms(targ)},200);
	}

	function listRunWhenDone() {
		shrinkComms(document);
	}

	function listener(e) {
        if (e.target.classList == undefined) return;
        if (!(e.target.id == 'image_comments' || (e.target.parentNode.classList.contains('communication-edit__tab')) || (e.target.classList.contains('block') && e.target.classList.contains('communication')))) return;
    	listRunInComms(e.target);
		shrinkComms(e.target);
		highlightArtist(e.target);
	}

	function error(name, e) {
		debug('YDB:T',name+' crashed during startup. '+e.stack,2);
	}

	try {UA();} catch(e) {error("UA", e)};
	try {flashNotifies();} catch(e) {error("flashNotifies", e)};
	try {profileLinks();} catch(e) {error("profileLinks", e)};
	try {readAll();} catch(e) {error("readAll", e)};
	try {scratchPad();} catch(e) {error("scratchPad", e)};
	if (ls.patchSearch) try {bigSearch();} catch(e) {error("bigSearch", e)};
	try {aliases();} catch(e) {error("aliases", e)};
	try {asWatchlist();} catch(e) {error("asWatchlist", e)};
	try {YDBSpoilersHelp();} catch(e) {error("YDBSpoilersHelp", e)};
	if (ls.similar) try {similar();} catch(e) {error("bigSearch", e)};
	try {listRunInComms(document);} catch(e) {error("listRunInComms", e)};
	if (ls.deactivateButtons) try {deactivateButtons(document, true);} catch(e) {error("deactivateButtons", e)};
	if (ls.oldHead) try {oldHeaders();} catch(e) {error("oldHead", e)};
	try {commentButtons(document, true);} catch(e) {error("commentButtons", e)};
	try {customSpoilerCheck(false, ls.spoilers);} catch(e) {error("customSpoilerCheck", e)};
	try {shrinkComms(document);} catch(e) {error("shrinkComms", e)};
	try {hiddenImg(document, true);} catch(e) {error("hiddenImg", e)};
	try {getArtists();} catch(e) {error("getArtists", e)};
	try {resizeEverything(true);} catch(e) {error("resizeEverything", e)};
	try {addGalleryOption();} catch(e) {error("addGalleryOption", e)};
	try {contacts();} catch(e) {error("contacts", e)};
	try {fixDupes();} catch(e) {error('fixDupes', e)};
	try {appendCustomNav();} catch(e) {error('appendCustomNav', e)};
    if (location.pathname == "/pages/yourbooru") {
        YDB();
    }
	unsafeWindow.addEventListener('load',listRunWhenDone);
    if (document.getElementById('comments') != undefined) document.getElementById('comments').addEventListener("DOMNodeInserted", listener);
    if (document.querySelector('.communication-edit__tab[data-tab="preview"]') != undefined) document.querySelector('.communication-edit__tab[data-tab="preview"]').addEventListener("DOMNodeInserted", listener);
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
