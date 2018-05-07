// ==UserScript==
// @name         DeviantArt ADUp Module
// @version      0.0.6
// @author       stsyn
// @include      http*://*.deviantart.com/*
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ADUp-DeviantArt.user.js
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
	'use strict';

	var l, ds, i=0;
	var req = false;

	function DA(p, link) {
		req = true;
		if (l.indexOf('/art/') !== 0) {
			console.log('[DAD]: Not art');
			return;
		}

		let hasFull = (Boolean)(document.querySelector('.dev-page-download'));
		let dlink, width, height, text = '';
		if (hasFull) {
			let xlink = document.querySelector('.dev-page-download').href;
			width = document.querySelector('div.dev-metainfo-details dl dd:last-child').innerHTML.split('×')[0];
			height = document.querySelector('div.dev-metainfo-details dl dd:last-child').innerHTML.split('×')[1];
			if (link == undefined) {
				GM_xmlhttpRequest({
					method:   "GET",
					url:      xlink,
					onload: function(r) {
						DA(p,r.finalUrl);
					},
					onerror:  function(r) {
						console.log('Error', r);
					}
				});
				return;
			}
			else {
				dlink = link;
			}
		}
		else {
			let o = document.querySelector('.pimp a.thumb');
			dlink = o.dataset.superFullImg;
			width = o.dataset.superFullWidth;
			height = o.dataset.superFullHeight;
		}

		if (document.querySelector('.dev-description .text.block') != undefined) text = '[bq]'+document.querySelector('.dev-description .text.block').innerText+'[/bq]';

		ds.innerHTML = '<i></i><span class="label"> Upload on derpibooru</span><span class="text"></span>';

		ds.href = '//www.derpibooru.org/images/new?newImg='+encodeURIComponent(dlink)+
			'&src='+encodeURIComponent(location.href)+'&tags='+encodeURIComponent('artist:'+document.querySelector('.author .username').innerHTML.toLowerCase())+'&description='+
			(encodeURIComponent(text))+
			'&newWidth='+width+'&newHeight='+height;
		ds.getElementsByTagName('i')[0].style.width = '20px';
		ds.getElementsByTagName('i')[0].style.background = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJtMTMuMiwuNmM1LDkuMi0uMiwxNS41LTIuOSwxNS4zcy0zLjYsLTQuNy05LjIsLTQuNWMyLjYsLTMuNCA4LjMsLS4zIDkuOCwtMS42czMuNywtNS40IDIuMywtOS4yIiBmaWxsPSIjNzNkNmVkIj48L3BhdGg+PHBhdGggZD0ibTExLDAuNi0xLjcsMS40LTEuNywtMS4yLjgsMi0xLjcsMWgxLjhsLTUuNSw5LjcuNCwuMiA1LjUsLTkuNy42LDEuOCAuNSwtMiAyLjIsLS4xLTEuOCwtMS4xLjYsLTIiIGZpbGw9IiM5NGMxZGQiPjwvcGF0aD48Y2lyY2xlIGN4PSIxMy41IiBjeT0iOC41IiBmaWxsPSIjZmZmIiBpZD0iZSIgcj0iMC41Ij48L2NpcmNsZT48dXNlIHg9Ii0yIiB5PSIzIiB4bGluazpocmVmPSIjZSI+PC91c2U+PHVzZSB4PSItNiIgeT0iNCIgeGxpbms6aHJlZj0iI2UiPjwvdXNlPjx1c2UgeD0iLTIuOCIgeT0iNiIgeGxpbms6aHJlZj0iI2UiPjwvdXNlPjwvc3ZnPgo=')";
		i = 1;
		document.getElementsByClassName('dev-meta-actions')[p].appendChild(ds);
	}

	function DA_check() {
		setTimeout(DA_check, 1000);
		if (window.location.pathname !== l) {
			if (document.getElementsByClassName('dev-meta-actions')[i] !== undefined) {
				if (i==1 && !req) {
					req = false;
					return;
				}
				l = window.location.pathname;
				DA(i);
			}
		}
	}
	ds = document.createElement('a');
	ds.className = 'dev-page-button dev-page-button-with-text dev-page-download';
	ds.target = '_blank';

	DA_check();

})();
