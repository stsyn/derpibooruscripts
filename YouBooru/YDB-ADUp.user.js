// ==UserScript==
// @name         YDB:ADUp
// @version      0.1.8
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

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ADUp.user.js

// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

	let overRideSize = false;
	let onceLoaded = false;
	let checkedArtists = {};

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

	function fillData1(url) {
		if (decodeURIComponent(url.params.tags) != 'undefined') {
			if (url.params.origTags != undefined) {
				document.getElementById('image_tag_input').value = url.params.origTags+','+decodeURIComponent(url.params.tags);
			}
			else {
				url.params.origTags = decodeURIComponent(url.params.tags);
				document.getElementById('image_tag_input').value = decodeURIComponent(url.params.tags);
			}
			document.querySelector('.button.button--state-primary.button--bold.js-taginput-show-tag_input').click();
		}
		if (decodeURIComponent(url.params.src) != 'undefined') {
			document.getElementById('image_source_url').value = decodeURIComponent(url.params.src);
		}
		if (decodeURIComponent(url.params.newImg) != 'undefined') {
			document.getElementById('scraper_url').value = decodeURIComponent(url.params.newImg);
			onceLoaded = true;
			document.getElementById('js-scraper-preview').click();
		}
		if (decodeURIComponent(url.params.originWidth) != 'undefined') {
			document.getElementById('_ydb_old').innerHTML = url.params.originWidth+'x'+url.params.originHeight;
		}
		if (decodeURIComponent(url.params.newWidth) != 'undefined') {
			overRideSize = true;
			document.getElementById('_ydb_new').innerHTML = url.params.newWidth+'x'+url.params.newHeight;
		}
		if (decodeURIComponent(url.params.originView) != 'undefined') {
			document.getElementById('_ydb_preview').src = url.params.originView;
		}
		if (decodeURIComponent(url.params.description) != 'undefined') {
			document.getElementById('image_description').value = decodeURIComponent(url.params.description).replace(/\n\s*\n/g, '\n').replace(/^\s*/mg, '');
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

	function tagCheck() {
		let render = function (d) {
			let color = '', suggestion = '';
			if (d.dnp_type=='Artist Upload Only') color = 'flash--warning';
			if (d.dnp_type=='With Permission Only') {
				suggestion = 'You should be ready to provide proofs of permission!';
				color = 'flash--warning';
			}
			if (d.dnp_type=='Certain Type/Location Only') color = 'flash--warning';
			if (d.dnp_type=='No Edits') {
				suggestion = 'If you have permission to upload, remove "edit" tag for now and add it after uploading';
				color = 'flash--warning';
			}
			if (d.dnp_type=='Other') color = 'flash--warning';
			return InfernoAddElem('div',{className:'alternating-color block__content'},[
				InfernoAddElem('div',{className:'flash '+color},[
					InfernoAddElem('strong',{innerHTML:d.name},[]),
					InfernoAddElem('span',{innerHTML:' — '},[]),
					InfernoAddElem('strong',{innerHTML:d.dnp_type, style:{color:color}},[]),
					InfernoAddElem('span',{innerHTML:suggestion==''?'':' — '},[]),
					InfernoAddElem('span',{innerHTML:suggestion},[])
				]),
				InfernoAddElem('span',{innerHTML:' '+d.conditions},[]),
				InfernoAddElem('br',{},[]),
				InfernoAddElem('em',{innerHTML:d.reason},[])
			]);
		};
		let checker = function (target, method) {
            for (let i=0; i<document.querySelectorAll(target).length; i++) {
                let x = document.querySelectorAll(target)[i];
				let gotten;
				for (let x in checkedArtists) checkedArtists[x].shouldDraw = false;
                for (let i=0; i<x.getElementsByClassName('tag').length; i++) {
                    let y = x.getElementsByClassName('tag')[i];
                    let z;
                    z = y.getElementsByTagName('a')[0].dataset.tagName;
                    if (z.startsWith('artist:')) {
						let name = z.slice(7);
						if (checkedArtists[name] == undefined) {
							fetch('/tags/'+encodeURIComponent(('artist:'+name).replace(/\-/g,'-dash-').replace(/\./g,'-dot-').replace(/ /g,'+').replace(/\:/g,'-colon-'))+'.json',{method:'GET'})
							.then(function (response) {
								const errorMessage = {fail:true};
								if (!response.ok)
									return errorMessage;
								if (response.redirected) {
									let newTag = response.url.split('/').pop();
									newTag = newTag.replace(/\-dash\-/g,'-').replace(/\-dot\-/g,'.').replace(/\+/g,' ').replace(/\-colon\-/g,':');
									y.getElementsByTagName('a')[0].dataset.tagName = newTag;
									y.firstChild.textContent = newTag+' ';
									return errorMessage;
								}
								return response.json();
								})
							.then(data => {
								if (data.fail) return;
								let dnp = data.dnp_entries;
								for (let j=0; j<dnp.length; j++) {
									let d = dnp[j];
									d.name = name;
									checkedArtists[name] = d;
									container.appendChild(render(d));
									gotten = true;
									checkedArtists[name].shouldDraw = true;
								}
								//console.log(dnp);
								if (dnp.length == 0) checkedArtists[name] = {ok:true};
							});
						}
						else if (!checkedArtists[name].ok) {
							checkedArtists[name].shouldDraw = true;
							if (!checkedArtists[name].drawn) gotten = true;
						}
					}
                }
				for (let x in checkedArtists) {
					if (checkedArtists[x].drawn != checkedArtists[x].shouldDraw) {
						gotten = true;
						break;
					}
				}
				if (gotten) {
					for (let x in checkedArtists) checkedArtists[x].drawn = false;
					let container = document.getElementById('ydb_dnp_container');
					container.innerHTML = '';
					let drawn = false;
					for (let i=0; i<x.getElementsByClassName('tag').length; i++) {
						let y = x.getElementsByClassName('tag')[i];
						let z;
						z = y.getElementsByTagName('a')[0].dataset.tagName;
						if (z.startsWith('artist:')) {
							let name = z.slice(7);
							if (checkedArtists[name] == undefined) continue;
							else {
								checkedArtists[name].drawn = true;
								container.appendChild(render(checkedArtists[name]));
								drawn = true;
							}
						}
					}
					if (!drawn) {
						container.appendChild(InfernoAddElem('div',{className:'block__content'},[
							InfernoAddElem('span',{innerHTML:'Nothing'},[]),
						]));
					}
				}
            }
        };
        checker('.js-taginput');
        setTimeout(tagCheck,500);
	}

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
		ChildsAddElem('li',{style:'float:right'},document.querySelector('ul.image_menu.horizontal-list'), [
			InfernoAddElem('a',{href:'/images/new'+url},[
				InfernoAddElem('button',{className:'button button--link',innerHTML:'Upload copy'},[])
			])
		]);
	}
	else if (location.pathname == '/images/new') {
		let url = parseURL(location.href);
		//if (location.search == '') return;
		if (url.params.origin != undefined) {
			fetchExtData(url);
		}
		document.getElementById('js-image-upload-preview').style.display = 'inline-block';
		document.getElementById('js-image-upload-preview').style.width = '320px';
		document.getElementById('js-image-upload-preview').style.marginBottom = '0';
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
			InfernoAddElem('img',{id:'_ydb_preview',style:'display:inline-block;width:320px;margin-right:10px'},[]),
			InfernoAddElem('canvas',{id:'_ydb_diff',style:'display:inline-block;width:320px;margin-right:10px'},[]),
			document.getElementById('js-image-upload-preview')
		]),document.querySelector('.image-other').childNodes[0]);
		document.getElementById('_ydb_preview').onload = function() {
			document.getElementById('_ydb_diff').style.height = document.getElementById('_ydb_preview').clientHeight+'px';
			diff(url);
		};
		document.getElementById('js-scraper-preview').addEventListener('click',function() {
			console.log(onceLoaded);
			if (onceLoaded) {
				onceLoaded = false;
				return;
			}
			overRideSize = false;
			if (document.querySelector('#_ydb_similarGallery strong') != undefined) document.querySelector('#_ydb_similarGallery strong').innerHTML = 'Not executed';
			else document.getElementById('_ydb_similarGallery').appendChild(InfernoAddElem('strong',{innerHTML:'<br>Not executed'},[]));
		});
		document.getElementById('js-image-upload-preview').onload = function() {
			if (document.getElementById('image_image').files.length > 0) {
				overRideSize = false;
				if (document.querySelector('#_ydb_similarGallery strong') != undefined) document.querySelector('#_ydb_similarGallery strong').innerHTML = 'Not executed';
				else document.getElementById('_ydb_similarGallery').appendChild(InfernoAddElem('strong',{innerHTML:'<br>Not executed'},[]));
			}
			diff(url);
		};
		fillData1(url);
		document.getElementById('new_image').insertBefore(InfernoAddElem('div',{className:'block'},[
			InfernoAddElem('div',{className:'block__header'},[
				InfernoAddElem('span',{className:'block__header__title',innerHTML:'DNP entries'},[])
			]),
			InfernoAddElem('div',{id:'ydb_dnp_container'},[
				InfernoAddElem('div',{className:'block__content'},[
					InfernoAddElem('span',{innerHTML:'Nothing'},[]),
				])
			])
		]),
		document.querySelector('h4+.field'));
		tagCheck();
	}
})();
