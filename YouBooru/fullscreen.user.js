// ==UserScript==
// @name         Resurrected Derp Fullscreen
// @namespace    https://github.com/stsyn/derp-fullscreen/
// @version      0.3
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
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/fullscreen.user.js
// @run-at       document-start
// ==/UserScript==


(function() {
    'use strict';
    var styles = {};
    styles.general = `
.header, #content>.block:first-child, #footer, h4 {
height:0;
overflow-y:hidden;
margin:0;
padding:0;
}
#content {
margin:0;
padding:0;
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
`;

    var popUps = {};
    var objects = {};
    var pub = {};

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
        for (var i in values) t[i] = values[i];
        parent.appendChild(t);
        return t;
    }

    function append(st) {
        if (document.getElementById(st) != undefined) return 1;
        addElem('style', {innerHTML:st, id:st}, document.head);
        return 0;
    }

    function preenable() {
        append(styles.general);
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

    function enable() {
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
    }

    if (parseInt(location.pathname.slice(1))>=0 || (location.pathname.split('/')[1] == 'images' && parseInt(location.pathname.split('/')[2])>=0)) {
        preenable();
        if (document.readyState !== 'loading') enable();
        else document.addEventListener('DOMContentLoaded', enable);
    }
}());
