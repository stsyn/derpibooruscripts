// ==UserScript==
// @name         YourBooru
// @namespace    http://tampermonkey.net/
// @match        *://derpiboo.ru/
// @include      *://trixiebooru.org/
// @include      *://derpibooru.org/
// @match        *://www.derpiboo.ru/
// @include      *://www.trixiebooru.org/
// @include      *://www.derpibooru.org/
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooru.user.js
// @version      0.0.3
// @description  Feedz
// @author       stsyn
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let i;
	var config = {
		/* How many images are showing in the each feed on the derpibooru main page */
		imagesInFeeds:6,
		/* Keep vanilla watchlist on the top of the page */
		doNotRemoveWatchList:true,
		/* Trying to keep image controls alive. But it works ugly :c */
		doNotRemoveControls:true,
		/* This one is pretty clear */
		watchFeedLinkOnRightSide:true
	};

	/* Create your own feed (or remove some) here. Fields value... probably it's really easy. Really, just look! */
    var feedz = [
        {
            name:'Hot',
            query:'created_at.gte:6 hours ago',
            sort:'score',
            sd:'desc'
        },
		{
            name:'Fresh ponuts every day',
            query:'ponut',
            sort:'',
            sd:'desc'
        },
		{
            name:'Your cat\'s derpibooru',
            query:'cat || cat lingerie || behaving like a cat',
            sort:'',
            sd:'desc'
        },
		{
            name:'That day in history',
            query:getYearsQuery(),
            sort:'score',
            sd:'desc'
        },
		{
            name:'Watch it again',
            query:'my:watched, created_at.lte:1 years ago',
            sort:'random',
            sd:'desc'
        },
		{
            name:'Recently uploaded',
            query:'*',
            sort:'',
            sd:'desc'
        }
    ];

	/********************

	Please, stop there

	 ********************/

	function getYearsQuery() {
		let date = new Date();
		let c = '';
		let cc = 'created_at:';
		for (let i = date.getFullYear() - 1; i>2011; i--)
			c+=(c===''?'':' || ')+cc+i+'-'+((date.getMonth()+1)<10?('0'+(date.getMonth()+1)):(date.getMonth()+1))+'-'+(date.getDate()<10?('0'+date.getDate()):date.getDate());
		return c;
	}

    function compileURL(f) {
        return '/search?q='+encodeURIComponent(f.query.replace(new RegExp(' ','g'),'+')).replace(new RegExp('%2B','g'),'+')+'&sf='+f.sort+'&sd='+f.sd;
    }
    
    function compileJSONURL(f) {
        return '/search.json?q='+encodeURIComponent(f.query.replace(new RegExp(' ','g'),'+')).replace(new RegExp('%2B','g'),'+')+'&sf='+f.sort+'&sd='+f.sd;
    }
   
    function getFeed(feed) {
        let req = new XMLHttpRequest();
        req.feed = feed;
        req.onreadystatechange = readyHandler(req);
        req.open('GET', compileURL(feed));
        req.send();
    }
    
    function readyHandler(request) {
        return function () {
            if (request.readyState === 4) {
                if (request.status === 200) return parse(request);
                else if (request.status === 0) {
                    console.log ('[YDB]: Server timeout');
                    return false;
                }
                else {
                    console.log ('[YDB]: Response '+request.status);
                    return false;
                }
            }
        };
    }
    
    function parse(r) {
        r.feed.temp.innerHTML = r.responseText;
		let pc = r.feed.temp.querySelector('.block__content.js-resizable-media-container');
		let c = r.feed.container;
		var mwidth = parseInt(cont.clientWidth) - 14;
		if (pc === null) c.innerHTML = 'Empty feed';
		else for (let i=0; i<config.imagesInFeeds; i++) {
			if (pc.childNodes[0] === null) break;
			if (!config.doNotRemoveControls) pc.childNodes[0].getElementsByClassName('media-box__header')[0].style.display = 'none';
			pc.childNodes[0].getElementsByClassName('media-box__header')[0].style.width = parseInt(mwidth/config.imagesInFeeds-8)+'px';
			pc.childNodes[0].querySelector('.media-box__content--large .image-container.thumb a img').onload = function() {
				if ((this.width==1) && (this.height==1)) {
                    this.src = '/tagblocked.svg';
                    this.style.position = 'absolute';
                    this.style.left = '0';
                    this.style.top = '0';
                }
			};
			pc.childNodes[0].getElementsByClassName('media-box__content--large')[0].style.width = parseInt(mwidth/config.imagesInFeeds-8)+'px';
			pc.childNodes[0].getElementsByClassName('media-box__content--large')[0].style.height = parseInt(mwidth/config.imagesInFeeds-8)+'px';
			c.appendChild(pc.childNodes[0]);
		}
		r.feed.temp.parentNode.removeChild(r.feed.temp);
    }

    var cont = document.getElementsByClassName('column-layout__main')[0];
    for (i=0; i<(config.doNotRemoveWatchList?1:2); i++) cont.childNodes[i].style.display = 'none';

    for (i=0; i<feedz.length; i++) {
       	let elem = document.createElement('div');
        elem.className = 'block';
			let head = document.createElement('div');
			head.className = 'block__header';
				let title = document.createElement('span');
				title.className = 'block__header__title';
				title.innerHTML = feedz[i].name;
			head.appendChild(title);
				let url = document.createElement('a');
		        if (config.watchFeedLinkOnRightSide) url.style.float = 'right';
				url.href = compileURL(feedz[i]);
					let ie = document.createElement('i');
					ie.className = 'fa fa-eye';
				url.appendChild(ie);
					let ut = document.createElement('span');
					ut.className = 'hide-mobile';
					ut.innerHTML = 'Watch feed';
				url.appendChild(ut);
			head.appendChild(url);
		elem.appendChild(head);
            let container = document.createElement('div');
            container.className = 'block__content js-resizable-media-container';
		    feedz[i].container = container;
		elem.appendChild(container);
            let shitcontainer = document.createElement('div');
            shitcontainer.style.display = 'none';
            feedz[i].temp = shitcontainer;
		elem.appendChild(shitcontainer);
        cont.appendChild(elem);
        
        getFeed(feedz[i]);
    }
	
	if (config.doNotRemoveWatchList) cont.appendChild(cont.childNodes[1]);
})();
