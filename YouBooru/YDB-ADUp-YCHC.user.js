// ==UserScript==
// @name         YCH.Commishes YDB:ADUp module
// @version      0.1.3
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
    let mainDomain = 'www.derpibooru.org';
    let stop = 0;
    let multiplier, hermit;

    try {
        mainDomain = unsafeWindow._YDB_public.funcs.getDerpHomeDomain();
    }
    catch(e) {
    }

    function resample_single(canvas, width, height, resize_canvas) {
        var width_source = canvas.width;
        var height_source = canvas.height;
        width = Math.round(width);
        height = Math.round(height);

        var ratio_w = width_source / width;
        var ratio_h = height_source / height;
        var ratio_w_half = Math.ceil(ratio_w / 2);
        var ratio_h_half = Math.ceil(ratio_h / 2);

        var ctx = canvas.getContext("2d");
        var img = ctx.getImageData(0, 0, width_source, height_source);
        var img2 = ctx.createImageData(width, height);
        var data = img.data;
        var data2 = img2.data;

        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width; i++) {
                var x2 = (i + j * width) * 4;
                var weight = 0;
                var weights = 0;
                var weights_alpha = 0;
                var gx_r = 0;
                var gx_g = 0;
                var gx_b = 0;
                var gx_a = 0;
                var center_y = (j + 0.5) * ratio_h;
                var yy_start = Math.floor(j * ratio_h);
                var yy_stop = Math.ceil((j + 1) * ratio_h);
                for (var yy = yy_start; yy < yy_stop; yy++) {
                    var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                    var center_x = (i + 0.5) * ratio_w;
                    var w0 = dy * dy; //pre-calc part of w
                    var xx_start = Math.floor(i * ratio_w);
                    var xx_stop = Math.ceil((i + 1) * ratio_w);
                    for (var xx = xx_start; xx < xx_stop; xx++) {
                        var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                        var w = Math.sqrt(w0 + dx * dx);
                        if (w >= 1) {
                            //pixel too far
                            continue;
                        }
                        //hermite filter
                        weight = 2 * w * w * w - 3 * w * w + 1;
                        var pos_x = 4 * (xx + yy * width_source);
                        //alpha
                        gx_a += weight * data[pos_x + 3];
                        weights_alpha += weight;
                        //colors
                        if (data[pos_x + 3] < 255)
                            weight = weight * data[pos_x + 3] / 250;
                        gx_r += weight * data[pos_x];
                        gx_g += weight * data[pos_x + 1];
                        gx_b += weight * data[pos_x + 2];
                        weights += weight;
                    }
                }
                data2[x2] = gx_r / weights;
                data2[x2 + 1] = gx_g / weights;
                data2[x2 + 2] = gx_b / weights;
                data2[x2 + 3] = gx_a / weights_alpha;
            }
        }
        //clear and resize canvas
        if (resize_canvas === true) {
            canvas.width = width;
            canvas.height = height;
        } else {
            ctx.clearRect(0, 0, width_source, height_source);
        }

        //draw
        ctx.putImageData(img2, 0, 0);
    }

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
        let href = '//'+mainDomain+'/images/new?newImg='+encodeURIComponent(src)+
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
        holder.style.minHeight = '6em';
        let button = holder.appendChild(InfernoAddElem('a', {href:'javascript://',target:'_blank',innerHTML:'Prepare to share on Derpibooru', className:'like-toggle iconless',style:{fontSize:'120%',marginTop:'0.2em',display:'inline-block'}, events:[{t:'click',f:function(e) {

            e.target.innerHTML = 'Please wait';
            let aname = document.querySelector('.user-info .username').innerHTML.toLowerCase();
            let width = parseInt(document.querySelectorAll('body>script')[2].innerHTML.split('\n')[3].split('=').pop().trim());
            let height = parseInt(document.querySelectorAll('body>script')[2].innerHTML.split('\n')[4].split('=').pop().trim());
            let max = (width>height?width:height);
            let link = container.src.split('/');
            let xid = link[link.length-3];
            multiplier = parseInt(document.getElementById('_adup_quality').value);

            let xlink = 'https://portfolio.commishes.com/image/thumb/'+xid+'/original/'+(max*multiplier)+'/.png';
            let image = InfernoAddElem('img',{src:xlink}, []);

            image.onload = function() {
                e.target.innerHTML = 'Scroll down';
                hermit = document.getElementById('_adup_hermit').checked;
                let canvas = InfernoAddElem('canvas',{width:(hermit?width*multiplier:width),height:(hermit?height*multiplier:height), style:{maxWidth:'100%'}}, []);
                document.body.appendChild(canvas);
                let ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, (hermit?width*multiplier:width), (hermit?height*multiplier:height));
                if (hermit) {
                    e.target.innerHTML = 'Downscaling... Please be patient.';
                    setTimeout(function() {
                        resample_single(canvas,width,height,true);
                        alert('Save image from the bottom and upload it manually. Sorry, right now it\'s the only way to get adequate quality file :(');
                        e.target.innerHTML = 'Scroll down';
                    }, 100);
                }
                else alert('Save image from the bottom and upload it manually. Sorry, right now it\'s the only way to get adequate quality file :(');
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

        let width = parseInt(document.querySelectorAll('body>script')[2].innerHTML.split('\n')[3].split('=').pop().trim());
        let height = parseInt(document.querySelectorAll('body>script')[2].innerHTML.split('\n')[4].split('=').pop().trim());
        holder.appendChild(InfernoAddElem('br', {},[]));
        holder.appendChild(InfernoAddElem('br', {},[]));
        holder.appendChild(InfernoAddElem('span', {innerHTML:'Expected size: ', style:'font-size:80%'},[]));
        holder.appendChild(InfernoAddElem('b', {innerHTML:width+'x'+height, style:'font-size:80%'},[]));
        holder.appendChild(InfernoAddElem('br', {},[]));
        holder.appendChild(InfernoAddElem('span', {innerHTML:'JPEG size (2-4 recommended) ', style:'font-size:80%'},[]));
        holder.appendChild(InfernoAddElem('input', {type:'number',id:'_adup_quality',style:{width:'3em',fontSize:'80%'},value:2},[]));
        holder.appendChild(InfernoAddElem('label', {innerHTML:' HQ rescale ', style:'font-size:80%'},[
            InfernoAddElem('input', {type:'checkbox',id:'_adup_hermit',checked:true},[])
        ]));
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
