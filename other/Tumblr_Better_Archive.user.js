// ==UserScript==
// @name         It's much better, than Tumblr's archive!
// @version      0.7
// @description  try to take over the world!
// @author       stsyn
// @match        https://*/archive2
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/other/Tumblr_Better_Archive.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/other/Tumblr_Better_Archive.user.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// ==/UserScript==


/*************************

Currently the only thing which reveals hidden posts for now.

How to:
1. Open /archive2 page of the desired blog.
2. Profit.

*************************/



(function() {
    'use strict';
    let root, container, header, prefs = {}, data, preview, search, searchData = {}, indexDB = {};
    let linkSchema = 'https://api.tumblr.com/v2/blog/%BLOGNAME%/posts?fields%5Bblogs%5D=avatar%2Cname%2Ctitle%2Curl%2Cupdated%2Cfirst_post_timestamp%2Cposts%2Cdescription';
    let style = `._3Lynt{width:60%; float:left;} .J9VCO {width:100%; height:50px} #preview {width:36%; right:1%; top:60px; position:fixed; overflow-y:auto; height:90vh; align-items:normal}
    #preview .re{border-left:3px solid #999; width:95%; padding-left:2%} #preview img {max-width:99%} #preview video {width:99%} .post.selected{background-color:#9d9}`;

    function prepareURL(data) {
        let url = linkSchema.replace('%BLOGNAME%', prefs.blogName);
        for (let i in data) url += '&'+i+'='+data[i];
        return url;
    }

    function showPreview(postId) {
        if (document.querySelector('.post.selected')) document.querySelector('.post.selected').classList.remove('selected');
        document.querySelector('.post[data-index="'+postId+'"]').classList.add('selected');

        let post = data.response.posts[parseInt(postId)];
        preview.innerHTML = '';

        let renderHead = (data, preview2) => {
            preview2.appendChild(InfernoAddElem('div', {className:'_3LoFw'}, [
                InfernoAddElem('img', {src:data.blog.avatar.mediaUrlTemplates[0].url.replace('{id}', '30')}, []),
                InfernoAddElem('a', {href:data.blog.url, target:'_blank', innerHTML:data.blog.title+' ('+data.blog.name+')'}, [])
            ]))
        };

        let render = (line, preview2) => {
            if (line.type == 'text') {
                let newText = line.text.replace('\n', '<br>');
                if (line.formatting) {
                    line.formatting.forEach(f => {
                        let inner = line.text.substring(f.start, f.end);
                        if (f.type=='link') {
                            newText = newText.replace(inner, '<a href="'+f.url+'" target="_blank">'+inner+'</a>');
                        }
                        else if (f.type=='mention') {
                            newText = newText.replace(inner, '<a href="'+f.blog.url+'" target="_blank">'+inner+'</a>');
                        }
                        else if (f.type=='bold') {
                            newText = newText.replace(inner, '<strong>'+inner+'</strong>');
                        }
                        else if (f.type=='italic') {
                            newText = newText.replace(inner, '<em>'+inner+'</em>');
                        }
                    });
                }
                preview2.appendChild(InfernoAddElem('div', {className:line.subtype=='heading1'?'_3LoFw':'', innerHTML:newText}, []));
            }
            else if (line.type == 'image') {
                preview2.appendChild(InfernoAddElem('a', {href:line.slimMedia.mediaUrlTemplate.replace('{id}', '1280')}, [
                    InfernoAddElem('img', {src:line.slimMedia.mediaUrlTemplate.replace('{id}', '540')}, [])
                ]));
            }
            else if (line.type == 'video') {
                preview2.appendChild(InfernoAddElem('video', {poster:line.poster[0].url, controls:''}, [
                    InfernoAddElem('source', {src:line.media.url, type:line.media.type}, [])
                ]));
                preview2.appendChild(InfernoAddElem('a', {href:line.media.url, target:'_blank', innerHTML:'[Direct link]'}, []));
            }
            else if (line.type == 'audio') {
                let lnk = 'https://a.tumblr.com/'+line.media.url.split('/').pop().split('?')[0]+'o1.mp3';
                preview2.appendChild(InfernoAddElem('audio', {controls:''}, [
                    InfernoAddElem('source', {src:lnk, type:'audio/mpeg'}, [])
                ]));
                preview2.appendChild(InfernoAddElem('a', {href:line.media.url, target:'_blank', innerHTML:'[Direct link]'}, []));
            }
        };
        console.log(post);
        renderHead(post, preview);
        post.content.forEach(v => {render(v, preview)});
        let cpr = preview;
        post.trail.forEach(v => {
            cpr = cpr.appendChild(InfernoAddElem('div', {className:'re'}, []));
            renderHead(v, cpr);
            v.content.forEach(vx => {render(vx, cpr)});
        });
    }

    function mainRender() {
        let render = (data => {
            document.getElementById('Oindex').value = parseInt(prefs.offset/20+1);
            container.innerHTML = '';
            data.response.posts.forEach((post, index) => {
                indexDB[''+post.id] = post;
                let from = ((post.trail[0] && post.trail[0].blog)? post.trail[0].blog.name : '');
                let orig = ((post.trail[0] && post.trail[0].blog)? post.trail[0].blog.url+post.trail[0].post.id : '');
                container.appendChild(
                    InfernoAddElem('div', {className:'J9VCO post', dataset:{index}}, [
                        InfernoAddElem('div', {className:'SOOWB'}, [
                            InfernoAddElem('strong', {innerHTML:post.isNsfw?'[NSFW] ':''}, []),
                            InfernoAddElem('span', {innerHTML:' '}, []),
                            InfernoAddElem('a', {href:post.postUrl, target:'_blank',innerHTML:'[Link]'}, []),
                            InfernoAddElem('span', {innerHTML:' '}, []),
                            InfernoAddElem('a', {href:orig, target:'_blank',innerHTML:from}, []),
                            InfernoAddElem('span', {innerHTML:' '}, []),
                            InfernoAddElem('strong', {innerHTML:post.id}, []),
                            InfernoAddElem('span', {innerHTML:', '}, []),
                            InfernoAddElem('strong', {innerHTML:post.date}, []),
                            InfernoAddElem('span', {innerHTML:', '+post.summary}, []),
                            InfernoAddElem('a', {style:'float:right',innerHTML:'[Reblog]', target:'_blank', href:'https://www.tumblr.com/reblog/'+post.id+'/'+post.reblogKey}, [])
                        ])
                    ])
                );

                let found = () => {
                    container.lastChild.click();
                    searchData.isGoing = false;
                    searchData.lastId = post.id;
                    alert('Found');
                };

                if (searchData.isGoing && searchData.lastId > post.id) {
                    if (searchData.type == 'text') {
                        if (post.summary.indexOf(searchData.value) > -1) found();
                    }
                    else if (searchData.type == 'origPostId') {
                        post.trail.forEach(v => {
                            if (v.post && v.post.id == searchData.value) found();
                        });
                    }
                    else if (searchData.type == 'origTitle') {
                        post.trail.forEach(v => {
                            if (v.blog && v.blog.title.indexOf(searchData.value) > -1) found();
                        });
                    }
                    else if (searchData.type == 'origShortname') {
                        post.trail.forEach(v => {
                            if (v.blog && v.blog.name == searchData.value) found();
                        });
                    }
                    else if (search.type == 'imageId') {
                        post.content.forEach(c => {
                            if (c.type && c.type == 'image' && c.slimMedia && c.slimMedia.mediaUrlTemplate && c.slimMedia.mediaUrlTemplate.indexOf('_'+search.value) > -1) found();
                        });
                        post.trail.forEach(v => {
                            if (v.content) {
                                v.content.forEach(c => {
                                    if (c.type && c.type == 'image' && c.slimMedia && c.slimMedia.mediaUrlTemplate && c.slimMedia.mediaUrlTemplate.indexOf('_'+search.value) > -1) found();
                                });
                            }
                        });
                    }
                    else if (search.type == 'blogImageId') {
                        post.content.forEach(c => {
                            if (c.type && c.type == 'image' && c.slimMedia && c.slimMedia.mediaUrlTemplate && c.slimMedia.mediaUrlTemplate.indexOf('_'+search.value) > -1) found();
                        });
                        post.trail.forEach(v => {
                            if (v.content) {
                                v.content.forEach(c => {
                                    if (c.type && c.type == 'image' && c.slimMedia && c.slimMedia.mediaUrlTemplate &&
                                        c.slimMedia.mediaUrlTemplate.indexOf(new RegExp(search.value+'(o|)(\\d{1,2}|)_', '')) > -1) found();
                                });
                            }
                        });
                    }
                }
            });
            if (searchData.isGoing) {
                document.querySelector('._3cK_B._3s2qw._1kUcg.next').click();
            }
        });

        let req = () => {
            fetch(prepareURL({offset:prefs.offset, page:parseInt(prefs.offset/20)}), {
                method:'GET',
                headers: {
                    Accept:'application/json;format=camelcase',
                    Authorization: 'Bearer '+prefs.key,
                    'X-Version': 'redpop/3'
                }
            })
            .then(r => {return r.json()})
            .then(rdata => {data = rdata; render(data);});
        };

        req();
    }

    function preRender() {
        root = document.getElementById('root');
        root.innerHTML = '';
        //probably will be better to rewrite it, but I'm lazy
        //document.head.appendChild(InfernoAddElem('link', {rel:'stylesheet', type:'text/css', href:'https://assets.tumblr.com/pop/css/main-f3d780cf.css'}));
        document.head.appendChild(InfernoAddElem('link', {rel:'stylesheet', type:'text/css', href:'https://assets.tumblr.com/pop/css/archive-page-23d765c4.css'}));
        document.head.appendChild(InfernoAddElem('style', {media:'all', type:'text/css', innerHTML:style}));
        root.appendChild(
            InfernoAddElem('div', {id:"base-container"}, [
                InfernoAddElem('div', {className:'_2B7lk'}, [
                    InfernoAddElem('div', {className:'_7g80D'}, [
                        InfernoAddElem('header', {className:'_3Is8U _7g80D _2-JOb'}, [
                            InfernoAddElem('a', {innerHTML:'TBA', href:'/archive2', className:'_3cK_B _3s2qw _1kUcg'}, []),
                            InfernoAddElem('a', {innerHTML:'(export index)', id:'export', className:'_3cK_B _3s2qw _1kUcg'}, []),
                            search = InfernoAddElem('form', {className:'_3cK_B _3s2qw _1kUcg'}, [
                                InfernoAddElem('span', {innerHTML:'Find', className:'_3cK_B _3s2qw _1kUcg'}, []),
                                InfernoAddElem('input', {id:'Svalue', style:'width:10em'}, []),
                                InfernoAddElem('span', {innerHTML:' as ', className:'_3cK_B _3s2qw _1kUcg'}, []),
                                InfernoAddElem('select', {id:'Stype', style:'width:8em'}, [
                                    InfernoAddElem('option', {value:'origPostId', innerHTML:'Origin post id'}, []),
                                    InfernoAddElem('option', {value:'text', innerHTML:'Post text'}, []),
                                    InfernoAddElem('option', {value:'imageId', innerHTML:'Unique image id (w/o blog image id)'}, []),
                                    InfernoAddElem('option', {value:'blogImageId', innerHTML:'Blog image id'}, []),
                                    InfernoAddElem('option', {value:'origTitle', innerHTML:'Origin blog name'}, []),
                                    InfernoAddElem('option', {value:'origShortname', innerHTML:'Origin blog subdomain'}, [])
                                ]),
                                InfernoAddElem('input', {type:'submit',id:'Ssend', value:'Go', className:'_3cK_B _3s2qw _1kUcg'}, []),
                                InfernoAddElem('input', {type:'submit',id:'Scont', value:'Continue', className:'_3cK_B _3s2qw _1kUcg'}, [])
                            ]),
                            header = InfernoAddElem('form', {className:'_3cK_B _3s2qw _1kUcg'}, [
                                InfernoAddElem('span', {innerHTML:'< prev', className:'_3cK_B _3s2qw _1kUcg prev'}, []),
                                InfernoAddElem('input', {id:'Oindex', style:'width:4em'}, []),
                                InfernoAddElem('input', {type:'submit',id:'Osend', value:'Go', className:'_3cK_B _3s2qw _1kUcg'}, []),
                                InfernoAddElem('span', {innerHTML:'next >', className:'_3cK_B _3s2qw _1kUcg next'}, [])
                            ])
                        ])
                    ]),
                    InfernoAddElem('div', {className:'_3Lynt'}, [
                        InfernoAddElem('form', {className:'_3ggvs', id:"BAuth"}, [
                            InfernoAddElem('h2', {className:'_3LoFw', innerHTML:'Your Bearer Authorization key please :3', style:{textAlign:'center'}}, []),
                            InfernoAddElem('input', {id:'BKey'}, []),
                            InfernoAddElem('input', {type:'submit',id:'BConfirm', value:'Confirm'}, [])
                        ]),
                        container = InfernoAddElem('div', {className:'_3ggvs'}, [])
                    ]),
                    preview = InfernoAddElem('div', {id:'preview', className:'_3ggvs'}, [])
                ])
            ])
        );

        document.body.addEventListener('click', e => {
            let elem = e.target;
            let check = elem => {
                if (elem.tagName == 'A' || elem.tagName == 'BODY') return;
                if (elem.classList.contains('post')) showPreview(elem.dataset.index);
                else if (elem.classList.contains('prev')) {
                     prefs.offset-=20;
                     mainRender();
                }
                else if (elem.classList.contains('next')) {
                     prefs.offset+=20;
                     mainRender();
                }
                check(elem.parentNode);
            }
            check(elem);
        });

        document.getElementById('BConfirm').addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('BAuth').style.display = 'none';
            window.history.pushState('page2', 'Better than archive', ('/archive'));

            prefs.key = document.getElementById('BKey').value.trim();
            prefs.offset = 0;
            prefs.blogName = location.hostname.split('.')[0];

            mainRender();
            return false;
        });

        document.getElementById('Osend').addEventListener('click', e => {
            if (!prefs.blogName) return;
            e.preventDefault();

            prefs.offset = (parseInt(document.getElementById('Oindex').value)-1)*20;

            mainRender();
            return false;
        });

        document.getElementById('Ssend').addEventListener('click', e => {
            searchData.lastId = Infinity;
            document.getElementById('Scont').click();
            e.preventDefault();

            return false;
        });

        document.getElementById('Scont').addEventListener('click', e => {
            searchData.type = document.getElementById('Stype').value;
            searchData.value = document.getElementById('Svalue').value;
            searchData.isGoing = true;

            if (!prefs.blogName) return;
            e.preventDefault();

            mainRender();
            return false;
        });

        document.getElementById('export').addEventListener('click', e => {
            let blob = new Blob([JSON.stringify(indexDB)], {type: "application/json"});
            let url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.download = prefs.blogName+'.json';
            a.href = url;
            a.target = "_blank";
            a.click();
        });

        document.getElementById('BKey').value = unsafeWindow.___INITIAL_STATE___.apiFetchStore.API_TOKEN;
        document.getElementById('BConfirm').click();
    }

    setTimeout(preRender, 1000);
    window.onbeforeunload = function (evt) {
        let message = "You sure?";
        if (typeof evt == "undefined") evt = window.event;
        if (evt) evt.returnValue = message;
        return message;
    };
})();
