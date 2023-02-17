// ==UserScript==
// @name         YDB: ABP
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  Super lazy mode
// @author       stsyn

// @match        *://*/*

// @exclude      *://*/api*/json/*
// @exclude      *://*/adverts/*

// @require      https://raw.githubusercontent.com/blueimp/JavaScript-MD5/master/js/md5.min.js

// @require      https://github.com/stsyn/createElement/raw/component/src/es5.js
// @require      https://github.com/stsyn/createElement/raw/component/src/extensions/forms.js

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Basics.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/ImageSearch.js

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/Blocks.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/Inputs.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/TagInput.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ABP.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ABP.user.js

// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

// mod tool, nothing useful here if you know nothing about it yet.

(function() {
  'use strict';
  // todo: all booru support
  const search = { apiKey: JSON.parse(GM_getValue('apiKey', '{}')) };
  const state = {};
  const processors = [];

  const undeleteProcessor = {
    apiType: 'single',
    name: 'Undelete',
    options: [
      ['', 'Restores matched images.']
    ],
    defaultData: {},
    executor: async (_, image) => {
      const csrf = unsafeWindow.booru.csrfToken;
      await YDB_api.fetchPage('DELETE', `/images/${image.id}/delete`, { _csrf_token: csrf }, { useFormData: true });
    },
  };

  const deleteProcessor = {
    apiType: 'single',
    name: 'Delete',
    options: [
      [YDB_api.UI.input, { label: 'Deletion reason', fieldLabel: 'Deletes matched images.', name: 'reason' }]
    ],
    defaultData: {},
    executor: async ({ reason }, image) => {
      const csrf = unsafeWindow.booru.csrfToken;
      await YDB_api.fetchPage('POST', `/images/${image.id}/delete`, { _csrf_token: csrf, 'image[deletion_reason]': reason }, { useFormData: true });
    },
  };

  const voteRetractorProcessor = {
    apiType: 'single',
    name: 'Vote retractor',
    options: [
      [YDB_api.UI.input, { label: 'User id', fieldLabel: 'Retracts specified user votes - any kind of votes, except faves.', name: 'userId' }]
    ],
    defaultData: {},
    executor: async ({ userId }, image) => {
      const csrf = unsafeWindow.booru.csrfToken;
      await YDB_api.fetchPage('POST', `/images/${image.id}/tamper?user_id=${userId}`, { _csrf_token: csrf }, { useFormData: true });
    },
  };

  const batchTaggingProcessor = {
    apiType: 'batch',
    name: 'Batch tagging',
    options: [
      [YDB_api.UI.tagInput, { label: 'Tags to add', name: 'add' }],
      [YDB_api.UI.tagInput, { label: 'Tags to remove', name: 'remove' }],
    ],
    defaultData: {},
    executor: async ({ add, remove }, images) => {
      const csrf = unsafeWindow.booru.csrfToken;
      const removeTags = remove.trim().length > 0 ? ('-' + remove.split(',').map(v => v.trim()).join(',-')) : '';
      await YDB_api.fetchPage('PUT', `/admin/batch/tags`, {
        image_ids: images.map(v => String(v.id)),
        tags: add + ((add && removeTags) ? ',' : '') + removeTags,
      }, { headers: {
        'content-type': 'application/json',
        'x-csrf-token': csrf,
        'x-requested-with': 'xmlhttprequest'
      } });
    },
  };

  const definedProcessors = [batchTaggingProcessor, voteRetractorProcessor, undeleteProcessor, deleteProcessor];


  async function processImages() {
    GM_setValue('apiKey', JSON.stringify(search.apiKey))
    const iterator = YDB_api.longSearch(search.query, { key: search.apiKey, del: search.del });
    let images = [];
    let result = await iterator.next();
    while (!result.done) {
      images = images.concat(result.value.images);
      search.got = images.length;
      result = await iterator.next();
    }
    await processProcessors(images);
  }

  async function processProcessors(images) {
    for (let processor of processors) {
      if (processor.apiType === 'batch') {
        await processor.executor(processor.defaultData, images);
        processor.defaultData._completed = images.length;
      } else {
        processor.defaultData._completed = 0;
        for (let i = 0; i < images.length; i++) {
          await processor.executor(processor.defaultData, images[i]);
          processor.defaultData._completed = i + 1;
        }
      }
    }

    alert('Done');
  }

  function YDB_ABP() {
    let redrawPostprocessors = () => {};
    let redrawStartButton = () => {};

    function drawProcessors() {
      redrawPostprocessors(['', processors.map((proc, i) => {
        return [formElement, { data: proc.defaultData }, [
          [YDB_api.UI.block, [
            ['div', [
              proc.name,
              ['a', { style: { float: 'right' }, onclick: () => {
                processors.splice(i, 1);
                drawProcessors();
              }}, 'Remove'],
              [YDB_api.UI.input, { style: { float: 'right' }, disabled: true, inline: true, name: '_completed' }],
            ]],
            ...proc.options,
          ]],
        ]];
      })]);

      drawStart();
    }

    function drawStart() {
      if (search.total > 500) {
        return redrawStartButton(
          [YDB_api.UI.flash, { type: 'warning' }, 'Only 500 images at most are allowed'],
        );
      }
      if (search.total < 1) {
        return redrawStartButton(
          [YDB_api.UI.flash, { type: 'warning' }, 'Nothing to be processed'],
        );
      }
      if (processors.length < 1) {
        return redrawStartButton(
          [YDB_api.UI.flash, { type: 'warning' }, 'No selected processors'],
        );
      }

      redrawStartButton(
        [YDB_api.UI.block, { headless: true }, [
          [YDB_api.UI.button, {
            onclick: (e) => {
              e.preventDefault();
              e.stopPropagation();
              processImages();
            },
          }, 'Process'],
        ]],
      );
    }

    return [
      [formElement, { data: search }, [
        [YDB_api.UI.input, { type: 'password', label: 'API key', name: 'apiKey' }],
        [YDB_api.UI.textarea, { name: 'query', label: 'Search query', fullWidth: true }],
        [YDB_api.UI.select, { options: [
          { name: 'Exclude deleted', value: '' },
          { name: 'Include Deleted/Merged', value: '1' },
          { name: 'Deleted Only', value: 'deleted' },
          { name: 'Deleted/Merged Only', value: 'only' },
        ], name: 'del' }],
        [YDB_api.UI.button, { onclick: async () => {
          search.total = (await YDB_api.searchImages(search.query, { key: search.apiKey, del: search.del })).total;
          drawStart();
        } }, 'Validate'],
        [YDB_api.UI.input, { label: 'Images to be affected', disabled: true, name: 'total' }],
        [YDB_api.UI.input, { label: 'Retrieved', disabled: true, name: 'got' }],
      ]],

      ['', { _redraw: (redrawFunc) => redrawPostprocessors = redrawFunc }],

      [YDB_api.UI.block, { headless: true }, [
        [formElement, { data: {}, onchange: (data) => {
          const index = parseInt(data.index);
          if (index !== -1) {
            processors.push(
              Object.assign({}, definedProcessors[index], {
                defaultData: Object.assign({}, definedProcessors[index].defaultData)
              })
            );
            data.index = -1;
          }
          drawProcessors();
        }}, [
          [YDB_api.UI.select, {
            name: 'index',
            options: [{ name: '', value: '-1' }].concat(
              definedProcessors.map((proc, i) => ({ name: proc.name, value: i }))
            ),
          }],
        ]],
      ]],

      ['', { _redraw: (redrawFunc) => redrawStartButton = redrawFunc }],
    ];
  }

  YDB_api.pages.add('abp', YDB_ABP);
})();
