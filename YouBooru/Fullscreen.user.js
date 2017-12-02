// ==UserScript==
// @name         Resurrected Derp Fullscreen
// @namespace    https://github.com/stsyn/derp-fullscreen/
// @version      0.4.6
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
#_ydb_fs_mainPopup {
position:relative
}
footer {
position:absolute;
bottom:0;
width:calc(100% - 12px);
}
._fs #footer {
background:none
}
#content>.block:first-child, h4, .flash--site-notice, ._fs #_ydb_fs_enable {
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
#content>.block:first-child>.block__header a.js-rand,
#content>.block:first-child>.block__header a.js-up,
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
overflow-y:auto;
}
._fs_popup_big {
max-width:1000px;
height:80vh;
margin-top:10vh;
}
._fs_popup_vbig {
width:95vw;
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

#_fs_scroll_bot,#_fs_scroll_rgt {
background:none;
border-radius:5px;
display:block;
position:fixed;
z-index:201;
}
#_fs_scroll_bot {
height:10px;
bottom:3px
}
#_fs_scroll_rgt {
width:10px;
right:3px
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

#content>.block:first-child>.block__header>.interaction--comments:hover,
#_fs_main:hover{
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
#content>.block:first-child>.block__header [href*="/download/"],
#content>.block:first-child>.block__header .block__header__dropdown-tab {
display:none;
}

#content>.block:first-child>.block__header a.ydb_top_right_link {
right:0;
position:absolute;
z-index:202;
opacity:0.3;
display:inline
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
overflow-y:auto;
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

    styles.hideAll = `
.block, ._fs_down  {
display:none
}
#_fs_scroll_bot, #_fs_scroll_rgt {
background:RGBA(192,192,192,0.5);
transition:0.1s;
transition-timing-function:linear;
}
#image-display {
transition:0.1s;
transition-timing-function:linear;
}
`;

    styles.colorAccent = `
.block__header--light a, .block__header--js-tabbed a, a.block__header--single-item,
.block__header a:not(.interaction--fave):not(.interaction--upvote):not(.interaction--downvote):not(.interaction--comments):not(.interaction--hide),
.block__header--sub a, .block__header--single-item a, .block__content:not(._fs_popup)>*:not(.media-box) a:not(.tag__name), .block__content>a, .profile-top__name-and-links a,
.source_url a, #footer_content a, .button--link, .communication__body a, .comment_backlinks a, .communication__options a, a.interaction-user-list-item, .pagination a,
a.block__header--single-item:hover, .block__header:not(.center--layout) a:hover, .block__header--sub a:hover, .block__header--single-item a:hover,
.block--fixed a, .rule a, a.togglable-faq-item, .field a, a.media-box__header--link, a.media-box__header--link:hover{
color:_fs_color;
}
p>a {
color:_fs_color !important;
}

.header, a.header__link, span.header__link-user__dropdown-arrow, .add-to-gallery-list ::-webkit-scrollbar-thumb,
span.header__link-user__dropdown-arrow:hover, .header__dropdown:hover span.header__link-user__dropdown-arrow, .sparkline .bar {
background:_fs_ccomponent;
}

.image-description, #imagespns, .block__header--js-tabbed, .block__header--js-tabbed a.selected, .block__header--js-tabbed a.selected:hover,
.button, .toggle-box+label, .block__list a.block__list__link, .block__list, .input, .communication__toolbar__button, 
.block__header--js-tabbed a, .block__header--js-tabbed a:last-child, .block__header--js-tabbed a:first-child, .block--fixed:not(.block--success), .media-box, .filter {
border-color:_fs_background;
}

#container, .image-description, #imagespns, .block__content, .block__tab, .block__header--js-tabbed a.selected, .block__header--js-tabbed a.selected:hover, .toggle-box+label,
a.header__search__button:hover, button.header__search__button:hover, .input, .communication__toolbar__button, .tag__dropdown__link:hover, .block--fixed:not(.block--success), .filter,
.alternating-color:nth-child(odd), .table>thead>tr, .table>tbody>tr:nth-child(odd) {
background:_fs_component;
}

.alternating-color:nth-child(even), .table>tbody>tr:nth-child(even) {
background:_fs_4component;
}

.header--secondary a.header__link:hover, .header--secondary .header__dropdown:hover>a, .input:focus, .communication__toolbar__button:hover, .tag__dropdown__link,
.block__header, .block__header--sub, .block__header--single-item,
.block__header a, .block__header--sub a, .block__header--single-item a, .block__list a.block__list__link,
.communication__options, #footer, .button, a.media-box__header--link:hover,
.interaction--downvote.disabled, .interaction--downvote.disabled:hover{
background:_fs_2component;
}

.rule h2 {
border-color:_fs_2component;
}

.input:focus, .communication__toolbar__button:focus, .communication__toolbar__button:hover, .communication__toolbar__button:active, .communication__toolbar__button:visited, .sparkline {
border-color:_fs_color;
}

a:not(.header__link):not(.button):not(.block__header):not(.block__header--single-item):not(.tag__name):not(.interaction--fave):not(.interaction--comments)
:not(.interaction--upvote):not(.interaction--downvote):not(.media-box__header--link):hover{
color:_fs_icomponent !important;
}

.media-box__header, .button:hover, .toggle-box+label:hover, .header--secondary, .header--secondary a,
.block__list a.block__list__link.primary, select.header__input:hover, select.header__input:focus:hover {
background:_fs_background;
border-color:_fs_color;
}

 a.header__link:hover, .header__dropdown:hover>a {
background:_fs_color;
}

a.block__header--single-item:hover, .block__header a:hover, .block__header--sub a:hover, .block__header--single-item a:hover, .rule h2 {
background:_fs_3component;
}

.header__input, .header__input:focus, select.header__input, select.header__input:focus, a.header__search__button, button.header__search__button,
select.header__input:hover, select.header__input:focus:hover  {
background:_fs_icomponent;
}
.block__content, .block__content:last-child, .block__content:first-child, .table, .table>tbody, .block__tab, .block__tab:not(.hidden){
border-color:_fs_2component;
}
.block__header--js-tabbed  {
background:none
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
    }

    if (settings.extended == undefined) settings.extended = true;
    if (settings.enabled == undefined) settings.enabled = false;
    if (settings.scrollSpeed == undefined) settings.scrollSpeed = 20;
    if (settings.scrollMultiply == undefined) settings.scrollMultiply = 5;
    if (settings.staticTime == undefined) settings.staticTime = 20;
    if (settings.staticEnabled == undefined) settings.staticEnabled = true;
    if (settings.commentLink == undefined) settings.commentLink = false;
    if (settings.colorAccent == undefined) settings.colorAccent = false;
    if (settings.style == undefined) settings.style = 'rating';
    if (settings.button == undefined) settings.button = 'Download this image at full res with a short filename';
    settings.scrollSpeed = parseInt(settings.scrollSpeed);
    settings.scrollMultiply = parseInt(settings.scrollMultiply);
    settings.staticEnabled = parseInt(settings.staticEnabled);
    write();

    function register() {
        let fsData = {
            name:'Fullscreen',
            container:'_ydb_fs',
            version:GM_info.script.version,
            s:[
                {type:'checkbox', name:'Show UI', parameter:'extended'},
                {type:'input', name:'Scroll speed', parameter:'scrollSpeed'},
                {type:'input', name:'Scroll multiplier', parameter:'scrollMultiply'},
                {type:'checkbox', name:'Remove href from comments link', parameter:'commentLink'},
                {type:'breakline'},
                {type:'checkbox', name:'Autohide UI', parameter:'staticEnabled'},
                {type:'input', name:'Autohide timeout', parameter:'staticTime'},
                {type:'breakline'},
                {type:'select', name:'Panel color', parameter:'style', values:[
                    {name:'Pink', value:'oc'},
                    {name:'Red', value:'error'},
                    {name:'Orange', value:'spoiler'},
                    {name:'Yellow', value:'episode'},
                    {name:'Green', value:''},
                    {name:'Cyan', value:'character'},
                    {name:'Blue', value:'rating'},
                    {name:'Violet', value:'origin'}
                ]},
                {type:'checkbox', name:'Match site palette', parameter:'colorAccent'},
                {type:'select', name:'Top right button', parameter:'button', values:[
                    {name:'none', value:''},
                    {name:'View', value:'View this image at full res'},
                    {name:'VS', value:'View this image at full res with a short filename'},
                    {name:'Download', value:'Download this image at full res with tags in the filename'},
                    {name:'DS', value:'Download this image at full res with a short filename'}
                ]}
            ]
        };
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
        if (settings.extended) {
            append('base');
            append('ex');
        }
        if (settings.staticEnabled) append('hider');
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    function rescale() {
        if (objects.icontainer.dataset.aspectRatio > window.innerWidth/window.innerHeight) pub.wide = false;
        else pub.wide = true;

        if (pub.scaled != objects.dcontainer.dataset.scaled) {
            pub.scaled = objects.dcontainer.dataset.scaled;
            if (pub.scaled != 'true') {
                append('hideAll');
                pub.zoom = 1;
            }
            else remove('hideAll');
        }
        if (pub.scaled != 'false') {
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

    function showComms(e) {
        callPopup('coms');
        if (!settings.commentsLink) e.preventDefault();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    function tagEditor() {
        if (document.getElementsByClassName('autocomplete').length<=0) return;
        let ac = document.getElementsByClassName('autocomplete')[0];
        let orig = document.querySelector('.tagsinput input');

        ac.style.zIndex = '301';
        ac.style.top = orig.getBoundingClientRect().bottom + 'px';
    }

    function checkMargin() {
        let de = document.documentElement;
        let scrWidth = de.clientWidth,scrHeight = de.clientHeight;
        if (pub.dta === 0) return;
        if (!isNaN(parseInt(objects.image.style.marginTop))) {
            if (parseInt(objects.image.style.marginTop)<=0) {
                objects.image.style.marginTop = -(pub.zoom*objects.icontainer.dataset.height*(scrHeight/2-parseInt(objects.image.style.marginTop))/(objects.icontainer.dataset.height*(pub.zoom-pub.dta))-scrHeight/2)+'px';
            }
        }
        if (!isNaN(parseInt(objects.image.style.marginLeft))) {
            if (parseInt(objects.image.style.marginLeft)<=0) {
                objects.image.style.marginLeft = -(pub.zoom*objects.icontainer.dataset.width*(scrWidth/2-parseInt(objects.image.style.marginLeft))/(objects.icontainer.dataset.width*(pub.zoom-pub.dta))-scrWidth/2)+'px';
            }
        }
        pub.dta=0;
    }


    function setMargin() {
        if (pub.scaled != 'false') return;
        let de = document.documentElement;
        if (pub.zoom>10) pub.zoom =10;
        if (pub.zoom<0.1) pub.zoom= 0.1;
        addScrolls();
        let xScale = de.clientWidth/(objects.icontainer.dataset.width*pub.zoom), yScale = de.clientHeight/(objects.icontainer.dataset.height*pub.zoom);
        objects.image.style.height=objects.icontainer.dataset.height*pub.zoom+'px';
        objects.image.style.width=objects.icontainer.dataset.width*pub.zoom+'px';
        if (isNaN(parseInt(objects.image.style.marginTop))) objects.image.style.marginTop = -(objects.icontainer.dataset.height - de.clientHeight)/2 + 'px';
        if (isNaN(parseInt(objects.image.style.marginLeft))) objects.image.style.marginLeft = -(objects.icontainer.dataset.width - de.clientWidth)/2 + 'px';

        checkMargin();
        if (objects.icontainer.dataset.height*pub.zoom < de.clientHeight) {
            objects.image.style.marginTop = (de.clientHeight - objects.icontainer.dataset.height*pub.zoom) / 2+'px';
            objects.scroll_rgt.style.display = 'none';
        }
        else {
            objects.scroll_rgt.style.display = 'block';
            if (pub.mouseY < de.clientHeight*3/10) {
                objects.image.style.marginTop = (isNaN(parseInt(objects.image.style.marginTop))?0:parseInt(objects.image.style.marginTop))+settings.scrollSpeed+'px';
                if (pub.mouseY < de.clientHeight/5) objects.image.style.marginTop = parseInt(objects.image.style.marginTop)+settings.scrollSpeed*(settings.scrollMultiply-1)+'px';
                if (pub.mouseY < de.clientHeight/10) objects.image.style.marginTop = parseInt(objects.image.style.marginTop)+settings.scrollSpeed*(settings.scrollMultiply*2)+'px';
            }
            if (pub.mouseY > de.clientHeight*7/10) {
                objects.image.style.marginTop = (isNaN(parseInt(objects.image.style.marginTop))?0:parseInt(objects.image.style.marginTop))-settings.scrollSpeed+'px';
                if (pub.mouseY > de.clientHeight*4/5) objects.image.style.marginTop = parseInt(objects.image.style.marginTop)-settings.scrollSpeed*(settings.scrollMultiply-1)+'px';
                if (pub.mouseY > de.clientHeight*9/10) objects.image.style.marginTop = parseInt(objects.image.style.marginTop)-settings.scrollSpeed*(settings.scrollMultiply*2)+'px';
            }

            if (parseInt(objects.image.style.marginTop)>0) objects.image.style.marginTop = '0px';
            if (-parseInt(objects.image.style.marginTop)>=(objects.icontainer.dataset.height*pub.zoom-de.clientHeight)) objects.image.style.marginTop = -(objects.icontainer.dataset.height*pub.zoom-de.clientHeight)+1+'px';
        }

        if (objects.icontainer.dataset.width*pub.zoom > de.clientWidth) {
            objects.scroll_bot.style.display = 'block';
            if (pub.mouseX < de.clientWidth*3/10) {
                objects.image.style.marginLeft = (isNaN(parseInt(objects.image.style.marginLeft))?0:parseInt(objects.image.style.marginLeft))+settings.scrollSpeed+'px';
                if (pub.mouseX < de.clientWidth/5) objects.image.style.marginLeft = parseInt(objects.image.style.marginLeft)+settings.scrollSpeed*(settings.scrollMultiply-1)+'px';
                if (pub.mouseX < de.clientWidth/10) objects.image.style.marginLeft = parseInt(objects.image.style.marginLeft)+settings.scrollSpeed*(settings.scrollMultiply*2)+'px';
            }
            if (pub.mouseX > de.clientWidth*7/10) {
                objects.image.style.marginLeft = (isNaN(parseInt(objects.image.style.marginLeft))?0:parseInt(objects.image.style.marginLeft))-settings.scrollSpeed+'px';
                if (pub.mouseX > de.clientWidth*4/5) objects.image.style.marginLeft = parseInt(objects.image.style.marginLeft)-settings.scrollSpeed*(settings.scrollMultiply-1)+'px';
                if (pub.mouseX > de.clientWidth*9/10) objects.image.style.marginLeft = parseInt(objects.image.style.marginLeft)-settings.scrollSpeed*(settings.scrollMultiply*2)+'px';
            }

            if (parseInt(objects.image.style.marginLeft)>0) objects.image.style.marginLeft = '0px';
            if (-parseInt(objects.image.style.marginLeft)>=(objects.icontainer.dataset.width*pub.zoom-de.clientWidth)) objects.image.style.marginLeft = -(objects.icontainer.dataset.width*pub.zoom-de.clientWidth)+1+'px';
        }
        else
        {
            objects.image.style.marginLeft = 'auto';
            objects.scroll_bot.style.display = 'none';
        }
        objects.scroll_bot.style.left = -(isNaN(parseInt(objects.image.style.marginLeft))?0:parseInt(objects.image.style.marginLeft))*xScale+'px';
        objects.scroll_rgt.style.top = -(isNaN(parseInt(objects.image.style.marginTop))?0:parseInt(objects.image.style.marginTop))*yScale+'px';
    }

    function addScrolls() {
        if (pub.scaled != 'false') return;
        let de = document.documentElement;
        let scrWidth = de.clientWidth, xScale = de.clientWidth/(objects.icontainer.dataset.width*pub.zoom);
        let scrHeight = de.clientHeight, yScale = de.clientHeight/(objects.icontainer.dataset.height*pub.zoom);

        objects.scroll_bot = addElem('div', {id:'_fs_scroll_bot'}, document.body);
        objects.scroll_bot.style.width = scrWidth*xScale+'px';

        objects.scroll_rgt = addElem('div', {id:'_fs_scroll_rgt'}, document.body);
        objects.scroll_rgt.style.height = scrHeight*yScale+'px';
    }

    function listener() {
        if (!pub.enabled) return;
        setTimeout(listener, 100);

        tagEditor();

        if (pub.scaled == 'false') setMargin();

        if (pub.mouseY/window.innerHeight >= (popUps.down.classList.contains('active')?0.4:0.85) && !popUps.back.classList.contains('active')) popUps.down.classList.add('active');
        else popUps.down.classList.remove('active');

        let s = '';
        if (parseInt(document.getElementsByClassName('js-notification-ticker')[0].innerHTML) > 0) s += ' '+parseInt(document.getElementsByClassName('js-notification-ticker')[0].innerHTML);
        if (parseInt(document.querySelector('a[href="/messages"] .fa-embedded__text').innerHTML) > 0) s += (s.length>0?'+':'')+'M'+parseInt(document.querySelector('a[href="/messages"] .fa-embedded__text').innerHTML);

        if (s.length>0) {
            objects.mainButtonNotify.innerHTML = s;
            objects.mainButton.style.background = '#800';
        }
        else {
            objects.mainButtonNotify.innerHTML = '';
            objects.mainButton.style.background = '';
        }

        if ((pub.mouseY/window.innerHeight > 0.15 && pub.mouseY/window.innerHeight < 0.85) &&
            !(popUps.down.classList.contains('active') || popUps.back.classList.contains('active')))  {
            pub.static++;
            if (pub.static > settings.staticTime && !document.body.classList.contains('_ydb_fs_static')) {
                if (!settings.hidden) {
                    settings.hidden = true;
                    write();
                    document.body.classList.add('_ydb_fs_static');
                }
            }
        }
        else {
            if (pub.static>0) {
                pub.static =0;
                settings.hidden = false;
                write();
                document.body.classList.remove('_ydb_fs_static');
            }
        }
    }

    function mouseListener(e) {
        pub.mouseX = e.clientX;
        pub.mouseY = e.clientY;
    }

    function wheelListener(e){
        let delta = e.deltaY || e.detail || e.wheelDelta;
        let dt;

        if (pub.zoom<0.5) dt = 0.005*settings.scrollSpeed;
        else if (pub.zoom<1) dt = 0.01*settings.scrollSpeed;
        else if (pub.zoom<2.5) dt = 0.015*settings.scrollSpeed;
        else if (pub.zoom<5) dt = 0.025*settings.scrollSpeed;
        else dt = 0.05*settings.scrollSpeed;

        if (delta>0 && pub.zoom<10) {
            pub.zoom+=dt;
            pub.dta+=dt;
        }
        else if (delta<0 && pub.zoom>0.1) {
            pub.zoom-=dt;
            pub.dta-=dt;
        }

        e.preventDefault();
    }



    //////////////////////////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////////////////////////

    function transformColor(v, x1, x2, d) {
        if (d) return parseInt(v/x1);
        else return parseInt(255-(255-v)/x2);
    }

    function enableColor() {
        if (settings.colorAccent) {
            let c2 = getComputedStyle(document.body).backgroundColor;
            let isDark = parseInt(c2.substring(4, c2.length - 1).split(',')[0]) <128;
            objects.colorAccent = addElem('div', {id:'_fs_colorAccent', className:'tag hidden', dataset:{tagCategory:settings.style}}, document.body);
            styles.colorAccent = styles.colorAccent.replace(/_fs_color/g,getComputedStyle(objects.colorAccent).color);
            styles.colorAccent = styles.colorAccent.replace(/_fs_background/g,getComputedStyle(objects.colorAccent).backgroundColor);
            let c = getComputedStyle(objects.colorAccent)[isDark?'backgroundColor':'color'];
            let c3 = getComputedStyle(objects.colorAccent)['color'];
            let color = c.substring(4, c.length - 1).split(',').map(function (v,i,a) {return transformColor(v, 5, 35, isDark);});
            let color2 = c.substring(4, c.length - 1).split(',').map(function (v,i,a) {return transformColor(v, 1.5, 5, isDark);});
            let color3 = c.substring(4, c.length - 1).split(',').map(function (v,i,a) {return transformColor(v, 1.2, 0.95, !isDark);});
            let color4 = c.substring(4, c.length - 1).split(',').map(function (v,i,a) {return transformColor(v, 2.5, 3, isDark);});
            let color5 = c.substring(4, c.length - 1).split(',').map(function (v,i,a) {return transformColor(v, 3, 10, isDark);});
            let color6 = c3.substring(4, c3.length - 1).split(',').map(function (v,i,a) {return transformColor(v, 1.2, 1.3, isDark);});
            styles.colorAccent = styles.colorAccent.replace(/_fs_component/g,'rgb('+color[0]+','+color[1]+','+color[2]+')');
            styles.colorAccent = styles.colorAccent.replace(/_fs_2component/g,'rgb('+color2[0]+','+color2[1]+','+color2[2]+')');
            styles.colorAccent = styles.colorAccent.replace(/_fs_3component/g,'rgb('+color4[0]+','+color4[1]+','+color4[2]+')');
            styles.colorAccent = styles.colorAccent.replace(/_fs_4component/g,'rgb('+color5[0]+','+color5[1]+','+color5[2]+')');
            styles.colorAccent = styles.colorAccent.replace(/_fs_icomponent/g,'rgb('+color3[0]+','+color3[1]+','+color3[2]+')');
            styles.colorAccent = styles.colorAccent.replace(/_fs_ccomponent/g,'rgb('+color6[0]+','+color6[1]+','+color6[2]+')');
            append('colorAccent');
        }
    }

    function enable(notInital) {
        if (notInital) preenable();
        init();

        pub.mouseX = window.innerWidth/2;
        pub.mouseY = window.innerHeight/2;
        if (settings.hidden) pub.static = 100;
        else pub.static = 0;

        popUps.back = addElem('div', {id:'_ydb_fs_backSide', className:'_fs_popup_back'}, document.body);
        popUps.coms = addElem('div', {id:'_ydb_fs_commPopup', className:'_fs_popup _fs_popup_big block__content'}, popUps.back);
        popUps.main = addElem('div', {id:'_ydb_fs_mainPopup', className:'_fs_popup _fs_popup_vbig block__content'}, popUps.back);
        popUps.down = addElem('div', {id:'_fs_down', className:'_fs_down'}, document.body);
        popUps.downBack = addElem('div', {id:'_fs_down_back', className:'_fs_down_back tag', dataset:{tagCategory:settings.style}}, popUps.down);
        popUps.downContainer = addElem('div', {id:'_fs_down_container', className:'_fs_down_container'}, popUps.down);
        objects.mainButton = InfernoAddElem('a', {id:'_fs_main', events:[{
            t:'click',
            f:function() {
                callPopup('main');
            }
        }]}, [
            InfernoAddElem('span', {}, [
                InfernoAddElem('i', {className:'fa', innerHTML:'\uf0c9'}, []),
                objects.mainButtonNotify = InfernoAddElem('span', {}, [])
            ])
        ]);
        if (notInital) enableColor();

        document.querySelector('#content>.block:first-child>.block__header').insertBefore(objects.mainButton,document.getElementsByClassName('interaction--fave')[0]);
        document.querySelectorAll('#content>div')[3].appendChild(document.getElementById('image_options_area'));
        popUps.coms.appendChild(document.querySelectorAll('#content>div')[4]);
        popUps.downContainer.appendChild(document.querySelectorAll('#content>div')[2]);
        popUps.downContainer.appendChild(document.querySelectorAll('#content>div')[2]);

        document.querySelector('a[title="'+settings.button+'"]').classList.add('ydb_top_right_link');

        popUps.main.appendChild(document.querySelector('header'));
        popUps.main.appendChild(document.querySelector('nav.header.header--secondary'));
        ChildsAddElem('div', {className:'block__header'}, popUps.main, [
            InfernoAddElem('span',{innerHTML:'Image Tools:',style:'margin-left:1em'}, []),
            InfernoAddElem('a',{className:'js-up', events:[{t:'click',f:function() {
                document.querySelector('#content>.block:first-child>.block__header .js-up').click();
            }}]}, [
                InfernoAddElem('i',{className:'fa fa-chevron-up'},[]),
                InfernoAddElem('span',{innerHTML:' Find'},[])
            ]),
            InfernoAddElem('a',{className:'js-random', events:[{t:'click',f:function() {
                document.querySelector('#content>.block:first-child>.block__header .js-random').click();
            }}]}, [
                InfernoAddElem('i',{className:'fa fa-random'},[]),
                InfernoAddElem('span',{innerHTML:' Random'},[])
            ]),
            document.querySelectorAll('#content>.block:first-child>.block__header [class*="js-notification"')[0].cloneNode(true),
            document.querySelectorAll('#content>.block:first-child>.block__header [class*="js-notification"')[1].cloneNode(true),
            document.querySelector('#content>.block:first-child>.block__header .dropdown').cloneNode(true),
            document.querySelector('#content>.block:first-child>.block__header [href*="/related/"').cloneNode(true),
            document.querySelector('#content>.block:first-child>.block__header>.hide-mobile').cloneNode(true)
        ]);
        popUps.main.appendChild(document.querySelector('footer'));

        objects.image = document.getElementById('image-display');
        objects.de = document.documentElement;
        objects.icontainer = document.getElementsByClassName('image-show-container')[0];
        objects.dcontainer = document.getElementById('image_target');
        objects.commButton = document.getElementsByClassName('interaction--comments')[0];
        if (settings.commentLink) objects.commButton.href = 'javascript://';

        objects.commButton.addEventListener('click',showComms);
        popUps.back.addEventListener('click',hidePopups);
        document.body.addEventListener('mousemove',mouseListener);
        objects.dcontainer.addEventListener("wheel", wheelListener);

        if (objects.image != undefined) loadedImgFetch();
        objects.dcontainer.addEventListener("DOMNodeInserted",loadedImgFetch);

        document.body.classList.add('_fs');

        pub.enabled = true;
        settings.enabled = true;

        write();
        listener();
    }

    function disable() {
        remove('general');
        remove('base');
        remove('ex');
        remove('hider');
        unscale();

        objects.dcontainer.removeEventListener("DOMNodeInserted",loadedImgFetch);
        objects.commButton.removeEventListener('click',showComms);
        objects.commButton.href = '#comments';
        popUps.back.removeEventListener('click',hidePopups);
        document.body.removeEventListener('mousemove',mouseListener);
        objects.dcontainer.removeEventListener("wheel", wheelListener);

        document.querySelector('#content>.block:first-child>.block__header').removeChild(objects.mainButton);

        document.getElementById('content').appendChild(popUps.downContainer.getElementsByTagName('div')[0]);
        document.getElementById('content').appendChild(popUps.downContainer.getElementsByTagName('div')[0]);
        document.getElementById('content').appendChild(popUps.coms.getElementsByTagName('div')[0]);
        document.querySelector('a[title="'+settings.button+'"]').classList.remove('ydb_top_right_link');

        document.getElementById('container').insertBefore(document.querySelector('nav.header.header--secondary'),document.getElementById('container').firstChild);
        document.getElementById('container').insertBefore(document.querySelector('header'),document.getElementById('container').firstChild);
        document.getElementById('container').appendChild(document.querySelector('footer'));

        document.querySelectorAll('#content>div')[4].insertBefore(document.getElementById('image_options_area'), document.querySelectorAll('#content>div')[4].childNodes[0]);
        pub.enabled = false;
        settings.enabled = false;

        document.body.classList.remove('_fs');
        document.body.removeChild(popUps.back);
        document.body.removeChild(popUps.down);

        write();
    }

    register();
    if ((parseInt(location.pathname.slice(1))>=0 && location.pathname.split('/')[2] == undefined) || (location.pathname.split('/')[1] == 'images' && parseInt(location.pathname.split('/')[2])>=0 && location.pathname.split('/')[3] == undefined)) {
        if (settings.enabled) {
            preenable();
            if (document.readyState !== 'loading') {
                enable();
                enableColor();
            }
            else document.addEventListener('DOMContentLoaded', function() {
                enable();
                enableColor();
                if (location.hash == '#comments') showComms();
            });
        }
        else {
            if (document.readyState !== 'loading') init();
            else document.addEventListener('DOMContentLoaded', init);
        }
    }
    else {
        document.addEventListener('DOMContentLoaded',enableColor);
    }
}());
