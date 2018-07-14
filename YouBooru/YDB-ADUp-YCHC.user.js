// ==UserScript==
// @name         YCH.Commishes YDB:ADUp module
// @version      0.0.1
// @author       stsyn
// @include      https://portfolio.commishes.com/upload/show/*
// @include      https://ych.commishes.com/followUp/show/*
// @include      https://ych.commishes.com/auction/show/*

// @include      *://trixiebooru.org/images/new*
// @include      *://derpibooru.org/images/new*
// @include      *://www.trixiebooru.org/images/new*
// @include      *://www.derpibooru.org/images/new*
// @include      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/images/new*
// @include      *://*.orzgs6djmvrg633souxg64th.*.*/upload/*
// @include      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/images/new*
// @include      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/images/new*
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ADUp-YCHC.user.js

// ==/UserScript==

(function() {
    'use strict';
    let stop = 0;

    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    if (location.hostname == 'ych.commishes.com') {
        // easy
        let container = document.querySelector('a[href*="/uploads/"]') || document.querySelector('img[src*="/uploads/"]');
        let src;
        if (container != undefined) {
            src = container.href || container.src;
        }
        else return;
        let holder;
        if (location.href.indexOf('/followUp/')==-1) {
            holder = document.querySelector('.material.unpadded+.spacer');
            holder.style.minHeight = '3em';
            holder.style.textAlign = 'center';
        }
        else {
            holder = document.querySelector('.row4.fluid');
        }
        let aname = document.querySelector('a[href*="/user/"]:not([href*="commishes.com"])').innerHTML.toLowerCase();
        let text = '';
        if (document.querySelector('div.material .force-wrap') != undefined) text = document.querySelector('div.material .force-wrap').innerText;
        let href = '//www.derpibooru.org/images/new?newImg='+encodeURIComponent(src)+
			'&src='+encodeURIComponent(location.href)+
            '&tags='+encodeURIComponent('artist:'+aname)+',ych'+(location.href.indexOf('/followUp/')>-1?' result':',commission')+
            '&description='+(encodeURIComponent(text));
        holder.appendChild(InfernoAddElem('a', {href:href,target:'_blank',innerHTML:'Share on Derpibooru',className:'like-toggle iconless',style:{fontSize:'120%',marginTop:'0.7em',display:'inline-block'}}, []));
    }
    else if (location.hostname == 'portfolio.commishes.com') {
        // hard
        let container = document.querySelector('#preview-container img');
        if (container == undefined) {
            return;
        }
        let holder = document.querySelector('.user-info+.spacer');
        holder.style.minHeight = '3.5em';
        let button = holder.appendChild(InfernoAddElem('a', {href:'javascript://',target:'_blank',innerHTML:'Prepare to share on Derpibooru', className:'like-toggle iconless',style:{fontSize:'120%',marginTop:'0.2em',display:'inline-block'}, events:[{t:'click',f:function() {

            let aname = document.querySelector('.user-info .username').innerHTML.toLowerCase();
            let width = parseInt(document.querySelectorAll('body>script')[2].innerHTML.split('\n')[3].split('=').pop().trim());
            let height = parseInt(document.querySelectorAll('body>script')[2].innerHTML.split('\n')[4].split('=').pop().trim());
            let max = (width>height?width:height);
            let link = container.src.split('/');
            let xid = link[link.length-3];

            let xlink = 'https://portfolio.commishes.com/image/thumb/'+xid+'/original/'+(max*2)+'/.png';
            let image = InfernoAddElem('img',{src:xlink}, []);

            image.onload = function() {
                let canvas = InfernoAddElem('canvas',{width:width,height:height, style:{maxWidth:'100%'}}, []);
                document.body.appendChild(canvas);
                let ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, width, height);
                alert('Save image from the bottom and upload it manually. Sorry, right now it\'s the only way to get adequate quality file :(');
                /*
                I tried to do something automatically. 
                Welp, it will be possible only if portfolio.commishes.com will provide original noncompressed file or if Derpibooru will allow base64 uploading.
                ¯\_(ツ)_/¯
                
                let dt = canvas.toDataURL();
                GM_setValue('0', dt);

                let href = '//www.derpibooru.org/images/new?ychjpeghack=1'+
                    '&newImg='+encodeURIComponent(xlink)+
                    '&src='+encodeURIComponent(location.href)+
                    '&tags='+encodeURIComponent('artist:'+aname)+',ych'+(location.href.indexOf('/followUp/')>-1?' result':',commission')+
                    '&newWidth='+width+'&newHeight='+height;
                button.href = href;
                button.innerHTML = 'Share on Derpibooru';*/
            }
        //let button = holder.appendChild(InfernoAddElem('a', {href:href,target:'_blank',innerHTML:'Share on Derpibooru', className:'like-toggle iconless',style:{fontSize:'120%',marginTop:'0.2em',display:'inline-block'}, events:[{t:'click',f:function() {

        }}]}, []));
    }
    else {
        // handle derpibooru
        /*let image;
        if (location.search.startsWith('?ychjpeghack=1')) {
            document.querySelector('input[name="commit"]').setAttribute('disabled',1);
            let listen2 = function() {
                if (stop == 0) {
                    let blob = b64toBlob(GM_getValue('0').split(',').pop(),'image/jpeg');
                    let file = new File([blob], "generated-"+parseInt(Math.random()*10000)+".jpg");
                    //document.getElementById('image_image').files[0] = file;
                    document.getElementById('scraper_url').value = '';
                    stop++;
                    //setTimeout(function() {document.getElementById('js-scraper-preview').click()}, 100);
                }
                else {
                    stop = 2;
                }
            };
            let listen1 = function() {
                image = document.getElementsByClassName('scraper-preview--image')[0];
                if (image != undefined) {
                    image.setAttribute('crossOrigin',"Anonymous");
                    image.src = '';
                    image.src = GM_getValue('0');
                    if (image.complete) listen2();
                    else document.getElementsByClassName('scraper-preview--image')[0].addEventListener('load', listen2);
                }
                else setTimeout(listen1, 100);
            };
            setTimeout(listen1, 100);
        }*/
    }
})();
