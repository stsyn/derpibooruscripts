// ==UserScript==
// @name         Resurrected Derp Fullscreen
// @namespace    https://github.com/stsyn/derp-fullscreen/
// @version      0.3.1
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
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/Fullscreen.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/Fullscreen.user.js
// @run-at       document-start
// ==/UserScript==


(function() {
    'use strict';
    var styles = {};
    styles.general = `
.header,#content>.block:first-child, #footer, h4 {
height:0;
overflow-y:hidden;
margin:0;
padding:0;
}
#content {
margin:0;
padding:0;
}
.block__header a.js-rand,
.block__header a.js-up,
.block__header a.js-prev i,
.block__header a.js-next i{
display:none;
}
.block__header a.js-prev,
.block__header a.js-next{
position:fixed;
top:0;
height:100%;
width:25%;
}
.block__header a.js-prev {
left:0;
}
.block__header a.js-next {
right:0;
}
.image-show-container {
position:absolute;
top:0;
left:0;
margin:0;
padding:0;
min-width:100%;
min-height:100%;
z-index:200;
}
._fs_popup {
position:fixed;
display:none;
}
._fs_down {
display:none;
}
#image_target, #image_target>picture {
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
position:absolute;
z-index:202;
display:inline-block !important;
opacity:0.3;
}
`;
    styles.base = `
#content>.block:first-child{
position:fixed;
top:0;
height:auto;
width:100%;
z-index:201;
}

#content>.block:first-child>.block__header--sub {
float:right;
width:auto;
opacity:0.2;
}

#content>.block:first-child>.block__header,
#content>.block:first-child>.block__header a:not(.active){
background:none;
}

#content>.block:first-child>.block__header {
font-size:150%;
line-height:175%;
}

#content>.block:first-child>.block__header>.block__header__title {
font-size:100%;
line-height:100%;
transition-duration: 0.1s;
transition-timing-function: ease-in-out;
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

.block__header .stretched-mobile-links {
width:0;
}

`;

    var popUps = {};
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

    /*function register() {
        console.log(window._YDB_public);
        if (window._YDB_public == undefined) window._YDB_public = {};
        if (window._YDB_public.settings == undefined) window._YDB_public.settings = {};
        window._YDB_public.settings.fullscreen = {
            name:'Fullscreen',
            container:'_ydb_fs',
            version:GM_info.script.version
        };
    }*/


    function addElem(tag, values, parent) {
        if (values != undefined && values.id != undefined && document.getElementById(values.id) != undefined) return document.getElementById(values.id);
        var t = document.createElement(tag);
        for (var i in values) if (i!='events') t[i] = values[i];
        try {
            if (values.events != undefined) values.events.forEach(function(v,i,a) {
                t.addEventListener(v.t, v.f);
            }
        );}
        catch (e) {
        }
        parent.appendChild(t);
        return t;
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
    }

    function rescale() {
        if (objects.icontainer.dataset.aspectRatio > window.innerWidth/window.innerHeight) pub.wide = false;
        else pub.wide = true;

        pub.scaled = objects.dcontainer.dataset.scaled;
        if (pub.scaled) {
            if (!pub.wide) {
                console.log(objects);
                objects.image.style.width = '100vw';
                objects.image.style.height = 'auto';
                objects.image.style.marginTop = (window.innerHeight - parseInt(getComputedStyle(objects.image).height))/2;
            }
            else {
                objects.image.style.height = '100vh';
                objects.image.style.width = 'auto';
            }
        }
    }

    function init() {
        objects.disable = addElem('a', {id:'_ydb_fs_disable', className:'', style:'display:none', innerHTML:'Disable', events:[{t:'click',f:function() {disable();}}]}, document.querySelector('#content>.block:first-child>.block__header'));
        objects.enable = addElem('a', {id:'_ydb_fs_enable', className:'header__link', innerHTML:'Fullscreen', events:[{t:'click',f:function() {enable(true);}}]}, document.body);
        document.getElementsByClassName('flex-row__right')[0].insertBefore(objects.enable, document.getElementsByClassName('flex-row__right')[0].childNodes[0]);
    }

    function enable(notInital) {
        if (notInital) preenable();
        init();

        popUps.back = addElem('div', {id:'_ydb_fs_backSide', className:'_fs_popup_back'}, document.body);
        popUps.coms = addElem('div', {id:'_ydb_fs_commPopup', className:'_fs_popup _fs_popup_big'}, document.body);
        popUps.down = addElem('div', {id:'_fs_down', className:'_fs_down'}, document.body);

        document.querySelectorAll('#content>.layout--narrow')[1].appendChild(document.getElementById('image_options_area'));
        popUps.coms.appendChild(document.querySelectorAll('#content>.layout--narrow')[2]);
        popUps.down.appendChild(document.querySelectorAll('#content>.layout--narrow')[0]);
        popUps.down.appendChild(document.querySelectorAll('#content>.layout--narrow')[0]);

        objects.image = document.getElementById('image-display');
        objects.icontainer = document.getElementsByClassName('image-show-container')[0];
        objects.dcontainer = document.getElementById('image_target');
        if (objects.image == undefined) {
            objects.dcontainer.addEventListener("DOMNodeInserted",function(e) {
                if (pub.loaded) return;
                objects.image = document.getElementById('image-display');
                rescale();
            });
        }
        else {
            pub.loaded = true;
            rescale();
        }
        pub.enabled = true;
        settings.enabled = true;

        write();
    }

    function disable() {
        remove('general');
        remove('base');

        document.getElementById('content').appendChild(popUps.down.querySelectorAll('.layout--narrow')[0]);
        document.getElementById('content').appendChild(popUps.down.querySelectorAll('.layout--narrow')[0]);
        document.getElementById('content').appendChild(popUps.coms.querySelectorAll('.layout--narrow')[0]);
        document.querySelectorAll('#content>.layout--narrow')[2].insertBefore(document.getElementById('image_options_area'), document.querySelectorAll('#content>.layout--narrow')[2].childNodes[0]);
        pub.enabled = false;
        settings.enabled = false;

        write();
    }

    if (parseInt(location.pathname.slice(1))>=0 || (location.pathname.split('/')[1] == 'images' && parseInt(location.pathname.split('/')[2])>=0)) {
        if (settings.enabled) {
            preenable();
            if (document.readyState !== 'loading') enable();
            else document.addEventListener('DOMContentLoaded', enable);
        }
        else {
            if (document.readyState !== 'loading') init();
            else document.addEventListener('DOMContentLoaded', init);
        }
    }
}());
