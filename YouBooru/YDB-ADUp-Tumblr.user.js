// ==UserScript==
// @name         Tumblr YDB:ADUp module
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @author       stsyn
// @match        *://*/*
// @exclude      *://trixiebooru.org/*
// @exclude      *://derpibooru.org/*
// @exclude      *://www.trixiebooru.org/*
// @exclude      *://www.derpibooru.org/*
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ADUp-Tumblr.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
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

	function createLink(y, x, img) {
		y.style.position = 'relative';
		let url = location.href;
		let artist = '';
		let desc = '';
		if (location.hostname == "www.tumblr.com") {
			let parent = x.parentNode;
			while (!parent.classList.contains('post_full')) parent = parent.parentNode;
			artist = parent.dataset.tumblelog;
			url = JSON.parse(parent.dataset.json).share_popover_data.post_url;
			if (parent.getElementsByClassName('post_body')[0] != undefined) desc = parent.getElementsByClassName('post_body')[0].innerText;
		}
		else {
			let x = location.hostname.split('.');
			let u = x.shift();
			while (u=='www' || u=='nsfw' || u=='art') {
				console.log(u, x);
				u = x.shift();
			}
			artist = u;
		}
		addElem('a',{innerHTML:'DB upload',target:'_blank',href:'//www.derpibooru.org/images/new?newImg='+encodeURIComponent('http://s3.amazonaws.com/data.tumblr.com'+img.replace(/_\d{3,}/, '_raw'))+'&src='+encodeURIComponent(url)+'&tags='+encodeURIComponent('artist:'+artist)+'&description='+encodeURIComponent('[bq]'+desc+'[/bq]'),style:'position:absolute;top:0;left:0;background:#000;color:#fff;opacity:0.4', events:[{t:'click',f:function(e){
			e.preventDefault();
			window.open(e.target.href,'_blank');
		}}]},y);
	}

	for (let i=0;i<document.querySelectorAll('div.photoset[id*="photoset_"]').length;i++) {
		let x = document.querySelectorAll('div.photoset[id*="photoset_"]')[i];
		for (let j=0; j<x.querySelectorAll('a.photoset_photo').length;j++) {
			let y = x.querySelectorAll('a.photoset_photo')[j];
			createLink(y, x, y.pathname);
		}
	}

	for (let i=0;i<document.querySelectorAll('div.post.is_photo div.post_media a.post_media_photo_anchor, a[href*="'+location.hostname+'/image/"]').length;i++) {
		let y = document.querySelectorAll('div.post.is_photo div.post_media a.post_media_photo_anchor, a[href*="'+location.hostname+'/image/"]')[i];
		createLink(y, y, parseURL(y.querySelector('img').src).path);
	}

})();
