// ==UserScript==
// @name         YourBooru:Settings
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
// @require      https://github.com/LZMA-JS/LZMA-JS/raw/master/src/lzma_worker-min.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js
// @version      0.7.3
// @description  Global settings script for YourBooru script family
// @author       stsyn
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
	'use strict';
	let config;
	let modules = [];
	let settings;
	let resaved = false;
	let errorCode = 0;
	let windows = '._ydb_window {position:fixed;width:80vw;height:80vh;top:10vh;left:10vw;overflow-y:auto} ._ydb_warn{background:#f00 !important}';
	const warningText = 'These two lines are used by YourBooru to save data in your account. Do not split or edit them.';
	const backupVersion = 1;

	function read() {
		if (localStorage._ydb_config == undefined) localStorage._ydb_config = localStorage._ydb;
		let svd = localStorage._ydb_config;
		try {
			settings = JSON.parse(svd);
		}
		catch (e) {
			settings = {};
		}
		if (settings.debugLength == undefined) settings.debugLength = 100;
		write();
	}
	read();

	function write() {
		localStorage._ydb_config = JSON.stringify(settings);
	}

	function callWindow(inside) {
		return ChildsAddElem('div',{className:'_ydb_window block__content'},document.body,inside);
	}

	function debugLogger(id, val, level) {
		let x = [];
		let svd = localStorage._ydb_dlog;
		try {
			x = JSON.parse(svd);
		}
		catch (e) { }
		let levels = ['!', '?', '.'];
		x.push({id:id,level:level,val:val,ts:Date.now()});
		if (x.length > settings.debugLength) x = x.slice(-settings.debugLength);
		localStorage._ydb_dlog = JSON.stringify(x);
	}

	function register() {
		if (window._YDB_public == undefined) window._YDB_public = {};
		if (window._YDB_public.settings == undefined) window._YDB_public.settings = {};
		window._YDB_public.settings.settings = {
			name:'Settings',
			container:'_ydb_config',
			version:GM_info.script.version,
			s:[
				{type:'checkbox', name:'Synchronize (settings will be duplicated at watchlist string filter, this will not affect watchlist)', parameter:'synch'},
				{type:'breakline'},
				{type:'text', name:'Newer settings from backup will be loaded even if synchronizing is disabled. So, first enabling of this option should be done when all the settings is actual.<br>', styleS:{fontStyle:'italic'}},
				{type:'text', name:'If you don\'t need backup anymore, remove added text in "Watch list filter string" at the "Watch list" tab.', styleS:{fontStyle:'italic'}},
				{type:'breakline'},
				{type:'buttonLink', name:'Synch now', href:'/pages/yourbooru?synch'},
				{type:'breakline'},
				{type:'breakline'},
				{type:'input', name:'Debug log length:', parameter:'debugLength', validation:{type:'int',min:0,max:500, default:200}}
			]
		};
		if (window._YDB_public.funcs == undefined) window._YDB_public.funcs = {};
		window._YDB_public.funcs.callWindow = callWindow;
		window._YDB_public.funcs.backgroundBackup = backgroundBackup;
		window._YDB_public.funcs.log = debugLogger;
	}

	function hideBlock(e) {
		let u = e.target;
		while (!u.classList.contains('block__header')) u = u.parentNode;
		let x = u.nextSibling;
		x.classList.toggle('hidden');
		u.getElementsByClassName('fa')[0].innerHTML = (x.classList.contains('hidden')?'\uF061':'\uF063');
	}

	function renderer(e, ss, l, s, mod) {
		s.forEach(function (v,i,a) {
			let x, y;
			if (v.type == 'checkbox') {
				y = ChildsAddElem('label', {dataset:{parent:e.container, parameter:v.parameter}, className:'_ydb_s_checkcont',innerHTML:' '+v.name+' '}, l, [
					x = InfernoAddElem('input',{type:'checkbox',checked:ss[v.parameter]})
				]);
			}
			else if (v.type == 'input') {
				y = addElem('span', {innerHTML:' '+v.name+' '},l);
				x = addElem('input', {dataset:{parent:e.container, parameter:v.parameter},type:'text',className:'input _ydb_s_valuecont',value:ss[v.parameter]},l);
			}
			else if (v.type == 'textarea') {
				y = addElem('span', {innerHTML:' '+v.name+' '},l);
				x = addElem('textarea', {dataset:{parent:e.container, parameter:v.parameter},type:'text',className:'input _ydb_s_valuecont _ydb_s_bigtextarea',value:ss[v.parameter]},l);
			}
			else if (v.type == 'select') {
				y = addElem('span', {innerHTML:' '+v.name+' '},l);
				let elems = v.values.map(function (vv,i,a) {
					return InfernoAddElem('option',{innerHTML:vv.name, value:vv.value, selected:(vv.value == ss[v.parameter])});
				});
				x = ChildsAddElem('select', {dataset:{parent:e.container, parameter:v.parameter},size:1, className:'input _ydb_s_valuecont'}, l, elems);
			}

			else if (v.type == 'button') {
				x = addElem('span', {innerHTML:v.name, className:'button', events:[{t:'click',f:function(e) {v.action(mod, e.target);}}]},l);
			}

			else if (v.type == 'buttonLink') {
				x = addElem('a', {innerHTML:v.name, className:'button', href:v.href},l);
			}

			else if (v.type == 'breakline') {
				y = addElem('br', {},l);
			}

			else if (v.type == 'header') {
				y = addElem('h4', {innerHTML:v.name},l);
			}

			else if (v.type == 'text') {
				y = addElem('span', {innerHTML:v.name},l);
			}

			else if (v.type == 'array') {
				let rr = function(e, ss, l, s, y, nav) {
					let x = addElem('div', {className:'block__content alternating-color _ydb_inArray', dataset:{id:y.getElementsByClassName('_ydb_inArray').length}}, y);
					for (let k=0; k<v.s.length; k++) {
						renderer(e, ss, x, s[k], mod);
						if (nav && k==0) {
							addElem('span', {
								style:'margin-left:.5em; float:right',
								className:'button',
								innerHTML:'<i class="fa fa-arrow-up"></i>',
								events:[{
									t:'click',
									f:function(e) {
										let u = e.target;
										if (!u.classList.contains('button')) u = u.parentNode;
										let xl = u.parentNode;
										if (xl.previousSibling == null) return;
										xl.parentNode.insertBefore(xl, xl.previousSibling);
									}
								}]
							}, x);
						}
						if (k == v.s.length-1) {
							addElem('span', {
								className:'button commission__category',
								innerHTML:'Delete',
								style:'margin-left:0.5em',
								events:[{
									t:'click',
									f:function(ex) {
										this.parentNode.parentNode.removeChild(this.parentNode);
									}
								}]
							}, x);

							if (nav) {
								addElem('span', {
									style:'margin-left:.5em; float:right',
									className:'button',
									innerHTML:'<i class="fa fa-arrow-down"></i>',
									events:[{
										t:'click',
										f:function(e) {
											let u = e.target;
											if (!u.classList.contains('button')) u = u.parentNode;
											let xl = u.parentNode;
											if (xl.nextSibling == null) return;
											let xp = xl.nextSibling.nextSibling;
											if (xp == undefined) xl.parentNode.appendChild(xl);
											else xl.parentNode.insertBefore(xl, xp);
										}
									}]
								}, x);
							}
						}
						else addElem('br', {},x);
					}
				};
				x = addElem('div', {dataset:{parent:e.container, parameter:v.parameter},className:'_ydb_array'},l);
				v.container = v.parameter;
				if (ss[v.parameter] != undefined) for (let j=0; j<ss[v.parameter].length; j++) {
					rr(e, ss[v.parameter][j], x, v.s, x, v.customOrder);
				}
				y = addElem('span', {
					className:'button',
					innerHTML:v.addText,
					events:[{
						t:'click',
						f:function(ex) {
							rr(e, v.template, x, v.s, x, v.customOrder);
						}
					}]
				}, l);

			}

			if (v.attrI != undefined) for (let s in v.attrI) x[s] = v.attrI[s];
			if (v.attrS != undefined) for (let s in v.attrS) y[s] = v.attrS[s];
			if (v.styleI != undefined) for (let s in v.styleI) x.style[s] = v.styleI[s];
			if (v.styleS != undefined) for (let s in v.styleS) y.style[s] = v.styleS[s];
			if (v.i != undefined) v.i(mod, x);

		});
	}

	function renderCustom(e, cont2, mod) {
		if (e.s.length == 0) return;
		let ss = {};
		try {
			ss = JSON.parse(localStorage[e.container]);
		}
		catch (ex) {
		}

		if (e.name != 'Settings') ChildsAddElem('div', {className:'block__header'}, cont2, [
			InfernoAddElem('a', {events:[{t:'click',f:hideBlock}]}, [
				InfernoAddElem('i', {className:'fa', innerHTML:'\uF061'}),
				InfernoAddElem('span', {innerHTML:' '+e.name})
			])
		]);

		let cont = addElem('div', {className:'block__content '+(e.name!='Settings'?'hidden':'')}, cont2);
		if (e.name == 'Settings') cont2.insertBefore(cont, cont2.childNodes[0]);

		let l = document.createElement('div');
		l.dataset.parent = e.container;
		l.className = '_ydb_settings_container';
		renderer(e, ss, l, e.s, mod);
		cont.appendChild(l);

	}

	function getData(force) {
		let t = addElem('div',{id:'_ydb_dataArrive', style:'display:none'}, document.getElementById('content'));
		let parse = function (request) {
			try {
				t.innerHTML = request.responseText;
				let x = document.getElementById('user_watched_images_exclude_str').value.split('\n');
				t.innerHTML = '';
				for (let i=0; i<x.length; i++) {
					if (x[i].startsWith('$')) {
						x[i] = atob(x[i].slice(1));
						let r = [];
						for (let j=0; j<x[i].length; j++) {
							let x2 = x[i].charCodeAt(j);
							if (x2>127) x2-=256;
							r.push(x2);
						}
						let s = JSON.parse(LZMA.decompress(r));
						if (settings.timestamp < s.timestamp || force) {
							for (let y in s.vs) {
								localStorage[y] = s.vs[y];
							}
						}
						settings.timestamp = parseInt(Date.now()/1000);
						write();
						if (location.pathname != "/pages/yourbooru" && location.search != '?synch') location.reload();
						return;
					}
				}
				errorCode = 2;
				return;
			}
			catch (e) {
				settings.timestamp = parseInt(Date.now()/1000);
				write();
			}
			return;
		};

		let readyHandler = function(request) {
			return function () {
				if (request.readyState === 4) {
					if (request.status === 200) return parse(request);
					else if (request.status === 0) {
						return false;
					}
					else {
						return false;
					}
				}
			};
		};

		let get = function() {
			let req = new XMLHttpRequest();
			req.onreadystatechange = readyHandler(req);
			req.open('GET', '/settings');
			req.send();
		};
		get();
	}

	function removeBackup() {
		let container = document.getElementById('user_watched_images_exclude_str');
		let x = container.value.split('\n');
		for (let i=0; i<x.length; i++) {
			if (x[i].startsWith('$') || x[i] == warningText) {
				x.splice(i,1);
				i--;
			}
		}
		container.value = '';
		for (let i=0; i<x.length; i++) container.value += x[i] + (i<x.length-1?'\n':'');
	}

	function backgroundBackup(callback) {
		if (!settings.synch) {
			callback();
			return;
		}

		read();
		settings.bgBackupflag = true;
		write();
		window._YDB_public.bgCalled = true;
		let t = window.open('/settings#backup', 'backup', 'width=1,height=1');
		let checker = function() {
			read();
			if (settings.bgBackupflag) setTimeout(checker, 100);
			else {
				window._YDB_public.bgCalled = false;
				t.close();
				debugLogger('YDB:S', 'Bg backup successfully created', 0);
				if (callback != undefined) callback();
			}
		};
		checker();
	}

	function backup() {
		read();
		if (!settings.synch) {
			//removeBackup();
			return;
		}
		let container = document.getElementById('user_watched_images_exclude_str');
		let x = container.value.split('\n');
		let inserted;

		let content = {};
		content.timestamp = parseInt(Date.now()/1000);
		content.version = backupVersion;
		content.vs = {};

		for (let m in modules) {
			content.vs[modules[m].container] = localStorage[modules[m].container];
		}

		let r2 = LZMA.compress(JSON.stringify(content),9);
		let r = '';
		for (let i=0; i<r2.length; i++) {
			if (r2[i] < 0) r2[i] = 256+r2[i];
			r+=String.fromCharCode(r2[i]);
		}
		r = '$'+btoa(r);

		for (let i=0; i<x.length; i++) {
			if (x[i].startsWith('$')) {
				if (i==0 || x[i-1] != warningText) x.splice(i,0,warningText);
				x[i] = r;
				inserted = true;
			}
		}
		if (!inserted) {
			x.push(warningText);
			x.push(r);
		}
		container.value = '';
		for (let i=0; i<x.length; i++) container.value += x[i] + (i<x.length-1?'\n':'');
		debugLogger('YDB:S', 'Front backup successfully created', 0);
	}

	function afterSave() {
		backup();
	}

	function validate(e) {
		let ec = document.getElementById('_ydb_error_cont');
		ec.innerHTML = '';
		let errorlevel = 0;
		let validateChilds = function(c, m, mm) {
			let errorlevel = 0;
			for (let i=0; i<c.childNodes.length; i++) {
				let el = c.childNodes[i];
				let x;
				for (let j=0; j<m.length; j++) {
					if (m[j].length>0) for (let k=0; k<m[j].length; k++) {
						if (m[j][k].parameter == el.dataset.parameter) {
							x = m[j][k];
							break;
						}
					}
					else if (m[j].parameter == el.dataset.parameter) {
						x = m[j];
						break;
					}
				}
				if (el.classList == null) continue;
				else if (el.classList.contains('_ydb_s_valuecont')) {
					if (x.validation != undefined) {
						let v = x.validation;
						if (v.type == 'int') {
							if (el.value == '') {
                                if (x.default != undefined) el.value = x.default;
                                else if (el.min != undefined) el.value = x.min;
                                else el.value=0;
                            }
							if (el.value != parseInt(el.value) || el.value<v.min || el.value>v.max) {
								let reason = '';
								if (el.value != parseInt(el.value)) reason = ' should be valid integer number!';
								else if (el.value<v.min) reason = ' is too small! Should be at least '+v.min;
								else if (el.value>v.max) reason = ' is too big! Should be at most '+v.max;
								addElem('div',{className:'flash flash--warning', innerHTML:'>'+mm.name+': '+x.name+reason}, ec);
								errorlevel++;
								el.classList.add('_ydb_warn');
							}
						}
						else if (v.type == 'float') {
							if (el.value == '') {
                                if (x.default != undefined) el.value = x.default;
                                else if (el.min != undefined) el.value = x.min;
                                else el.value=0;
                            }
							if (el.value != parseFloat(el.value) || el.value<v.min || el.value>v.max) {
								let reason = '';
								if (el.value != parseInt(el.value)) reason = ' should be valid real number!';
								else if (el.value<v.min) reason = ' is too small! Should be at least '+v.min;
								else if (el.value>v.max) reason = ' is too big! Should be at most '+v.max;
								addElem('div',{className:'flash flash--warning', innerHTML:'>'+mm.name+': '+x.name+reason}, ec);
								errorlevel++;
								el.classList.add('_ydb_warn');
							}
						}
						else if (v.type == 'unique') {
							for (let i=0; i<c.parentNode.querySelectorAll('input._ydb_s_valuecont[data-parent="'+el.dataset.parent+'"][data-parameter="'+el.dataset.parameter+'"]').length;i++) {
								let c2 = c.parentNode.querySelectorAll('input._ydb_s_valuecont[data-parent="'+el.dataset.parent+'"][data-parameter="'+el.dataset.parameter+'"]')[i];
								if (c2 == el) break;
								if (c2.value == el.value) {
									addElem('div',{className:'flash flash--warning', innerHTML:'>'+mm.name+': '+x.name+' should be unique!'}, ec);
									errorlevel++;
									el.classList.add('_ydb_warn');
								}
							}
						}
						continue;
					}
				}
				else if (el.classList.contains('_ydb_array')) {
					if (el.childNodes != undefined) for (let j=0; j<el.childNodes.length; j++) {
						if (el.childNodes[j].classList.contains('_ydb_inArray')) {
							errorlevel+=validateChilds(el.childNodes[j], x.s, mm);
						}
					}
				}
			}
			return errorlevel;
		};
		let containers = document.getElementsByClassName('_ydb_settings_container');
		for (let i=0; i<containers.length; i++) {
			let mx = modules[containers[i].dataset.parent];
			errorlevel += (validateChilds(containers[i], mx.options, mx));
		}
		if (errorlevel>0) {
			let x = addElem('div',{className:'flash flash--warning', style:'font-weight:500', innerHTML:'There is '+errorlevel+' errors preventing settings to be saved:'}, ec);
			ec.insertBefore(x,ec.childNodes[0]);
		}
		return errorlevel;
	}

	function save(e) {
		if (resaved) {
			afterSave();
			return;
		}
		window._YDB_public.handled = 0;
		if (validate(e) >0) {
			e.preventDefault();
			setTimeout(function() {document.querySelector('.edit_user input.button[type=submit]').removeAttribute('disabled');},500);
			return;
		}
		let changed = false;
		let exploreChilds = function(c, m, o) {
            //container, module data container, onchange functions, module data container path, container id
            let callback = function(m, el, val) {
                m[el.dataset.parameter] = val;
            };
			let changed = false;
			for (let i=0; i<c.childNodes.length; i++) {
				let el = c.childNodes[i];
				if (el.classList == null) continue;
				else if (el.classList.contains('_ydb_s_valuecont')) {
					if (m[el.dataset.parameter] != el.value) {
						changed = true;
						m[el.dataset.parameter] = el.value;
						if (o != undefined && o[el.dataset.parameter] != undefined) o[el.dataset.parameter](m, el, callback);
					}
				}
				else if (el.classList.contains('_ydb_s_checkcont')) {
					let cel = el.getElementsByTagName('input')[0];
					if (m[el.dataset.parameter] != cel.checked) {
						changed = true;
						m[el.dataset.parameter] = cel.checked;
						if (o != undefined && o[el.dataset.parameter] != undefined) o[el.dataset.parameter](m, cel, callback);
					}
				}
				else if (el.classList.contains('_ydb_array')) {
					let inChanged = false;
					let k = 0;
					if (m[el.dataset.parameter] == undefined || m[el.dataset.parameter].length == undefined) m[el.dataset.parameter] = [];
					if (el.childNodes != undefined) for (let j=0; j<el.childNodes.length; j++) {
						if (el.childNodes[j].classList.contains('_ydb_inArray')) {
							if (typeof m[el.dataset.parameter][k] != 'object') m[el.dataset.parameter][k] = {};
							if (exploreChilds(el.childNodes[j], m[el.dataset.parameter][k], (o != undefined?o[el.dataset.parameter]:undefined))) {
								inChanged = true;
							}
							k++;
						}
					}

					if (k<m[el.dataset.parameter].length) {
						m[el.dataset.parameter].splice(k);
						inChanged = true;
					}

					if (inChanged) changed = true;
					if (inChanged && o != undefined && o[el.dataset.parameter]._ != undefined) o[el.dataset.parameter]._(m, m[el.dataset.parameter], callback);
				}
			}
			return changed;
		};
		let containers = document.getElementsByClassName('_ydb_settings_container');
		for (let i=0; i<containers.length; i++) {
			let mx = modules[containers[i].dataset.parent];
            mx.changed = false;
			if (exploreChilds(containers[i], mx.saved, mx.onChanges)) {
				changed = true;
                mx.changed = true;
				if (mx.onChanges != undefined && mx.onChanges._ != undefined) mx.onChanges._(mx);
				//localStorage[mx.container] = JSON.stringify(mx.saved);
			}
		}
		read();
		settings.timestamp = parseInt(Date.now()/1000);
		settings.bgBackupflag = false;
		write();
		if (window._YDB_public.handled != 0) {
			e.preventDefault();
			let checker = function() {
				if (window._YDB_public.handled != 0) setTimeout(checker, 100);
				else {
                    for (let i=0; i<containers.length; i++) {
                        let mx = modules[containers[i].dataset.parent];
                        if (mx.changed) localStorage[mx.container] = JSON.stringify(mx.saved);
                    }
					resaved = true;
					document.querySelector('.edit_user input.button[type=submit]').removeAttribute('disabled');
					document.querySelector('.edit_user input.button[type=submit]').click();
				}
			};
			setTimeout(checker, 100);
		}
        else if (changed) {
            for (let i=0; i<containers.length; i++) {
                let mx = modules[containers[i].dataset.parent];
                if (mx.changed) localStorage[mx.container] = JSON.stringify(mx.saved);
            }
            backup();
        }
		debugLogger('YDB:S', 'Settings saved', 0);
	}

	function settingPage() {
		let cont;
		//preparing
		document.getElementById('js-setting-table').insertBefore(cont = InfernoAddElem('div',{className:'block__tab hidden',dataset:{tab:'YourBooru'},style:'position:relative'}), document.querySelector('[data-tab="local"]').nextSibling);

		let style = '._ydb_s_bigtextarea {resize:none;overflow:hidden;line-height:1.25em;white-space:pre;height:2.25em;vertical-align:top;}'+
			'._ydb_s_bigtextarea:focus {overflow:auto;position:absolute;width:900px !important;height:10em;z-index:5;white-space:pre-wrap}';
		addElem('style',{type:'text/css',innerHTML:style},document.head);
		addElem('a',{href:'#',innerHTML:'YourBooru',dataset:{clickTab:'YourBooru'}},document.getElementsByClassName('block__header')[0]);

		let el;
		if (!settings.synch) {
			el = document.createElement('div');
			el.className = 'block block--fixed block--warning';
			el.innerHTML = 'Settings on this tab are saved in the current browser. They are independent of whether you are logged in or not.';
			cont.appendChild(el);
		}

		//loading, stage 1
		if (window._YDB_public != undefined) {
			if (window._YDB_public.settings != undefined) {
				for (let k in window._YDB_public.settings) {
					if (window._YDB_public.settings[k] != undefined && window._YDB_public.settings[k].s != undefined) {
						let ss = {};
						let s2 = window._YDB_public.settings[k];
						try {ss = JSON.parse(localStorage[window._YDB_public.settings[k].container]);}
						catch (ex) {console.log('Warning: '+k+' has empty storage!');}
						modules[s2.container] = {name:k, container:s2.container, changed:false, saved:ss, options:s2.s, onChanges:s2.onChanges};
						renderCustom(s2, cont, modules[s2.container]);
					}
				}
			}
		}

		//loading, stage 2
		for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
			try {
				let k = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
				let ss = {};
				try {ss = JSON.parse(localStorage[k.container]);}
				catch (ex) {console.log('Warning: '+k.name+' has empty storage!');}
				modules[k.container] = {name:k.name, container:k.container, changed:false, saved:ss, options:k.s, onChanges:k.onChanges};
				renderCustom(k, cont, modules[k.container]);
			}
			catch (e) {
				console.log('Error JSON processing "'+document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value+'" '+e);
			}
		}

		//postloading
		ChildsAddElem('div', {className:'block__header'}, cont, [
			InfernoAddElem('span', {innerHTML:'Installed plugins', style:'margin-left:12px'})
		]);

		let s = '';
		for (let key in window._YDB_public.settings) {
			let ax = window._YDB_public.settings[key];
			addElem('div', {classList:'block__content alternating-color', innerHTML:ax.name+' ver. '+ax.version}, cont);
		}
		for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
			try {
				let ax = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
				addElem('div', {classList:'block__content alternating-color', innerHTML:ax.name+' ver. '+ax.version}, cont);
			}
			catch (e) {
			}
		}

		ChildsAddElem('div', {className:'block__header'}, cont, [
			InfernoAddElem('a', {innerHTML:'Backup', target:'_blank', href:'/pages/yourbooru?backup'}),
			InfernoAddElem('a', {innerHTML:'Logs', target:'_blank', href:'/pages/yourbooru?logs'})
		]);
		addElem('div', {className:'block', id:'_ydb_error_cont'}, cont);

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

		document.querySelector('.edit_user input.button[type=submit]').addEventListener('click', save);
		setTimeout(hh, 500);
		if (location.hash.slice(1) == 'backup') {
			document.querySelector('.edit_user input.button[type=submit]').click();
		}
		validate();
	}

	////////////////////////////

	function YB_createEmpty() {
		document.querySelector('#content h1').innerHTML = 'Ooops!';
		document.querySelector('#content .walloftext').innerHTML = '<p>YourBooru cannot get what you want. Sorry :(</p><p>Try to check url you used. If you believe that you found a bug report to me please!</p>';
	}

	///////////////////////////
	function YB_logs() {
		document.querySelector('#content h1').innerHTML = 'Debug logs';
		var c = document.querySelector('#content .walloftext');

		var s = '';
		c.innerHTML = '';

		let x = [];
		let svd = localStorage._ydb_dlog;
		try {
			x = JSON.parse(svd);
		}
		catch (e) { }
		let levels = ['.', '?', '!'];
		let levelsClasses = ['flash--success','flash--site-notice','flash--warning'];
		let u = [];

		for (let i=x.length-1; i>=0; i--) {
			let d = new Date(x[i].ts);
			u.push(InfernoAddElem('div',{className:levelsClasses[x[i].level]},[
				InfernoAddElem('strong',{innerHTML:'['+levels[x[i].level]+'] '},[]),
				InfernoAddElem('strong',{innerHTML:' ['+x[i].id+'] '},[]),
				InfernoAddElem('span',{innerHTML:d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear()+'@'+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()},[]),
				InfernoAddElem('span',{innerHTML:' '+x[i].val},[])
			]));
		}

		ChildsAddElem('div',{className:'block',style:'width:100%'}, c, u);
	}

	function YB_backup() {
		document.querySelector('#content h1').innerHTML = 'Backup';
		var c = document.querySelector('#content .walloftext');

		var s = '';
		c.innerHTML = 'Copy content from that textbox and save it somewhere.'+
			'<br>If you want to "restore" backup:<br>1. Open developer console (usually F12) while browsing derpibooru;<br>2. Copypaste saved code inside;<br>3. Press Enter.';
		//loading, stage 1
		if (window._YDB_public != undefined) {
			if (window._YDB_public.settings != undefined) {
				for (let k in window._YDB_public.settings) {
					if (k!='settings') {
						if (window._YDB_public.settings[k] != undefined && window._YDB_public.settings[k].s != undefined) {
							let ss;
							try {
								ss = localStorage[window._YDB_public.settings[k].container];
								s+='localStorage.'+window._YDB_public.settings[k].container+'=\''+ss+'\';\n';
							}
							catch (ex) {console.log('Warning: '+k+' has empty storage!');}
						}
					}
				}
			}
		}

		//loading, stage 2
		for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
			try {
				let k = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
				let ss;
				try {
					ss = localStorage[k.container];
					s+='localStorage.'+k.container+'=\''+ss+'\';\n';
				}
				catch (ex) {console.log('Warning: '+k.name+' has empty storage!');}
			}
			catch (e) {
				console.log('Error JSON processing "'+document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value+'" '+e);
			}
		}

		addElem('textarea',{className:'input',readonly:true,value:s,style:'width:100%; height:20em;'}, c);
	}

	function yourbooruPage() {
		let x = location.search.slice(1);
		if (location.search == "") YB_createEmpty();
		else if (location.search == "?") YB_createEmpty();
		else {
			let u = x.split('?');
			if (u[0] == "backup") setTimeout(YB_backup, 100);
			else if (u[0] == "logs") setTimeout(YB_logs, 100);
			else if (u[0] == "synch") setTimeout(function() {
				document.querySelector('#content h1').innerHTML = 'Synchronizing...';
				document.querySelector('#content .walloftext').innerHTML = '';
				getData(true);
				let c = function() {
					if (errorCode>0) {
						if (errorCode == 2) {
							document.querySelector('#content .walloftext').innerHTML = 'No backup found.';
							setTimeout(function() {
								if (history.length == 1) close();
								else history.back();
							},5000);
						}
					}
					else if (settings.timestamp+1 >= parseInt(Date.now()/1000)) {
						if (history.length == 1) close();
						else history.back();
					}
					else setTimeout(c, 100);
				};
				c();
			}, 100);
		}
	}

	window.onbeforeunload = function(e) {
		if (window._YDB_public.bgCalled) {
			let checker = function() {
				if (window._YDB_public.bgCalled) setTimeout(checker, 100);
			};
			callWindow(addElem('h1',{innerHTML:'Background copy in process...'},[]));
		}
	};

	addElem('style',{type:'text/css',innerHTML:windows},document.head);
	if (settings.timestamp+21600 < parseInt(Date.now()/1000) && location.pathname != "/settings") getData();
	if (location.pathname == "/settings") setTimeout(settingPage, 100);
	if (location.pathname == "/pages/yourbooru") yourbooruPage();
	register();
})();
