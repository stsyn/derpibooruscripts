// ==UserScript==
// @name         YDB:ADUp
// @version      0.2.1
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
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YouBooruSettings0.lib.js
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ADUp.user.js

// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

	let overRideSize = false;
	let onceLoaded = false;
	let checkedTags = {};
	let forceRedraw = false;
	let settings = {
		implicationDisallow:false,
		implicationDefaultInsert:true,
		implicationNotify:true,
		implicationDefaultRecursive:false,
		implicationAutoDelete:true
	};

	function register() {
		if (window._YDB_public == undefined) window._YDB_public = {};
		if (window._YDB_public.settings == undefined) window._YDB_public.settings = {};
		window._YDB_public.settings._adup = {
			name:'ADUp',
			version:GM_info.script.version,
			container:'_adup',
			link:'/meta/topics/userscript-semi-automated-derpibooru-uploader',
			s:[
				{type:'checkbox', name:'Turn off implication predictor', parameter:'implicationDisallow'},
				{type:'breakline'},
				{type:'checkbox', name:'Notify about implication', parameter:'implicationNotify'},
				{type:'breakline'},
				{type:'breakline'},
				{type:'checkbox', name:'Show implied tags by default', parameter:'implicationDefaultInsert'},
				{type:'checkbox', name:'Insert implied tags by default', parameter:'implicationDefaultRecursive'},
				{type:'breakline'},
				{type:'text', name:'Please refer to the script forum topic to understand the difference.',styleS:{fontStyle:'italic'}}
			]
		};
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
	register();

	window.checkedTags = checkedTags;

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

	function addTag(x, tag) {
		if (x.querySelector('a[data-tag-name="'+tag+'"]') != undefined) return;
		x.insertBefore(InfernoAddElem('span',{className:'tag',style:'opacity:0.75',innerHTML:tag+' '},[
			InfernoAddElem('a',{href:'javascript://', innerHTML:'x',dataset:{clickFocus:'.js-taginput-input-tag_input',tagName:tag}},[
			])
		]), x.querySelector('.js-taginput-input-tag_input'));
	}

	function insertImpliedTags(x, tagName) {
		let implies = checkedTags[tagName].implies;
		for (let i=0; i<implies.length; i++) {
			if (checkedTags[implies[i]] == undefined || checkedTags[implies[i]].impliedBy != undefined) {
				if (checkedTags[implies[i]] == undefined) {
					addTag(x, implies[i]);
					if (settings.implicationDefaultRecursive) {
						document.querySelector('.input.input--wide.tagsinput.js-image-input.js-taginput.js-taginput-plain-tag_input').value += ', '+implies[i];
						x.querySelector('a[data-tag-name="'+implies[i]+'"]').parentNode.style.opacity = '1';
					}
					checkedTags[implies[i]] = {
						needInfo:true,
						impliedBy:[tagName]
					};
				}
				else {
					checkedTags[implies[i]].impliedBy.push(tagName);
				}
			}
			else {
				implies.splice(i,1);
				i--;
				if (implies.length == 0) {
					delete checkedTags[tagName].implies;
					delete checkedTags[tagName].imply_notify;
					return;
				}
			}
		}
	}

	function removeRecursive(tag, parent) {
		let xc = document.querySelector('.input.input--wide.tagsinput.js-image-input.js-taginput.js-taginput-plain-tag_input');
		let x = xc.value.split(', ');
		for (let i=0; i<x.length; i++) {
			if (x[i] == tag.name) {
				x.splice(i,1);
				break;
			}
		}
		xc.value = x.join(', ');
		if (tag.impliedBy == undefined) tag.impliedBy = [parent.name];
		else {
			let ax = false;
			for (let i=0; i<tag.impliedBy.length; i++) {
				if (tag.impliedBy[i] == parent.name) {
					ax = true;
					break;
				}
			}
			if (!ax) tag.impliedBy.push(parent.name);
		}
		parent.container.querySelector('a[data-tag-name="'+tag.name+'"]').parentNode.style.opacity = '0.75';
	}

	function removeTag(tag, parent, nr) {
		if (tag == undefined) return;
		let x = tag.impliedBy;
		if (x!= undefined) {
			for (let i=0; i<x.length; i++) {
				if (x[i] == parent.name) {
					let y = parent.implies;
					if (!nr) {
						for (let j=0; j<y.length; j++) {
							if (y[j] == tag.name) {
								y.splice(j,1);
								break;
							}
						}
					}
					x.splice(i,1);
					break;
				}
			}
		}

		if (x == undefined || x.length==0) {
			if (tag.container.querySelector('a[data-tag-name="'+tag.name+'"]') != undefined) tag.container.querySelector('a[data-tag-name="'+tag.name+'"]').click();
		}
	}

	function tagCheck() {
		let render = function (d) {
			let cc = InfernoAddElem('div',{className:'alternating-color block__content'},[]);
			if (d.dnp_type == undefined && d.imply_notify == undefined) return undefined;
			if (d.dnp_type != undefined) {
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
				cc.appendChild(InfernoAddElem('div',{},[
					InfernoAddElem('div',{className:'flash '+color},[
						InfernoAddElem('strong',{innerHTML:d.name},[]),
						InfernoAddElem('span',{innerHTML:' — '},[]),
						InfernoAddElem('strong',{innerHTML:d.dnp_type, style:{color:color}},[]),
						InfernoAddElem('span',{innerHTML:suggestion==''?'':' — '},[]),
						InfernoAddElem('span',{innerHTML:suggestion},[])
					]),
					InfernoAddElem('span',{innerHTML:' '},[]),
					InfernoAddElem('span',{innerHTML:d.conditions},[]),
					InfernoAddElem('br',{},[]),
					InfernoAddElem('em',{innerHTML:d.reason},[])
				]));
			}
			if (d.imply_notify != undefined) {
				let actions = [];
				if (!settings.implicationDefaultInsert) {
					actions.push(InfernoAddElem('a',{innerHTML:'Add',style:'margin-right:0.85em;cursor:pointer',dataset:{clickFocus:'.js-taginput-input-tag_input'}, events:[{t:'click',f:function() {
						insertImpliedTags(d.container,d.name);
						d.mutedImplication = true;
					}}]},[]));
					if (!settings.implicationDefaultRecursive) {
						actions.push(InfernoAddElem('a',{innerHTML:'with recursive',style:'margin-right:0.85em;cursor:pointer',dataset:{clickFocus:'.js-taginput-input-tag_input'}, events:[{t:'click',f:function() {
							insertImpliedTags(d.container,d.name);
							for (let i=0; i<d.implies.length; i++) {
								document.querySelector('.input.input--wide.tagsinput.js-image-input.js-taginput.js-taginput-plain-tag_input').value += ', '+d.implies[i];
								d.container.querySelector('a[data-tag-name="'+d.implies[i]+'"]').parentNode.style.opacity = '1';
								delete checkedTags[d.implies[i]].impliedBy;
								checkedTags[d.implies[i]].mutedImplication = false;
							}
							delete d.implies;
							d.mutedImplication = true;
						}}]},[]));
					}
					else {
						actions.push(InfernoAddElem('a',{innerHTML:'without recursive',style:'margin-right:0.85em;cursor:pointer',dataset:{clickFocus:'.js-taginput-input-tag_input'}, events:[{t:'click',f:function() {
							insertImpliedTags(d.container,d.name);
							let checker = function() {
								for (let i=0; i<d.implies.length; i++) {
									if (checkedTags[d.implies[i]].needInfo) {
										setTimeout(checker, 100);
										return;
									}
								}
								for (let i=0; i<d.implies.length; i++) {
									removeRecursive(checkedTags[d.implies[i]], d);
									checkedTags[d.implies[i]].mutedImplication = true;
								}
							};
							setTimeout(checker, 400);
							d.mutedImplication = true;
						}}]},[]));
					}
				}
				else {
					actions.push(InfernoAddElem('a',{innerHTML:'Undo implication',style:'margin-right:0.85em;cursor:pointer',dataset:{clickFocus:'.js-taginput-input-tag_input'}, events:[{t:'click',f:function() {
						d.mutedImplication = true;
						for (let i=d.implies.length-1; i>=0; i--) delete removeTag(checkedTags[d.implies[i]], d);
					}}]},[]));
					if (!settings.implicationDefaultRecursive) {
						actions.push(InfernoAddElem('a',{innerHTML:'Allow recursive',style:'margin-right:0.85em;cursor:pointer',dataset:{clickFocus:'.js-taginput-input-tag_input'}, events:[{t:'click',f:function() {
							for (let i=0; i<d.implies.length; i++) {
								document.querySelector('.input.input--wide.tagsinput.js-image-input.js-taginput.js-taginput-plain-tag_input').value += ', '+d.implies[i];
								delete checkedTags[d.implies[i]].impliedBy;
								if (checkedTags[d.implies[i]].implies != undefined && checkedTags[d.implies[i]].implies.length>0) {
									checkedTags[d.implies[i]].imply_notify = true;
									insertImpliedTags(d.container,d.implies[i]);
								}
								d.container.querySelector('a[data-tag-name="'+d.implies[i]+'"]').parentNode.style.opacity = '1';
								checkedTags[d.implies[i]].mutedImplication = false;
							}
							delete d.implies;
							d.mutedImplication = true;
						}}]},[]));
					}
					else {
						actions.push(InfernoAddElem('a',{innerHTML:'Disallow recursive',style:'margin-right:0.85em;cursor:pointer',dataset:{clickFocus:'.js-taginput-input-tag_input'}, events:[{t:'click',f:function() {
							for (let i=0; i<d.implies.length; i++) removeRecursive(checkedTags[d.implies[i]], d);
							d.mutedImplication = true;
						}}]},[]));
					}
				}

				actions.push(InfernoAddElem('a',{innerHTML:'Hide',style:'margin-right:0.85em;cursor:pointer',dataset:{clickFocus:'.js-taginput-input-tag_input'}, events:[{t:'click',f:function() {
					d.mutedImplication = true;
				}}]},[]));
				cc.appendChild(InfernoAddElem('div',{},[
					InfernoAddElem('div',{className:'flash'},[
						InfernoAddElem('strong',{innerHTML:d.name},[]),
						InfernoAddElem('span',{innerHTML:' — implies '},[]),
						InfernoAddElem('strong',{innerHTML:d.implies.join(', ')},[])
					]),
					InfernoAddElem('br',{},[]),
					InfernoAddElem('span',{},actions)
				]));
			}
			return cc;
		};
		let checker = function (target, method) {
			for (let x in checkedTags) {
				checkedTags[x].shouldDraw = false;
				checkedTags[x].present = false;
			}
            for (let i=0; i<document.querySelectorAll(target).length; i++) {
                let x = document.querySelectorAll(target)[i];
				let gotten = forceRedraw;
                for (let i=0; i<x.getElementsByClassName('tag').length; i++) {
                    let y = x.getElementsByClassName('tag')[i];
                    let z;
                    z = y.getElementsByTagName('a')[0].dataset.tagName;

                    let name = z;
                    if (checkedTags[name] == undefined || checkedTags[name].needInfo != undefined) {
						//gather tag info
                        fetch('/tags/'+encodeURIComponent((name).replace(/\-/g,'-dash-').replace(/\./g,'-dot-').replace(/ /g,'+').replace(/\:/g,'-colon-'))+'.json',{method:'GET'})
                        .then(function (response) {
                            const errorMessage = {fail:true};
                            if (!response.ok) {
                                return errorMessage;
							}
                            if (response.redirected) {
								//got aliase
                                let newTag = response.url.split('/').pop();
                                newTag = newTag.replace(/\-dash\-/g,'-').replace(/\-dot\-/g,'.').replace(/\+/g,' ').replace(/\-colon\-/g,':');
                                y.getElementsByTagName('a')[0].dataset.tagName = newTag;
                                y.firstChild.textContent = newTag+' ';
								if (checkedTags[name] != undefined) delete checkedTags[name].needInfo;
                                return errorMessage;
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.fail) return;
							//search for DNP
							if (checkedTags[name] == undefined) checkedTags[name] = {};
							checkedTags[name].container = x;
							delete checkedTags[name].needInfo;
                            let dnp = data.dnp_entries;
                            if (dnp == undefined) {
                                checkedTags[name].dnp_type = 'Tag does not exist';
								checkedTags[name].name = name;
                            }
                            else if (dnp.length>0) {
								for (let j=0; j<dnp.length; j++) {
									let d = dnp[j];
									d.name = name;
									for (let x in d) checkedTags[name][x] = d[x];
									container.appendChild(render(d));
									gotten = true;
									checkedTags[name].shouldDraw = true;
									checkedTags[name].name = name;
								}
							}
                            else if (data.tag.images == 0) {
                                checkedTags[name].dnp_type = 'Tag has no images';
								checkedTags[name].name = name;
                            }
                            else {
								checkedTags[name].ok = true;
								checkedTags[name].name = name;
							}

							//search for implications
							if (data.tag != undefined && !settings.implicationDisallow) {
								let implies = data.tag.implied_tags;
								if (implies.length > 0) {
									implies = implies.split(',');
									implies = implies.map(function(c) {return c.trim();});
									implies.forEach(function (v,i,a) {
										if (!(checkedTags[v] == undefined || checkedTags[v].impliedBy != undefined)) {
											a.splice(i,1);
										}
									})
									if (implies.length > 0) {
										checkedTags[name].implies = implies;

										let inserted = false;
										if ((checkedTags[name].impliedBy == undefined || (settings.implicationDefaultRecursive && checkedTags[name] == undefined)) && (settings.implicationDefaultInsert)) insertImpliedTags(x, name);
										if ((settings.implicationNotify) && (checkedTags[name].impliedBy == undefined || (settings.implicationDefaultRecursive && checkedTags[name] == undefined))) {
											checkedTags[name].imply_notify = true;
											checkedTags[name].shouldDraw = true;
											checkedTags[name].mutedImplication = false;
											let yx = render(checkedTags[name]);
											if (yx != undefined) container.appendChild(yx);
										}
										else checkedTags[name].mutedImplication = true;
									}
								}
							}
                        });
						if (checkedTags[name] != undefined) {
							checkedTags[name].present = true;
						}
                    }
                    else {
						if (checkedTags[name] != undefined) {
							checkedTags[name].present = true;
						}
						if (!checkedTags[name].ok || (!checkedTags[name].mutedImplication && checkedTags[name].present)) {
							checkedTags[name].shouldDraw = true;
							if (!checkedTags[name].drawn) gotten = true;
						}
					}
					
                }
				for (let x in checkedTags) {
					if (checkedTags[x].drawn != checkedTags[x].shouldDraw) {
						gotten = true;
						break;
					}
				}

				if (gotten) {
					forceRedraw = false;
					for (let x in checkedTags) checkedTags[x].drawn = false;
					let container = document.getElementById('ydb_dnp_container');
					container.innerHTML = '';
					let drawn = false;
					for (let i=0; i<x.getElementsByClassName('tag').length; i++) {
						let y = x.getElementsByClassName('tag')[i];
						let z;
						z = y.getElementsByTagName('a')[0].dataset.tagName;

                        let name = z;
                        if (checkedTags[name] == undefined) continue;
                        else if (!checkedTags[name].ok || !checkedTags[name].mutedImplication) {
							let yx = render(checkedTags[name]);
                            if (yx != undefined) {
                            	checkedTags[name].drawn = true;
								container.appendChild(yx);
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
			for (let x in checkedTags) {
				//removing
				if (!checkedTags[x].present) {
					if (settings.implicationAutoDelete && (checkedTags[x].implies != undefined && checkedTags[x].implies.length > 0)) {
						checkedTags[x].implies.forEach(function(v,i,a) {
							removeTag(checkedTags[v],checkedTags[x], true);
						});
						if (checkedTags[x].impliedBy != undefined) {
							checkedTags[x].impliedBy.forEach(function(v,i,a) {
								let y = checkedTags[v].implies;
								for (let j=0; j<y.length; j++) {
									if (y[j] == x) {
										y.splice(j,1);
										break;
									}
								}
								if (y.length == 0) checkedTags[v].mutedImplication = true;
								forceRedraw = true;
							});
						}
						delete checkedTags[x];
					}
					else delete checkedTags[x];
				}
			}
        };
        checker('.js-taginput-fancy-tag_input');
        setTimeout(tagCheck,333);
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
				InfernoAddElem('span',{className:'block__header__title',innerHTML:'DNP entries and warnings'},[])
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
