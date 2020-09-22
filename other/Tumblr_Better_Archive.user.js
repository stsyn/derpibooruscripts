// ==UserScript==
// @name         It's much better, than Tumblr's archive!
// @version      0.8.2
// @author       stsyn
// @match        https://*/archive2
// @match        https://www.tumblr.com/dashboard2/*
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
  const linkSchema = 'https://api.tumblr.com/v2/blog/%BLOGNAME%/posts?fields%5Bblogs%5D=avatar%2Cname%2Ctitle%2Curl%2Cuuid%2Cdescription_npf&reblog_info=true&npf=true&should_bypass_safemode_forpost=true&should_bypass_safemode_forblog=true&can_modify_safe_mode=true';
  const postLinkSchema = 'https://api.tumblr.com/v2/blog/%BLOGNAME%/posts/%POST%/permalink?fields%5Bblogs%5D=avatar%2Cname%2Ctitle%2Curl%2Cdescription_npf%2Ctheme%2Cuuid%2Ccan_message%2Ccan_be_followed%2C%3Ffollowed%2C%3Fis_member%2Cshare_likes%2Cshare_following%2Ccan_subscribe%2Csubscribed%2Cask%2C%3Fcan_submit%2C%3Fis_blocked_from_primary%2C%3Ftweet&reblog_info=true'
  let style = `._3Lynt{width:60%; float:left;} .J9VCO {width:100%; height:50px} #preview {width:36%; right:1%; top:60px; position:fixed; overflow-y:scroll; height:90vh; align-items:normal}
#preview .re{border-left:3px solid #999; width:95%; padding-left:2%} #preview img {max-width:99%} #preview video {width:99%} .post.selected{background-color:#9d9}
body {position:static; background: #f2f2f2 !important}`;

  function prepareURL(data) {
    let url = linkSchema.replace('%BLOGNAME%', prefs.blogName);
    for (let i in data) url += '&'+i+'='+data[i];
    return url;
  }

  function preparePostUrl(id) {
    let url = postLinkSchema.replace(/%BLOGNAME%/g, prefs.blogName).replace(/%POST%/g, id);
    return url;
  }

  function showPreview(postId) {
    if (document.querySelector('.post.selected')) document.querySelector('.post.selected').classList.remove('selected');
    if (document.querySelector('.post[data-index="'+postId+'"]')) document.querySelector('.post[data-index="'+postId+'"]').classList.add('selected');

    let post = indexDB[''+postId];
    preview.innerHTML = '';

    try {
      let renderHead = (data, preview2) => {
        preview2.appendChild(InfernoAddElem('div', {className:'_3LoFw'}, [
          InfernoAddElem('img', {src:data.blog.avatar[3].url, width: 32, height: 32}, []),
          InfernoAddElem('a', {href:data.blog.url, target:'_blank', innerHTML:data.blog.title+' ('+data.blog.name+')'}, []),
          InfernoAddElem('a', {href:'//tumblr.com/dashboard2/blog/' + data.blog.name, target:'_blank', innerHTML:' [TBA]'}, [])
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
          preview2.appendChild(InfernoAddElem('a', {target:'_blank', href:line.media[0].url}, [
            InfernoAddElem('img', {src:line.media[1].url}, [])
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
      renderHead(post, preview);
      post.content.forEach(v => {render(v, preview)});
      let cpr = preview;
      post.trail.forEach(v => {
        cpr = cpr.appendChild(InfernoAddElem('div', {className:'re'}, []));
        renderHead(v, cpr);
        v.content.forEach(vx => {render(vx, cpr)});
      });
    } catch(e) {
      preview.innerHTML = e + '<hr>' + JSON.stringify(post);
    }
    preview.appendChild(InfernoAddElem('a', {target:'_blank', href:'https://www.tumblr.com/reblog/'+post.id+'/'+post.reblogKey, innerHTML:'[Reblog]'}, []));
  }

  function renderSinglePost(post, index) {
    indexDB[''+post.id] = post;
    let from = ((post.trail[0] && post.trail[0].blog)? post.trail[0].blog.name : '');
    let orig = ((post.trail[0] && post.trail[0].blog)? post.trail[0].blog.url+post.trail[0].post.id : '');
    container.appendChild(
      InfernoAddElem('div', {className:'J9VCO post', dataset:{index: post.id}}, [
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
  }

  function mainRender() {
    let render = (data => {
      document.getElementById('Oindex').value = parseInt(prefs.offset/20+1);
      container.innerHTML = '';
      data.response.posts.forEach((post, index) => {
        if (post.objectType !== 'post') return;
        let from = ((post.trail[0] && post.trail[0].blog)? post.trail[0].blog.name : '');
        let orig = ((post.trail[0] && post.trail[0].blog)? post.trail[0].blog.url+post.trail[0].post.id : '');
        renderSinglePost(post, index);

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
            if (post.id == searchData.value) found();
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
              if (c.type && c.type == 'image' && c.media && c.media[0] && c.media[0].url.indexOf('_'+search.value) > -1) found();
            });
            post.trail.forEach(v => {
              if (v.content) {
                v.content.forEach(c => {
                  if (c.type && c.type == 'image' && c.media && c.media[0] && c.media[0].url.indexOf('_'+search.value) > -1) found();
                });
              }
            });
          }
          else if (search.type == 'blogImageId') {
            post.content.forEach(c => {
              if (c.type && c.type == 'image' && c.media && c.media[0] && c.media[0].url.indexOf('_'+search.value) > -1) found();
            });
            post.trail.forEach(v => {
              if (v.content) {
                v.content.forEach(c => {
                  if (c.type && c.type == 'image' && c.media && c.media[0] &&
                      c.media[0].url.indexOf(new RegExp(search.value+'(o|)(\\d{1,2}|)_', '')) > -1) found();
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
      window.history.pushState('page2', 'Better than archive', ('/dashboard/blog/'+prefs.blogName));
      fetch(prepareURL({offset:prefs.offset, page_number:parseInt(prefs.offset/20)}), {
        method:'GET',
        headers: {
          Accept:'application/json;format=camelcase',
          Authorization: 'Bearer '+prefs.key,
          'X-Version': 'redpop/3/0//redpop/'
        }
      })
        .then(r => {return r.json()})
        .then(rdata => {data = rdata; render(data);});
    };

    req();
  }

  function fetchPost() {
    if (indexDB[''+searchData.value]) {
      showPreview(searchData.value);
      return;
    }
    window.history.pushState('page2', 'Better than archive', ('/dashboard/blog/'+prefs.blogName+'/'+searchData.value));
    searchData.isGoing = false;
    fetch(preparePostUrl(searchData.value), {
      method:'GET',
      headers: {
        Accept:'application/json;format=camelcase',
        Authorization: 'Bearer '+prefs.key,
        'X-Version': 'redpop/3/0//redpop/'
      }
    })
      .then(r => r.json())
      .then(rdata => {
      try {
        const post = rdata.response.timeline.elements[0];
        indexDB[''+post.id] = post;
        showPreview(post.id);
      }
      catch (e) {
        alert('Failed: ' + e);
      }
    });
  }

  function preRender() {
    prefs.blogName = location.pathname.split('/')[3];
    root = document.querySelector('.has-background-image.no-delay');
    root.innerHTML = '';
    //probably will be better to rewrite it, but I'm lazy
    //document.head.appendChild(InfernoAddElem('link', {rel:'stylesheet', type:'text/css', href:'https://assets.tumblr.com/pop/css/main-f3d780cf.css'}));
    document.head.appendChild(InfernoAddElem('link', {rel:'stylesheet', type:'text/css', href:'https://assets.tumblr.com/pop/css/archive-page-23d765c4.css'}));
    document.head.appendChild(InfernoAddElem('style', {media:'all', type:'text/css', innerHTML:style}));
    root.appendChild(
      InfernoAddElem('div', {id:"base-container", style:'color:#000'}, [
        InfernoAddElem('div', {className:'_2B7lk'}, [
          InfernoAddElem('div', {className:'_7g80D'}, [
            InfernoAddElem('header', {className:'_3Is8U _7g80D _2-JOb'}, [
              InfernoAddElem('a', {innerHTML:'TBA', href:'//tumblr.com/dashboard2/blog/' + prefs.blogName, className:'_3cK_B _3s2qw _1kUcg'}, []),
              InfernoAddElem('a', {innerHTML:'(export index)', id:'export', className:'_3cK_B _3s2qw _1kUcg'}, []),
              search = InfernoAddElem('form', {className:'_3cK_B _3s2qw _1kUcg'}, [
                InfernoAddElem('span', {innerHTML:'Find', className:'_3cK_B _3s2qw _1kUcg'}, []),
                InfernoAddElem('input', {id:'Svalue', style:'width:10em'}, []),
                InfernoAddElem('span', {innerHTML:' as ', className:'_3cK_B _3s2qw _1kUcg'}, []),
                InfernoAddElem('select', {id:'Stype', style:'width:8em'}, [
                  InfernoAddElem('option', {value:'goto', innerHTML:'Just take me to the post'}, []),
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
      prefs.key = document.getElementById('BKey').value.trim();
      prefs.offset = 0;

      e.preventDefault();
      document.getElementById('BAuth').style.display = 'none';

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
      e.preventDefault();
      searchData.type = document.getElementById('Stype').value;
      searchData.value = document.getElementById('Svalue').value;
      searchData.isGoing = true;
      if (searchData.type == 'goto') {
        fetchPost();
        return;
      }

      if (!prefs.blogName) return;

      mainRender();
      return false;
    });

    document.getElementById('export').addEventListener('click', e => {
      const allKeys = Object.keys(indexDB).sort();
      const parts = allKeys.reduce((acc, item, index) => {
        const page = Math.floor(index / 5000);
        if (!acc[page]) acc[page] = [];
        acc[page].push(item);
        return acc;
      }, []);
      parts.forEach((part, index) => {
        const partialDB = {};
        part.forEach(item => partialDB[item] = indexDB[item]);
        let blob = new Blob([JSON.stringify(partialDB)], {type: "application/json"});
        let url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.download = prefs.blogName+'--p' + index + '.json';
        a.href = url;
        a.target = "_blank";
        a.click();
      })
    });

    document.getElementById('BKey').value = location.search.substring(1);
    //document.getElementById('BConfirm').click();
  }

  if (location.host !== 'www.tumblr.com') {
    prefs.blogName = location.hostname.split('.')[0];
    location.href = '//www.tumblr.com/dashboard2/blog/' + prefs.blogName + '?' + unsafeWindow.___INITIAL_STATE___.apiFetchStore.API_TOKEN;
  }

  if (document.querySelector('[http-equiv="refresh"]')) {
    document.head.removeChild(document.querySelector('[http-equiv="refresh"]'));
  }

  window.onbeforeunload = function (evt) {
    let message = "You sure?";
    if (typeof evt == "undefined") evt = window.event;
    if (evt) evt.returnValue = message;
    return message;
  };

  setTimeout(preRender, 1000);
})();
