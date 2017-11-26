// ==UserScript==
// @name         Resurrected Derp Fullscreen
// @namespace    https://github.com/stsyn/derp-fullscreen/
// @version      0.3.4
// @description  Make Fullscreen great again!
// @author       St@SyaN

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
// @exclude      *://adverts/*.o53xo.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude      *://adverts/*.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude      *://adverts/*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*
// @exclude      *://adverts/*.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/Fullscreen.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/Fullscreen.user.js
// @run-at       document-start
// ==/UserScript==


(function() {
    'use strict';
    var styles = {};
    styles.general = `
.header,#content>.block:first-child, #footer, h4, .flash--site-notice {
height:0;
overflow-y:hidden;
margin:0;
padding:0;
}
#content>.block:first-child{
z-index:201;
position:fixed;
}
.image-show-container .block--warning {
margin:auto;
}
#content {
margin:0;
padding:0;
padding-left:0 !important;
}
.block__header a.js-rand,
.block__header a.js-up,
#content>.block:first-child>.block__header a.js-prev i,
#content>.block:first-child>.block__header a.js-next i{
display:none;
}
#content>.block:first-child>.block__header a.js-prev,
#content>.block:first-child>.block__header a.js-next{
position:fixed;
top:0;
height:100%;
width:10%;
}
#content>.block:first-child>.block__header a.js-prev {
left:0;
}
#content>.block:first-child>.block__header a.js-next {
right:0;
}
.center--layout--flex .image-show-container {
position:absolute;
top:0;
left:0;
margin:0;
padding:0;
min-width:100%;
min-height:100%;
z-index:200;
}
._fs_popup_back {
position:fixed;
display:none;
top:0;
left:0;
width:100%;
height:100%;
z-index:400;
background:rgba(0,0,0,.5);
}
._fs_popup {
display:none;
margin:auto;
overflow-y:scroll;
}
._fs_popup_big {
max-width:1000px;
height:80vh;
margin-top:10vh;
}
._fs_popup.active, ._fs_popup_back.active{
display:block;
}
._fs_down {
display:none;
}
#image_target, #image_target>picture, #image_target>video {
min-height:100vh;
min-width:100vw;
display:block;
}
#image_target>picture>* {
max-height:none;
max-width:none;
margin:auto;
display:block;
}
#_ydb_fs_disable {
left:0;
position:fixed;
z-index:202;
display:inline-block !important;
opacity:0.3;
}
#_ydb_fs_disable:hover {
opacity:.7
}

#content>.block:first-child>.block__header,
#content>.block:first-child>.block__header a:not(.active){
background:none;
}

#image_target {
position:fixed;
top:0;
}
`;
    styles.base = `
#content>.block:first-child{
top:0;
height:auto;
width:100%;
}

#content>.block:first-child>.block__header--sub {
float:right;
width:auto;
opacity:0.2;
}

#content>.block:first-child>.block__header {
text-align:center;
font-size:150%;
line-height:175%;
}

#content>.block:first-child>.block__header>.block__header__title {
font-size:100%;
line-height:100%;
transition-duration: 0.1s;
transition-timing-function: ease-in-out;
color:#e0e0e0;
}

#content>.block:first-child>.block__header>.interaction--comments:hover {
color:#e0e0e0;
}

#content>.block:first-child>.block__header>.block__header__title:hover {
color:#000;
transition-duration: 0.1s;
transition-timing-function: ease-in-out;
}

#content>.block:first-child>.block__header--sub .image_uploader,
#content>.block:first-child>.block__header--sub time,
#content>.block:first-child>.block__header [class*="js-notification-Image"],
#content>.block:first-child>.block__header [href*="/related"],
#content>.block:first-child>.block__header [href*="/view/"],
#content>.block:first-child>.block__header [title*="with tags"],
#content>.block:first-child>.block__header .block__header__dropdown-tab {
display:none;
}

#content>.block:first-child>.block__header [href*="/download/"] {
right:0;
position:absolute;
z-index:202;
opacity:0.3;
}

#content>.block:first-child>.block__header [href*="/download/"]:hover {
opacity:.7;
}

.block__header .stretched-mobile-links {
width:0;
}
`;

    styles.ex = `
._fs_down {
transition:.3s;
display:block;
width:100%;
z-index:300;
bottom:0;
height:15vh;
overflow:hidden;
position:fixed;
left:0;
}
._fs_down_container{
transition:.3s;
max-width:1000px;
margin:auto;
margin-top:14vh;
height:1vh;
}
._fs_down_back{
transition:.3s;
width:100%;
height:calc(100% - 13vh);
position:absolute;
top:13vh;
left:0;
z-index:-1;
opacity:.8;
}

._fs_down.active {
height:60vh;
}
._fs_down.active ._fs_down_container{
margin-top:1vh;
height:59vh;
overflow-y:scroll;
}
._fs_down.active ._fs_down_back{
height:100%;
top:0;
}
`;

styles.hider = `
._ydb_fs_static #content>.block:first-child>.block__header,
._ydb_fs_static #content>.block:first-child>.block__header--sub,
._ydb_fs_static ._fs_down{
opacity:0;
transition:.5s;
}
`;

    let popUps = {};
    var objects = {};
    var pub = {};
    var settings;


    function write() {
        localStorage._ydb_fs = JSON.stringify(settings);
    }

    var svd = localStorage._ydb_fs;
    try {
        settings = JSON.parse(svd);
    }
    catch (e) {
        settings = {};
        settings.enabled = false;
        write();
    }

    function register() {
        let fsData = {
            name:'Fullscreen',
            container:'_ydb_fs',
            version:GM_info.script.version,
            s:[]
        };
        console.log(JSON.stringify(fsData));
        document.addEventListener('DOMContentLoaded', function() {addElem('span', {style:'display:none', type:'text', dataset:{value:JSON.stringify(fsData)}, className:'_YDB_reserved_register'}, document.body);});
    }

    function append(id) {
        if (document.getElementById(id) != undefined) return 1;
        addElem('style', {innerHTML:styles[id], id:id}, document.head);
        return 0;
    }

    function remove(id) {
        if (document.getElementById(id) == undefined) return 1;
        document.head.removeChild(document.getElementById(id));
        return 0;
    }

    function preenable() {
        append('general');
        append('base');
        append('ex');
        append('hider');
    }

    function rescale() {
        console.log(objects.image);
        if (objects.icontainer.dataset.aspectRatio > window.innerWidth/window.innerHeight) pub.wide = false;
        else pub.wide = true;

        pub.scaled = objects.dcontainer.dataset.scaled;
        if (pub.scaled) {
            if (!pub.wide) {
                objects.image.style.width = '100vw';
                objects.image.style.height = 'auto';
                let aspectRatio = window.innerWidth / window.innerHeight;
                let zoomRatio = objects.icontainer.dataset.width / window.innerWidth;

                objects.image.style.marginTop = (window.innerHeight - (objects.icontainer.dataset.height / zoomRatio)) / 2+'px';
                objects.image.style.width = '100vw';

            }
            else {
                objects.image.style.marginTop = '0';
                objects.image.style.height = '100vh';
                objects.image.style.width = 'auto';
            }
        }
    }

    function unscale() {
        objects.image.style.height = 'auto';
        objects.image.style.width = 'auto';
        objects.image.style.marginTop = '0';
    }

    function init() {
        objects.disable = addElem('a', {id:'_ydb_fs_disable', className:'', style:'display:none', innerHTML:'Disable', events:[{t:'click',f:function() {disable();}}]}, document.querySelector('#content>.block:first-child>.block__header'));
        objects.enable = addElem('a', {id:'_ydb_fs_enable', className:'header__link', innerHTML:'Fullscreen', events:[{t:'click',f:function() {enable(true);}}]}, document.body);
        document.getElementsByClassName('flex-row__right')[0].insertBefore(objects.enable, document.getElementsByClassName('flex-row__right')[0].childNodes[0]);
    }

    function loadedImgFetch() {
        objects.image = document.getElementById('image-display');
        rescale();
    }

    function callPopup(id) {
        popUps[id].classList.add('active');
        popUps.back.classList.add('active');
    }

    function hidePopups(e) {
        if (!e.target.classList.contains('_fs_popup_back')) return;
        for (let i=0; i<popUps.back.childNodes.length; i++) popUps.back.childNodes[i].classList.remove('active');
        popUps.back.classList.remove('active');
        location.hash = '';
    }

    function showComms() {
        callPopup('coms');
    }

    function tagEditor() {
        if (document.getElementsByClassName('autocomplete').length<=0) return;
        var ac = document.getElementsByClassName('autocomplete')[0];
        var orig = document.querySelector('.tagsinput input');

        ac.style.zIndex = '301';
        ac.style.top = orig.getBoundingClientRect().bottom + 'px';
    }

    function listener() {
        if (!pub.enabled) return;
        setTimeout(listener, 100);

        tagEditor();
        if (pub.mouseY/window.innerHeight >= (popUps.down.classList.contains('active')?0.4:0.85)) popUps.down.classList.add('active');
        else popUps.down.classList.remove('active');

        if ((pub.mouseY/window.innerHeight > .15 && pub.mouseY/window.innerHeight < .85 && pub.mouseX/window.innerWidth > .15 && pub.mouseX/window.innerWidth < .85) &&
           !(popUps.down.classList.contains('active') || popUps.back.classList.contains('active')))  {
            pub.static++;
            if (pub.static > 20) document.body.classList.add('_ydb_fs_static');
        }
        else {
            pub.static =0;
            document.body.classList.remove('_ydb_fs_static');
        }
    }

    function mouseListener(e) {
        pub.mouseX = e.clientX;
        pub.mouseY = e.clientY;
    }

    function enable(notInital) {
        if (notInital) preenable();
        init();

        popUps.back = addElem('div', {id:'_ydb_fs_backSide', className:'_fs_popup_back'}, document.body);
        popUps.coms = addElem('div', {id:'_ydb_fs_commPopup', className:'_fs_popup _fs_popup_big block__content'}, popUps.back);
        popUps.down = addElem('div', {id:'_fs_down', className:'_fs_down'}, document.body);
        popUps.downBack = addElem('div', {id:'_fs_down_back', className:'_fs_down_back tag', dataset:{tagCategory:'rating'}}, popUps.down);
        popUps.downContainer = addElem('div', {id:'_fs_down_container', className:'_fs_down_container'}, popUps.down);

        document.querySelectorAll('#content>.layout--narrow')[1].appendChild(document.getElementById('image_options_area'));
        popUps.coms.appendChild(document.querySelectorAll('#content>div')[4]);
        popUps.downContainer.appendChild(document.querySelectorAll('#content>div')[2]);
        popUps.downContainer.appendChild(document.querySelectorAll('#content>div')[2]);

        objects.image = document.getElementById('image-display');
        objects.de = document.documentElement;
        objects.icontainer = document.getElementsByClassName('image-show-container')[0];
        objects.dcontainer = document.getElementById('image_target');
        objects.commButton = document.getElementsByClassName('interaction--comments')[0];

        objects.commButton.addEventListener('click',showComms);
        popUps.back.addEventListener('click',hidePopups);
        document.body.addEventListener('mousemove',mouseListener);

        if (objects.image != undefined) loadedImgFetch();
        objects.dcontainer.addEventListener("DOMNodeInserted",loadedImgFetch);

        pub.enabled = true;
        settings.enabled = true;

        write();
        listener();
    }

    function disable() {
        remove('general');
        remove('base');
        unscale();

        objects.dcontainer.removeEventListener("DOMNodeInserted",loadedImgFetch);
        objects.commButton.removeEventListener('click',showComms);
        popUps.back.removeEventListener('click',hidePopups);
        document.body.removeEventListener('mousemove',mouseListener);

        document.getElementById('content').appendChild(popUps.downContainer.getElementsByTagName('div')[0]);
        document.getElementById('content').appendChild(popUps.downContainer.getElementsByTagName('div')[0]);
        document.getElementById('content').appendChild(popUps.coms.getElementsByTagName('div')[0]);
        document.querySelectorAll('#content>div')[4].insertBefore(document.getElementById('image_options_area'), document.querySelectorAll('#content>div')[4].childNodes[0]);
        pub.enabled = false;
        settings.enabled = false;

        write();
    }

    register();
    if (parseInt(location.pathname.slice(1))>=0 || (location.pathname.split('/')[1] == 'images' && parseInt(location.pathname.split('/')[2])>=0)) {
        if (settings.enabled) {
            preenable();
            if (document.readyState !== 'loading') enable();
            else document.addEventListener('DOMContentLoaded', function() {
                enable();
                if (location.hash == '#comments') showComms();
            });
        }
        else {
            if (document.readyState !== 'loading') init();
            else document.addEventListener('DOMContentLoaded', init);
        }
    }
}());
