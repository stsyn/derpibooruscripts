// ==UserScriptLib==
// @name         YourBooru:Settings
// @version      0.9.30L
// @description  Global library script for YourBooru script family
// @grant	     unsafeWindow
// @grant        GM_addStyle
// @author       stsyn
// ==/UserScriptLib==


    // This is beta version
let win = (typeof unsafeWindow == 'undefined' ? window : unsafeWindow);
if (/(www\.|)(derpi|trixie)booru\.org/.test(location.hostname) && (win.self === win.top)) {
  let main = function() {

  //https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
  if (typeof addElem == 'undefined') function addElem(e,l,n){return n.appendChild(InfernoAddElem(e,l,[]))}
  if (typeof ChildsAddElem == 'undefined') function ChildsAddElem(e,l,n,t){return n.appendChild(InfernoAddElem(e,l,t))}
  if (typeof InfernoAddElem == 'undefined') function InfernoAddElem(e,t,d){var l;if(void 0===t&&(t={}),"string"==typeof t&&(t={innerHTML:t}),void 0===d&&Array.isArray(t)&&(d=t,t={}),null!=t&&null!=t.id&&null!=document.getElementById(t.id))if(0==document.querySelectorAll(e+"#"+t.id).length)(l=document.getElementById(t.id)).parentNode.removeChild(l),l=document.createElement(e);else for(l=document.getElementById(t.id);l.firstChild;)l.removeChild(l.firstChild);else l=document.createElement(e);for(let e in t)"events"==e||"dataset"==e||"innerHTML"==e||"checked"==e||"disabled"==e||"value"==e||"selected"==e||"className"==e||"style"==e&&"object"==typeof t.style||l.setAttribute(e,t[e]);if(void 0!==t.dataset)for(let e in t.dataset)l.dataset[e]=t.dataset[e];if(void 0!==t.className&&(l.className=t.className),void 0!==t.innerHTML&&(l.innerHTML=t.innerHTML),void 0!==t.value&&(l.value=t.value),void 0!==t.checked&&(l.checked=t.checked),void 0!==t.selected&&(l.selected=t.selected),void 0!==t.disabled&&(l.disabled=t.disabled),void 0!==t.events)if(Array.isArray(t.events))t.events.forEach(function(e,t,d){l.addEventListener(e.t,e.f)});else for(let e in t.events)l.addEventListener(e,t.events[e]);if("object"==typeof t.style)for(let e in t.style)l.style[e]=t.style[e];return d&&null!=d.length&&d.forEach(function(e,t,d){l.appendChild(null==e.parentNode?e:e.cloneNode(!0))}),l}

  let scriptId = 'settings';
  let internalVersion = '0.9.30LUW';
  let version = GM_info.script.version;
  let settings;

  try {
    if (typeof unsafeWindow == 'undefined' || typeof GM_addStyle == 'undefined') {
      //it won't work anyway, but maybe we can put some libs inside
      read();
      register(true, (typeof unsafeWindow == 'undefined' ? window : unsafeWindow));
      return;
    }
    if (unsafeWindow._YDB_public.settings[scriptId] != undefined) return;
  }
  catch(e){}

  //https://github.com/LZMA-JS/LZMA-JS/raw/master/src/lzma_worker-min.js
  var e=function(){"use strict";function r(e,r){postMessage({action:xt,cbn:r,result:e})}function t(e){var r=[];return r[e-1]=void 0,r}function o(e,r){return i(e[0]+r[0],e[1]+r[1])}function n(e,r){return u(~~Math.max(Math.min(e[1]/Ot,2147483647),-2147483648)&~~Math.max(Math.min(r[1]/Ot,2147483647),-2147483648),c(e)&c(r))}function s(e,r){var t,o;return e[0]==r[0]&&e[1]==r[1]?0:(t=0>e[1],o=0>r[1],t&&!o?-1:!t&&o?1:h(e,r)[1]<0?-1:1)}function i(e,r){var t,o;for(r%=0x10000000000000000,e%=0x10000000000000000,t=r%Ot,o=Math.floor(e/Ot)*Ot,r=r-t+o,e=e-o+t;0>e;)e+=Ot,r-=Ot;for(;e>4294967295;)e-=Ot,r+=Ot;for(r%=0x10000000000000000;r>0x7fffffff00000000;)r-=0x10000000000000000;for(;-0x8000000000000000>r;)r+=0x10000000000000000;return[e,r]}function _(e,r){return e[0]==r[0]&&e[1]==r[1]}function a(e){return e>=0?[e,0]:[e+Ot,-Ot]}function c(e){return e[0]>=2147483648?~~Math.max(Math.min(e[0]-Ot,2147483647),-2147483648):~~Math.max(Math.min(e[0],2147483647),-2147483648)}function u(e,r){var t,o;return t=e*Ot,o=r,0>r&&(o+=Ot),[o,t]}function f(e){return 30>=e?1<<e:f(30)*f(e-30)}function m(e,r){var t,o,n,s;if(r&=63,_(e,Ht))return r?Gt:e;if(0>e[1])throw Error("Neg");return s=f(r),o=e[1]*s%0x10000000000000000,n=e[0]*s,t=n-n%Ot,o+=t,n-=t,o>=0x8000000000000000&&(o-=0x10000000000000000),[n,o]}function d(e,r){var t;return r&=63,t=f(r),i(Math.floor(e[0]/t),e[1]/t)}function p(e,r){var t;return r&=63,t=d(e,r),0>e[1]&&(t=o(t,m([2,0],63-r))),t}function h(e,r){return i(e[0]-r[0],e[1]-r[1])}function P(e,r){return e.Mc=r,e.Lc=0,e.Yb=r.length,e}function l(e){return e.Lc>=e.Yb?-1:255&e.Mc[e.Lc++]}function v(e,r,t,o){return e.Lc>=e.Yb?-1:(o=Math.min(o,e.Yb-e.Lc),M(e.Mc,e.Lc,r,t,o),e.Lc+=o,o)}function B(e){return e.Mc=t(32),e.Yb=0,e}function S(e){var r=e.Mc;return r.length=e.Yb,r}function g(e,r){e.Mc[e.Yb++]=r<<24>>24}function k(e,r,t,o){M(r,t,e.Mc,e.Yb,o),e.Yb+=o}function R(e,r,t,o,n){var s;for(s=r;t>s;++s)o[n++]=e.charCodeAt(s)}function M(e,r,t,o,n){for(var s=0;n>s;++s)t[o+s]=e[r+s]}function D(e,r){Ar(r,1<<e.s),r.n=e.f,Hr(r,e.m),r.eb=0,r.fb=3,r.Y=2,r.y=3}function b(r,t,o,n,i){var _,a;if(s(n,At)<0)throw Error("invalid length "+n);for(r.Tb=n,_=Dr({}),D(i,_),_.Gc=void 0===e.disableEndMark,Gr(_,o),a=0;64>a;a+=8)g(o,255&c(d(n,a)));r.yb=(_.W=0,_.oc=t,_.pc=0,Mr(_),_.d.Ab=o,Fr(_),wr(_),br(_),_.$.rb=_.n+1-2,Qr(_.$,1<<_.Y),_.i.rb=_.n+1-2,Qr(_.i,1<<_.Y),void(_.g=Gt),X({},_))}function w(e,r,t){return e.Nb=B({}),b(e,P({},r),e.Nb,a(r.length),t),e}function E(e,r,t){var o,n,s,i,_="",c=[];for(n=0;5>n;++n){if(s=l(r),-1==s)throw Error("truncated input");c[n]=s<<24>>24}if(o=ir({}),!ar(o,c))throw Error("corrupted input");for(n=0;64>n;n+=8){if(s=l(r),-1==s)throw Error("truncated input");s=s.toString(16),1==s.length&&(s="0"+s),_=s+""+_}/^0+$|^f+$/i.test(_)?e.Tb=At:(i=parseInt(_,16),e.Tb=i>4294967295?At:a(i)),e.yb=nr(o,r,t,e.Tb)}function L(e,r){return e.Nb=B({}),E(e,P({},r),e.Nb),e}function y(e,r,o,n){var s;e.Bc=r,e._b=o,s=r+o+n,(null==e.c||e.Kb!=s)&&(e.c=null,e.Kb=s,e.c=t(e.Kb)),e.H=e.Kb-o}function C(e,r){return e.c[e.f+e.o+r]}function z(e,r,t,o){var n,s;for(e.T&&e.o+r+o>e.h&&(o=e.h-(e.o+r)),++t,s=e.f+e.o+r,n=0;o>n&&e.c[s+n]==e.c[s+n-t];++n);return n}function F(e){return e.h-e.o}function I(e){var r,t,o;for(o=e.f+e.o-e.Bc,o>0&&--o,t=e.f+e.h-o,r=0;t>r;++r)e.c[r]=e.c[o+r];e.f-=o}function x(e){var r;++e.o,e.o>e.zb&&(r=e.f+e.o,r>e.H&&I(e),N(e))}function N(e){var r,t,o;if(!e.T)for(;;){if(o=-e.f+e.Kb-e.h,!o)return;if(r=v(e.cc,e.c,e.f+e.h,o),-1==r)return e.zb=e.h,t=e.f+e.zb,t>e.H&&(e.zb=e.H-e.f),void(e.T=1);e.h+=r,e.h>=e.o+e._b&&(e.zb=e.h-e._b)}}function O(e,r){e.f+=r,e.zb-=r,e.o-=r,e.h-=r}function A(e,r,o,n,s){var i,_,a;1073741567>r&&(e.Fc=16+(n>>1),a=~~((r+o+n+s)/2)+256,y(e,r+o,n+s,a),e.ob=n,i=r+1,e.p!=i&&(e.L=t(2*(e.p=i))),_=65536,e.qb&&(_=r-1,_|=_>>1,_|=_>>2,_|=_>>4,_|=_>>8,_>>=1,_|=65535,_>16777216&&(_>>=1),e.Ec=_,++_,_+=e.R),_!=e.rc&&(e.ub=t(e.rc=_)))}function H(e,r){var t,o,n,s,i,_,a,c,u,f,m,d,p,h,P,l,v,B,S,g,k;if(e.h>=e.o+e.ob)h=e.ob;else if(h=e.h-e.o,e.xb>h)return W(e),0;for(v=0,P=e.o>e.p?e.o-e.p:0,o=e.f+e.o,l=1,c=0,u=0,e.qb?(k=Tt[255&e.c[o]]^255&e.c[o+1],c=1023&k,k^=(255&e.c[o+2])<<8,u=65535&k,f=(k^Tt[255&e.c[o+3]]<<5)&e.Ec):f=255&e.c[o]^(255&e.c[o+1])<<8,n=e.ub[e.R+f]||0,e.qb&&(s=e.ub[c]||0,i=e.ub[1024+u]||0,e.ub[c]=e.o,e.ub[1024+u]=e.o,s>P&&e.c[e.f+s]==e.c[o]&&(r[v++]=l=2,r[v++]=e.o-s-1),i>P&&e.c[e.f+i]==e.c[o]&&(i==s&&(v-=2),r[v++]=l=3,r[v++]=e.o-i-1,s=i),0!=v&&s==n&&(v-=2,l=1)),e.ub[e.R+f]=e.o,S=(e.k<<1)+1,g=e.k<<1,d=p=e.w,0!=e.w&&n>P&&e.c[e.f+n+e.w]!=e.c[o+e.w]&&(r[v++]=l=e.w,r[v++]=e.o-n-1),t=e.Fc;;){if(P>=n||0==t--){e.L[S]=e.L[g]=0;break}if(a=e.o-n,_=(e.k>=a?e.k-a:e.k-a+e.p)<<1,B=e.f+n,m=p>d?d:p,e.c[B+m]==e.c[o+m]){for(;++m!=h&&e.c[B+m]==e.c[o+m];);if(m>l&&(r[v++]=l=m,r[v++]=a-1,m==h)){e.L[g]=e.L[_],e.L[S]=e.L[_+1];break}}(255&e.c[o+m])>(255&e.c[B+m])?(e.L[g]=n,g=_+1,n=e.L[g],p=m):(e.L[S]=n,S=_,n=e.L[S],d=m)}return W(e),v}function G(e){e.f=0,e.o=0,e.h=0,e.T=0,N(e),e.k=0,O(e,-1)}function W(e){var r;++e.k>=e.p&&(e.k=0),x(e),1073741823==e.o&&(r=e.o-e.p,T(e.L,2*e.p,r),T(e.ub,e.rc,r),O(e,r))}function T(e,r,t){var o,n;for(o=0;r>o;++o)n=e[o]||0,t>=n?n=0:n-=t,e[o]=n}function Z(e,r){e.qb=r>2,e.qb?(e.w=0,e.xb=4,e.R=66560):(e.w=2,e.xb=3,e.R=0)}function Y(e,r){var t,o,n,s,i,_,a,c,u,f,m,d,p,h,P,l,v;do{if(e.h>=e.o+e.ob)d=e.ob;else if(d=e.h-e.o,e.xb>d){W(e);continue}for(p=e.o>e.p?e.o-e.p:0,o=e.f+e.o,e.qb?(v=Tt[255&e.c[o]]^255&e.c[o+1],_=1023&v,e.ub[_]=e.o,v^=(255&e.c[o+2])<<8,a=65535&v,e.ub[1024+a]=e.o,c=(v^Tt[255&e.c[o+3]]<<5)&e.Ec):c=255&e.c[o]^(255&e.c[o+1])<<8,n=e.ub[e.R+c],e.ub[e.R+c]=e.o,P=(e.k<<1)+1,l=e.k<<1,f=m=e.w,t=e.Fc;;){if(p>=n||0==t--){e.L[P]=e.L[l]=0;break}if(i=e.o-n,s=(e.k>=i?e.k-i:e.k-i+e.p)<<1,h=e.f+n,u=m>f?f:m,e.c[h+u]==e.c[o+u]){for(;++u!=d&&e.c[h+u]==e.c[o+u];);if(u==d){e.L[l]=e.L[s],e.L[P]=e.L[s+1];break}}(255&e.c[o+u])>(255&e.c[h+u])?(e.L[l]=n,l=s+1,n=e.L[l],m=u):(e.L[P]=n,P=s,n=e.L[P],f=u)}W(e)}while(0!=--r)}function V(e,r,t){var o=e.o-r-1;for(0>o&&(o+=e.M);0!=t;--t)o>=e.M&&(o=0),e.Lb[e.o++]=e.Lb[o++],e.o>=e.M&&$(e)}function j(e,r){(null==e.Lb||e.M!=r)&&(e.Lb=t(r)),e.M=r,e.o=0,e.h=0}function $(e){var r=e.o-e.h;r&&(k(e.cc,e.Lb,e.h,r),e.o>=e.M&&(e.o=0),e.h=e.o)}function K(e,r){var t=e.o-r-1;return 0>t&&(t+=e.M),e.Lb[t]}function q(e,r){e.Lb[e.o++]=r,e.o>=e.M&&$(e)}function J(e){$(e),e.cc=null}function Q(e){return e-=2,4>e?e:3}function U(e){return 4>e?0:10>e?e-3:e-6}function X(e,r){return e.cb=r,e.Z=null,e.zc=1,e}function er(e,r){return e.Z=r,e.cb=null,e.zc=1,e}function rr(e){if(!e.zc)throw Error("bad state");return e.cb?or(e):tr(e),e.zc}function tr(e){var r=sr(e.Z);if(-1==r)throw Error("corrupted input");e.Pb=At,e.Pc=e.Z.g,(r||s(e.Z.Nc,Gt)>=0&&s(e.Z.g,e.Z.Nc)>=0)&&($(e.Z.B),J(e.Z.B),e.Z.e.Ab=null,e.zc=0)}function or(e){Rr(e.cb,e.cb.Xb,e.cb.uc,e.cb.Kc),e.Pb=e.cb.Xb[0],e.cb.Kc[0]&&(Or(e.cb),e.zc=0)}function nr(e,r,t,o){return e.e.Ab=r,J(e.B),e.B.cc=t,_r(e),e.U=0,e.ib=0,e.Jc=0,e.Ic=0,e.Qc=0,e.Nc=o,e.g=Gt,e.jc=0,er({},e)}function sr(e){var r,t,n,i,_,u;if(u=c(e.g)&e.Dc,vt(e.e,e.Gb,(e.U<<4)+u)){if(vt(e.e,e.Zb,e.U))n=0,vt(e.e,e.Cb,e.U)?(vt(e.e,e.Db,e.U)?(vt(e.e,e.Eb,e.U)?(t=e.Qc,e.Qc=e.Ic):t=e.Ic,e.Ic=e.Jc):t=e.Jc,e.Jc=e.ib,e.ib=t):vt(e.e,e.pb,(e.U<<4)+u)||(e.U=7>e.U?9:11,n=1),n||(n=mr(e.sb,e.e,u)+2,e.U=7>e.U?8:11);else if(e.Qc=e.Ic,e.Ic=e.Jc,e.Jc=e.ib,n=2+mr(e.Rb,e.e,u),e.U=7>e.U?7:10,_=at(e.kb[Q(n)],e.e),_>=4){if(i=(_>>1)-1,e.ib=(2|1&_)<<i,14>_)e.ib+=ut(e.kc,e.ib-_-1,e.e,i);else if(e.ib+=Bt(e.e,i-4)<<4,e.ib+=ct(e.Fb,e.e),0>e.ib)return-1==e.ib?1:-1}else e.ib=_;if(s(a(e.ib),e.g)>=0||e.ib>=e.nb)return-1;V(e.B,e.ib,n),e.g=o(e.g,a(n)),e.jc=K(e.B,0)}else r=Pr(e.gb,c(e.g),e.jc),e.jc=7>e.U?vr(r,e.e):Br(r,e.e,K(e.B,e.ib)),q(e.B,e.jc),e.U=U(e.U),e.g=o(e.g,Wt);return 0}function ir(e){e.B={},e.e={},e.Gb=t(192),e.Zb=t(12),e.Cb=t(12),e.Db=t(12),e.Eb=t(12),e.pb=t(192),e.kb=t(4),e.kc=t(114),e.Fb=_t({},4),e.Rb=dr({}),e.sb=dr({}),e.gb={};for(var r=0;4>r;++r)e.kb[r]=_t({},6);return e}function _r(e){e.B.h=0,e.B.o=0,gt(e.Gb),gt(e.pb),gt(e.Zb),gt(e.Cb),gt(e.Db),gt(e.Eb),gt(e.kc),lr(e.gb);for(var r=0;4>r;++r)gt(e.kb[r].G);pr(e.Rb),pr(e.sb),gt(e.Fb.G),St(e.e)}function ar(e,r){var t,o,n,s,i,_,a;if(5>r.length)return 0;for(a=255&r[0],n=a%9,_=~~(a/9),s=_%5,i=~~(_/5),t=0,o=0;4>o;++o)t+=(255&r[1+o])<<8*o;return t>99999999||!ur(e,n,s,i)?0:cr(e,t)}function cr(e,r){return 0>r?0:(e.Ob!=r&&(e.Ob=r,e.nb=Math.max(e.Ob,1),j(e.B,Math.max(e.nb,4096))),1)}function ur(e,r,t,o){if(r>8||t>4||o>4)return 0;hr(e.gb,t,r);var n=1<<o;return fr(e.Rb,n),fr(e.sb,n),e.Dc=n-1,1}function fr(e,r){for(;r>e.O;++e.O)e.ec[e.O]=_t({},3),e.hc[e.O]=_t({},3)}function mr(e,r,t){if(!vt(r,e.wc,0))return at(e.ec[t],r);var o=8;return o+=vt(r,e.wc,1)?8+at(e.tc,r):at(e.hc[t],r)}function dr(e){return e.wc=t(2),e.ec=t(16),e.hc=t(16),e.tc=_t({},8),e.O=0,e}function pr(e){gt(e.wc);for(var r=0;e.O>r;++r)gt(e.ec[r].G),gt(e.hc[r].G);gt(e.tc.G)}function hr(e,r,o){var n,s;if(null==e.V||e.u!=o||e.I!=r)for(e.I=r,e.qc=(1<<r)-1,e.u=o,s=1<<e.u+e.I,e.V=t(s),n=0;s>n;++n)e.V[n]=Sr({})}function Pr(e,r,t){return e.V[((r&e.qc)<<e.u)+((255&t)>>>8-e.u)]}function lr(e){var r,t;for(t=1<<e.u+e.I,r=0;t>r;++r)gt(e.V[r].Ib)}function vr(e,r){var t=1;do t=t<<1|vt(r,e.Ib,t);while(256>t);return t<<24>>24}function Br(e,r,t){var o,n,s=1;do if(n=t>>7&1,t<<=1,o=vt(r,e.Ib,(1+n<<8)+s),s=s<<1|o,n!=o){for(;256>s;)s=s<<1|vt(r,e.Ib,s);break}while(256>s);return s<<24>>24}function Sr(e){return e.Ib=t(768),e}function gr(e,r){var t,o,n,s;e.jb=r,n=e.a[r].r,o=e.a[r].j;do e.a[r].t&&(st(e.a[n]),e.a[n].r=n-1,e.a[r].Ac&&(e.a[n-1].t=0,e.a[n-1].r=e.a[r].r2,e.a[n-1].j=e.a[r].j2)),s=n,t=o,o=e.a[s].j,n=e.a[s].r,e.a[s].j=t,e.a[s].r=r,r=s;while(r>0);return e.mb=e.a[0].j,e.q=e.a[0].r}function kr(e){e.l=0,e.J=0;for(var r=0;4>r;++r)e.v[r]=0}function Rr(e,r,t,n){var i,u,f,m,d,p,P,l,v,B,S,g,k,R,M;if(r[0]=Gt,t[0]=Gt,n[0]=1,e.oc&&(e.b.cc=e.oc,G(e.b),e.W=1,e.oc=null),!e.pc){if(e.pc=1,R=e.g,_(e.g,Gt)){if(!F(e.b))return void Er(e,c(e.g));xr(e),k=c(e.g)&e.y,kt(e.d,e.C,(e.l<<4)+k,0),e.l=U(e.l),f=C(e.b,-e.s),rt(Xr(e.A,c(e.g),e.J),e.d,f),e.J=f,--e.s,e.g=o(e.g,Wt)}if(!F(e.b))return void Er(e,c(e.g));for(;;){if(P=Lr(e,c(e.g)),B=e.mb,k=c(e.g)&e.y,u=(e.l<<4)+k,1==P&&-1==B)kt(e.d,e.C,u,0),f=C(e.b,-e.s),M=Xr(e.A,c(e.g),e.J),7>e.l?rt(M,e.d,f):(v=C(e.b,-e.v[0]-1-e.s),tt(M,e.d,v,f)),e.J=f,e.l=U(e.l);else{if(kt(e.d,e.C,u,1),4>B){if(kt(e.d,e.bb,e.l,1),B?(kt(e.d,e.hb,e.l,1),1==B?kt(e.d,e.Ub,e.l,0):(kt(e.d,e.Ub,e.l,1),kt(e.d,e.vc,e.l,B-2))):(kt(e.d,e.hb,e.l,0),1==P?kt(e.d,e._,u,0):kt(e.d,e._,u,1)),1==P?e.l=7>e.l?9:11:(Kr(e.i,e.d,P-2,k),e.l=7>e.l?8:11),m=e.v[B],0!=B){for(p=B;p>=1;--p)e.v[p]=e.v[p-1];e.v[0]=m}}else{for(kt(e.d,e.bb,e.l,0),e.l=7>e.l?7:10,Kr(e.$,e.d,P-2,k),B-=4,g=Tr(B),l=Q(P),mt(e.K[l],e.d,g),g>=4&&(d=(g>>1)-1,i=(2|1&g)<<d,S=B-i,14>g?Pt(e.Sb,i-g-1,e.d,d,S):(Rt(e.d,S>>4,d-4),pt(e.S,e.d,15&S),++e.Qb)),m=B,p=3;p>=1;--p)e.v[p]=e.v[p-1];e.v[0]=m,++e.Mb}e.J=C(e.b,P-1-e.s)}if(e.s-=P,e.g=o(e.g,a(P)),!e.s){if(e.Mb>=128&&wr(e),e.Qb>=16&&br(e),r[0]=e.g,t[0]=Mt(e.d),!F(e.b))return void Er(e,c(e.g));if(s(h(e.g,R),[4096,0])>=0)return e.pc=0,void(n[0]=0)}}}}function Mr(e){var r,t;e.b||(r={},t=4,e.X||(t=2),Z(r,t),e.b=r),Ur(e.A,e.eb,e.fb),(e.ab!=e.wb||e.Hb!=e.n)&&(A(e.b,e.ab,4096,e.n,274),e.wb=e.ab,e.Hb=e.n)}function Dr(e){var r;for(e.v=t(4),e.a=[],e.d={},e.C=t(192),e.bb=t(12),e.hb=t(12),e.Ub=t(12),e.vc=t(12),e._=t(192),e.K=[],e.Sb=t(114),e.S=ft({},4),e.$=qr({}),e.i=qr({}),e.A={},e.m=[],e.P=[],e.lb=[],e.nc=t(16),e.x=t(4),e.Q=t(4),e.Xb=[Gt],e.uc=[Gt],e.Kc=[0],e.fc=t(5),e.yc=t(128),e.vb=0,e.X=1,e.D=0,e.Hb=-1,e.mb=0,r=0;4096>r;++r)e.a[r]={};for(r=0;4>r;++r)e.K[r]=ft({},6);return e}function br(e){for(var r=0;16>r;++r)e.nc[r]=ht(e.S,r);e.Qb=0}function wr(e){var r,t,o,n,s,i,_,a;for(n=4;128>n;++n)i=Tr(n),o=(i>>1)-1,r=(2|1&i)<<o,e.yc[n]=lt(e.Sb,r-i-1,o,n-r);for(s=0;4>s;++s){for(t=e.K[s],_=s<<6,i=0;e.$b>i;++i)e.P[_+i]=dt(t,i);for(i=14;e.$b>i;++i)e.P[_+i]+=(i>>1)-1-4<<6;for(a=128*s,n=0;4>n;++n)e.lb[a+n]=e.P[_+n];for(;128>n;++n)e.lb[a+n]=e.P[_+Tr(n)]+e.yc[n]}e.Mb=0}function Er(e,r){Nr(e),Wr(e,r&e.y);for(var t=0;5>t;++t)bt(e.d)}function Lr(e,r){var t,o,n,s,i,_,a,c,u,f,m,d,p,h,P,l,v,B,S,g,k,R,M,D,b,w,E,L,y,I,x,N,O,A,H,G,W,T,Z,Y,V,j,$,K,q,J,Q,X,er,rr;if(e.jb!=e.q)return p=e.a[e.q].r-e.q,e.mb=e.a[e.q].j,e.q=e.a[e.q].r,p;if(e.q=e.jb=0,e.N?(d=e.vb,e.N=0):d=xr(e),E=e.D,b=F(e.b)+1,2>b)return e.mb=-1,1;for(b>273&&(b=273),Y=0,u=0;4>u;++u)e.x[u]=e.v[u],e.Q[u]=z(e.b,-1,e.x[u],273),e.Q[u]>e.Q[Y]&&(Y=u);if(e.Q[Y]>=e.n)return e.mb=Y,p=e.Q[Y],Ir(e,p-1),p;if(d>=e.n)return e.mb=e.m[E-1]+4,Ir(e,d-1),d;if(a=C(e.b,-1),v=C(e.b,-e.v[0]-1-1),2>d&&a!=v&&2>e.Q[Y])return e.mb=-1,1;if(e.a[0].Hc=e.l,A=r&e.y,e.a[1].z=Yt[e.C[(e.l<<4)+A]>>>2]+nt(Xr(e.A,r,e.J),e.l>=7,v,a),st(e.a[1]),B=Yt[2048-e.C[(e.l<<4)+A]>>>2],Z=B+Yt[2048-e.bb[e.l]>>>2],v==a&&(V=Z+zr(e,e.l,A),e.a[1].z>V&&(e.a[1].z=V,it(e.a[1]))),m=d>=e.Q[Y]?d:e.Q[Y],2>m)return e.mb=e.a[1].j,1;e.a[1].r=0,e.a[0].bc=e.x[0],e.a[0].ac=e.x[1],e.a[0].dc=e.x[2],e.a[0].lc=e.x[3],f=m;do e.a[f--].z=268435455;while(f>=2);for(u=0;4>u;++u)if(T=e.Q[u],!(2>T)){G=Z+Cr(e,u,e.l,A);do s=G+Jr(e.i,T-2,A),x=e.a[T],x.z>s&&(x.z=s,x.r=0,x.j=u,x.t=0);while(--T>=2)}if(D=B+Yt[e.bb[e.l]>>>2],f=e.Q[0]>=2?e.Q[0]+1:2,d>=f){for(L=0;f>e.m[L];)L+=2;for(;c=e.m[L+1],s=D+yr(e,c,f,A),x=e.a[f],x.z>s&&(x.z=s,x.r=0,x.j=c+4,x.t=0),f!=e.m[L]||(L+=2,L!=E);++f);}for(t=0;;){if(++t,t==m)return gr(e,t);if(S=xr(e),E=e.D,S>=e.n)return e.vb=S,e.N=1,gr(e,t);if(++r,O=e.a[t].r,e.a[t].t?(--O,e.a[t].Ac?($=e.a[e.a[t].r2].Hc,$=4>e.a[t].j2?7>$?8:11:7>$?7:10):$=e.a[O].Hc,$=U($)):$=e.a[O].Hc,O==t-1?$=e.a[t].j?U($):7>$?9:11:(e.a[t].t&&e.a[t].Ac?(O=e.a[t].r2,N=e.a[t].j2,$=7>$?8:11):(N=e.a[t].j,$=4>N?7>$?8:11:7>$?7:10),I=e.a[O],4>N?N?1==N?(e.x[0]=I.ac,e.x[1]=I.bc,e.x[2]=I.dc,e.x[3]=I.lc):2==N?(e.x[0]=I.dc,e.x[1]=I.bc,e.x[2]=I.ac,e.x[3]=I.lc):(e.x[0]=I.lc,e.x[1]=I.bc,e.x[2]=I.ac,e.x[3]=I.dc):(e.x[0]=I.bc,e.x[1]=I.ac,e.x[2]=I.dc,e.x[3]=I.lc):(e.x[0]=N-4,e.x[1]=I.bc,e.x[2]=I.ac,e.x[3]=I.dc)),e.a[t].Hc=$,e.a[t].bc=e.x[0],e.a[t].ac=e.x[1],e.a[t].dc=e.x[2],e.a[t].lc=e.x[3],_=e.a[t].z,a=C(e.b,-1),v=C(e.b,-e.x[0]-1-1),A=r&e.y,o=_+Yt[e.C[($<<4)+A]>>>2]+nt(Xr(e.A,r,C(e.b,-2)),$>=7,v,a),R=e.a[t+1],g=0,R.z>o&&(R.z=o,R.r=t,R.j=-1,R.t=0,g=1),B=_+Yt[2048-e.C[($<<4)+A]>>>2],Z=B+Yt[2048-e.bb[$]>>>2],v!=a||t>R.r&&!R.j||(V=Z+(Yt[e.hb[$]>>>2]+Yt[e._[($<<4)+A]>>>2]),R.z>=V&&(R.z=V,R.r=t,R.j=0,R.t=0,g=1)),w=F(e.b)+1,w=w>4095-t?4095-t:w,b=w,!(2>b)){if(b>e.n&&(b=e.n),!g&&v!=a&&(q=Math.min(w-1,e.n),P=z(e.b,0,e.x[0],q),P>=2)){for(K=U($),H=r+1&e.y,M=o+Yt[2048-e.C[(K<<4)+H]>>>2]+Yt[2048-e.bb[K]>>>2],y=t+1+P;y>m;)e.a[++m].z=268435455;s=M+(J=Jr(e.i,P-2,H),J+Cr(e,0,K,H)),x=e.a[y],x.z>s&&(x.z=s,x.r=t+1,x.j=0,x.t=1,x.Ac=0)}for(j=2,W=0;4>W;++W)if(h=z(e.b,-1,e.x[W],b),!(2>h)){l=h;do{for(;t+h>m;)e.a[++m].z=268435455;s=Z+(Q=Jr(e.i,h-2,A),Q+Cr(e,W,$,A)),x=e.a[t+h],x.z>s&&(x.z=s,x.r=t,x.j=W,x.t=0)}while(--h>=2);if(h=l,W||(j=h+1),w>h&&(q=Math.min(w-1-h,e.n),P=z(e.b,h,e.x[W],q),P>=2)){for(K=7>$?8:11,H=r+h&e.y,n=Z+(X=Jr(e.i,h-2,A),X+Cr(e,W,$,A))+Yt[e.C[(K<<4)+H]>>>2]+nt(Xr(e.A,r+h,C(e.b,h-1-1)),1,C(e.b,h-1-(e.x[W]+1)),C(e.b,h-1)),K=U(K),H=r+h+1&e.y,k=n+Yt[2048-e.C[(K<<4)+H]>>>2],M=k+Yt[2048-e.bb[K]>>>2],y=h+1+P;t+y>m;)e.a[++m].z=268435455;s=M+(er=Jr(e.i,P-2,H),er+Cr(e,0,K,H)),x=e.a[t+y],x.z>s&&(x.z=s,x.r=t+h+1,x.j=0,x.t=1,x.Ac=1,x.r2=t,x.j2=W)}}if(S>b){for(S=b,E=0;S>e.m[E];E+=2);e.m[E]=S,E+=2}if(S>=j){for(D=B+Yt[e.bb[$]>>>2];t+S>m;)e.a[++m].z=268435455;for(L=0;j>e.m[L];)L+=2;for(h=j;;++h)if(i=e.m[L+1],s=D+yr(e,i,h,A),x=e.a[t+h],x.z>s&&(x.z=s,x.r=t,x.j=i+4,x.t=0),h==e.m[L]){if(w>h&&(q=Math.min(w-1-h,e.n),P=z(e.b,h,i,q),P>=2)){for(K=7>$?7:10,H=r+h&e.y,n=s+Yt[e.C[(K<<4)+H]>>>2]+nt(Xr(e.A,r+h,C(e.b,h-1-1)),1,C(e.b,h-(i+1)-1),C(e.b,h-1)),K=U(K),H=r+h+1&e.y,k=n+Yt[2048-e.C[(K<<4)+H]>>>2],M=k+Yt[2048-e.bb[K]>>>2],y=h+1+P;t+y>m;)e.a[++m].z=268435455;s=M+(rr=Jr(e.i,P-2,H),rr+Cr(e,0,K,H)),x=e.a[t+y],x.z>s&&(x.z=s,x.r=t+h+1,x.j=0,x.t=1,x.Ac=1,x.r2=t,x.j2=i+4)}if(L+=2,L==E)break}}}}}function yr(e,r,t,o){var n,s=Q(t);return n=128>r?e.lb[128*s+r]:e.P[(s<<6)+Zr(r)]+e.nc[15&r],n+Jr(e.$,t-2,o)}function Cr(e,r,t,o){var n;return r?(n=Yt[2048-e.hb[t]>>>2],1==r?n+=Yt[e.Ub[t]>>>2]:(n+=Yt[2048-e.Ub[t]>>>2],n+=wt(e.vc[t],r-2))):(n=Yt[e.hb[t]>>>2],n+=Yt[2048-e._[(t<<4)+o]>>>2]),n}function zr(e,r,t){return Yt[e.hb[r]>>>2]+Yt[e._[(r<<4)+t]>>>2]}function Fr(e){kr(e),Dt(e.d),gt(e.C),gt(e._),gt(e.bb),gt(e.hb),gt(e.Ub),gt(e.vc),gt(e.Sb),et(e.A);for(var r=0;4>r;++r)gt(e.K[r].G);jr(e.$,1<<e.Y),jr(e.i,1<<e.Y),gt(e.S.G),e.N=0,e.jb=0,e.q=0,e.s=0}function Ir(e,r){r>0&&(Y(e.b,r),e.s+=r)}function xr(e){var r=0;return e.D=H(e.b,e.m),e.D>0&&(r=e.m[e.D-2],r==e.n&&(r+=z(e.b,r-1,e.m[e.D-1],273-r))),++e.s,r}function Nr(e){e.b&&e.W&&(e.b.cc=null,e.W=0)}function Or(e){Nr(e),e.d.Ab=null}function Ar(e,r){e.ab=r;for(var t=0;r>1<<t;++t);e.$b=2*t}function Hr(e,r){var t=e.X;e.X=r,e.b&&t!=e.X&&(e.wb=-1,e.b=null)}function Gr(e,r){e.fc[0]=9*(5*e.Y+e.eb)+e.fb<<24>>24;for(var t=0;4>t;++t)e.fc[1+t]=e.ab>>8*t<<24>>24;k(r,e.fc,0,5)}function Wr(e,r){if(e.Gc){kt(e.d,e.C,(e.l<<4)+r,1),kt(e.d,e.bb,e.l,0),e.l=7>e.l?7:10,Kr(e.$,e.d,0,r);var t=Q(2);mt(e.K[t],e.d,63),Rt(e.d,67108863,26),pt(e.S,e.d,15)}}function Tr(e){return 2048>e?Zt[e]:2097152>e?Zt[e>>10]+20:Zt[e>>20]+40}function Zr(e){return 131072>e?Zt[e>>6]+12:134217728>e?Zt[e>>16]+32:Zt[e>>26]+52}function Yr(e,r,t,o){8>t?(kt(r,e.db,0,0),mt(e.Vb[o],r,t)):(t-=8,kt(r,e.db,0,1),8>t?(kt(r,e.db,1,0),mt(e.Wb[o],r,t)):(kt(r,e.db,1,1),mt(e.ic,r,t-8)))}function Vr(e){e.db=t(2),e.Vb=t(16),e.Wb=t(16),e.ic=ft({},8);for(var r=0;16>r;++r)e.Vb[r]=ft({},3),e.Wb[r]=ft({},3);return e}function jr(e,r){gt(e.db);for(var t=0;r>t;++t)gt(e.Vb[t].G),gt(e.Wb[t].G);gt(e.ic.G)}function $r(e,r,t,o,n){var s,i,_,a,c;for(s=Yt[e.db[0]>>>2],i=Yt[2048-e.db[0]>>>2],_=i+Yt[e.db[1]>>>2],a=i+Yt[2048-e.db[1]>>>2],c=0,c=0;8>c;++c){if(c>=t)return;o[n+c]=s+dt(e.Vb[r],c)}for(;16>c;++c){if(c>=t)return;o[n+c]=_+dt(e.Wb[r],c-8)}for(;t>c;++c)o[n+c]=a+dt(e.ic,c-8-8)}function Kr(e,r,t,o){Yr(e,r,t,o),0==--e.sc[o]&&($r(e,o,e.rb,e.Cc,272*o),e.sc[o]=e.rb)}function qr(e){return Vr(e),e.Cc=[],e.sc=[],e}function Jr(e,r,t){return e.Cc[272*t+r]}function Qr(e,r){for(var t=0;r>t;++t)$r(e,t,e.rb,e.Cc,272*t),e.sc[t]=e.rb}function Ur(e,r,o){var n,s;if(null==e.V||e.u!=o||e.I!=r)for(e.I=r,e.qc=(1<<r)-1,e.u=o,s=1<<e.u+e.I,e.V=t(s),n=0;s>n;++n)e.V[n]=ot({})}function Xr(e,r,t){return e.V[((r&e.qc)<<e.u)+((255&t)>>>8-e.u)]}function et(e){var r,t=1<<e.u+e.I;for(r=0;t>r;++r)gt(e.V[r].tb)}function rt(e,r,t){var o,n,s=1;for(n=7;n>=0;--n)o=t>>n&1,kt(r,e.tb,s,o),s=s<<1|o}function tt(e,r,t,o){var n,s,i,_,a=1,c=1;for(s=7;s>=0;--s)n=o>>s&1,_=c,a&&(i=t>>s&1,_+=1+i<<8,a=i==n),kt(r,e.tb,_,n),c=c<<1|n}function ot(e){return e.tb=t(768),e}function nt(e,r,t,o){var n,s,i=1,_=7,a=0;if(r)for(;_>=0;--_)if(s=t>>_&1,n=o>>_&1,a+=wt(e.tb[(1+s<<8)+i],n),i=i<<1|n,s!=n){--_;break}for(;_>=0;--_)n=o>>_&1,a+=wt(e.tb[i],n),i=i<<1|n;return a}function st(e){e.j=-1,e.t=0}function it(e){e.j=0,e.t=0}function _t(e,r){return e.F=r,e.G=t(1<<r),e}function at(e,r){var t,o=1;for(t=e.F;0!=t;--t)o=(o<<1)+vt(r,e.G,o);return o-(1<<e.F)}function ct(e,r){var t,o,n=1,s=0;for(o=0;e.F>o;++o)t=vt(r,e.G,n),n<<=1,n+=t,s|=t<<o;return s}function ut(e,r,t,o){var n,s,i=1,_=0;for(s=0;o>s;++s)n=vt(t,e,r+i),i<<=1,i+=n,_|=n<<s;return _}function ft(e,r){return e.F=r,e.G=t(1<<r),e}function mt(e,r,t){var o,n,s=1;for(n=e.F;0!=n;)--n,o=t>>>n&1,kt(r,e.G,s,o),s=s<<1|o}function dt(e,r){var t,o,n=1,s=0;for(o=e.F;0!=o;)--o,t=r>>>o&1,s+=wt(e.G[n],t),n=(n<<1)+t;return s}function pt(e,r,t){var o,n,s=1;for(n=0;e.F>n;++n)o=1&t,kt(r,e.G,s,o),s=s<<1|o,t>>=1}function ht(e,r){var t,o,n=1,s=0;for(o=e.F;0!=o;--o)t=1&r,r>>>=1,s+=wt(e.G[n],t),n=n<<1|t;return s}function Pt(e,r,t,o,n){var s,i,_=1;for(i=0;o>i;++i)s=1&n,kt(t,e,r+_,s),_=_<<1|s,n>>=1}function lt(e,r,t,o){var n,s,i=1,_=0;for(s=t;0!=s;--s)n=1&o,o>>>=1,_+=Yt[(2047&(e[r+i]-n^-n))>>>2],i=i<<1|n;return _}function vt(e,r,t){var o,n=r[t];return o=(e.E>>>11)*n,(-2147483648^o)>(-2147483648^e.Bb)?(e.E=o,r[t]=n+(2048-n>>>5)<<16>>16,-16777216&e.E||(e.Bb=e.Bb<<8|l(e.Ab),e.E<<=8),0):(e.E-=o,e.Bb-=o,r[t]=n-(n>>>5)<<16>>16,-16777216&e.E||(e.Bb=e.Bb<<8|l(e.Ab),e.E<<=8),1)}function Bt(e,r){var t,o,n=0;for(t=r;0!=t;--t)e.E>>>=1,o=e.Bb-e.E>>>31,e.Bb-=e.E&o-1,n=n<<1|1-o,-16777216&e.E||(e.Bb=e.Bb<<8|l(e.Ab),e.E<<=8);return n}function St(e){e.Bb=0,e.E=-1;for(var r=0;5>r;++r)e.Bb=e.Bb<<8|l(e.Ab)}function gt(e){for(var r=e.length-1;r>=0;--r)e[r]=1024}function kt(e,r,t,s){var i,_=r[t];i=(e.E>>>11)*_,s?(e.xc=o(e.xc,n(a(i),[4294967295,0])),e.E-=i,r[t]=_-(_>>>5)<<16>>16):(e.E=i,r[t]=_+(2048-_>>>5)<<16>>16),-16777216&e.E||(e.E<<=8,bt(e))}function Rt(e,r,t){for(var n=t-1;n>=0;--n)e.E>>>=1,1==(r>>>n&1)&&(e.xc=o(e.xc,a(e.E))),-16777216&e.E||(e.E<<=8,bt(e))}function Mt(e){return o(o(a(e.Jb),e.mc),[4,0])}function Dt(e){e.mc=Gt,e.xc=Gt,e.E=-1,e.Jb=1,e.Oc=0}function bt(e){var r,t=c(p(e.xc,32));if(0!=t||s(e.xc,[4278190080,0])<0){e.mc=o(e.mc,a(e.Jb)),r=e.Oc;do g(e.Ab,r+t),r=255;while(0!=--e.Jb);e.Oc=c(e.xc)>>>24}++e.Jb,e.xc=m(n(e.xc,[16777215,0]),8)}function wt(e,r){return Yt[(2047&(e-r^-r))>>>2]}function Et(e){for(var r,t,o,n=0,s=0,i=e.length,_=[],a=[];i>n;++n,++s){if(r=255&e[n],128&r)if(192==(224&r)){if(n+1>=i)return e;if(t=255&e[++n],128!=(192&t))return e;a[s]=(31&r)<<6|63&t}else{if(224!=(240&r))return e;
  if(n+2>=i)return e;if(t=255&e[++n],128!=(192&t))return e;if(o=255&e[++n],128!=(192&o))return e;a[s]=(15&r)<<12|(63&t)<<6|63&o}else{if(!r)return e;a[s]=r}16383==s&&(_.push(String.fromCharCode.apply(String,a)),s=-1)}return s>0&&(a.length=s,_.push(String.fromCharCode.apply(String,a))),_.join("")}function Lt(e){var r,t,o,n=[],s=0,i=e.length;if("object"==typeof e)return e;for(R(e,0,i,n,0),o=0;i>o;++o)r=n[o],r>=1&&127>=r?++s:s+=!r||r>=128&&2047>=r?2:3;for(t=[],s=0,o=0;i>o;++o)r=n[o],r>=1&&127>=r?t[s++]=r<<24>>24:!r||r>=128&&2047>=r?(t[s++]=(192|r>>6&31)<<24>>24,t[s++]=(128|63&r)<<24>>24):(t[s++]=(224|r>>12&15)<<24>>24,t[s++]=(128|r>>6&63)<<24>>24,t[s++]=(128|63&r)<<24>>24);return t}function yt(e){return e[1]+e[0]}function Ct(e,t,o,n){function s(){try{for(var e,r=(new Date).getTime();rr(a.c.yb);)if(i=yt(a.c.yb.Pb)/yt(a.c.Tb),(new Date).getTime()-r>200)return n(i),Nt(s,0),0;n(1),e=S(a.c.Nb),Nt(o.bind(null,e),0)}catch(t){o(null,t)}}var i,_,a={},c=void 0===o&&void 0===n;if("function"!=typeof o&&(_=o,o=n=0),n=n||function(e){return void 0!==_?r(e,_):void 0},o=o||function(e,r){return void 0!==_?postMessage({action:Ft,cbn:_,result:e,error:r}):void 0},c){for(a.c=w({},Lt(e),Vt(t));rr(a.c.yb););return S(a.c.Nb)}try{a.c=w({},Lt(e),Vt(t)),n(0)}catch(u){return o(null,u)}Nt(s,0)}function zt(e,t,o){function n(){try{for(var e,r=0,i=(new Date).getTime();rr(c.d.yb);)if(++r%1e3==0&&(new Date).getTime()-i>200)return _&&(s=yt(c.d.yb.Z.g)/a,o(s)),Nt(n,0),0;o(1),e=Et(S(c.d.Nb)),Nt(t.bind(null,e),0)}catch(u){t(null,u)}}var s,i,_,a,c={},u=void 0===t&&void 0===o;if("function"!=typeof t&&(i=t,t=o=0),o=o||function(e){return void 0!==i?r(_?e:-1,i):void 0},t=t||function(e,r){return void 0!==i?postMessage({action:It,cbn:i,result:e,error:r}):void 0},u){for(c.d=L({},e);rr(c.d.yb););return Et(S(c.d.Nb))}try{c.d=L({},e),a=yt(c.d.Tb),_=a>-1,o(0)}catch(f){return t(null,f)}Nt(n,0)}var Ft=1,It=2,xt=3,Nt="function"==typeof setImmediate?setImmediate:setTimeout,Ot=4294967296,At=[4294967295,-Ot],Ht=[0,-0x8000000000000000],Gt=[0,0],Wt=[1,0],Tt=function(){var e,r,t,o=[];for(e=0;256>e;++e){for(t=e,r=0;8>r;++r)0!=(1&t)?t=t>>>1^-306674912:t>>>=1;o[e]=t}return o}(),Zt=function(){var e,r,t,o=2,n=[0,1];for(t=2;22>t;++t)for(r=1<<(t>>1)-1,e=0;r>e;++e,++o)n[o]=t<<24>>24;return n}(),Yt=function(){var e,r,t,o,n=[];for(r=8;r>=0;--r)for(o=1<<9-r-1,e=1<<9-r,t=o;e>t;++t)n[t]=(r<<6)+(e-t<<6>>>9-r-1);return n}(),Vt=function(){var e=[{s:16,f:64,m:0},{s:20,f:64,m:0},{s:19,f:64,m:1},{s:20,f:64,m:1},{s:21,f:128,m:1},{s:22,f:128,m:1},{s:23,f:128,m:1},{s:24,f:255,m:1},{s:25,f:255,m:1}];return function(r){return e[r-1]||e[6]}}();return"undefined"==typeof onmessage||"undefined"!=typeof window&&void 0!==unsafeWindow.document||!function(){onmessage=function(r){r&&r.gc&&(r.gc.action==It?e.decompress(r.gc.gc,r.gc.cbn):r.gc.action==Ft&&e.compress(r.gc.gc,r.gc.Rc,r.gc.cbn))}}(),{compress:Ct,decompress:zt}}();this.LZMA=this.LZMA_WORKER=e;

  let config;
  let modules = [];
  let resaved = false;
  let errorCode = 0;
  let windows = '._ydb_window {position:fixed;z-index:999;width:80vw;height:80vh;top:10vh;left:10vw;overflow-y:auto} ._ydb_warn{background:#f00 !important}';
  const warningText = 'These two lines are used by YourBooru to save data in your account. Do not split or edit them.';
  const warningTextShort = 'Lines below are used by YourBooru. Do not edit.';
  const backupVersion = 2;

  function read() {
    if (localStorage._ydb_config == undefined) localStorage._ydb_config = localStorage._ydb;
    let svd = localStorage._ydb_config;
    try {
      settings = JSON.parse(svd);
    }
    catch (e) {
      settings = {};
    }
    if (settings.sync == undefined) settings.sync = settings.synch;
    if (settings.downsync == undefined) settings.downsync = settings.downsynch;
    if (settings.sync == undefined) settings.sync = true;
    if (settings.downsync == undefined) settings.downsync = settings.sync;
    if (settings.syncInterval == undefined) settings.syncInterval = 360;
    if (settings.silentSync == undefined) settings.silentSync = false;
    if (settings.debugLength == undefined) settings.debugLength = 100;
    if (settings.debugLevel == undefined) settings.debugLevel = 1;
    if (settings.nonce == undefined || isNaN(settings.nonce)) settings.nonce = parseInt(Math.random()*Number.MAX_SAFE_INTEGER);
    write();
  }
  read();

  function write() {
    localStorage._ydb_config = JSON.stringify(settings);
  }

  function callWindow(inside) {
    return ChildsAddElem('div',{className:'_ydb_window block__content'},document.body,inside);
  }

  function debugLogger(id, val, level) {
    if (settings.debugLevel>level) return;
    if (settings.debugFilter != undefined) {
      let filter = settings.debugFilter.split(',');
      for (let i=0; i<filter.length; i++) {
        if (filter[i].trim() == id) return;
      }
    }
    let x = [];
    let svd = localStorage._ydb_dlog;
    try {
      x = JSON.parse(svd);
    }
    catch (e) { }
    let levels = ['!', '?', '.'];
    x.push({id:id,level:level,val:val,ts:Date.now()});
    if (x.length > settings.debugLength) x = x.slice(-settings.debugLength);
    if (level == 2) {
      console.log('['+['.', '?', '!'][level]+'] ['+id+'] '+val);
      console.trace();
    }
    localStorage._ydb_dlog = JSON.stringify(x);
  }

  function register(onlyLibs, win) {
    win = win || unsafeWindow;
    if (win._YDB_public == undefined) win._YDB_public = {};
    if (win._YDB_public.settings == undefined) win._YDB_public.settings = {};
    let xversion;
    if (version.indexOf('aE') == -1) {
      if (GM_info.script.name == 'YourBooru:Settings') xversion = version+' (standalone)';
      else xversion = internalVersion+' (served by '+GM_info.script.name+')';
    }
    else xversion = version;
    if (!onlyLibs) win._YDB_public.settings.settings = {
      name:'Settings',
      container:'_ydb_config',
      version:xversion,
      s:[
        {type:'header', name:'Syncronization'}, {type:'text', name:'Writes a compressed copy of these settings into the end of your watchlist query and filter settings. This action does not affect your watchlist, you still may use everything as before, but please do not edit appended data.', styleS:{fontStyle:'italic'}},
        {type:'breakline'},
        {type:'text', name:'Available space is limited, if you\'re running out of it, consider using YDB:Feeds to replicate all your watchlist settings in a more compressed format.', styleS:{fontStyle:'italic'}},
        {type:'breakline'},
        {type:'breakline'},
        {type:'checkbox', name:'Allow setting uploading', parameter:'sync'},
        {type:'breakline'},
        {type:'checkbox', name:'Allow setting downloading', parameter:'downsync'},
        {type:'breakline'},
        {type:'input', name:'Syncronization interval (in minutes)', parameter:'syncInterval', validation:{type:'int',min:5,max:10080, default:360}},
        {type:'breakline'},
        {type:'checkbox', name:'Silent syncronization', parameter:'silentSync'},
        {type:'breakline'},
        {type:'breakline'},
        {type:'text', name:'If you do not wish to backup anymore, simply remove ydb-related strings from your display settings.', styleS:{fontStyle:'italic'}},
        {type:'breakline'},
        {type:'breakline'},
        {type:'buttonLink', name:'Sync', href:'/pages/api?sync'},
        {type:'breakline'},
        {type:'header', name:'Logs'},
        {type:'input', name:'Debug log length', parameter:'debugLength', validation:{type:'int',min:0,max:500, default:200}},
        {type:'select', name:'Log level', parameter:'debugLevel', values:[
          {name:'Errors', value:2},
          {name:'Info', value:1},
          {name:'Verbose', value:0}
        ]},
        {type:'input', name:'Filter (,)', parameter:'debugFilter'}
      ]
    };
    if (win._YDB_public.funcs == undefined) win._YDB_public.funcs = {};
    if (!win._YDB_public.funcs.callWindow) win._YDB_public.funcs.callWindow = callWindow;
    if (!onlyLibs && !win._YDB_public.funcs.backgroundBackup) win._YDB_public.funcs.backgroundBackup = backgroundBackup;
    if (!win._YDB_public.funcs.log) win._YDB_public.funcs.log = debugLogger;
    if (!win._YDB_public.funcs.getNonce) win._YDB_public.funcs.getNonce = () => settings.nonce;
  }

  function hideBlock(e) {
    let u = e.target;
    while (!u.classList.contains('block__header')) u = u.parentNode;
    let x = u.nextSibling;
    x.classList.toggle('hidden');
    u.getElementsByClassName('fa')[0].innerHTML = (x.classList.contains('hidden')?'\uF061':'\uF063');
  }

  function renderer(e, ss, l, s, mod) {
    s.forEach(function (v,i,a) {
      let x, y;
      if (v.type == 'checkbox') {
        y = ChildsAddElem('label', {dataset:{parent:e.container, parameter:v.parameter}, className:'_ydb_s_checkcont',innerHTML:' '+v.name+' '}, l, [
          x = InfernoAddElem('input',{type:'checkbox',checked:ss[v.parameter]})
        ]);
      }
      else if (v.type == 'input') {
        y = addElem('span', {innerHTML:' '+v.name+' '},l);
        x = addElem('input', {dataset:{parent:e.container, parameter:v.parameter},type:'text',className:'input _ydb_s_valuecont',value:ss[v.parameter]},l);
      }
      else if (v.type == 'textarea') {
        y = addElem('span', {innerHTML:' '+v.name+' '},l);
        x = addElem('textarea', {dataset:{parent:e.container, parameter:v.parameter},type:'text',className:'input _ydb_s_valuecont _ydb_s_bigtextarea',value:ss[v.parameter]},l);
      }
      else if (v.type == 'select') {
        y = addElem('span', {innerHTML:' '+v.name+' '},l);
        let elems = v.values.map(function (vv,i,a) {
          return InfernoAddElem('option',{innerHTML:vv.name, value:vv.value, selected:(vv.value == ss[v.parameter])});
        });
        x = ChildsAddElem('select', {dataset:{parent:e.container, parameter:v.parameter},size:1, className:'input _ydb_s_valuecont'}, l, elems);
      }

      else if (v.type == 'button') {
        x = addElem('span', {innerHTML:v.name, className:'button', events:[{t:'click',f:function(e) {v.action(mod, e.target);}}]},l);
      }

      else if (v.type == 'buttonLink') {
        x = addElem('a', {innerHTML:v.name, className:'button', href:v.href},l);
      }

      else if (v.type == 'breakline') {
        y = addElem('br', {},l);
      }

      else if (v.type == 'header') {
        y = addElem('h4', {innerHTML:v.name},l);
      }

      else if (v.type == 'text') {
        y = addElem('span', {innerHTML:v.name},l);
      }

      else if (v.type == 'array') {
        let rr = function(e, ss, l, s, y, nav) {
          let x = addElem('div', {className:'block__content alternating-color _ydb_inArray', dataset:{id:y.getElementsByClassName('_ydb_inArray').length}}, y);
          for (let k=0; k<v.s.length; k++) {
            renderer(e, ss, x, s[k], mod);
            if (nav && k==0) {
              addElem('span', {
                style:{marginLeft:'.5em', float:'right'},
                className:'button',
                innerHTML:'<i class="fa fa-arrow-up"></i>',
                events:[{
                  t:'click',
                  f:function(e) {
                    let u = e.target;
                    if (!u.classList.contains('button')) u = u.parentNode;
                    let xl = u.parentNode;
                    if (xl.previousSibling == null) return;
                    xl.parentNode.insertBefore(xl, xl.previousSibling);
                  }
                }]
              }, x);
            }
            if (k == v.s.length-1) {
              addElem('span', {
                className:'button commission__category',
                innerHTML:'Delete',
                style:{marginLeft:'.5em'},
                events:[{
                  t:'click',
                  f:function(ex) {
                    this.parentNode.parentNode.removeChild(this.parentNode);
                  }
                }]
              }, x);

              if (nav) {
                addElem('span', {
                  style:{marginLeft:'.5em', float:'right'},
                  className:'button',
                  innerHTML:'<i class="fa fa-arrow-down"></i>',
                  events:[{
                    t:'click',
                    f:function(e) {
                      let u = e.target;
                      if (!u.classList.contains('button')) u = u.parentNode;
                      let xl = u.parentNode;
                      if (xl.nextSibling == null) return;
                      let xp = xl.nextSibling.nextSibling;
                      if (xp == undefined) xl.parentNode.appendChild(xl);
                      else xl.parentNode.insertBefore(xl, xp);
                    }
                  }]
                }, x);
              }
            }
            else addElem('br', {},x);
          }
        };
        x = addElem('div', {dataset:{parent:e.container, parameter:v.parameter},className:'_ydb_array'},l);
        v.container = v.parameter;
        if (ss[v.parameter] != undefined) for (let j=0; j<ss[v.parameter].length; j++) {
          rr(e, ss[v.parameter][j], x, v.s, x, v.customOrder);
        }
        y = addElem('span', {
          className:'button',
          innerHTML:v.addText,
          events:[{
            t:'click',
            f:function(ex) {
              rr(e, v.template, x, v.s, x, v.customOrder);
            }
          }]
        }, l);

      }

      if (v.attrI != undefined) for (let s in v.attrI) x[s] = v.attrI[s];
      if (v.attrS != undefined) for (let s in v.attrS) y[s] = v.attrS[s];
      if (v.styleI != undefined) for (let s in v.styleI) x.style[s] = v.styleI[s];
      if (v.styleS != undefined) for (let s in v.styleS) y.style[s] = v.styleS[s];
      if (v.eventsI != undefined) for (let s in v.eventsI) x.addEventListener(s,v.eventsI[s]);
      if (v.eventsS != undefined) for (let s in v.eventsS) y.addEventListener(s,v.eventsS[s]);
      if (v.validation != undefined) x.dataset.validation = v.validation.type;
      if (v.i != undefined) v.i(mod, x);

    });
  }

  function renderCustom(e, cont2, mod) {
    if (e.s.length == 0) return;
    let ss = {};
    try {
      ss = JSON.parse(localStorage[e.container]);
    }
    catch (ex) {
    }

    if (e.name != 'Settings') ChildsAddElem('div', {className:'block__header'}, cont2, [
      InfernoAddElem('a', {events:[{t:'click',f:hideBlock}]}, [
        InfernoAddElem('i', {className:'fa', innerHTML:'\uF061'}),
        InfernoAddElem('span', {innerHTML:' '+e.name})
      ])
    ]);

    let cont = addElem('div', {className:'block__content '+(e.name!='Settings'?'hidden':'')}, cont2);
    if (e.name == 'Settings') cont2.insertBefore(cont, cont2.childNodes[0]);

    let l = document.createElement('div');
    l.dataset.parent = e.container;
    l.className = '_ydb_settings_container';
    renderer(e, ss, l, e.s, mod);
    cont.appendChild(l);

  }

  function getData(force, external) {
    let win;
    let t = InfernoAddElem('div');
    let parse = function (request) {
      try {
        t.innerHTML = request.responseText;
        let x = t.querySelector('#user_watched_images_exclude_str').value.split('\n');
        let y = t.querySelector('#user_watched_images_query_str').value.split('\n');
        t.innerHTML = '';
        let bc = '';
        for (let i=0; i<x.length; i++) {
          if (x[i].startsWith('$')) {
            bc += x[i].slice(1);
            break;
          }
        }
        for (let i=0; i<y.length; i++) {
          if (y[i].startsWith('$')) {
            bc += y[i].slice(1);
            break;
          }
        }
        bc = bc.trim();
        if (bc != '') {
          bc = atob(bc);
          let r = [];
          for (let j=0; j<bc.length; j++) {
            let x2 = bc.charCodeAt(j);
            if (x2>127) x2-=256;
            r.push(x2);
          }
          let s = JSON.parse(LZMA.decompress(r));
          if (external) {
            document.querySelector('#content .walloftext').innerHTML = JSON.stringify(s,null,' ');
            return;
          }
          if (settings.timestamp+60 < s.timestamp || force) {
            for (let y in s.vs) {
              localStorage[y] = s.vs[y];
            }
            settings.timestamp = parseInt(Date.now()/1000);
            write();
            if (location.pathname != "/pages/api" && location.search != '?sync' && !settings.silentSync) location.reload();
            return;
          }
          settings.timestamp = parseInt(Date.now()/1000);
          write();
          debugLogger('YDB:S','Successfuly syncronized', 1);
          if (!external && !settings.silentSync) win.parentNode.removeChild(win);
          return;
        }
        errorCode = 2;
        settings.timestamp = parseInt(Date.now()/1000);
        write();
        debugLogger('YDB:S','Failed to sync settings — nothing to parse. Updating impossible',2);
        if (!external && !settings.silentSync) win.parentNode.removeChild(win);
        return;
      }
      catch (e) {
        settings.timestamp = parseInt(Date.now()/1000);
        write();
        debugLogger('YDB:S','Failed to sync settings. Updating impossible',2);

        if (!external && !settings.silentSync) win.parentNode.removeChild(win);
      }
      return;
    };

    let readyHandler = function(request) {
      return function () {
        if (request.readyState === 4) {
          if (request.status === 200) return parse(request);
          else if (request.status === 0) {
            return false;
          }
          else {
            return false;
          }
        }
      };
    };

    let get = function() {
      let req = new XMLHttpRequest();
      req.onreadystatechange = readyHandler(req);
      req.open('GET', '/settings/edit');
      req.send();
    };
    if (!settings.downsync && !force && !external) return;
    if (!external && !settings.silentSync) win = callWindow([InfernoAddElem('h1',{innerHTML:'Fetching last settings, please wait a bit...'},[])]);
    get();
  }

  function createBackup(x, y) {
    let ret1, ret2;

    let inserted;
    let content = {};
    content.timestamp = parseInt(Date.now()/1000);
    content.version = backupVersion;
    content.vs = {};

    for (let m in modules) {
      if (modules[m].container != '_ydb_config') content.vs[modules[m].container] = localStorage[modules[m].container];
    }

    let r2 = LZMA.compress(JSON.stringify(content),9);
    let r = '';
    let rs = [];
    for (let i=0; i<r2.length; i++) {
      if (r2[i] < 0) r2[i] = 256+r2[i];
      r+=String.fromCharCode(r2[i]);
    }
    r = btoa(r);
    rs[0] = '$'+r.substring(0, parseInt((r.length-1)/2)+1);
    rs[1] = '$'+r.substring(parseInt((r.length-1)/2)+1, r.length);

    for (let i=0; i<x.length; i++) {
      if (x[i] == warningText) x[i] = warningTextShort;
      if (x[i].startsWith('$')) {
        if (i==0 || x[i-1] != warningTextShort) x.splice(i,0,warningTextShort);
        x[i] = rs[0];
        inserted = true;
      }
    }
    if (!inserted) {
      x.push(warningTextShort);
      x.push(rs[0]);
    }
    inserted = false;
    for (let i=0; i<y.length; i++) {
      if (y[i] == warningText) y[i] = warningTextShort;
      if (y[i].startsWith('$')) {
        if (i==0 || y[i-1] != warningTextShort) y.splice(i,0,warningTextShort);
        y[i] = rs[1];
        inserted = true;
      }
    }
    if (!inserted) {
      y.push(warningTextShort);
      y.push(rs[1]);
    }
    ret1 = x.join('\n');
    ret2 = y.join('\n');
    return [ret1, ret2];
  }

  function backgroundBackup(callback) {
    let s = document.querySelector('._ydb_settings_cloneForm');

    let process = function() {
      read();
      write();
      let el = s.querySelector('textarea[name*="watched_images_exclude_str"]');
      let x = el.innerHTML.split('\n');
      let el2 = s.querySelector('textarea[name*="watched_images_query_str"]');
      let y = el2.innerHTML.split('\n');
      let ax = createBackup(x, y);
      el.innerHTML = ax[0];
      el2.innerHTML = ax[1];
      let readyHandler = function(request) {
        return function () {
          if (request.readyState === 4) {
            if (callback!= undefined) callback(true);
          }
        };
      };

      let get = function() {
        let req = new XMLHttpRequest();
        req.onreadystatechange = readyHandler(req);
        req.open('POST', '/settings');
        req.send(new FormData(s.querySelector('form')));
      };
      get();
    };

    let callbackS = function (r) {
      let x = addElem('div',{style:{display:'none'},innerHTML:r.responseText},document.body);
      if (x.querySelector('form.new_user') != undefined) return;
      s = ChildsAddElem('div',{style:{display:'none'},className:'_ydb_settings_cloneForm'},document.body,[
        x.querySelector('form.edit_user')
      ]);
      document.body.removeChild(x);
      s.querySelector('#serve_hidpi').checked = localStorage.serve_hidpi;
      s.querySelector('#serve_webm').checked = localStorage.serve_webm;
      s.querySelector('#webm').checked = localStorage.webm;
      s.querySelector('#hide_uploader').checked = localStorage.hide_uploader;
      s.querySelector('#chan_nsfw').checked = localStorage.chan_nsfw;
      setTimeout(() => {s.parentNode.removeChild(s);}, 15000);
      process();
    };

    let get = function() {
      let req = new XMLHttpRequest();
      req.onreadystatechange = readyHandler(req);
      req.open('GET', '/settings');
      req.send();
    };

    let readyHandler = function(request) {
      return function () {
        if (request.readyState === 4) {
          if (request.status === 200) return callbackS(request);
          else {
            debugLogger('YDB:S','Failed to fetch settings. Backup impossible',2);
            callback(false);
          }
        }
      };
    };

    if (s == undefined) get();
    else process();
  }

  function backup() {
    read();
    if (!settings.sync) {
      //removeBackup();
      return;
    }
    let container = document.getElementById('user_watched_images_exclude_str');
    let x = container.value.split('\n');
    let container2 = document.getElementById('user_watched_images_query_str');
    let x2 = container2.value.split('\n');
    let bc = createBackup(x, x2);
    container.value = bc[0];
    container2.value = bc[1];
    debugLogger('YDB:S', 'Front backup successfully created', 0);
  }

  function afterSave() {
    backup();
  }

  function validate(e) {
    let ec = document.getElementById('_ydb_error_cont');
    ec.innerHTML = '';
    let errorlevel = 0;
    let validateChilds = function(c, m, mm) {
      let errorlevel = 0;
      for (let i=0; i<c.childNodes.length; i++) {
        let el = c.childNodes[i];
        let x;
        for (let j=0; j<m.length; j++) {
          if (m[j].length>0) for (let k=0; k<m[j].length; k++) {
            if (m[j][k].parameter == el.dataset.parameter) {
              x = m[j][k];
              break;
            }
          }
          else if (m[j].parameter == el.dataset.parameter) {
            x = m[j];
            break;
          }
        }
        if (el.classList == null) continue;
        else if (el.classList.contains('_ydb_s_valuecont')) {
          if (x.validation != undefined) {
            let v = x.validation;
            if (v.type == 'int') {
              if (el.value == '') {
                if (x.default != undefined) el.value = x.default;
                else if (el.min != undefined) el.value = x.min;
                else el.value=0;
              }
              if (el.value != parseInt(el.value) || el.value<v.min || el.value>v.max) {
                let reason = '';
                if (el.value != parseInt(el.value)) reason = ' must be an integer!';
                else if (el.value < v.min) reason = ` must be at least ${v.min}`;
                else if (el.value > v.max) reason = ` must be no more than ${v.max}`;
                addElem('div',{className:'flash flash--warning', innerHTML:'>'+mm.name+': '+x.name+reason}, ec);
                errorlevel++;
                el.classList.add('_ydb_warn');
              }
            }
            else if (v.type == 'float') {
              if (el.value == '') {
                if (x.default != undefined) el.value = x.default;
                else if (el.min != undefined) el.value = x.min;
                else el.value=0;
              }
              if (el.value != parseFloat(el.value) || el.value<v.min || el.value>v.max) {
                let reason = '';
                if (el.value != parseInt(el.value)) reason = ' must be a real number!';
                else if (el.value<v.min) reason = ' must be at least '+v.min;
                else if (el.value>v.max) reason = ' must not be more than '+v.max;
                addElem('div',{className:'flash flash--warning', innerHTML:'>'+mm.name+': '+x.name+reason}, ec);
                errorlevel++;
                el.classList.add('_ydb_warn');
              }
            }
            else if (v.type == 'unique') {
              for (let i=0; i<c.parentNode.querySelectorAll('input._ydb_s_valuecont[data-parent="'+el.dataset.parent+'"][data-parameter="'+el.dataset.parameter+'"]').length;i++) {
                let c2 = c.parentNode.querySelectorAll('input._ydb_s_valuecont[data-parent="'+el.dataset.parent+'"][data-parameter="'+el.dataset.parameter+'"]')[i];
                if (c2 == el) break;
                if (c2.value == el.value) {
                  addElem('div',{className:'flash flash--warning', innerHTML:'>'+mm.name+': '+x.name+' should be unique!'}, ec);
                  errorlevel++;
                  el.classList.add('_ydb_warn');
                }
              }
            }
            continue;
          }
        }
        else if (el.classList.contains('_ydb_array')) {
          if (el.childNodes != undefined) for (let j=0; j<el.childNodes.length; j++) {
            if (el.childNodes[j].classList.contains('_ydb_inArray')) {
              errorlevel+=validateChilds(el.childNodes[j], x.s, mm);
            }
          }
        }
      }
      return errorlevel;
    };
    if (e == undefined || e.tagName == undefined) {
      let containers = document.getElementsByClassName('_ydb_settings_container');
      for (let i=0; i<containers.length; i++) {
        let mx = modules[containers[i].dataset.parent];
        errorlevel += (validateChilds(containers[i], mx.options, mx));
      }

      if (errorlevel>0) {
        let x = addElem('div',{className:'flash flash--warning', style:{fontWeight:500}, innerHTML:errorlevel+' error(s) are preventing the settings from saving:'}, ec);
        ec.insertBefore(x,ec.childNodes[0]);
      }
    }
    else {
      let virgin = (ec.childNodes.length == 0);
      let mx = modules[e.dataset.parent];
      errorlevel += (validateChilds(e, mx.options, mx));
      if (errorlevel>0 && virgin) {
        let x = addElem('div',{className:'flash flash--warning', style:{fontWeight:500}, innerHTML:errorlevel+' error(s) are preventing the settings from saving:'}, ec);
        ec.insertBefore(x,ec.childNodes[0]);
      }
    }
    return errorlevel;
  }

  function save(e) {
    if (resaved) {
      afterSave();
      return;
    }
    unsafeWindow._YDB_public.handled = 0;
    if (validate(e) >0) {
      e.preventDefault();
      setTimeout(() => document.querySelector('.edit_user button.button[type=submit]').removeAttribute('disabled'),500);
      return;
    }
    let changed = false;
    let exploreChilds = function(c, m, o, mx) {
      //container, module data container, onchange functions, module
      let callback = function(m, el, val) {
        m[el.dataset.parameter] = val;
      };
      let changed = false;
      for (let i=0; i<c.childNodes.length; i++) {
        let el = c.childNodes[i];
        if (el.classList == null) continue;
        else if (el.classList.contains('_ydb_s_valuecont')) {
          if (m[el.dataset.parameter] != el.value) {
            changed = true;
            m[el.dataset.parameter] = el.value;
            if (el.dataset.validation == 'int') m[el.dataset.parameter] = parseInt(m[el.dataset.parameter]);
            else if (el.dataset.validation == 'float') m[el.dataset.parameter] = parseFloat(m[el.dataset.parameter]);
            if (o != undefined && o[el.dataset.parameter] != undefined) o[el.dataset.parameter](m, el, callback);
          }
        }
        else if (el.classList.contains('_ydb_s_checkcont')) {
          let cel = el.getElementsByTagName('input')[0];
          if (m[el.dataset.parameter] != cel.checked) {
            changed = true;
            m[el.dataset.parameter] = cel.checked;
            if (o != undefined && o[el.dataset.parameter] != undefined) o[el.dataset.parameter](m, cel, callback);
          }
        }
        else if (el.classList.contains('_ydb_array')) {
          let inChanged = false;
          let k = 0;
          if (m[el.dataset.parameter] == undefined || m[el.dataset.parameter].length == undefined) m[el.dataset.parameter] = [];
          if (el.childNodes != undefined) for (let j=0; j<el.childNodes.length; j++) {
            if (el.childNodes[j].classList.contains('_ydb_inArray')) {
              if (typeof m[el.dataset.parameter][k] != 'object') m[el.dataset.parameter][k] = {};
              if (exploreChilds(el.childNodes[j], m[el.dataset.parameter][k], (o != undefined?o[el.dataset.parameter]:undefined))) {
                inChanged = true;
              }
              k++;
            }
          }

          if (k<m[el.dataset.parameter].length) {
            m[el.dataset.parameter].splice(k);
            inChanged = true;
          }

          if (inChanged) changed = true;
          if (inChanged && o != undefined && o[el.dataset.parameter] != undefined && o[el.dataset.parameter]._ != undefined) o[el.dataset.parameter]._(m, m[el.dataset.parameter], callback);
        }
      }
      return changed;
    };
    let containers = document.getElementsByClassName('_ydb_settings_container');
    for (let i=0; i<containers.length; i++) {
      let mx = modules[containers[i].dataset.parent];
      mx.changed = false;
      if (exploreChilds(containers[i], mx.saved, mx.onChanges, mx.s)) {
        changed = true;
        mx.changed = true;
        if (mx.onChanges != undefined && mx.onChanges._ != undefined) mx.onChanges._(mx);
        //localStorage[mx.container] = JSON.stringify(mx.saved);
      }
    }
    read();
    settings.timestamp = parseInt(Date.now()/1000);
    settings.bgBackupflag = false;
    write();
    if (unsafeWindow._YDB_public.handled != 0) {
      e.preventDefault();
      const checker = () => {
        if (unsafeWindow._YDB_public.handled != 0) setTimeout(checker, 100);
        else {
          for (let i=0; i<containers.length; i++) {
            let mx = modules[containers[i].dataset.parent];
            if (mx.changed) localStorage[mx.container] = JSON.stringify(mx.saved);
          }
          resaved = true;
          document.querySelector('.edit_user button.button[type=submit]').removeAttribute('disabled');
          document.querySelector('.edit_user button.button[type=submit]').click();
        }
      };
      setTimeout(checker, 100);
    }
    else if (changed) {
      for (let i=0; i<containers.length; i++) {
        let mx = modules[containers[i].dataset.parent];
        if (mx.changed) localStorage[mx.container] = JSON.stringify(mx.saved);
      }
      backup();
    }
    debugLogger('YDB:S', 'Settings saved', 0);
  }


  function injectModule(k, editCont, listCont) {
    let ss = {};
    let s2 = unsafeWindow._YDB_public.settings[k];
    try {ss = JSON.parse(localStorage[unsafeWindow._YDB_public.settings[k].container]);}
    catch (ex) {console.log('Warning: '+k+' has empty storage!');}
    modules[s2.container] = {name:s2.name, container:s2.container, changed:false, saved:ss, options:s2.s, onChanges:s2.onChanges};
    if (s2.s != undefined && editCont != undefined) {
      try {renderCustom(s2, editCont, modules[s2.container]);}
      catch(e) {console.log('Error rendering '+k+'. '+e); console.trace(e);}
    }

    if (listCont != undefined && !s2.hidden) addElem(s2.link!=undefined?'a':'div', {href:s2.link!=undefined?s2.link:'', style:{display:'block'}, className:'block__content alternating-color', innerHTML:s2.name+' v. '+s2.version}, listCont);
  }

  function injectLegacyModule(k, editCont, listCont) {
    let ss = {};
    try {ss = JSON.parse(localStorage[k.container]);}
    catch (ex) {console.log('Warning: '+k.name+' has empty storage!');}
    modules[k.container] = {name:k.name, container:k.container, changed:false, saved:ss, options:k.s, onChanges:k.onChanges};
    if (k.s != undefined && editCont != undefined) {
      try {renderCustom(k, editCont, modules[k.container]);}
      catch(e) {console.log('Error rendering '+k.name+'. '+e);}
    }

    if (listCont != undefined && !k.hidden) addElem(k.link!=undefined?'a':'div',  {href:k.link!=undefined?k.link:'', style:{display:'block'}, className:'block__content alternating-color', innerHTML:k.name+' v. '+k.version}, listCont);
  }

  function listModules() {
    let loadedList = {};
    //loading, stage 1
    if (unsafeWindow._YDB_public != undefined) {
      if (unsafeWindow._YDB_public.settings != undefined) {
        for (let k in unsafeWindow._YDB_public.settings) {
          injectModule(k);
          loadedList[k] = true;
        }
      }
    }

    //loading, stage 2
    for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
      try {
        let k = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
        injectLegacyModule(k);
        loadedList[k.name] = true;
      }
      catch (e) {
        console.log('JSON failed to parse: "'+document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value+'" '+e);
      }
    }

    let timer = 50;
    let handler = function() {
      for (let k in unsafeWindow._YDB_public.settings) {
        if (!loadedList[k]) {
          injectModule(k);
          loadedList[k] = true;
        }
      }
      for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
        try {
          let k = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
          if (!loadedList[k.name]) {
            injectLegacyModule(k);
            loadedList[k.name] = true;
          }
        }
        catch (e) {
        }
      }

      timer*=4;
      setTimeout(handler, timer);
    };
    setTimeout(handler, 50);
  }

  function settingPage() {
    //localStorage._ydb_watchListFilterString = document.getElementById('user_watched_images_exclude_str').innerHTML;
    let cont;
    //preparing
    document.getElementById('js-setting-table').insertBefore(cont = InfernoAddElem('div',{className:'block__tab hidden',dataset:{tab:'YourBooru'},style:{position:'relative'}}), document.querySelector('[data-tab="local"]').nextSibling);

    let style = '._ydb_s_bigtextarea {resize:none;overflow:hidden;line-height:1.25em;white-space:pre;height:2.25em;vertical-align:top;}'+
        '._ydb_s_bigtextarea:focus {overflow:auto;position:absolute;width:900px !important;height:10em;z-index:5;white-space:pre-wrap}';
    GM_addStyle(style);
    addElem('a',{href:'#',innerHTML:'YourBooru',dataset:{clickTab:'YourBooru'}},document.getElementsByClassName('block__header')[0]);

    let editCont = addElem('div',{className:'block'},cont);
    let listCont = addElem('div',{className:'block'},cont);
    ChildsAddElem('div', {className:'block__header'}, listCont, [
      InfernoAddElem('span', {innerHTML:'Installed plugins', style:{marginLeft:'12px'}})
    ]);

    let el;
    if (!settings.sync) {
      el = document.createElement('div');
      el.className = 'block block--fixed block--warning';
      el.innerHTML = 'Settings on this tab are saved in the current browser. They are independent of whether you are logged in or not.';
      cont.appendChild(el);
    }

    let loadedList = {};

    //loading, stage 1
    if (unsafeWindow._YDB_public != undefined) {
      if (unsafeWindow._YDB_public.settings != undefined) {
        for (let k in unsafeWindow._YDB_public.settings) {
          injectModule(k, editCont, listCont);
          loadedList[k] = true;
        }
      }
    }

    //loading, stage 2
    for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
      try {
        let k = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
        injectLegacyModule(k, editCont, listCont);
        loadedList[k.name] = true;
      }
      catch (e) {
        console.log('JSON failed to parse "'+document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value+'" '+e);
      }
    }

    //postloading
    ChildsAddElem('div', {className:'block__header'}, cont, [

      InfernoAddElem('a', {target:'_blank', href:'javscript://', events:[{t:'click',f:function() {
        unsafeWindow.open(getDonateLink()!=undefined?getDonateLink():'https://ko-fi.com/C0C8BVXS');
      }}]}, [
        InfernoAddElem('i', {className:'fa fa-heart', style:{color:'red'}}, []),
        InfernoAddElem('span', {innerHTML:' Support'}, [])
      ]),
      InfernoAddElem('a', {target:'_blank', href:'/pages/api?help'}, [
        InfernoAddElem('i', {className:'fa fa-question'}, []),
        InfernoAddElem('span', {innerHTML:' Help'}, [])
      ]),
      InfernoAddElem('a', {target:'_blank', href:'/pages/api?logs'}, [
        InfernoAddElem('i', {className:'fa fa-bug'}, []),
        InfernoAddElem('span', {innerHTML:' Debug logs'}, [])
      ]),
      InfernoAddElem('a', {target:'_blank', href:'/pages/api?backup'}, [
        InfernoAddElem('i', {className:'fa fa-bug'}, []),
        InfernoAddElem('span', {innerHTML:' Test backup'}, [])
      ])
    ]);
    addElem('div', {className:'block', id:'_ydb_error_cont'}, cont);

    let hh = function () {
      if (location.hash!='') {
        let t = location.hash.slice(1);
        if (document.querySelector('a[data-click-tab="'+t+'"]') != null) document.querySelector('a[data-click-tab="'+t+'"]').click();
      }
    };

    for (let i=0; i<document.getElementsByClassName('block__header')[0].childNodes.length; i++) {
      document.getElementsByClassName('block__header')[0].childNodes[i].href = '#'+document.getElementsByClassName('block__header')[0].childNodes[i].getAttribute('data-click-tab');
      document.getElementsByClassName('block__header')[0].childNodes[i].addEventListener('click', function(e) {location.hash = e.target.href.split('#')[1];});
    }

    document.querySelector('button.button[type=submit]').addEventListener('click', save);
    setTimeout(hh, 500);
    if (location.hash.slice(1) == 'backup') {
      document.querySelector('button.button[type=submit]').click();
    }
    validate();

    let timer = 50;
    let handler = function() {
      for (let k in unsafeWindow._YDB_public.settings) {
        if (!loadedList[k]) {
          injectModule(k, editCont, listCont);
          loadedList[k] = true;
        }
      }
      for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
        try {
          let k = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
          if (!loadedList[k.name]) {
            injectLegacyModule(k, editCont, listCont);
            loadedList[k.name] = true;
          }
        }
        catch (e) {
        }
      }

      timer*=4;
      setTimeout(handler, timer);
    };
    setTimeout(handler, 50);
  }

  ////////////////////////////

  function YB_createEmpty() {
    if (document.querySelector('#content h1').innerHTML != 'API') return;
    document.querySelector('#content h1').innerHTML = 'Derp!';
    document.querySelector('#content .walloftext').innerHTML = '<p>I know the script is callled "YourBooru", but as much as I would want it to be truly yours, I could not find a page you specified. Nope. Nothing at all! I tried though.</p><p>Make sure that the URL you are trying to access is valid and that you aren\'t trying to hunt ghosts here. Otherwise you might have hit a bug and it would be a good idea to report it to me!</p>';
  }

  ///////////////////////////
  function YB_logs() {
    let active = {}, ex = {};

    let readAll = function() {
      let svd = localStorage._ydb_dlog;
      try {
        x = JSON.parse(svd);
      }
      catch (e) { }
    };

    let getAll = function() {
      let ox = [];
      for (let i=x.length-1; i>=0; i--) {
        if (ex[x[i].id] == undefined) {
          ex[x[i].id] = true;
          active[x[i].id] = true;
          ox.push(InfernoAddElem('label',{innerHTML:x[i].id+' ',style:{marginRight:'9px'}},[
            InfernoAddElem('input',{type:'checkbox', dataset:{id:x[i].id}, checked:true, events:[{t:'change',f:function(e) {active[e.target.dataset.id] = e.target.checked; render();}}]},[])
          ]));
        }
      }
      c3.appendChild(InfernoAddElem('span',{},ox));
    };

    let render = function() {
      readAll();
      getAll();
      c2.innerHTML = '';
      let u = [];
      for (let i=x.length-1; i>=0; i--) {
        if (document.getElementById('_ydb_s_level').value<=x[i].level && active[x[i].id]) {
          let d = new Date(x[i].ts);
          u.push(InfernoAddElem('div',{className:levelsClasses[x[i].level]},[
            InfernoAddElem('strong',{innerHTML:'['+levels[x[i].level]+'] '},[]),
            InfernoAddElem('strong',{innerHTML:'['+x[i].id+'] '},[]),
            InfernoAddElem('span',{innerHTML:d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear()+'@'+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()},[]),
            InfernoAddElem('span',{innerHTML:' '+x[i].val},[])
          ]));
        }
      }
      ChildsAddElem('div',{className:'block',style:{width:'100%'}}, c2, u);
    };

    document.querySelector('#content h1').innerHTML = 'Debug Logs';
    let c = document.querySelector('#content .walloftext');
    c.innerHTML = '';
    ChildsAddElem('div',{className:'block',style:{width:'100%'}}, c, [
      InfernoAddElem('select',{id:'_ydb_s_level',className:'input header__input', style:{display:'inline'}, events:[{t:'change',f:render}], size:1},[
        InfernoAddElem('option',{innerHTML:'Only errors', value:'2'},[]),
        InfernoAddElem('option',{innerHTML:'Normal', value:'1'},[]),
        InfernoAddElem('option',{innerHTML:'Verbose', value:'0'},[])
      ]),
      InfernoAddElem('input',{type:'button', className:'button', style:{marginLeft:'2em'}, value:'Redraw', events:[{t:'click',f:render}]},[])
    ]);

    let s = '';

    let x = [];
    let levels = ['.', '?', '!'];
    let levelsClasses = ['flash--success','flash--site-notice','flash--warning'];

    let c3 = ChildsAddElem('div',{className:'block',style:{fontFamily:'monospace',whiteSpace:'pre',width:'100%'}}, c, []);
    let c2 = ChildsAddElem('div',{className:'block',style:{fontFamily:'monospace',whiteSpace:'pre',width:'100%'}}, c, []);

    render();
  }

  function YB_backup() {
    document.querySelector('#content h1').innerHTML = 'Help';
    let c = document.querySelector('#content .walloftext');
    c.innerHTML = '';

    let error = 'Ha, you thought there is help, how adorable.<br><br><br>Help is available only for standalone versions of YDB:Settings.';
    try {
      renderHelp(c);
    }
    catch(e) {
      c.innerHTML = error;
    }
  }

  function yourbooruPage() {
    let x = location.search.slice(1);
    if (location.search == "?") YB_createEmpty();
    else {
      document.getElementById('content').removeChild(document.querySelector('#content>p'));
      document.getElementById('content').removeChild(document.querySelector('#content>a'));
      let u = x.split('?');
      if (u[0] == "backup") setTimeout(function() {
        document.querySelector('#content h1').innerHTML = 'Syncing...';
        document.querySelector('#content .walloftext').innerHTML = '';
        getData(true, true);
      }, 100);
      else if (u[0] == "help") setTimeout(YB_backup, 100);
      else if (u[0] == "logs") setTimeout(YB_logs, 100);
      else if (u[0] == "sync") setTimeout(function() {
        document.querySelector('#content h1').innerHTML = 'Syncing...';
        document.querySelector('#content .walloftext').innerHTML = '';
        getData(true);
        let c = function() {
          if (errorCode>0) {
            if (errorCode == 2) {
              document.querySelector('#content .walloftext').innerHTML = 'No backups for you!';
              setTimeout(function() {
                if (history.length == 1) close();
                else history.back();
              },5000);
            }
          }
          else if (settings.timestamp+1 >= parseInt(Date.now()/1000)) {
            if (history.length == 1) close();
            else history.back();
          }
          else setTimeout(c, 100);
        };
        c();
      }, 100);
      else if (location.search != '') setTimeout(YB_createEmpty, 100);
    }
  }

  unsafeWindow.onbeforeunload = function(e) {
    if (unsafeWindow._YDB_public.bgCalled) {
      let checker = function() {
        if (unsafeWindow._YDB_public.bgCalled) setTimeout(checker, 100);
      };
      callWindow([InfernoAddElem('h1',{innerHTML:'Background copy in process...'},[])]);
    }
  };

  GM_addStyle(windows);
  if (settings.timestamp+(settings.syncInterval*60) < parseInt(Date.now()/1000) && location.pathname != "/settings/edit") {
    settings.nonce = parseInt(Math.random()*Number.MAX_SAFE_INTEGER);
    try { telemetry();} catch(e) {}
    getData();
  }
  if (location.pathname == "/settings/edit") setTimeout(settingPage, 50);
  else setTimeout(listModules, 50);
  if (location.pathname == "/pages/api") yourbooruPage();
  register();
})();
