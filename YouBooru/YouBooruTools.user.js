// ==UserScript==
// @name         YourBooru:Tools
// @namespace    http://tampermonkey.net/
// @version      0.5.0
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
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/tagShortAliases0.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruTools.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruTools.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
	let main = function() {
	let scriptId = 'tools';
	let aE = false;
	try {if (GM_info == undefined) {aE = true;}}
	catch(e) {aE = true;}
	try {if (window._YDB_public.settings[scriptId] != undefined) return;}
	catch(e){}
	if (aE) {if (!window._YDB_public.allowedToRun[scriptId]) return;}
	let sversion = aE?window._YDB_public.version:GM_info.script.version;

    let processing = false;
    let result;
	let version = 0;
	let artists = [];
	let bps = ['princess luna','tempest shadow','starlight glimmer','oc:blackjack','princess celestia','rarity'];
	let best_pony_for_today = bps[parseInt(Math.random()*bps.length)];
	let hidden = {
		normal:[
			{
				big:'https://derpicdn.net/img/view/2017/10/23/1568696.png',
				small:'https://derpicdn.net/img/2017/10/23/1568696/small.png'
			}
		],
		pony:[
			{
				big:'https://derpicdn.net/img/2012/11/24/161576/large.png',
				small:'https://derpicdn.net/img/2012/11/24/161576/small.png'
			}
		]
	};
	let debug = function(id, value, level) {
		try {
			window._YDB_public.funcs.log(id, value, level);
		}
		catch(e) {
			let levels = ['.', '?', '!'];
			console.log('['+levels[level]+'] ['+id+'] '+value);
		};
	};
    let style = `
body[data-theme*="dark"] ._ydb_green {
background: #5b9b26;
color: #e0e0e0;
}

._ydb_green {
background: #67af2b;
color: #fff;
}

._ydb_t_patched {
overflow-y:hidden;
}

.ydb_t_block.block__content:not(.hidden) {
display:block;
}

body[data-theme*="dark"] ._ydb_greentext {
color: #66e066;
}

._ydb_greentext {
color: #0a0;
}
`;

    var tagDB ={normal:{character:[],episode:[],error:[],oc:[],origin:[],rating:[],spoiler:[]},regulars:{},list:{oc:[],origin:[]}};
    try {tagDB = getTagDB();}
    catch(e) {}

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

    function write(ls2) {
        localStorage._ydb_tools = JSON.stringify(ls2);
    }

    function register() {
		addElem('style',{type:'text/css',innerHTML:style},document.head);
        if (window._YDB_public == undefined) window._YDB_public = {};
        if (window._YDB_public.settings == undefined) window._YDB_public.settings = {};
		window._YDB_public.settings.toolsUB = {
            name:'Tools (Userbase)',
            container:'_ydb_toolsUB',
            version:sversion,
			hidden:true
		};
		window._YDB_public.settings.tools = {
            name:'Tools',
            container:'_ydb_tools',
            version:sversion,
            s:[
                {type:'header', name:'Notifications'},
                {type:'checkbox', name:'Reset', parameter:'reset'},
                {type:'checkbox', name:'Force hiding (Ignorantia non est argumentum!)', parameter:'force'},
                {type:'header', name:'UI'},
                {type:'checkbox', name:'Bigger search fields', parameter:'patchSearch'},
                {type:'checkbox', name:'Deactive downvote if upvoted (and reverse)', parameter:'deactivateButtons'},
                {type:'checkbox', name:'Hide images immediately', parameter:'fastHide'},
                {type:'breakline'},
                {type:'input', name:'Shrink comments and posts longer that (px)', parameter:'shrinkComms', validation:{type:'int',min:280, default:500}},
                {type:'checkbox', name:'Button to shrink expanded posts', parameter:'shrinkButt'},
                {type:'breakline'},
                {type:'checkbox', name:'Greentext (don\'t tell TSP about it)', parameter:'greenText',eventsI:{change:function (e) {
					if ((document.body.dataset.userName == 'The Frowning Pony') || (document.body.dataset.userName == 'The Smiling Pony')) {
						alert(errorMessages[errorLog++%errorMessages.length]);
						e.target.checked = false;
					}
				}}},
                {type:'header', name:'Tag aliases'},
                {type:'checkbox', name:'Do not parse page name', parameter:'oldName'},
                {type:'checkbox', name:'As short queries as possible', parameter:'compress', styleS:{display:'none'}},
                {type:'breakline'},
                {type:'breakline'},
                {type:'text', name:'Aliase', styleS:{width:'30%', textAlign:'center',display:'inline-block'}},
                {type:'text', name:'Original tag', styleS:{width:'70%', textAlign:'center',display:'inline-block'}},
                {type:'array', parameter:'aliases', addText:'Add', customOrder:false, s:[
                    [
                        {type:'input', name:'', parameter:'a',styleI:{width:'calc(40% - 10px - 12.5em)'},validation:{type:'unique'}},
                        {type:'textarea', name:'', parameter:'b',styleI:{width:'60%'}},
                        {type:'input', name:'', parameter:'c',styleI:{display:'none'}},
                        {type:'checkbox', name:'As watchlist', parameter:'w'}
                    ]
                ], template:{a:'best_pony',b:best_pony_for_today, w:false}}
            ],
            onChanges:{
                aliases:{
                    _:function(module,data, cb) {
                        if (data != undefined && data.length>0) {
                            data.sort(function(a, b){
                                return b.a.length - a.a.length;
                            });
                        }
                        for (let i=0; i<data.length; i++) {
                            if (data[i].changed) {
                                data[i].changed = false;
                                if (data[i].w) {
                                    window._YDB_public.handled++;
                                    let t = InfernoAddElem('div',{},[
                                        InfernoAddElem('h1',{},[]),
                                        InfernoAddElem('div',{className:'walloftext'},[])
                                    ]);
                                    t = window._YDB_public.funcs.callWindow([t]);
                                    processing = true;
                                    YB_checkList(data[i], t);
                                    let process = function() {
                                        if (!processing) {
                                            data[i] = result;
                                            window._YDB_public.handled--;
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
        if (window._YDB_public.funcs == undefined) window._YDB_public.funcs = {};
        window._YDB_public.funcs.tagAliases = tagAliases;
        window._YDB_public.funcs.tagComplexParser = goodParse;
        window._YDB_public.funcs.tagSimpleParser = simpleParse;
		window._YDB_public.funcs.tagComplexCombine = goodCombine;
		window._YDB_public.funcs.tagSimpleCombine = simpleCombine;
		window._YDB_public.funcs.upvoteDownvoteDisabler = function(elem, inital) {
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

    if (ls.aliases != undefined && ls.aliases.length>0) {
        ls.aliases.sort(function(a, b){
            return b.a.length - a.a.length;
        });
        write(ls);
    }

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
            'header ._ydb_t_textarea:focus {max-width:calc(100vw - 350px);overflow:auto;position:absolute;width:calc(100vw - 350px);height:5em;z-index:5;white-space:pre-wrap}'+
            '#searchform textarea {min-width:100%;max-width:100%;min-height:2.4em;line-height:1.5em;height:7em}';
        addElem('style',{type:'text/css',innerHTML:css},document.head);
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

	function goodParseIngnoreParentheses(x) {
		let yx = {};
        yx.orig = x;
        x = x.replace(/\|\|/g, ', ');
        x = x.replace(/\&\&/g, ', ');
        //x = x.replace(/^\-/g, ' ');
        //x = x.replace(/^\!/g, ' ');
        //x = x.replace(/[ ,\(]\-/g, function(str){return str[0]+' ';});
        //x = x.replace(/[ ,\(]!/g, function(str){return str[0]+' ';});
        x = x.replace(/[ ,\(]\*/g, function(str){return str[0]+' ';});
        x = x.replace(/\"/g, ' ');
        x = x.replace(/\~/g, ',');
        x = x.replace(/\^/g, ',');
        x = x.replace(new RegExp(' OR ','g'), ',   ');
        x = x.replace(new RegExp(' AND ','g'), ',    ');
        x = x.replace(new RegExp(' NOT ','g'), ',    ');
        x = x.replace(new RegExp('^NOT ','g'), '    ');
        let y = x.split(',');
		let afix2 = 0;
		let pcounter = 0;
		let pstarted = false;
        for (let i=0; i<y.length; i++) {
			let c = y[i].length;
			y[i] = y[i].replace(/^ +/g,'');
			let d = c-y[i].length;
			afix2+=d;
			let j = 0;
			while (y[i][j] == '(' || y[i][j] == ' ' || y[i][j] == '-') {
				if (y[i][j] == '(') pcounter++;
				j++;
			}
			j = y[i].length-1;
			while (y[i][j] == ')' || y[i][j] == ' ') {
				if (y[i][j] == ')') pcounter--;
				j--;
			}

			let lx=0;
			if (pcounter>0 || pstarted) {
				if (!pstarted) {
					let tag = {};
					tag.offset = afix2;
					tag.length = y[i].length;
					lx = 1+tag.length;
					tag.v = y[i];
					y[i] = tag;
					pstarted = true;
				}
				else {
					let a = y[i-1].offset+y[i-1].length;
					y[i-1].v += yx.orig.substr(a, afix2-a);
					y[i-1].v += y[i];
					y[i-1].length +=y[i].length;
					lx = 1+y[i].length;
					y[i-1].length +=afix2-a;
					y.splice(i, 1);
					i--;
					if (pcounter == 0) {
						pstarted = false;
					}
				}
			}
			else {
				pstarted = false;
				let tag = {};
				tag.offset = afix2;
				tag.length = y[i].length;
				lx = 1+y[i].length;
				let s1 = y[i].replace(/^ +/g,'');
				tag.offset += y[i].length-s1.length;
				tag.length -= y[i].length-s1.length;
				let s2 = s1.replace(/ +$/g,'');
				tag.length -= s1.length-s2.length;
				tag.v = s2;
				y[i] = tag;
			}
			afix2 += lx;
        }
        yx.temp = x;
        yx.tags = y;
        return yx;
	}

    function goodParse(x) {
        let yx = {};
        yx.orig = x;
        x = x.replace(/\|\|/g, ', ');
        x = x.replace(/\&\&/g, ', ');
        x = x.replace(/^\(/g, ' ');
        while (x.indexOf('(') >= 0) x = x.replace(/([^\\\(])\(/g, '$1 ');
        while (x.indexOf(')') >= 0) x = x.replace(/([^\\\)])\)/g, '$1 ');
        x = x.replace(/^\-/g, ' ');
        x = x.replace(/^\!/g, ' ');
        x = x.replace(/([ ,\(])\-/g, '$1 ');
        x = x.replace(/([ ,\(])!/g, '$1 ');
        x = x.replace(/([ ,\(])\*/g, '$1 ');
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
		if (separator == undefined) separator = ' || ';
        let s = '';
        for (let i=0; i<y.length; i++) s += y[i] + (i<y.length-1?separator:'');
        return s;
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
        let getYearsQuery = function() {
            let date = new Date();
            let c = '(';
            let cc = 'created_at:';
            for (let i = date.getFullYear() - 1; i>2011; i--)
                c+=(c==='('?'':' || ')+cc+i+'-'+((date.getMonth()+1)<10?('0'+(date.getMonth()+1)):(date.getMonth()+1))+'-'+(date.getDate()<10?('0'+date.getDate()):date.getDate());
            return c+')';
        };

        let getYearsAltQuery = function() {
            let date = new Date();
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
                if (localStorage['bor_tags_'+cur] == undefined) return '[Unknown]';
                return prev + JSON.parse(localStorage['bor_tags_'+cur]).name+(i+1 == a.length?'':' || ');
            }, '');
            tags = '('+tags+')';
            if (document.getElementsByClassName('js-datastore')[0].dataset.spoileredFilter != "") tags += ' || '+document.getElementsByClassName('js-datastore')[0].dataset.spoileredFilter;
            return tags;
        };


        original = original.replace('__ydb_LastYearsAlt', getYearsAltQuery());
        original = original.replace('__ydb_LastYears', getYearsQuery());
        original = original.replace('__ydb_Spoilered', spoileredQuery());
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
		
		let unspoilTag = function (orig) {
			if (window._YDB_public.funcs.getNonce == undefined) return orig;
            let tags = goodParse(orig);
            for (let i=0; i<tags.tags.length; i++) {
                if (tags.tags[i].v == '__ydb_Unspoil') {
                    tags.tags[i].v = '!__ydb_Unspoil:'+md5(document.body.dataset.userName+window._YDB_public.funcs.getNonce());
                }
            }
            let q2 = goodCombine(tags);
            return q2;
        };

		//////////////////////////////////////////////////////
		
        let q = cycledParse(original);
        if (opt.legacy) q = legacyTagAliases(q);
		q = artists(q);
		if (q.length > limit) q = compressSyntax(q);
        if (q.length > limit) q = compressAliases(q);
        if (q.length > limit) q = compressArtists(q);
		q = unspoilTag(q);
		
        if (q!=original) {
			debug('YDB:T','Query '+original+' compressed to '+q,0);
            udata[md5(q)] = {q:original, t:getTimestamp()};
            writeTagTools(udata);
        };
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
			elem.innerHTML = elem.innerHTML; //CBEPXPA3YM.JPEG
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
		let q = document.getElementsByClassName('header__input--search')[0].value;
		let qc = goodParse(q);
		for (let i=0; i<qc.tags.length; i++) {
			if (qc.tags[i].v.startsWith('__ydb_Unspoil')) {
				let n = qc.tags[i].v.split(':').pop();
				if (n == undefined || window._YDB_public.funcs.getNonce == undefined) {
					document.getElementById('container').insertBefore(InfernoAddElem('div',{className:'flash flash--warning', innerHTML:'YDB:Settings 0.9.1+ required to use "__ydb_Unspoil"!'},[]),document.getElementById('content'));
					break;
				}
				let hash = md5(document.body.dataset.userName+window._YDB_public.funcs.getNonce());
				if (hash != n) {
					document.getElementById('container').insertBefore(InfernoAddElem('div',{className:'flash flash--warning', innerHTML:'Invalid or outdated token!'},[]),document.getElementById('content'));
					break;
				}
				if (document.getElementsByClassName('js-resizable-media-container')[0] != undefined) unspoil(document.getElementsByClassName('js-resizable-media-container')[0]);
				else if (document.getElementsByClassName('image-show-container')[0] != undefined) unspoil(document.getElementsByClassName('image-show-container')[0]);
			}
		}
		
        let data = readTagTools();
        let s = md5(document.getElementsByClassName('header__input--search')[0].value);
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
        if (ls.aliases != undefined && ls.aliases.length>0) {
            let aliaseParse = function(el) {
                el.value = tagAliases(el.value, {legacy:true});
            };

            document.getElementsByClassName('header__search__button')[0].addEventListener('click',function() {aliaseParse(document.getElementsByClassName('header__input--search')[0]);});
            if (document.querySelector('input[type="submit"][value="Search"]')!=undefined)
                document.querySelector('input[type="submit"][value="Search"]').addEventListener('click',function() {aliaseParse(document.querySelector('.js-search-form .input'));});
        };
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
                                        if (window._YDB_public.funcs.backgroundBackup!=undefined) window._YDB_public.funcs.backgroundBackup();
                                        return;
                                    }
                                }
                                s.push(d.tag);
                                l.aliases[k].b = simpleCombine(s);
                                write(l);
                                e.target.innerHTML = d.a+' (-)';
                                if (window._YDB_public.funcs.backgroundBackup!=undefined) window._YDB_public.funcs.backgroundBackup();
                                return;
                            }
                        }
                        e.target.innerHTML = d.a+' (?)';
                    }}],className:'tag__dropdown__link', style:'cursor:pointer', innerHTML:ls.aliases[i].a+' ('+(isEnabled?'-':'+')+')'}, t[j].getElementsByClassName('dropdown__content')[0]);
                }
            }
        }
    }

    //colored tags
    function colorTags() {
        let checker = function (target, method) {
            if (document.querySelectorAll(target).length>0) {
                let x = document.querySelectorAll(target)[0];
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
        checker('.js-taginput-fancy-tag_input', 'standart');
        checker('.js-taginput-fancy-watched_tag_list', 'standart');
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
			for (let i=0; i<e.querySelectorAll('._ydb_spoil:not(._ydb_spoil_patched)').length; i++) {
				e.querySelectorAll('._ydb_spoil:not(._ydb_spoil_patched)')[i].addEventListener('click', hideBlock);
				e.querySelectorAll('._ydb_spoil:not(._ydb_spoil_patched)')[i].classList.add('_ydb_spoil_patched');
			}
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
        e.innerHTML = e.innerHTML.replace(/(https?:\/\/|ftp:\/\/)((?![.,?!;:()]*(\s|$|\"|\<))[^\s]){2,}/gim, function(str){
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
		let callback = function(r) {
			let x = addElem('div',{innerHTML:r.responseText,style:'display:none'},document.body);
			let exit = function() {
				document.body.removeChild(x);
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
					while (n.nextSibling != undefined && n.nextSibling.nextSibling != undefined && n.nextSibling.nextSibling.tagName == 'A') {
						n = n.nextSibling.nextSibling;
						artists.push(n.innerHTML);
					}
					if (document.querySelector('.image_uploader a') != undefined && document.querySelector('.image_uploader a').innerHTML == n.innerHTML) {
                        for (let i=0; i<document.querySelectorAll('.image_uploader a').length; i++) {
                            document.querySelectorAll('.image_uploader a')[i].classList.add('_ydb_green');
                        }
					}
					highlightArtist(document, n.innerHTML);
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

        let get = function(el) {
            let req = new XMLHttpRequest();
            req.el = el;
            req.onreadystatechange = readyHandler(req);
            req.open('GET', el.href);
            req.send();
        };

		for (let i=0; i<document.querySelectorAll('.tag.dropdown[data-tag-category="origin"] .tag__name').length; i++) {
			let el = document.querySelectorAll('.tag.dropdown[data-tag-category="origin"] .tag__name')[i];
			if (el.innerHTML == 'edit' || el.innerHTML == 'alternate version' || el.innerHTML == 'derpibooru exclusive') continue;
			get(el);
		}
	}

	function highlightArtist(e, name) {
		let highlight = function(e,n) {
			if (document.querySelector('.image_uploader a') == undefined) return;
			for (let i=0; i<e.getElementsByClassName('communication__body').length; i++) {
				let el = e.getElementsByClassName('communication__body')[i];
				if (el.querySelector('.communication__body__sender-name a') != undefined && el.querySelector('.communication__body__sender-name a').innerHTML == n) {
					el.querySelector('.communication__body__sender-name a').classList.add('flash--success');
				}
			}
		};
		if (name != undefined) highlight(e, name);
		else {
			for (let i=0; i<artists.length; i++) highlight(e, artists[i]);
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

	//compress labels
	function personal_titles_have_to_be_24_characters_long(e) {
		for (let i=0; i<e.querySelectorAll('.label:not(._ydb_t_patched)').length; i++) {
			let el = e.querySelectorAll('.label:not(._ydb_t_patched)')[i];
			el.classList.add('_ydb_t_patched');
			if (el.innerText.length > 24) {
				let t = el.innerHTML;
				el.innerText = el.innerText.substr(0,24);
				addElem('a',{innerHTML:'Read more >>', href:'javascript://', events:[{t:'click',f:function() {
					el.innerText = t;
				}}]}, el);
			}
		}
	}

	//compress comments
	function shrinkComms(e) {
		for (let i=0; i<e.querySelectorAll('.block.communication').length; i++) {
			let el = e.querySelectorAll('.block.communication')[i];
			if (el.clientHeight > parseInt(ls.shrinkComms)*1.2+13) {
				let t = el.querySelector('.communication__body__text');
				if (t.classList.contains('_ydb_t_comm_shrink')) continue;
				t.classList.add('_ydb_t_comm_shrink');
				t.style.maxHeight = parseInt(ls.shrinkComms)*0.8+'px';
				el.style.position = 'relative';
				let x;
				let y = InfernoAddElem('div',{className:'block__content communication__options _ydb_tools_compress', style:'display:none;text-align:center;font-size:150%;margin-bottom:2px'},[
					InfernoAddElem('a',{href:'javascript://', style:'width:100%;display:inline-block;', events:[{t:'click',f:function() {
						t.classList.add('_ydb_t_comm_shrink');
						t.style.maxHeight = parseInt(ls.shrinkComms)*0.8+'px';
						x.style.display = 'block';
						y.style.display = 'none';
					}}]}, [
						InfernoAddElem('i',{innerHTML:'',className:'fa'},[]),
						InfernoAddElem('span',{innerHTML:' Shrink '},[]),
						InfernoAddElem('i',{innerHTML:'',className:'fa'},[])
					])
				]);
				x = InfernoAddElem('div',{className:'block__content communication__options _ydb_tools_expand', style:'position:absolute;text-align:center;font-size:150%;bottom:'+(el.querySelector('.communication__options').clientHeight+4)+'px;width:calc(100% - 14px)'},[
					InfernoAddElem('a',{href:'javascript://', style:'width:100%;display:inline-block;',events:[{t:'click',f:function() {
						t.classList.remove('_ydb_t_comm_shrink');
						t.style.maxHeight = 'none';
						x.style.display = 'none';
						y.style.display = 'block';
					}}]}, [
						InfernoAddElem('i',{innerHTML:'',className:'fa'},[]),
						InfernoAddElem('span',{innerHTML:' Expand '},[]),
						InfernoAddElem('i',{innerHTML:'',className:'fa'},[])
					])
				]);
				if (ls.shrinkButt) el.insertBefore(y,el.lastChild);
				el.insertBefore(x,el.lastChild);
			}
			else if (el.clientHeight < parseInt(ls.shrinkComms)*0.8+13) {
				let t = el.querySelector('.communication__body__text');
				if (t.classList.contains('_ydb_t_comm_shrink') && parseInt(t.style.maxHeight)<t.clientHeight) {
					if (el.getElementsByClassName('_ydb_tools_compress')[0] != undefined) el.removeChild(el.getElementsByClassName('_ydb_tools_compress')[0]);
					el.removeChild(el.getElementsByClassName('_ydb_tools_expand')[0]);
					t.classList.remove('_ydb_t_comm_shrink');
				}
			}
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
            if (el.querySelector('.media-box__header .interaction--upvote.active') != undefined || el.querySelector('.media-box__header .interaction--fave.active') != undefined) {
				el.querySelector('.media-box__header .interaction--downvote').classList.add('hidden');
				el.querySelector('.media-box__header .interaction--hide').classList.add('hidden');
			}
            else {
				el.querySelector('.media-box__header .interaction--downvote').classList.remove('hidden');
				el.querySelector('.media-box__header .interaction--hide').classList.remove('hidden');
            }

			if (el.querySelector('.media-box__header .interaction--downvote.active') != undefined || (el.querySelector('.media-box__header .interaction--hide.active') != undefined ^ itsHide)) {
				el.querySelector('.media-box__header .interaction--upvote').classList.add('hidden');
				el.querySelector('.media-box__header .interaction--fave').classList.add('hidden');
			}
            else {
				el.querySelector('.media-box__header .interaction--upvote').classList.remove('hidden');
				el.querySelector('.media-box__header .interaction--fave').classList.remove('hidden');
            }
        };

        let soloWork = function(el) {
            if (el.querySelector('.interaction--hide') == undefined) return;
            if (inital) {
                el.addEventListener('DOMNodeInserted',function(e) {
                    setTimeout(function() {deactivateButtons(el,false);}, 100);
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

			if (el.querySelector('.interaction--downvote.active[href="#"]') != undefined || el.querySelector('.interaction--hide.active[href="#"]') != undefined) {
				el.querySelector('.interaction--upvote[href="#"]').classList.add('hidden');
				el.querySelector('.interaction--fave[href="#"]').classList.add('hidden');
			}
            else {
				el.querySelector('.interaction--upvote[href="#"]').classList.remove('hidden');
				el.querySelector('.interaction--fave[href="#"]').classList.remove('hidden');
            }
        };
        if (e.classList!=undefined && e.classList.contains('media-box')) work(e);
        else if ((e.classList != undefined && e.classList.contains('block__header')) || e.getElementsByClassName('media-box').length == 0) soloWork(e);
		else for (let i=0; i<e.getElementsByClassName('media-box').length; i++) {
			work(e.getElementsByClassName('media-box')[i]);
		}
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
					el.querySelector('.media-box__content picture img').src = hidden[horsie][parseInt(Math.random()*hidden[horsie].length)].small;
					el.querySelector('.media-box__content picture img').srcset = hidden[horsie][parseInt(Math.random()*hidden[horsie].length)].small;
				}
				else {
					el.querySelector('.media-box__content a video').style.display = 'none';
					ChildsAddElem('picture',{},el.querySelector('.media-box__content a'), [
						InfernoAddElem('img',{src:hidden[horsie][parseInt(Math.random()*hidden[horsie].length)].small},[])
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

    //target _blank
    //domain fixes
    function linksPatch(doc) {
        let a = doc.getElementsByTagName('a');
        let domains = ['www.trixiebooru.org', 'trixiebooru.org', 'www.derpibooru.org', 'derpibooru.org', 'www.derpiboo.ru', 'derpiboo.ru'];
        for (let i=0; i<a.length; i++) {
            for (let j=0; j<domains.length; j++)
                if (a[i].host != location.host && a[i].host == domains[j]) a[i].host = location.host;
            if (a[i].host != location.host && a[i].host != '') a[i].target = '_blank';
        }
    }

	/////////////////////////////////////////////
	//user aliases
	let UBinterval = 604800000;
	let userbase = {
		users:{},
		pending:[],
		lost:{}
	};
	let userbaseTS = {
		ttu:0,
		lastRun:0
	};
	let userbaseStarted = false;

	function UA(e) {
		let createUser = function(name, aliases, id) {
			let user = {
				name:name,
				aliases:aliases,
				id:id
			};
			userbase.users[name] = user;
			userbase.pending.push(name);
			write();
			if (window._YDB_public.funcs.backgroundBackup!=undefined) window._YDB_public.funcs.backgroundBackup();
			return user;
		};

		let removeUser = function(username) {
			delete userbase.users[username];
			for (let i=0; i<userbase.pending.length; i++) {
				if (userbase.pending[i] == username) {
					userbase.pending.splice(i,1);
					return;
				}
			}
		};

		let write = function() {
			localStorage._ydb_toolsUB = JSON.stringify(userbase);
		};

		let tswrite = function() {
			localStorage._ydb_toolsUBTS = JSON.stringify(userbaseTS);
		};

		let getTimestamp = function(user, regular, simplyReturn) {
			let nameEncode = function(name) {
				return encodeURI(name.replace(/\-/g,'-dash-').replace(/\./g,'-dot-').replace(/\//g,'-fwslash-').replace(/\//g,'-bwslash-').replace(/ /g,'+'));
			};
			let callback = function(req) {
				try {
					let x = JSON.parse(req.responseText);
					if (simplyReturn) return x.id;
					if (regular) {
						userbase.pending.push(userbase.pending.shift());
                        delete user.ts;
					}
					if (user.id == undefined) {
						user.id = x.id;
						write();
						if (window._YDB_public.funcs.backgroundBackup!=undefined) window._YDB_public.funcs.backgroundBackup();
					}
					else {
						if (user.id != x.id) {
							userbase.lost[user.id] = user;
							removeUser(user.name);
						}
						write();
						if (window._YDB_public.funcs.backgroundBackup!=undefined) window._YDB_public.funcs.backgroundBackup();
					}
				}
				catch(e) {
					debug('YDB:T','Failed to get timestamp from name '+user.name+'. Encoded to '+nameEncode(user.name)+'. Maybe it\'s encoder issue, contact dev.', 2);
				}
			};
			let readyHandler = function(request) {
				return function () {
					if (request.readyState === 4) {
						if (request.status === 200) return callback(request);
						else if (request.status === 0) {
							return false;
						}
						else {
							debug('YDB:T','Failed to get timestamp from name '+user.name+'. Encoded to '+nameEncode(user.name)+'. Maybe it\'s encoder issue, contact dev.', 2);
							return false;
						}
					}
				};
			};

			let get = function(name) {
				let req = new XMLHttpRequest();
				if (!simplyReturn) req.onreadystatechange = readyHandler(req);
				req.open('GET', '/profiles/'+nameEncode(name)+'.json', !simplyReturn);
				req.send();
                if (simplyReturn) {
                    if (request.status === 200) return JSON.parse(req.responseText).id
                }
			};
			if (regular) {
				userbaseTS.ttu -= (Date.now()-userbaseTS.lastRun);
				if (userbaseTS.ttu <= 0) {
					if (userbaseTS.lastRun == 0) userbaseTS.ttu = 0;
					get(user.name);
					userbaseTS.lastRun = Date.now();
					userbaseTS.ttu += UBinterval/userbase.pending.length;
                    userbaseTS.ttu = parseInt(userbaseTS.ttu);
				}
				tswrite();
			}
            else {
            }
		};
		if (!userbaseStarted) {
			userbaseStarted = true;
			try {
				let temp = JSON.parse(localStorage._ydb_toolsUB);
				userbase = temp;
			}
			catch(e) {}
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

			if (userbase.ttu != undefined) {
				delete userbase.ttu;
				delete userbase.lastRun;
			}

			if (document.querySelector('.profile-top__name-header') != undefined) {
				let name = document.querySelector('.profile-top__name-header').innerHTML.slice(0, -10);
				if (userbase.users[name] == undefined) {
					if (document.querySelector('.profile-top__name-header').nextSibling.tagName == undefined) {
						let t = document.querySelector('.profile-top__name-header').nextSibling.wholeText;
						t = t.substring(21,t.length-2).trim();
						let aliases = [t];
						if (userbase.users[t] != undefined) {
							let id = document.querySelector('a[href*="/lists/user_comments"]').href.split('/').pop();
							if (userbase.users[t].id == id) {
								aliases = userbase.users[t].aliases;
								aliases.push(t);
								removeUser(t);
								createUser(name, aliases, id);
							}
							else {
								userbase.lost[userbase.users[t].id] = userbase.users[t];
								removeUser(t);
								createUser(name, aliases, id);
							}
						}
						else {
							createUser(name, aliases);
						}
					}
				}
				else {
					let a = userbase.users[name].aliases;
					if (userbase.users[name].aliases.length>0) {
						let ae = [];
						for (let i=0;i<a.length; a++) {
							ae.push(InfernoAddElem('div',{className:'alternating-color block__content', innerHTML:a[i]},[]))
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

			if (userbase.pending.length>0) {
				getTimestamp(userbase.users[userbase.pending[0]], true);
			}
		}
		for (let i=0; i<e.getElementsByClassName('communication__body').length; i++) {
			let el = e.getElementsByClassName('communication__body')[i];
			let eln = el.querySelector('.communication__body__sender-name a');
			if (eln == undefined) continue;
			let ele = el.querySelector('.communication__body__sender-name');
			let name = eln.innerHTML;
			if (userbase.users[name] != undefined) {
                let s = InfernoAddElem('div',{style:'width:100px;font-size:.86em'},[
                    InfernoAddElem('span',{innerHTML:'AKA '},[]),
                    InfernoAddElem('strong',{innerHTML:userbase.users[name].aliases.join()},[]),
                    InfernoAddElem('br',{},[])
                ]);
                if (!el.parentNode.querySelector('.flex__fixed.spacing-right').lastChild.classList.contains('post-image-container'))
                    el.parentNode.querySelector('.flex__fixed.spacing-right').insertBefore(s,el.parentNode.querySelector('.flex__fixed.spacing-right').lastChild);
                continue;
            }
			let alias = ele.nextSibling;
			while (!(alias.classList != undefined && alias.classList.contains('communication__body__text'))) {
				if (alias.classList != undefined && alias.classList.contains('small-text')) {
					let t = alias.innerHTML;
					t = t.substring(21,t.length-2).trim();
					let aliases = [t];
					if (userbase.users[t] != undefined) {
						let ts = getTimestamp(user, false, true);
						if (userbase.users[t].id == ts) {
							aliases = userbase.users[t].aliases;
							aliases.push(t);
							removeUser(t);
							createUser(name, aliases, ts);
						}
						else {
							userbase.lost[userbase.users[t].id] = userbase.users[t];
							removeUser(t);
							createUser(name, aliases, ts);
						}
					}
					else {
						let user = createUser(name, aliases);
						getTimestamp(user, false);
					}
					break;
				}
				alias = alias.nextSibling;
			}
		}

	}
	/////////////////////////////////////////////

	//filling
	function resizeEverything(inital) {
		let ccont = document.getElementsByClassName('column-layout__main')[0];
		if (ccont == undefined) return;
		let mwidth = parseInt(ccont.clientWidth) - 14;
		let twidth = parseInt(mwidth/5-8);
		for (let i=0; i<document.getElementsByClassName('js-resizable-media-container').length; i++) {
			let el = document.getElementsByClassName('js-resizable-media-container')[i];
			for (let j=0; j<el.getElementsByClassName('media-box').length; j++) {
				let eli = el.getElementsByClassName('media-box')[j];
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
		if (document.getElementsByClassName('js-resizable-media-container').length > 0 && inital) window.addEventListener('resize',resizeEverything);
	}

    //selfbadges
    function badge(core) {
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

    //fixing watchlist
    function YB_checkList(o, elems) {
        elems.querySelector('h1').innerHTML = 'Checking watchlist tags...';
        let c = elems.querySelector('.walloftext');
        let t = addElem('div',{id:'_ydb_temp', style:'display:none'}, document.getElementById('content'));
        c.innerHTML = 'This may take few seconds. Do not close this page until finished<br><br>';

        let y = simpleParse(o.b);
        for (let i=0; i<y.length; i++) y[i] = y[i].trim();
        c.innerHTML += y.length+' tags detected.<br>';

        let parse = function (request) {
            try {
                t.innerHTML = request.responseText;
                y[request.id] = t.getElementsByClassName('tag')[0].dataset.tagName;
                c.innerHTML += y[request.id]+'<br>';
                t.innerHTML = '';
            }
            catch (e) {
                c.innerHTML += '[PARSE ERROR] '+e+'<br>';
            }
            if (request.id < y.length) get(request.id+1);
            return;
        };

        let readyHandler = function(request) {
            return function () {
                if (request.readyState === 4) {
                    if (request.status === 200) return parse(request);
                    else if (request.status === 0) {
                        c.innerHTML += '[ERROR]<br>';
                        if (request.id < y.length) return get(request.id+1);
                        return false;
                    }
                    else {
                        c.innerHTML += '[ERROR]<br>';
                        if (request.id < y.length) return get(request.id+1);
                        return false;
                    }
                }
            };
        };

        let get = function(i) {
            if (i == y.length) {
                finish();
                return;
            }
            c.innerHTML += y[i]+' -> ';
            let req = new XMLHttpRequest();
            req.id = i;
            req.onreadystatechange = readyHandler(req);
            req.open('GET', '/tags/'+encodeURIComponent(y[i].replace(/\-/g,'-dash-').replace(/\./g,'-dot-').replace(/ /g,'+').replace(/\:/g,'-colon-')));
            req.send();
        };

        let finish = function() {
            o.b = simpleCombine(y);
            //write(ls);
            result = o;
            processing = false;
            /*if (history.length == 1) close();
            else history.back();*/
        };
        if (y.length>0) get(0);
    }

    function YDB() {
        let x = location.search.slice(1);
        if (location.search == "") return;
        else if (location.search == "?") return;
        else {
            let u = x.split('?');
            //if (u[0] == "checklist") YB_checkList(u);
        }
    }

	function listRunInComms(targ) {
    	badge(targ);
		UA(targ);
		urlSearch(targ);
		linksPatch(targ);
		showUploader(targ);
		personal_titles_have_to_be_24_characters_long(targ);
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

    flashNotifies();
    profileLinks();
    if (ls.patchSearch) bigSearch();
    aliases();
    asWatchlist();
	YDBSpoilersHelp();
    listRunInComms(document);
    if (ls.deactivateButtons) deactivateButtons(document, true);
	commentButtons(document, true);
	shrinkComms(document);
	hiddenImg(document,true);
	getArtists();
    colorTags();
	resizeEverything(true);
	addGalleryOption();
    if (location.pathname == "/pages/yourbooru") {
        YDB();
    }
	window.addEventListener('load',listRunWhenDone);
    if (document.getElementById('comments') != undefined) document.getElementById('comments').addEventListener("DOMNodeInserted", listener);
    if (document.querySelector('.communication-edit__tab[data-tab="preview"]') != undefined) document.querySelector('.communication-edit__tab[data-tab="preview"]').addEventListener("DOMNodeInserted", listener);
	};

	let aE = false;
	try {if (GM_info == undefined) {aE = true;}}
	catch(e) {aE = true;}
	if (!aE) main();
	else {
		let code = '('+main.toString()+')();';
		addElem('script',{innerHTML:code},document.head);
	}
})();
