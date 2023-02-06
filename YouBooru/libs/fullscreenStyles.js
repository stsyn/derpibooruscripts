let styles = {};

styles.general = `
#footer #footer_content {
  flex-direction: row !important;
}
#_fs_main {
  display: inline !important;
}

#_ydb_fs_mainPopup.active {
  position: relative;
  display: flex;
  flex-direction: column;
}

footer {
  position: absolute;
  bottom: 0;
  width: calc(100% - 12px);
}

._fs #footer {
  background: none
}

#content>.block:first-child,
.flash--site-notice {
  height: 0;
  margin: 0;
  padding: 0;
}

#content>.block:first-child {
  z-index: 201;
  width: 100%;
  position: fixed;
}

.image-show-container .block--warning {
  margin: auto;
}

#content {
  margin: 0;
  padding: 0;
  padding-left: 0 !important;
}

.layout--narrow>h4 {
  display: none
}

#content>.block:first-child>* a.js-rand,
#content>.block:first-child>* a.js-up,
#content>.block:first-child>* a.js-prev i,
#content>.block:first-child>* a.js-next i {
  display: none;
}

#content>.block:first-child>* a.js-prev,
#content>.block:first-child>* a.js-next {
  position: fixed;
  top: 0;
  height: 100%;
  width: 10%;
  box-sizing: border-box;
}

#content>.block:first-child>* a.js-prev {
  left: 0;
}

#content>.block:first-child>* a.js-next {
  right: 0;
}

.center--layout--flex .image-show-container {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  min-width: 100%;
  min-height: 100%;
  z-index: 200;
}

._fs_popup_back {
  backdrop-filter: blur(0);
  position: fixed;
  opacity: 0;
  pointer-events: none;
  transition: 0.15s;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 400;
  background: rgba(0, 0, 0, .5);
}

._fs_popup {
  display: none;
  margin: auto;
  overflow-y: auto;
}

._fs_popup_big {
  max-width: 1000px;
  height: 80vh;
  margin-top: 10vh;
}

._fs_popup_vbig {
  width: 95vw;
  height: 80vh;
  margin-top: 10vh;
}

._fs_popup.active {
  display: block;
}

._fs_popup_back.active {
  backdrop-filter: blur(2px);
  opacity: 1;
  pointer-events: all;
}

._fs_down {
  display: none;
}

#image_target,
#image_target>picture {
  min-height: 100vh;
  min-width: 100vw;
  display: block;
}

#image_target>video {
  max-height: none;
  max-width: none;
  display: block;
}

#image_target>picture>* {
  max-height: none;
  max-width: none;
  margin: auto;
  display: block;
}

.block__header__title {
  text-shadow: 0 0 0.15em #fff;
  font-size: 100%;
  line-height: 175%;
}

body[data-theme*="dark"] .block__header__title {
  text-shadow: 0 0 0.15em #000;
}

#content>.block:first-child>*,
#content>.block:first-child>* a:not(.active) {
  background: none;
}

#image_target {
  position: fixed;
  top: 0;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

#_fs_scroll_bot,
#_fs_scroll_rgt {
  background: none;
  border-radius: 5px;
  display: block;
  position: fixed;
  z-index: 201;
}

#_fs_scroll_bot {
  height: 10px;
  bottom: 3px
}

#_fs_scroll_rgt {
  width: 10px;
  right: 3px
}
`;

styles.keepVanila = ` 
#content>.block:first-child>*>div {
  text-align: center;
  width: 100%;
  font-size: 150%;
  line-height: 175%;
  z-index: 2;
}

#content>.block:first-child>*>.interaction--comments:hover,
#_fs_main:hover {
  color: #e0e0e0;
}

#content>.block:first-child>*>.block__header__title:hover {
  color: #000;
  transition-duration: 0.1s;
  transition-timing-function: ease-in-out;
}

#content>.block:first-child>.block__header--sub .image_uploader,
#content>.block:first-child>.block__header--sub time,
#content>.block:first-child>* [class*="js-notification-Image"],
#content>.block:first-child>* [href*="/related"],
#content>.block:first-child>* [href*="/view/"],
#content>.block:first-child>* [href*="/download/"],
.image-metabar>div:nth-child(3),
.image-metabar span[data-click-preventdefault="true"] {
  display: none;
}

#content>.block:first-child>* a.ydb_top_right_link {
  right: 0;
  position: fixed;
  z-index: 202;
  opacity: 0.3;
  display: inline;
  top: 0;
}

.image-size {
  text-shadow: 0 0 0.15em #fff, 0 0 0.15em #fff;
  right: 0;
  position: absolute;
  z-index: 202;
  opacity: 0.4;
  display: inline;
  top: 2.2em;
}

body[data-theme*="dark"] .image-size {
  text-shadow: 0 0 0.15em #000, 0 0 0.15em #000;
}

#content>.block:first-child>* [href*="/download/"]:hover {
  opacity: .7;
}

`;
styles.base=` #content>.block:first-child {
  top: 0;
  height: auto;
  background: none;
  width: 100%;
}

#content>.block:first-child>.block__header--sub {
  float: right;
  width: auto;
  opacity: 0.2;
}

#content>.block:first-child>.block__header>div {
  text-align: center;
  width: 100%;
  font-size: 150%;
  line-height: 175%;
  z-index: 2;
}

#content>.block:first-child>*>.block__header__title {
  font-size: 100%;
  line-height: 100%;
  transition-duration: 0.1s;
  transition-timing-function: ease-in-out;
  color: #e0e0e0;
}

.block__header__title {
  text-shadow: 0 0 0.15em #fff;
  font-size: 100%;
  line-height: 175%;
}

body[data-theme*="dark"] .block__header__title {
  text-shadow: 0 0 0.15em #000;
}

#content>.block:first-child>.block__header>.interaction--comments:hover,
#_fs_main:hover {
  color: #e0e0e0;
}

#content>.block:first-child>.block__header>.block__header__title:hover {
  color: #000;
  transition-duration: 0.1s;
  transition-timing-function: ease-in-out;
}

#content>.block:first-child>.block__header--sub .image_uploader,
#content>.block:first-child>.block__header--sub time,
#content>.block:first-child>.block__header [class*="js-notification-Image"],
#content>.block:first-child>.block__header [href*="/related"],
#content>.block:first-child>.block__header [href*="/view/"],
#content>.block:first-child>.block__header [href*="/download/"] {
  display: none;
}

#content>.block:first-child>.block__header a.ydb_top_right_link {
  right: 0;
  position: absolute;
  z-index: 202;
  opacity: 0.3;
  display: inline;
  top: 0;
}

#content>.block:first-child>.block__header>div>.image-size {
  right: 0;
  position: absolute;
  font-size: 70%;
  z-index: 202;
  opacity: 0.3;
  display: inline;
  top: 2em;
}

body[data-theme*="dark"] #content>.block:first-child>.block__header>div>.image-size {
  text-shadow: 0 0 0.15em #000, 0 0 0.15em #000;
}

#content>.block:first-child>.block__header [href*="/download/"]:hover {
  opacity: .7;
}

#content .image-show-container .block--warning {
  max-width: 800px;
}
`;

styles.ex = `
#content .image-show-container .block--warning {
  margin-top: 6em;
}

._fs_down {
  transition: .3s;
  display: block;
  width: 100%;
  z-index: 300;
  bottom: 0;
  height: 1vh;
  overflow: hidden;
  position: fixed;
  left: 0;
}

._fs_down_container {
  transition: .3s;
  max-width: 1000px;
  margin: auto;
  height: 0.5vh;
  margin-top: 0.5vh;
}

._fs_down_back {
  transition: .3s;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  z-index: -1;
  opacity: .8;
}

#_fs_top_bg {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  opacity: .5;
  height: 4em;
}

._fs_down.active {
  height: 66vh;
}

._fs_down.active ._fs_down_container {
  margin-top: 1vh;
  height: 55vh;
  overflow-y: auto;
  padding-bottom: 11vh;
}

._fs_down.active ._fs_down_back {
  height: 100%;
  top: 0;
}

`;
styles.hider=` ._ydb_fs_static #content>.block:first-child>*,
._ydb_fs_static ._fs_down {
  opacity: 0;
  transition: .5s;
}

`;

styles.imageZoom = `
#_fs_scroll_bot,
#_fs_scroll_rgt {
  background: RGBA(192, 192, 192, 0.5);
  transition: 0.1s;
  transition-timing-function: linear;
}

#image-display {
  transition: 0.1s;
  transition-timing-function: linear;
}

#image_target>video {
  min-height: 0;
  min-width: 0;
  max-height: none;
  max-width: none;
  margin: auto;
}
`;

styles.hideAll = `
.block,
._fs_down {
  display: none
}
`;

styles.colorAccentTemplate = ` 
*:not(.dnp-warning)>*:not(.tag)>a:not(.header__link):not([rel="dc:source"]):not(.button):not(.block__header):not(.tag__name):not(.interaction--hide):not(.interaction--fave):not(.interaction--comments):not(.interaction--upvote):not(.interaction--downvote),
.button.button--link,
.button.button--link:visited {
  color: _fs_color;
}


/*p>a {
color:_fs_color !important;
}*/

#content .communication__body .spoiler:not(:hover) a[href],
.image-description .spoiler:not(:hover) a[href] {
  color: #e88585 !important
}

body[data-theme*="dark"] #content .communication__body .spoiler:not(:hover) a[href],
body[data-theme*="dark"] .image-description .spoiler:not(:hover) a[href] {
  color: #782c21 !important
}

.autocomplete__item:not(.autocomplete__item--selected),
.header,
#burger a:hover,
header a.header__link,
span.header__link-user__dropdown-arrow,
.add-to-gallery-list ::-webkit-scrollbar-thumb,
span.header__link-user__dropdown-arrow:hover,
.header__dropdown:hover span.header__link-user__dropdown-arrow,
.sparkline .bar,
.poll-bar__fill:not(.poll-bar__fill--top) {
  background-color: _fs_ccomponent;
}

.border-vertical,
.block__header--js-tabbed a:hover,
.image-description,
#imagespns,
.block__header--js-tabbed,
.block__header--js-tabbed a.selected,
.block__header--js-tabbed a.selected:hover,
.button:not(.commission__category):not(.button--state-warning):not(.button--state-danger):not(.button--state-success),
.toggle-box+label,
.block__list a.block__list__link,
.block__list,
.input,
.communication__toolbar__button,
.tag-info__image,
#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked+.scraper-preview--image-wrapper,
.block__header--js-tabbed a,
.block__header--js-tabbed a:last-child,
.block__header--js-tabbed a:first-child,
.block--fixed:not(.block--success):not(.block--warning),
.media-box,
.filter,
.poll-bar {
  border-color: _fs_background;
}

#container,
.block__content .profile-top__options ul li a {
  background: none
}

hr {
  background-color: _fs_background;
}

body,
.image-description,
#imagespns,
.block__content,
.block__tab,
.block__header--js-tabbed a.selected,
.block__header--js-tabbed a.selected:hover,
.toggle-box+label,
a.header__search__button:hover,
button.header__search__button:hover,
.input,
.communication__toolbar__button,
.tag__dropdown__link:hover,
.block--fixed:not(.block--success):not(.block--warning),
.filter,
#burger a,
#burger,
.alternating-color:nth-child(odd),
.table>thead>tr,
.table>tbody>tr:nth-child(odd),
.poll-bar,
.block__content .profile-top__options ul li:hover {
  background: _fs_component;
}

#footer,
.alternating-color:nth-child(even),
.table>tbody>tr:nth-child(even),
.block__header--sub,
.block__header--sub a,
.block__content>.label.label--primary.label--block,
.block__header--single-item>span,
.block__header--single-item a,
.block__header--sub>span,
.block__header--sub a,
.header__span,
.block__content .profile-top__options ul li {
  background: _fs_4component;
}

.header--secondary>.flex>.hide-mobile a.header__link:hover,
.header--secondary .header__dropdown:hover>a,
.input:focus,
.communication__toolbar__button:hover,
.tag__dropdown__link,
.block__header,
.block__header--single-item,
.block__header a,
.block__list a.block__list__link,
.communication__options,
.button:not(.commission__category):not(.button--state-warning):not(.button--state-danger):not(.button--state-success),
a.media-box__header--link:hover,
.header--secondary span.header__counter,
#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked+.scraper-preview--image-wrapper,
.interaction--downvote.disabled,
.interaction--downvote.disabled:hover,
.block__content>.label.label--primary.label--block:hover,
.poll-form__options__label {
  background: _fs_2component;
}

.rule h2,
.quick-tag-table__tab>div,
.poll-form__options__label {
  border-color: _fs_2component;
}

.input:focus,
.communication:target,
.communication__toolbar__button:focus,
.communication__toolbar__button:hover,
.communication__toolbar__button:active,
.communication__toolbar__button:visited,
.sparkline {
  border-color: _fs_color;
}

.barline__bar {
  fill: _fs_color;
}

a:not(.header__link):not([rel="dc:source"]):not(.button):not(.block__header):not(.block__header--single-item):not(.tag__name):not(.interaction--fave):not(.interaction--comments):not(.interaction--upvote):not(.interaction--hide):not(.interaction--downvote):not(.media-box__header--link):hover {
  color: #aaa !important;
}

body[data-theme*="dark"] a:not(.header__link):not([rel="dc:source"]):not(.button):not(.block__header):not(.block__header--single-item):not(.tag__name):not(.interaction--fave):not(.interaction--comments):not(.interaction--upvote):not(.interaction--downvote):not(.media-box__header--link):hover {
  color: #aaa !important;
}

.media-box__header:not(.media-box__header--unselected),
.button:hover:not(.button--state-danger):not(.button--state-warning):not(.button--state-success),
.toggle-box+label:hover,
.header--secondary,
.header--secondary>.flex>.hide-mobile a,
.block__list a.block__list__link.primary,
select.header__input:hover,
select.header__input:focus:hover,
span.header__counter {
  background-color: _fs_background;
  border-color: _fs_color;
}

header a.header__link:hover,
.header__dropdown:hover>a,
 ::selection {
  background: _fs_color;
}

.block__header__dropdown-tab:hover>a,
a.block__header--single-item:hover,
.block__header a:hover,
.block__header--sub a:hover,
.block__header--single-item a:hover,
.rule h2 {
  background: _fs_3component;
}

.button--link:hover,
div.tag-list span.source_url a:not(.header__link):hover {
  color: _fs_ccomponent !important;
}

.header__input,
.header__input:focus,
select.header__input,
select.header__input:focus,
a.header__search__button,
button.header__search__button,
select.header__input:hover,
select.header__input:focus:hover,
body[data-theme*="default"] .flash.flash--site-notice {
  background-color: _fs_icomponent;
}

.block__content,
.block__content:last-child,
.block__content:first-child,
.table,
.table>tbody,
.block__tab,
.block__tab:not(.hidden),
.block__content>.label.label--primary.label {
  border-color: _fs_2component;
}

.block__header--js-tabbed {
  background: none
}

#_fs_pony_mark {
  width: 100%;
  height: 100%;
  position: fixed;
  background-position: bottom right;
  background-repeat: no-repeat;
  background-size: contain;
  top: 0;
  left: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.25;
}
`;

styles.adc_pixel=`
#image_target {
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}
`;

styles.webm=`

video#image-display::-webkit-media-controls-panel {
  padding: 0 10%;
}
`;
