var YDB_api = YDB_api || {};

(function() {
  YDB_api.UI.tagInput = props => {

    // derpibooru's code
    function c() {
      Array.from(arguments || []).forEach(function(e) {
        return e.parentNode.removeChild(e)
      })
    }

    function nextUntil(css, e) {
      while (e = e.nextSibling && e) {
        if (e.matches(css)) return e;
      }
    }

    function o(e, t = document) {
      return Array.from(t.querySelectorAll(e) || []);
    }

    function d(e) {
      return e.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
    }

    function i(e, t = document) {
      return t.querySelector(e) || null
    }
    function s() {
      Array.from(arguments || []).forEach(function(e) {
        while (e.firstChild) {
          e.removeChild(e.firstChild)
        }
      })
    }
    function a() {
      Array.from(arguments || []).forEach(function(e) {
        return e?.classList?.remove("hidden")
      })
    }
    function r() {
      Array.from(arguments || []).forEach(function(e) {
        return e?.classList?.add("hidden")
      })
    }

    function Z(e) {
      var event = new Event('change');
      var t = o(".js-taginput", e),
          n = t[0],
          u = t[1],
          l = i(".js-tag-block ~ button", e.parentNode),
          f = i("input", u),
          p = [],
          tagLink;

      function h(e) {
        if ((e = e.trim()).length && -1 === p.indexOf(e)) {
          if ("-" === e[0]) {
            e = e.slice(1);
            tagLink = i('[data-tag-name="' + (e.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"]'), u);
            return m(e, tagLink.parentNode);
          }
          p.push(e);
          n.value = p.join(", ");
          var t = '<span class="tag">' + d(e) + ' <a href="#" data-click-focus=".js-taginput-input" data-tag-name="' + d(e) + '">x</a></span>';
          f.insertAdjacentHTML("beforebegin", t);
          f.value = "";
          n.dispatchEvent(event);
        }
      }

      function m(e, t) {
        c(t);
        p.splice(p.indexOf(e), 1);
        n.value = p.join(", ");
      }

      function v() {
        s(u);
        u.appendChild(f);
        p = [];
        n.value.split(",").forEach(function(e) {
          return h(e)
        });
        n.value = p.join(", ");
        n.dispatchEvent(event);
      }
      l.addEventListener("click", v);
      n.addEventListener("addtag", function(e) {
        if (u.classList.contains("hidden")) return;
        h(e.detail.name);
        e.stopPropagation()
      });
      n.addEventListener("reload", v);
      e.addEventListener("click", function(e) {
        e.target.dataset.tagName && (e.preventDefault(),
                                     m(e.target.dataset.tagName, e.target.parentNode))
      });
      f.addEventListener("keydown", function(e) {
        var t = e.keyCode,
            n = e.ctrlKey,
            o = e.shiftKey;
        if (13 === t && n && "" === f.value) return;
        if (8 === t && "" === f.value) {
          e.preventDefault();
          var a = i(".tag:last-of-type", u);
          a && m(p[p.length - 1], a)
        }
        (13 === t || 188 === t && !o) && (e.preventDefault(),
                                          f.value.split(",").forEach((function(e) {
          return h(e)
        })),
                                          f.value = "")
      });
      f.addEventListener("autocomplete", function(e) {
        h(e.detail.value);
        f.focus()
      });
      e.addEventListener("keydown", function(t) {
        var n = t.keyCode,
            o = t.ctrlKey;
        if (13 !== n || !o) return;
        i('[type="submit"]', e.closest("form")).click()
      });
      (async function(e) {
        const booru = await YDB_api.booru();
        return booru.fancyTagUpload && e.classList.contains("fancy-tag-upload") || booru.fancyTagEdit && e.classList.contains("fancy-tag-edit")
      })(e) && (a(o(".js-taginput-fancy")),
                a(o(".js-taginput-hide")),
                r(o(".js-taginput-plain")),
                r(o(".js-taginput-show")),
                v())
    }


    // component
    const { label, fieldLabel, value, _redraw, fancy = true, ...otherProps } = props;
    const cl = otherProps.id || `${otherProps.name}-${Math.floor(Math.random() * 10000)}` || '';

    let field;

    return ['.field', { _cast: e => {
      Z(e.querySelector('.js-tag-block'));
    }, _redraw }, [
      label ? ['label', label + ' '] : null,
      ['.js-tag-block.fancy-tag-edit', [
        ['textarea.input.input--wide.tagsinput.js-image-input.js-taginput.js-taginput-plain',
         {
           ...otherProps,
           className: cl + (fancy ? ' hidden' : ''),
           placeholder: 'Add tags separated with commas',
         },
        ],
        ['.js-taginput.input.input--wide.tagsinput.js-taginput-fancy', { className: cl, dataset: { clickFocus: `.js-taginput-input.${cl}` } }, [
          ['input.input.js-taginput-input',
           {
             type: 'text',
             className: cl + (fancy ? '' : ' hidden'),
             placeholder: 'add a tag',
             autocapitalize: 'none',
             autocomplete: 'off',
             dataset: {
               ac: true,
               acMinLength: 3,
               acSource: '/autocomplete/tags?term=',
             },
           },
          ]
        ]]
      ]],
      [YDB_api.UI.button,
       {
         state: 'primary',
         bold: true,
         className: 'js-taginput-show ' + cl + (fancy ? ' hidden' : ''),
         dataset: {
           clickFocus: `.js-taginput-input.${cl}`,
           clickHide: `.js-taginput-plain.${cl},.js-taginput-show.${cl}`,
           clickShow: `.js-taginput-fancy.${cl},.js-taginput-hide.${cl}`,
         },
       },
       'Fancy Editor ',
      ],
      [YDB_api.UI.button,
       {
         state: 'primary',
         bold: true,
         className: 'js-taginput-hide ' + cl + (fancy ? '' : ' hidden'),
         dataset: {
           clickFocus: `.js-taginput-plain.${cl}`,
           clickHide: `.js-taginput-fancy.${cl},.js-taginput-hide.${cl}`,
           clickShow: `.js-taginput-plain.${cl},.js-taginput-show.${cl}`,
         },
       },
       'Plain Editor ',
      ],
      fieldLabel ? ['div', [
        ['i', fieldLabel],
      ]] : null,
    ]];
  }
})();
