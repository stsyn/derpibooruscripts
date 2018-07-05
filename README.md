# derpibooruscripts
Here are the userscripts related to the https://derpibooru.org. Most of them are provided under the common name of YourBooru (YDB). Functional descriptions are available on the links, here are just technical informations.

## Quick installation links and descriptions

**YDB:Settings** — https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js

**YDB:Feeds** — https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooru.user.js — https://derpibooru.org/meta/userscript-youbooru-feeds-on-main-page

**YDB:Tools** — https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruTools.user.js — https://derpibooru.org/meta/youboorutools-0524-everything-what-you-ever-imagined-and-even-more

**Search Sorting Fixer** — https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/SearchFixer.user.js — https://www.derpibooru.org/meta/userscript-search-sorting-fixer-003

**Fullscreen** — https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/Fullscreen.user.js — https://www.derpibooru.org/meta/topics/userscript-derp-fullscreen-viewer

**YDB:ADUp** — https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ADUp.user.js — https://www.derpibooru.org/forums/meta/topics/userscript-semi-automated-derpibooru-uploader

## Detailed technical descriptions

### YDB:Settings
Main settings provider which allows to construct UI-based settings for userscript on Derpibooru settings page. Can be used as separate userscript, since 0.9.12 can be used as library, through.

#### Implementing
Despite the fact that the script was developed for the internal needs of the YDB (this is evident in some elements of the design), you can use it for your own purposes. Due to the nature of its development, it's always working realtime as normal userscript (not as typical function-library), but always no more than one instance of the script is active (which was launched first). See YDB tab in settings to make sure, which instantion works right now.

If you want to guarantee it's startup in your work without having standalone installation of YDB:S, you need to require special library-based build of YDB:S:

``` javascript
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YouBooruSettings0.lib.js
```

You **must not** do that if your script has run-at property set as **document-start**. You should provide to end users a link for a standalone version or just believe, that they have any other script which integrated YDB:S as a library.

#### Usage
Threre is a sample code of implementing settings by using YDB:S:
``` javascript
if (window._YDB_public == undefined) window._YDB_public = {};
if (window._YDB_public.settings == undefined) window._YDB_public.settings = {};
window._YDB_public.settings.feeds = {
  name:'Feeds',
  container:'_ydb_feeds',
  version:version,
  link:'/meta/userscript-youbooru-feeds-on-main-page',
  s:[
    {type:'checkbox', name:'Keep watchlist', parameter:'doNotRemoveWatchList'},
    {type:'breakline'},
    {type:'input', name:'Amount of images in a feed:', parameter:'imagesInFeeds', validation:{type:'int',min:1,max:25}},
    {type:'input', name:'Minimum feeds loaded at once:', parameter:'oneTimeLoad', validation:{type:'int',min:1,max:10}},
    {type:'breakline'},
    {type:'checkbox', name:'Right-aligned layout', parameter:'watchFeedLinkOnRightSide'},
    {type:'breakline'},
    {type:'checkbox', name:'Trim garbage from HTML', parameter:'optimizeLS', styleS:{display:'none'}},
    {type:'array', parameter:'feedz', addText:'Add feed', customOrder:true, s:[
      [
        {type:'input', name:'Name', parameter:'name',styleI:{width:'33em', marginRight:'.5em'},validation:{type:'unique'}},
        {type:'select', name:'Sorting', parameter:'sort',styleI:{marginRight:'.5em'}, values:[
          {name:'Creation date', value:'created_at'},
          {name:'Score', value:'score'},
          {name:'Wilson score', value:'wilson'},
          {name:'Relevance', value:'relevance'},
          {name:'Width', value:'width'},
          {name:'Height', value:'height'},
          {name:'Comments', value:'comments'},
          {name:'Random', value:'random'},
          {name:'Gallery', value:'gallery_id'}
        ],i:function(module,elem) {
          let f = module.saved.feedz[elem.parentNode.dataset.id];
          if (f == undefined || !f.sort.startsWith('gallery_id')) {
            elem.removeChild(elem.querySelector('option[value="gallery_id"]'));
          }
          else {
            let x = elem.querySelector('option[value="gallery_id"]');
            x.value = f.sort;
            x.selected = true;
          }
        }},
        {type:'select', name:'Direction', parameter:'sd',styleI:{marginRight:'.5em'}, values:[
          {name:'Descending', value:'desc'},
          {name:'Ascending', value:'asc'}
        ]}
      ],
      [
        {type:'input', name:'Caching delay (minutes)', parameter:'cache',styleI:{width:'3em', marginRight:'.4em'}, validation:{type:'int',min:0,max:99999}},
        {type:'input', name:'...or caching interval', parameter:'ccache',styleI:{width:'3.2em', marginRight:'.4em'}, validation:{type:'int',min:0,max:99999}},
        {type:'checkbox', name:'Double size', parameter:'double',styleI:{marginRight:'.4em'}},
        {type:'checkbox', name:'Show on home page', parameter:'mainPage',styleI:{marginRight:'.4em'}},
        {type:'buttonLink', attrI:{title:'Copy-paste this link somewhere to share this feed!',target:'_blank'},styleI:{marginRight:'.5em'}, name:'Share', i:function(module,elem) {
          let f = module.saved.feedz[elem.parentNode.dataset.id];
          if (f == undefined) {
            elem.innerHTML = '------';
            return;
          }
          let q = f.query;
          if (window._YDB_public.funcs != undefined && window._YDB_public.funcs.tagAliases !=undefined)
            q = encodeURIComponent(window._YDB_public.funcs.tagAliases(f.query, {legacy:false}));
          elem.href = '/search?name='+encodeURIComponent(f.name)+'&q='+q.replace(/\%20/g,'+')+'&sf='+f.sort+'&sd='+f.sd+'&cache='+f.cache+'&ccache='+f.ccache;
        }},
        {type:'button', name:'Nuke cache  (╯°□°）╯', action:resetCache}
      ],[
        {type:'textarea', name:'Query', parameter:'query',styleI:{width:'calc(100% - 11em)'}}
      ]
    ], template:{name:'New feed',sort:'',sd:'',cache:'30',ccache:'0',query:'*',double:false,mainPage:true}}
  ],
  onChanges:{
    feedz:{
      sort:resetCache,
      sd:resetCache,
      query:resetCache,
      double:resetCache
    }
  }
};
```

Let's look, how it's working.

First of all, you should define YDB and YDB:S public objects (because you don't know, which script will launch first):
``` javascript
if (window._YDB_public == undefined) window._YDB_public = {};
if (window._YDB_public.settings == undefined) window._YDB_public.settings = {};
```

Second this is that you need to define object which will contain all needed data about your script. Name of the object should be unique.
``` javascript
window._YDB_public.settings.feeds = { ... };
```

Fields (each except **s**, **onChanges** and **hidden** is string):
- **name** — **[Required]** displayable name of your script;
- **version** — **[Required]** displayable version of your script (common practice is using **GM_info.script.version** property);
- **container** — **[Required]** **name** of the **localStorage** object with your settings which content you are want to config with YDB:S;
- **link** — if present, name of your script in YDB:S page will be hyperlink;
- **s** — settings array, described bellow;
- **onChanges** — object similar with **s**, described bellow;
- **hidden** — if present and equal to **true**, your script won't be listed at the end.

Since YDB:S allows to store content on Derpibooru itself it's strongly recommended to keep settings and other script saved data, which you don't want to syncronize, separated, because it's saving whole **container** object. Also if want only to allow syncronize some data without configuring, you may want to don't define **s** object and set **hidden** to true.

The main thing is **s** array, which contains every setting you want to visually configure. Each element of array is object with these fields:
- **type** — **[Required]** **string** type of element. Can be:
  - **checkbox** — for boolean-type settings; 
  - **input** — for string, integer and float settings; 
  - **textarea** — for large string settings;
  - **select** — for selectable string settings;
  - **array** — for array-based settings;
  - **button** — normal button;
  - **buttonLink** — as **button**, but used for links;
  - **header** — static header (e.q. for subsection);
  - **text** — static text;
  - **breakline** — breakline (none of the above parameters puts them by themself).
- **name** — **[Required]** **[except for *array*]** **string** displayable name of parameter or inner value for static elements;
- **parameter** — **[Required]** **[for *checkbox*, *input*, *textarea*, *select*, *array*]** **string** property of provided settings object represents current option;
- **eventsI** — **[for *checkbox*, *input*, *textarea*, *select*]** **object** allows to attach events for **editable** (inputs) part of setting HTML-element;
- **eventsS** — **[except for *array*]** **object** allows to attach events for **static** (texts) part of setting HTML-element;
- **styleI** — **[for *checkbox*, *input*, *textarea*, *select*]** **object** allows to attach CSS-properies for **editable** (inputs) part of setting HTML-element;
- **styleS** — **[except for *array*]** **object** allows to attach CSS-properies for **static** (texts) part of setting HTML-element;
- **attrI** — **[for *checkbox*, *input*, *textarea*, *select*]** **object** allows to attach other attributes for **editable** (inputs) part of setting HTML-element;
- **attrS** — **[except for *array*]** **object** allows to attach other attributes for **static** (texts) part of setting HTML-element;
- **validation** — **[for *input* and *textarea*]** **object** allows to control input values. Has folowing subfields:
  - **type** — **string** type of validation. Can be:
    - **int** — tries to use **parseInt** on value. Throws warning if failed. Allows to use **min** and **max** parameters;
    - **float** — tries to use **parseFloat** on value. Throws warning if failed. Allows to use **min** and **max** parameters;
    - **unique** — **[only for *input* which are the children of *array*]** checks if there is another option with that value and throws warning if it is.
  - **min** — **int/float** throws warning if value is smaller than specified;
  - **max** — **int/float** throws warning if value is bigger than specified.
- **i** — **function** executes right after element injected with parameters **setting-module** and **HTML-elem**;
- **values** — **[Required]** **[for *select*]** **array** — possible values for setting. Each element of array is object with these fields:
  - **name** — **[Required]** **string** displayable name of value;
  - **value** — **[Required]** **string** value itself;
- **addText** — **[Required]** **[for *array*]** **string** text on button to add value in array setting;
- **customOrder** — **[Required]** **[for *array*]** **boolean** allows to reorder values in array; 
- **s** — **[Required]** **[for *array*]** **array** of **arrays**. Each array represents one line and has the same structure as global **s** object;
- **template** — **[for *array*]** **object** default parameters values for new elements of array setting;
- **href** — **[Required]** **[for *buttonLink*]** **string** hyperlink.

Optional object **onChanges** consist of function map, allows to attach parsing function to setting properties by **parameter** values. If you want to implement setting to **inner array properties**, you should create an object and use inner properties parameter. If you want to implement setting to **array itself**, you should create an object and set function as value to field **_** (underline). Sample:

``` javascript
onChanges:{
  property:evalueProperty;              // executes when option changed
  arrayProperty:{
    innerProperty:evalueInnerProperty,  // executes when option changed
    _:evalueArrayProperty               // executes when any option of array changed
  }
}
```

Functions executes when user clicks "Save settings" right before being written.

#### Usage for *// @run-at document-start* scripts
Since there is a different **window** object in that case, you should use other method to implement settings:

``` javascript
document.addEventListener('DOMContentLoaded', function() {addElem('span', {style:'display:none', type:'text', dataset:{value:JSON.stringify(DATA_OBJECT),origin:'script'}, className:'_YDB_reserved_register'}, document.body);});
```

**DATA_OBJECT** is the same object as in common method with only one significant difference: **no any functions allowed**. If you want to do something with inserted HTML-elements, you should select them and add event listeners on your side.

#### Arguments objects

Functions, which can be placed as field **i** and **action** have 2 arguments: **module** and **element**.

Functions, which can be placed in field **onChanges** have 3 arguments: **moduleData**, **element** and **callback**.

- **callback** — call this function if you changed value in your handler and want to save changed one. Have 3 arguments: **moduleData**, **element** and **newValue**. First 2 is the same, 3rd one — new value;
- **element** — it's common HTML-element which was generated to represent current setting. *For array type in **onChanges** is an array of **moduleData**s for each child!*
- **module** — mostly consists of created earlier public objects fields:
- - **changed** — for internal usage, you may see "false" here even if something actually was changed. You may change it to **true**, thought, it will cause backups to be updated;
- - **container** — same as in public object;
- - **name** — same as in public object;
- - **onChanges** — same as in public object;
- - **options** — same as **s** in public object;
- - **saved** — saved content of this branch (see below).
- **moduleData** — same as **module.saved**:

``` javascript
onChanges:{
  property:evalueProperty;              // moduleData is {property:..., arrayProperty:{innerProperty:...}}
  arrayProperty:{
    innerProperty:evalueInnerProperty,  // moduleData is {innerProperty:...}
    _:evalueArrayProperty               // moduleData is {property:..., arrayProperty:{innerProperty:...}}
  }
}
```

#### Other

- **window._YDB_public.funcs.backgroundBackup** — **function (callback)** if user have backupping enabled, saves data cloudly on Derpibooru. Asynchronous, use **callback**;
- **window._YDB_public.funcs.callWindow** — **function (element)** renders simple window with HTML-element **element**;
- **window._YDB_public.funcs.getNonce** — **function ()** returns unsafe unique value, use to prevent possible not critical unwanted actions which your script may do after parsing URL or other things. Randomizes each ~6 hours, not protected from overwriting;
- **window._YDB_public.handled** — **int** increment if your **onChange** handler is asynchronous to prevent page aborting function. Decrement upon completion;
- **window._YDB_public.funcs.log** — **function (id, string, level)** makes a record in global debug log. **id** should represent script, **string** is a main record, **level** represents importance (0 — error, 1 — normal, 2 — verbose).
