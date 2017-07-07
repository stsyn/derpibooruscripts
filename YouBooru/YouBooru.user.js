// ==UserScript==
// @name         YourBooru
// @namespace    http://tampermonkey.net/
// @include      *://trixiebooru.org/
// @include      *://derpibooru.org/
// @include      *://www.trixiebooru.org/
// @include      *://www.derpibooru.org/
// @include      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/
// @include      *://*.orzgs6djmvrg633souxg64th.*.*/
// @include      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/
// @include      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooru.user.js
// @version      0.1.2
// @description  Feedz
// @author       stsyn
// @grant        none
// @run-at       document-idle
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
		watchFeedLinkOnRightSide:true,
        /* Removing unneeded content from HTML. Disable if you meet some problems or if you just want to shit up your localstorage */
        optimizeLS:true
	};

	/*
       Please install YourBooruSettings to adjust feeds in normal way.
       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js
    */
    var feedz = [
        {
            name:'Hot',
            query:'created_at.gte:6 hours ago',
            sort:'score',
            sd:'desc',
            cache:5
        },
		{
            name:'Fresh ponuts every day',
            query:'ponut',
            sort:'',
            sd:'desc',
            cache:30
        },
		{
            name:'Your cat\'s derpibooru',
            query:'cat || cat lingerie || behaving like a cat',
            sort:'',
            sd:'desc',
            cache:30
        },
		{
            name:'That day in history',
            query:'__ydb_LastYears',
            sort:'score',
            sd:'desc',
            cache:0,
            ccache:1440
        },
		{
            name:'Watch it again',
            query:'my:watched, created_at.lte:1 years ago',
            sort:'random',
            sd:'desc',
            cache:5
        },
		{
            name:'Recently uploaded',
            query:'*',
            sort:'',
            sd:'desc',
            cache:0,
            ccache:0
        }
    ];

	/********************

	Please, stop there

	 ********************/

    
    function resizeEverything() {
        let ccont = document.getElementsByClassName('column-layout__main')[0];
        let mwidth = parseInt(ccont.clientWidth) - 14;
        let twidth = parseInt(mwidth/config.imagesInFeeds-8);
        for (let i=0; i<document.getElementsByClassName('_ydb_resizible').length; i++) {
			document.getElementsByClassName('_ydb_resizible')[i].getElementsByClassName('media-box__header')[0].style.width = twidth+'px';
			document.getElementsByClassName('_ydb_resizible')[i].getElementsByClassName('media-box__content--large')[0].style.width = twidth+'px';
			document.getElementsByClassName('_ydb_resizible')[i].getElementsByClassName('media-box__content--large')[0].style.height = twidth+'px';
            if (twidth < 240) {
                document.getElementsByClassName('_ydb_resizible')[i].getElementsByClassName('media-box__header')[0].classList.add('media-box__header--small');
            }
            else {
                document.getElementsByClassName('_ydb_resizible')[i].getElementsByClassName('media-box__header')[0].classList.remove('media-box__header--small');
            }
        }
    }

    function preRun() {
        let svd = localStorage._ydb;
        if (svd === undefined) return;
        else {
            try {
                feedz = JSON.parse(svd);
            }
            catch (e) {
                console.log('Cannot get cached feeds');
            }
        }
        for (let i=0; i<feedz.length; i++) if (feedz[i] != null) feedz[i].loaded = false;
    }

    function postRun() {
        resizeEverything();
        localStorage._ydb = JSON.stringify(feedz);
    }

	function getYearsQuery() {
		let date = new Date();
		let c = '';
		let cc = 'created_at:';
		for (let i = date.getFullYear() - 1; i>2011; i--)
			c+=(c===''?'':' || ')+cc+i+'-'+((date.getMonth()+1)<10?('0'+(date.getMonth()+1)):(date.getMonth()+1))+'-'+(date.getDate()<10?('0'+date.getDate()):date.getDate());
		return c;
	}

    function compileURL(f) {
        let tx = f.query;
        if (f.query == '__ydb_LastYears') tx = getYearsQuery();
        return '/search?q='+encodeURIComponent(tx.replace(new RegExp(' ','g'),'+')).replace(new RegExp('%2B','g'),'+')+'&sf='+f.sort+'&sd='+f.sd;
    }

    function compileJSONURL(f) {
        let tx = f.query;
        if (f.query == '__ydb_LastYears') tx = getYearsQuery();
        return '/search.json?q='+encodeURIComponent(tx.replace(new RegExp(' ','g'),'+')).replace(new RegExp('%2B','g'),'+')+'&sf='+f.sort+'&sd='+f.sd;
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
        let votes =r.feed.temp.querySelector('.js-datastore').getAttribute('data-interactions');
        if (votes !== undefined) votes = JSON.parse(votes);
        
		let pc = r.feed.temp.querySelector('.block__content.js-resizable-media-container');
		let c = r.feed.container;
		let mwidth = parseInt(cont.clientWidth) - 14;
        let twidth = parseInt(mwidth/config.imagesInFeeds-8);
        
		if (pc === null) c.innerHTML = 'Empty feed';
		else for (let i=0; i<config.imagesInFeeds; i++) {
            let elem = pc.childNodes[0];
			if (elem === null) break;
			if (!config.doNotRemoveControls) elem.getElementsByClassName('media-box__header')[0].style.display = 'none';
            
            let act = 'nope';
            let faved = false;
            for (let j=0; j<votes.length; j++) {
                if (votes[j].image_id == elem.querySelector('.media-box__content .image-container').getAttribute('data-image-id')) {
                    if (votes[j].interaction_type == 'voted') {
                        if (votes[j].value == 'up') act = 'up';
                        else if (votes[j].value == 'down') act = 'down';
                    }
                    if (votes[j].interaction_type == 'faved') faved = true;
                }
            }
            
            if (act == 'up') elem.querySelector('.media-box__header .interaction--upvote').classList.add('active');
            else if (act == 'down') elem.querySelector('.media-box__header .interaction--downvote').classList.add('active');
            if (faved) elem.querySelector('.media-box__header .interaction--fave').classList.add('active');
            
            if (config.optimizeLS) {
                elem.querySelector('.media-box__content .image-container').removeAttribute('data-download-uri');
                elem.querySelector('.media-box__content .image-container').removeAttribute('data-image-tag-aliases');
                elem.querySelector('.media-box__content .image-container').removeAttribute('data-image-tags');
                elem.querySelector('.media-box__content .image-container').removeAttribute('data-orig-sha512');
                elem.querySelector('.media-box__content .image-container').removeAttribute('data-sha512');
                elem.querySelector('.media-box__content .image-container').removeAttribute('data-source-url');
                elem.querySelector('.media-box__content .image-container').removeAttribute('data-uris');
                elem.querySelector('.media-box__content .image-container').removeAttribute('data-aspect-ratio');
                elem.querySelector('.media-box__content .image-container').removeAttribute('data-created-at');
                if (elem.querySelector('.media-box__content .image-container img') !== null) elem.querySelector('.media-box__content .image-container img').removeAttribute('alt');
            }

            elem.classList.add('_ydb_resizible');
			//elem.getElementsByClassName('media-box__header')[0].style.width = twidth+'px';
			if (elem.querySelector('.media-box__content .image-container.thumb a img') !== null) elem.querySelector('.media-box__content--large .image-container.thumb a img').onload = function() {
				if ((this.width==1) && (this.height==1)) {
                    this.src = '/tagblocked.svg';
                    this.style.position = 'absolute';
                    this.style.left = '0';
                    this.style.top = '0';
                }
			};
			/*elem.getElementsByClassName('media-box__content')[0].style.width = twidth+'px';
			elem.getElementsByClassName('media-box__content')[0].style.height = twidth+'px';*/
            if (twidth < 240) {
                elem.getElementsByClassName('media-box__header')[0].classList.add('media-box__header--small');
            }
			c.appendChild(pc.childNodes[0]);
		}

        let date = new Date();
		r.feed.temp.parentNode.removeChild(r.feed.temp);
        r.feed.loaded = true;
        r.feed.responsed = config.imagesInFeeds;
        r.feed.saved = parseInt(date.getTime() / 60000);

        r.feed.cachedResp = c.innerHTML;
        for (let i=0; i<feedz.length; i++) if (feedz[i] != null) if (!feedz[i].loaded) return;
        postRun();
    }

    function fillParsed(feed) {
        let c = feed.container;
        if (feed.cachedResp == null) c.innerHTML = 'Empty feed';
        else {
            c.innerHTML = feed.cachedResp;
            for (let i=0; i<c.childNodes.length; i++) {
                let elem = c.childNodes[i];
                if (elem.querySelector('.media-box__content .image-container.thumb a img') !== null) elem.querySelector('.media-box__content--large .image-container.thumb a img').onload = function() {
                    if ((this.width==1) && (this.height==1)) {
                        this.src = '/tagblocked.svg';
                        this.style.position = 'absolute';
                        this.style.left = '0';
                        this.style.top = '0';
                    }
                };
            }
        }
        feed.temp.parentNode.removeChild(feed.temp);
        feed.loaded = true;
        for (let i=0; i<feedz.length; i++) if (feedz[i] != null) if (!feedz[i].loaded) return;
        postRun();
    }

    function init()
    {
        preRun();
        cont.style.minWidth = 'calc(100% - 338px)';
        if (cont.childNodes.length == 1) config.hasWatchList = false;
        else config.hasWatchList = true;
        for (i=0; i<(config.doNotRemoveWatchList?1:2); i++) cont.childNodes[i].style.display = 'none';

        let ptime = new Date();
        ptime = parseInt(ptime.getTime()/60000);
        for (i=0; i<feedz.length; i++) {
            if (feedz[i] == null) continue;
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

            if (feedz[i].cachedResp == undefined) getFeed(feedz[i]);
            else if (ptime > (feedz[i].saved+feedz[i].cache))
            {
                if ((feedz[i].ccache !== undefined) && (feedz[i].ccache>0)) {
                    if (parseInt(ptime/feedz[i].ccache) > parseInt(feedz[i].saved/feedz[i].ccache)) getFeed(feedz[i]);
                    else fillParsed(feedz[i]);
                }
                else getFeed(feedz[i]);
            }
            else if (config.imagesInFeeds != feedz[i].responsed) getFeed(feedz[i]);
            else fillParsed(feedz[i]);
        }

        window.addEventListener("resize", resizeEverything);
        if (config.doNotRemoveWatchList && config.hasWatchList) cont.appendChild(cont.childNodes[1]);
    }
    var cont = document.getElementsByClassName('column-layout__main')[0];
    setTimeout(init, 333);
})();
