// ==UserScript==
// @name         YDB:ADUp
// @version      0.3.2
// @author       stsyn

// @match        *://*/*

// @exclude      *://trixiebooru.org/adverts/*
// @exclude      *://derpibooru.org/adverts/*
// @exclude      *://www.trixiebooru.org/adverts/*
// @exclude      *://www.derpibooru.org/adverts/*
// @exclude      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude      *://*.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*
// @exclude      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YouBooruSettings0UW.lib.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ADUp.user.js

// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    if (unsafeWindow.self !== unsafeWindow.top) return;
    function getDerpHomeDomain() {
        try {
            return GM_getValue('domain', 'www.derpibooru.org');
        }
        catch (e) {
            return 'www.derpibooru.org';
        }
    }

	let overRideSize = false;
	let onceLoaded = false;
	let checkedTags = {};
	let forceRedraw = false;
	let currentImage = '';
    let loadLimit = 3;
	let settings = {
		implicationDisallow:false,
		implicationDefaultInsert:true,
		implicationNotify:true,
		implicationDefaultRecursive:false,
		implicationAutoDelete:true
	};

	function register() {
        if (unsafeWindow._YDB_public == undefined) unsafeWindow._YDB_public = {};
        if (unsafeWindow._YDB_public.funcs == undefined) unsafeWindow._YDB_public.funcs = {};
        unsafeWindow._YDB_public.funcs.getDerpHomeDomain = getDerpHomeDomain;

        if (/(www\.|)(derpi|trixie)booru\.org/.test(location.hostname)) {
            if (unsafeWindow._YDB_public.settings == undefined) unsafeWindow._YDB_public.settings = {};
            unsafeWindow._YDB_public.settings._adup = {
                name:'ADUp',
                version:GM_info.script.version,
                container:'_adup',
                link:'/meta/topics/userscript-semi-automated-derpibooru-uploader',
                s:[
                    {type:'checkbox', name:'Turn off implication predictor', parameter:'implicationDisallow'},
                    {type:'breakline'},
                    {type:'checkbox', name:'Notify about implication', parameter:'implicationNotify'}/*,
                    {type:'breakline'},
                    {type:'breakline'},
                    {type:'checkbox', name:'Show implied tags by default', parameter:'implicationDefaultInsert'},
                    {type:'checkbox', name:'Insert implied tags by default', parameter:'implicationDefaultRecursive'},
                    {type:'breakline'},
                    {type:'text', name:'Please refer to the script forum topic to understand the difference.',styleS:{fontStyle:'italic'}}*/
                ]
            };
        }
	}

	//srsly?..
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

	function fetchExtData(url) {
		let req = new XMLHttpRequest();
		req.open('GET', '/images/'+url.params.origin+'.json', false);
		req.send();
		let x = JSON.parse(req.responseText);
		url.params.tags = encodeURIComponent(x.tags);
		url.params.originWidth = x.width;
		url.params.originHeight = x.height;
		url.params.originView = x.representations.large;
		if (url.params.src == 'undefined') url.params.src = encodeURIComponent(x.source_url);
	}

    function hasData() {
        return !!document.getElementById('image_tag_input').value || !!document.getElementById('image_source_url').value || !!document.getElementById('scraper_url').value || !!document.getElementById('image_description').value;
    }

    function fillDData1(url) {
        if (decodeURIComponent(url.params.tags) != 'undefined') {
            if (url.params.origTags != undefined) {
                document.getElementById('image_tag_input').value = url.params.origTags+','+decodeURIComponent(url.params.tags);
            }
            else {
                url.params.origTags = decodeURIComponent(url.params.tags);
                document.getElementById('image_tag_input').value = decodeURIComponent(url.params.tags);
            }
            document.querySelector('.button.button--state-primary.button--bold.js-taginput-show').click();
        }
        if (decodeURIComponent(url.params.src) != 'undefined') {
            document.getElementById('image_source_url').value = decodeURIComponent(url.params.src);
        }
        if (decodeURIComponent(url.params.newImg) != 'undefined') {
            document.getElementById('scraper_url').value = decodeURIComponent(url.params.newImg);
            onceLoaded = true;
            document.getElementById('js-scraper-preview').click();
        }
        if (decodeURIComponent(url.params.description) != 'undefined') {
            document.getElementById('image_description').value = decodeURIComponent(url.params.description).replace(/\n\s*\n/g, '\n').replace(/^\s*/mg, '');
        }
        if (decodeURIComponent(url.params.originView) != 'undefined') {
            document.getElementById('_ydb_preview').src = url.params.originView;
        }
    }

	function fillData1(url) {
        if (!hasData()) {
            fillDData1(url)
        } else {
            document.getElementById('new_image').insertBefore(
                InfernoAddElem('div',{className:"dnp-warning", style:{marginBottom:'0.5em'}, id:'_ydb_warning'},[
                    InfernoAddElem('h4',{innerHTML:"Override prefilled page content with ADUp fetch data?"},[]),
                    InfernoAddElem('p',{},[
                        InfernoAddElem('a',{innerHTML:'OK', events:[{t:'click',f:function() {fillDData1(url); document.getElementById('_ydb_warning').style.display = 'none'}}]},[]),
                        InfernoAddElem('span',{innerHTML:" "},[]),
                        InfernoAddElem('a',{innerHTML:'Cancel', events:[{t:'click',f:function() {document.getElementById('_ydb_warning').style.display = 'none'}}]},[])
                    ])
                ]),
            document.querySelector('.dnp-warning'));
        }

        if (decodeURIComponent(url.params.originWidth) != 'undefined') {
            document.getElementById('_ydb_old').innerHTML = url.params.originWidth+'x'+url.params.originHeight;
        }
        if (decodeURIComponent(url.params.newWidth) != 'undefined') {
            overRideSize = true;
            document.getElementById('_ydb_new').innerHTML = url.params.newWidth+'x'+url.params.newHeight;
        }
	}

	function diff(url) {
		let ctx = document.getElementById('_ydb_diff').getContext('2d');
		ctx.canvas.width = document.getElementById('_ydb_preview').naturalWidth;
		ctx.canvas.height = document.getElementById('_ydb_preview').naturalHeight;
		let img = document.getElementById('_ydb_preview');
		ctx.drawImage(img, 0, 0);
		ctx.globalCompositeOperation = 'difference';
		img = document.getElementById('js-image-upload-preview');
		ctx.drawImage(img, 0, 0, document.getElementById('_ydb_preview').naturalWidth, document.getElementById('_ydb_preview').naturalHeight);
		if (!overRideSize) document.getElementById('_ydb_new').innerHTML = img.naturalWidth + 'x' + img.naturalHeight;
		if (decodeURIComponent(url.params.src) != 'undefined') {
			document.getElementById('image_source_url').value = decodeURIComponent(url.params.src);
		}
	}

	function reverse(url) {
		let build = function(req) {
			let ux;
			if (document.getElementById('scraper_url').value == undefined) {
				if (document.getElementById('image_image').files.length > 0) {
					ux = document.querySelector('.input.js-scraper').cloneNode(true);
					ux.id = 'image';
					ux.name = 'image';
					document.querySelector('#_ydb_similarGallery strong').innerHTML += ' (It may take a while)';
				}
				else {
					document.querySelector('#_ydb_similarGallery strong').innerHTML = 'You hadn\'t specified either local file or url.';
					document.getElementById('ydb_head_hiddenable').style.display = 'inline';
					return;
				}
			}
			let s = InfernoAddElem('div',{style:'display:none',innerHTML:req.responseText},[]);
			//document.body.appendChild(s);
			document.body.appendChild(InfernoAddElem('form',{className:'hidden',id:'_ydb_reverse',enctype:"multipart/form-data",action:"/search/reverse",acceptCharset:"UTF-8",method:"post"},[
				InfernoAddElem('input',{name:"utf8",value:"✓",type:'hidden'},[]),
				InfernoAddElem('input',{name:"authenticity_token",value:s.querySelector('input[name="authenticity_token"]').value,type:'hidden'},[]),
				InfernoAddElem('input',{name:"fuzziness",value:document.getElementById('ydb_fuzzyness').value,type:'hidden'},[]),
				(document.getElementById('scraper_url').value == undefined?
				 ux:
				 InfernoAddElem('input',{name:"scraper_url",value:decodeURIComponent(document.getElementById('scraper_url').value),type:'hidden'},[])
				)
			]));
			let callback = function(rq) {
				document.getElementById('ydb_head_hiddenable').style.display = 'inline';
				s.innerHTML = rq.responseText;
				let t = document.getElementById('_ydb_similarGallery');
				t.innerHTML = '';
				let e = s.querySelector('table');
				if (e!=undefined) for (let i=1; i<e.querySelectorAll('tr').length; i++) {
					let x = e.querySelectorAll('tr')[i];
					let ix = x.querySelector('.image-container.thumb');
					t.parentNode.style.display = 'block';
					t.appendChild(
						InfernoAddElem('div',{className:'media-box'},[
							InfernoAddElem('a',{className:'media-box__header media-box__header--link media-box__header--small',target:'_blank',href:'/images/'+ix.dataset.imageId,innerHTML:'>>'+ix.dataset.imageId},[]),
							InfernoAddElem('div',{className:'media-box__content media-box__content--small'},[
								InfernoAddElem('div',{className:'image-container thumb'},[
									InfernoAddElem('a',{events:[{t:'click',f:function(ex) {
										for (let i=0; i<document.getElementById('_ydb_similarGallery').childNodes.length; i++) document.getElementById('_ydb_similarGallery').childNodes[i].style.opacity = 1;
										let x = ex.target;
										while (!x.classList.contains('media-box')) x = x.parentNode;
										x.style.opacity = 0.5;
										url.params.origin = ix.dataset.imageId;
										fetchExtData(url);
										fillData1(url);
										diff(url);
									}}]},[
										InfernoAddElem('picture',{},[
											InfernoAddElem('img',{src:JSON.parse(ix.dataset.uris).thumb},[])
										])
									])
								])
							])
						])
					);
				}
				else {
					if (document.querySelector('#_ydb_similarGallery strong') != undefined) document.querySelector('#_ydb_similarGallery strong').innerHTML = 'Nothing is found';
					else document.getElementById('_ydb_similarGallery').appendChild(InfernoAddElem('strong',{innerHTML:'Nothing is found'},[]));
				}
			};
			let readyHandler = function(rq) {
				return function () {
					if (rq.readyState === 4) {
						if (rq.status === 200) return callback(rq);
					}
					return false;
				};
			};
			let get = function() {
				let rq = new XMLHttpRequest();
				rq.onreadystatechange = readyHandler(rq);
				rq.open('POST', '/search/reverse');
				rq.send(new FormData(document.querySelector('#_ydb_reverse')));
			};
			get();
		};
		let req = new XMLHttpRequest();
		req.open('GET', '/search/reverse', false);
		req.send();
		build(req);
	}

	function addTag(x, tag) {
		if (x.parentNode.parentNode.querySelector('a[data-tag-name="'+tag+'"]') != undefined) return;
        let z = x.parentNode.parentNode;
        let y = z.querySelector('._ydb_tag_placeholder');
        if (y == undefined) {
            y = z.insertBefore(InfernoAddElem('div',{style:'min-height:0',className:'_ydb_tag_placeholder js-taginput input input--wide tagsinput', dataset:{clickFocus:'.js-taginput-input.js-taginput-tag_input'}}, [
                InfernoAddElem('span',{innerHTML:'Implied tags '}, [])
            ]), z.querySelector('.js-taginput-show'));
        }
		y.appendChild(InfernoAddElem('span',{className:'tag _ydb_transparent',style:'opacity:0.75; cursor:pointer',innerHTML:tag+' ',events:[{t:'click',f:function(e) {
            insertImpliedTag(x, tag);
        }}]},[
			InfernoAddElem('a',{href:'javascript://', innerHTML:'x', style:{display:'none'},dataset:{clickFocus:'.js-taginput-input',tagName:tag}},[
			])
		]));
	}

	function insertImpliedTag(x,name) {
		let e = new Event("keydown")
        e.keyCode = 13;
        let tText = document.querySelector('.input.js-taginput-input').value;
        x.querySelector('.input.js-taginput-input').value = name;
        x.querySelector('.input.js-taginput-input').dispatchEvent(e);
        x.querySelector('.input.js-taginput-input').value = tText;
	}

    function drawEmptyTag(tag) {
        return InfernoAddElem('span',{className:'tag',innerHTML:tag+' '},[
            InfernoAddElem('a',{style:{display:'none'},dataset:{tagName:tag}},[
        ])]);
    }

	function tagCheck() {
        let implyRender = function (x, d) {
            let tags = [];// = d.implied_tags.join(', ');
            for (let i=0; i<d.implied_tags.length; i++) {
                if (x.parentNode.parentNode.querySelector('.tag:not(._ydb_transparent) a[data-tag-name="'+d.implied_tags[i]+'"]') != undefined) continue;
                tags.push(drawEmptyTag(d.implied_tags[i]));
            }
            if (tags.length == 0) return false;
            return InfernoAddElem('div',{className:'alternating-color block__content'},[
				InfernoAddElem('div',{className:''},[
                    drawEmptyTag(d.name),
					InfernoAddElem('span',{innerHTML:'implies — '},[]),
					InfernoAddElem('span',{},tags),
                    InfernoAddElem('a',{href:'javascript://',className:'action block__header__title',innerHTML:'Insert', events:[{t:'click',f:function(e) {
                        for (let i=0; i<d.implied_tags.length; i++) {
                            if (x.querySelector('.tag._ydb_transparent a[data-tag-name="'+d.implied_tags[i]+'"]') != undefined)
                                x.querySelector('.tag._ydb_transparent a[data-tag-name="'+d.implied_tags[i]+'"]').click();
                        }
                    }}]},[]),
                    InfernoAddElem('a',{href:'javascript://',className:'action block__header__title',innerHTML:'Hide', events:[{t:'click',f:function(e) {
                        d.ok = true;
                        d.drawn = false;
                        e.target.parentNode.parentNode.style.display = 'none';
                    }}]},[])
				])
			]);
        };
		let render = function (d) {
			let color = 'flash--site-notice', suggestion = '';
			if (d.dnp_type=='Artist Upload Only') {
				suggestion = 'You won\'t be able to finish uploading.';
                color = 'flash--warning';
            }
			if (d.dnp_type=='With Permission Only') {
				suggestion = 'You should be ready to provide proof of permission!';
				color = 'flash--warning';
			}
			if (d.dnp_type=='Certain Type/Location Only') color = 'flash--warning';
			if (d.dnp_type=='No Edits') {
				suggestion = 'If you have permission to upload, remove "edit" tag for now and add it after uploading.';
				color = 'flash--warning';
			}
			if (d.dnp_type=='Other') color = 'flash--warning';
            if (d.dnp_type=='Tag does not exist' || d.dnp_type=='Tag has no images') {
                suggestion = 'You may have mistyped.';
            }
			return InfernoAddElem('div',{className:'alternating-color block__content'},[
				InfernoAddElem('div',{className:' '+color},[
					drawEmptyTag(d.name),
					InfernoAddElem('span',{innerHTML:' — '},[]),
					InfernoAddElem('strong',{innerHTML:d.dnp_type, style:{color:color}},[]),
					InfernoAddElem('span',{innerHTML:suggestion==''?'':' — '},[]),
					InfernoAddElem('span',{innerHTML:suggestion},[])
				]),
				InfernoAddElem('span',{innerHTML:' '},[]),
				InfernoAddElem('span',{innerHTML:d.conditions},[]),
				InfernoAddElem('br',{},[]),
				InfernoAddElem('em',{innerHTML:d.reason},[])
			]);
		};
		let checker = function (target, method) {
            let container = document.getElementById('ydb_dnp_container');
            for (let i=0; i<document.querySelectorAll(target).length; i++) {
                let x = document.querySelectorAll(target)[i];
				let gotten;
                for (let x in checkedTags) checkedTags[x].shouldDraw = false;
				//for (let x in checkedTags) checkedTags[x].shouldDraw = false;
                for (let i=0; i<x.getElementsByClassName('tag').length; i++) {
                    let y = x.getElementsByClassName('tag')[i];
                    if (y.classList.contains('_ydb_transparent')) continue;
                    let z;
                    z = y.getElementsByTagName('a')[0].dataset.tagName;

                    let name = z;
                    if (checkedTags[name] == undefined) {
                        fetch('/tags/'+encodeURIComponent((name).replace(/\-/g,'-dash-').replace(/\./g,'-dot-').replace(/ /g,'+').replace(/\:/g,'-colon-'))+'.json',{method:'GET'})
                        .then(function (response) {
                            const errorMessage = {fail:true};
                            if (!response.ok)
                                return errorMessage;
                            if (response.redirected) {
                                let newTag = response.url.split('/').pop().replace(/.json$/,'');
                                newTag = decodeURIComponent(newTag.replace(/\-dash\-/g,'-').replace(/\-dot\-/g,'.').replace(/\+/g,' ').replace(/\-colon\-/g,':').replace(/\%25/g,'%'));
                                y.getElementsByTagName('a')[0].dataset.tagName = newTag;
                                y.firstChild.textContent = newTag+' ';
                                return errorMessage;
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.fail) return;
                            if ((data.tag != undefined && data.tag.implied_tags != '') || settings.implicationDisallow) {
                                let implied_tags = data.tag.implied_tags.split(/\s*,\s*/);
                                checkedTags[name] = {name:name,implied_tags:implied_tags};
                                //container.appendChild(implyRender(checkedTags[name]));
                            }
                            else {
                                checkedTags[name] = {name:name,implied_tags:[]};
                            }

                            checkedTags[name].drawn = false;

                            let dnp = data.dnp_entries;
                            if (dnp == undefined) {
                                checkedTags[name].dnp_type = 'Tag does not exist';
                            }
                            else if (data.tag.images == 0) {
                                checkedTags[name].dnp_type = 'Tag has no images';
                            }
                            else if (dnp.length>0) for (let j=0; j<dnp.length; j++) {
                                let d = dnp[j];
                                d.name = name;
                                d.implied_tags = checkedTags[name].implied_tags;
                                checkedTags[name] = d;
                                //container.appendChild(render(d));
                                gotten = true;
                            }
                            else if (checkedTags[name].implied_tags.length == 0) {
                                checkedTags[name].ok = true;
                            }
                        });
                    }
                    else /*if (!checkedTags[name].ok)*/ {
                        checkedTags[name].shouldDraw = true;
                        if (!checkedTags[name].drawn) gotten = true;
                    }

                }
				for (let x in checkedTags) {
                    if (!checkedTags[x].shouldDraw) {
                        delete checkedTags[x];
						gotten = true;
                        continue;
                    }
					if (checkedTags[x].drawn != checkedTags[x].shouldDraw) {
						gotten = true;
						break;
					}
				}
				if (gotten) {
					for (let x in checkedTags) checkedTags[x].drawn = false;
                    while (document.querySelector('._ydb_transparent') != null) document.querySelector('._ydb_transparent').parentNode.removeChild(document.querySelector('._ydb_transparent'));
					let container = document.getElementById('ydb_dnp_container');
					container.innerHTML = '';
					let drawn = false;
					for (let i=0; i<x.getElementsByClassName('tag').length; i++) {
						let y = x.getElementsByClassName('tag')[i];
						let z;
						z = y.getElementsByTagName('a')[0].dataset.tagName;

                        let name = z;
                        if (checkedTags[name] == undefined) continue;
                        else if (!checkedTags[name].ok) {
                            if (checkedTags[name].dnp_type != undefined) {
                                container.appendChild(render(checkedTags[name]));
                                container.scrollTop = container.scrollHeight;
                                drawn = true;
                            }
                        }

                        if (checkedTags[name].implied_tags.length>0) {
                            let elem = implyRender(x, checkedTags[name]);
                            if (elem) {
                                if (!checkedTags[name].ok && settings.implicationNotify) {
                                    container.appendChild(elem);
                                    container.scrollTop = container.scrollHeight;
                                    drawn = true;
                                }
                            }
                            for (let ai=0; ai<checkedTags[name].implied_tags.length; ai++) addTag(x, checkedTags[name].implied_tags[ai]);
                        }
                        checkedTags[name].drawn = true;
					}
					if (!drawn) {
						container.appendChild(InfernoAddElem('div',{className:'block__content'},[
							InfernoAddElem('span',{innerHTML:'Nothing'},[]),
						]));
					}
				}
            }
        };
        checker('.js-taginput-fancy');
        setTimeout(tagCheck,400);
	}

	function diffCheck(url) {
		setTimeout(diffCheck, 100, url);
		if (url.params.originView == undefined) document.getElementById('_ydb_diff_container').style.display = 'none';
		else document.getElementById('_ydb_diff_container').style.display = 'block';
		if (document.querySelector('#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked') == null) return;
		let c = document.querySelector('#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked').value;
		if (currentImage != c) {
			currentImage = c;
			document.getElementById('js-image-upload-preview').src =  document.querySelector('#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked+.scraper-preview--image-wrapper img').src;
		}
	}

    register();
    if (/(www\.|)(derpi|trixie)booru\.org/.test(location.hostname)) {
        GM_setValue('domain', location.hostname);
        if (localStorage._adup == undefined || settings.override) {
            localStorage._adup = JSON.stringify(settings);
        }
        else {
            try {
                var settings2 = JSON.parse(localStorage._adup);
                settings = settings2;
            }
            catch(e) {
                localStorage._adup = JSON.stringify(settings);
            }
        }

        unsafeWindow.checkedTags = checkedTags;
        if ((parseInt(location.pathname.slice(1))>=0 && location.pathname.split('/')[2] == undefined) || (location.pathname.split('/')[1] == 'images' && parseInt(location.pathname.split('/')[2])>=0 && location.pathname.split('/')[3] == undefined)) {
            let url;
            url = '?';
            url += 'tags='+encodeURIComponent(document.getElementById('image_old_tag_list').value);
            let src = document.querySelector('span.source_url a');
            if (src) url += '&src='+encodeURIComponent(src.innerHTML);
            url += '&origin='+document.getElementsByClassName('image-show-container')[0].dataset.imageId;
            url += '&originView='+encodeURIComponent(JSON.parse(document.getElementsByClassName('image-show-container')[0].dataset.uris).large);
            url += '&originWidth='+document.getElementsByClassName('image-show-container')[0].dataset.width;
            url += '&originHeight='+document.getElementsByClassName('image-show-container')[0].dataset.height;
            addElem('span',{style:'flex-grow:1'},document.querySelector('#image_options_area .flex'));
            ChildsAddElem('span',{style:''},document.querySelector('#image_options_area .flex'), [
                InfernoAddElem('a',{href:'/images/new'+url},[
                    InfernoAddElem('button',{className:'button button--link',innerHTML:'Upload copy'},[])
                ])
            ]);
        }
        else if (location.pathname == '/images/new') {
            let url = parseURL(location.href);
            document.querySelector('.input.js-taginput-input').style.marginRight = "5px";
            //if (location.search == '') return;
            if (url.params.origin != undefined) {
                fetchExtData(url);
            }
            let actions = [];
            if (!settings.implicationDisallow) {
                let actionsNames = [];
                actionsNames.push('Insert all implications');
                actionsNames.push('Hide all implications');
                for (let i=0; i<actionsNames.length; i++) {
                    actions.push(InfernoAddElem('a',{innerHTML:actionsNames[i],style:'margin-right:0.85em;cursor:pointer',events:[{t:'click',f:function() {
                        document.querySelectorAll('#ydb_dnp_container .block__content a.action:nth-child('+(i+1)+')').forEach(function(v) {v.click();});
                    }}]},[]));
                }
            }

            let preview = InfernoAddElem('img',{id:'js-image-upload-preview',style:{display:'inline-block',width:'320px'}},[]);
            document.querySelector('.image-other').insertBefore(InfernoAddElem('div',{},[
                InfernoAddElem('div',{className:'block'},[
                    InfernoAddElem('div',{className:'block__header'},[
                        InfernoAddElem('strong',{innerHTML:'Similar images',className:'block__header__title'},[]),
                        InfernoAddElem('span',{id:'ydb_head_hiddenable'},[
                            InfernoAddElem('a',{id:'reverseButton',innerHTML:'Check', events:[{t:'click',f:function(e) {e.target.parentNode.style.display = 'none';document.getElementById('_ydb_similarGallery').innerHTML = ''; document.getElementById('_ydb_similarGallery').appendChild(InfernoAddElem('strong',{innerHTML:'Fetching...'},[]));reverse(url);}}]},[]),
                            InfernoAddElem('strong',{innerHTML:'Fuzziness',className:'block__header__title'},[]),
                            InfernoAddElem('input',{id:'ydb_fuzzyness',className:'header__input input',value:0.45},[])
                        ])
                    ]),
                    InfernoAddElem('div',{className:'block__content'},[
                        InfernoAddElem('div',{id:'_ydb_similarGallery'},[
                            InfernoAddElem('strong',{innerHTML:'Not executed'},[])
                        ])
                    ])
                ]),
                InfernoAddElem('div',{style:'padding-bottom:1em;font-size:1.1em;text-align:center'},[
                    InfernoAddElem('strong',{id:'_ydb_old',innerHTML:'??? x ???'},[]),
                    InfernoAddElem('span',{innerHTML:' => '},[]),
                    InfernoAddElem('strong',{id:'_ydb_new',innerHTML:'??? x ???'},[])
                ]),
                InfernoAddElem('div',{id:'_ydb_diff_container'},[
                    InfernoAddElem('img',{id:'_ydb_preview',style:'display:inline-block;width:320px;margin-right:10px'},[]),
                    InfernoAddElem('canvas',{id:'_ydb_diff',style:'display:inline-block;width:320px;margin-right:10px'},[]),
                    preview
                ])
            ]),document.querySelector('.image-other').childNodes[0]);
            document.getElementById('_ydb_preview').addEventListener('load', function() {
                document.getElementById('_ydb_diff').style.height = document.getElementById('_ydb_preview').clientHeight+'px';
                diff(url);
            });
            document.getElementById('js-scraper-preview').addEventListener('click',function() {
                if (onceLoaded) {
                    onceLoaded = false;
                    return;
                }
                overRideSize = false;
                if (document.querySelector('#_ydb_similarGallery strong') != undefined) document.querySelector('#_ydb_similarGallery strong').innerHTML = 'Not executed';
                else document.getElementById('_ydb_similarGallery').appendChild(InfernoAddElem('strong',{innerHTML:'<br>Not executed'},[]));
            });
            preview.addEventListener('load', function() {
                if (document.getElementById('image_image').files.length > 0) {
                    overRideSize = false;
                    if (document.querySelector('#_ydb_similarGallery strong') != undefined) document.querySelector('#_ydb_similarGallery strong').innerHTML = 'Not executed';
                    else document.getElementById('_ydb_similarGallery').appendChild(InfernoAddElem('strong',{innerHTML:'<br>Not executed'},[]));
                }
                diff(url);
            });
            fillData1(url);
            document.getElementById('new_image').insertBefore(InfernoAddElem('div',{className:'block'},[
                InfernoAddElem('div',{className:'block__header'},[
                    InfernoAddElem('span',{className:'block__header__title',innerHTML:'DNP entries and warnings. '},[]),
                    InfernoAddElem('span',{className:'block__header__title'},actions)
                ]),
                InfernoAddElem('div',{id:'ydb_dnp_container', className:'js-taginput', style:{maxHeight:'40vh',overflowY:'auto'}},[
                    InfernoAddElem('div',{className:'block__content'},[
                        InfernoAddElem('span',{innerHTML:'Nothing'},[]),
                    ])
                ])
            ]),document.querySelector('h4+.field'));
            tagCheck();
            setTimeout(diffCheck, 100, url);
        }
    }
})();
