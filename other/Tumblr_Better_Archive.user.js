// ==UserScript==
// @name         It's much better, than Tumblr's archive!
// @version      0.3
// @description  try to take over the world!
// @author       stsyn
// @match        https://*.tumblr.com/archive2
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
    let root, container, header, prefs = {}, data, preview;
    let linkSchema = 'https://api.tumblr.com/v2/blog/%BLOGNAME%/posts?fields%5Bblogs%5D=avatar%2Cname%2Ctitle%2Curl%2Cupdated%2Cfirst_post_timestamp%2Cposts%2Cdescription';
    let style = `._3Lynt{width:60%; float:left;} .J9VCO {width:100%; height:50px} #preview {width:36%; right:1%; top:60px; position:fixed; overflow-y:auto; height:90vh; align-items:left}
    #preview .re{border-left:3px solid #999; width:95%; padding-left:2%} #preview img {max-width:99%} .post.selected{background-color:#9d9}`;

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
            document.getElementById('Oindex').value = parseInt(prefs.offset/10+1);
            container.innerHTML = '';
            data.response.posts.forEach((post, index) => {
                let from = (post.trail[0]? post.trail[0].blog.name : '');
                let orig = (post.trail[0]? post.trail[0].blog.url+post.trail[0].post.id : '');
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
                )
            });
        });

        let req = () => {
            fetch(prepareURL({offset:prefs.offset, page:parseInt(prefs.offset/10)}), {
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
                            InfernoAddElem('a', {innerHTML:'This is not a Tumblr archive. This is better.', href:'/archive2', className:'_3cK_B _3s2qw _1kUcg'}, []),
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

            prefs.offset = (parseInt(document.getElementById('Oindex').value)-1)*10;

            mainRender();
            return false;
        });

        document.getElementById('BKey').value = unsafeWindow.___INITIAL_STATE___.apiFetchStore.API_TOKEN;
        document.getElementById('BConfirm').click();
    }

    setTimeout(preRender, 1000);
})();
