// ==UserScript==
// @name         Tumblr YDB:ADUp module
// @namespace    http://tampermonkey.net/
// @version      0.0.9
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
		if (url.indexOf('/photoset_iframe/')>-1) {
			url = url.replace(/(^.*)(photoset_iframe\/)(.*$)/,'$1');
		}
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
				u = x.shift();
			}
			artist = u;
		}
		addElem('a',{innerHTML:'DB upload',target:'_blank',
                     href:'//www.derpibooru.org/images/new?newImg='+encodeURIComponent('http://s3.amazonaws.com/data.tumblr.com'+img.replace(/_\d{3,}/, '_raw'))+
                     '&src='+encodeURIComponent(url)+'&tags='+encodeURIComponent('artist:'+artist)+'&description='+
                     (desc!=''?encodeURIComponent('[bq]'+desc+'[/bq]'):''),
                     style:'position:absolute;top:0;left:0;background:#000;color:#fff;opacity:0.4;max-width:10em;max-height:2em', events:[{t:'click',f:function(e){
			e.preventDefault();
			window.open(e.target.href,'_blank');
		}}]},y);
	}

	function main() {
		document.querySelectorAll('div.photoset[id*="photoset_"]:not(._ydb_adup_parsed)').forEach(function(x) {
			for (let j=0; j<x.querySelectorAll('a.photoset_photo').length;j++) {
				let y = x.querySelectorAll('a.photoset_photo')[j];
                y.classList.add('_ydb_adup_parsed');
				createLink(y, x, y.pathname);
			}
			x.classList.add('_ydb_adup_parsed');
		});

		document.querySelectorAll('div.post.is_photo div.post_media a.post_media_photo_anchor:not(._ydb_adup_parsed), a[href*="media.tumblr.com/"][href*="/tumblr_"]:not(._ydb_adup_parsed), a[href*="'+location.hostname+'/image/"]:not(._ydb_adup_parsed)').forEach(function(y) {
			let img = y.querySelector('img');
            if (y.clientHeight<66 && y.clientWidth<66) return;
			y.classList.add('_ydb_adup_parsed');
			if (img == undefined) {
				y = y.parentNode;
				img = y.querySelector('img[src*="media.tumblr"]');
			}
			if (img == undefined) return;
			createLink(y, y, parseURL(img.src).path);
		});

		document.querySelectorAll('*:not(._ydb_adup_parsed)>img[src*="/tumblr_inline_"]:not(._ydb_adup_parsed), a[href*="'+location.hostname+'"]:not(._ydb_adup_parsed) img[src*="media.tumblr.com/"]:not(._ydb_adup_parsed)').forEach(function(img) {
			let y = img.parentNode;
			if (y.getElementsByTagName('img').length>1) return;
            if (img.clientHeight<66 && img.clientWidth<66) return;

			img.classList.add('_ydb_adup_parsed');
			createLink(y, y, parseURL(img.src).path);
		});
		setTimeout(main, 2000);

	}

	main();
})();
