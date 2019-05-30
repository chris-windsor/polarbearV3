!function i(s,a,u){function c(t,e){if(!a[t]){if(!s[t]){var r="function"==typeof require&&require;if(!e&&r)return r(t,!0);if(l)return l(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var o=a[t]={exports:{}};s[t][0].call(o.exports,function(e){return c(s[t][1][e]||e)},o,o.exports,i,s,a,u)}return a[t].exports}for(var l="function"==typeof require&&require,e=0;e<u.length;e++)c(u[e]);return c}({1:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var s=e("./dom/Traverse"),a=e("./data/Observe"),u=e("./etc/ElementEvents"),n=e("./vdom/Render"),o=(i.prototype.render=function(){document.querySelector(this.$appContainerSel).replaceWith(n.renderElem(this,this.$vdom))},i);function i(r){if(this.$refs={},this.$filters={},this.$data={},this.$watchers={},r.created&&r.created(),this.$appContainerSel=r.el,this.$appContainerEl=document.querySelector(this.$appContainerSel),this.$vdom=s.traverse(this.$appContainerEl),a.observe(this,r.data),r.methods)for(var e in r.methods)r.methods.hasOwnProperty(e)&&(this[e]=r.methods[e]);if(r.events){var t=function(t){r.events.hasOwnProperty(t)&&u.possibleEventList.includes(t)&&document.addEventListener(t,function(e){return r.events[t](e)})};for(var n in r.events)t(n)}if(r.filters)for(var o in r.filters)r.filters.hasOwnProperty(o)&&(this.$filters[o]=r.filters[o]);if(this.render(),r.watch)for(var i in r.watch)r.watch.hasOwnProperty(i)&&(this.$watchers[i]=r.watch[i]);r.mounted&&r.mounted.call(this)}r.default=o,window.Polarbear=o},{"./data/Observe":4,"./dom/Traverse":5,"./etc/ElementEvents":6,"./vdom/Render":11}],2:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var d=e("../etc/KeyCodes"),f=e("../etc/ElementEvents"),v=e("../parser/CodeParser");r.default=function(t,e,r){var n=e.split("."),o=n[0],i=n.splice(1),s=Object.keys(d.keyCodes),a={capture:!1,passive:!1,prevent:!1,once:!1},u=[];i.forEach(function(e){if(Object.keys(a).includes(e))a[e]=!0;else if(s.includes(e))u.push("$event.keyCode === "+d.keyCodes[e]);else{var t=Number(e);isNaN(t)?u.push("$event.key === '"+e+"'"):u.push("$event.keyCode === "+t)}});var c="if (!("+u.join("||")+")) { return; }";if(f.possibleEventList.includes(o)){var l=v.parse(t,r);return{eventName:o,fn:function(e){return Function('\n      "use strict";\n      const $event = arguments[0];\n      '+(a.prevent?"$event.preventDefault();":"")+"\n      "+(0<u.length?c:"")+"\n      "+l+"\n      ").call(t,e)},otherEventModifiers:a}}}},{"../etc/ElementEvents":6,"../etc/KeyCodes":7,"../parser/CodeParser":9}],3:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.setProp=function(e,t,r){t.split&&(t=t.split("."));for(var n,o=0,i=t.length,s=e;o<i;++o)n=s[t[o]],s=s[t[o]]=o===i-1?r:null!=n?n:!~t[o+1].indexOf(".")&&-1<+t[o+1]?[]:{}},r.getProp=function(e,t,r,n){for(n=0,t=t.split?t.split("."):t;e&&n<t.length;)e=e[t[n++]];return void 0===e||n<t.length?r:e}},{}],4:[function(e,t,c){"use strict";Object.defineProperty(c,"__esModule",{value:!0});var l=e("./DataFns");c.observe=function(s,a,u){function e(e){if(a.hasOwnProperty(e)){var r=u?u+"."+e:e,t=l.getProp(a,e),n=t.constructor;if(n===Object)l.setProp(s.$data,r,{}),l.setProp(s,r,{}),c.observe(s,t,r);else if(n===Array){l.setProp(s.$data,r,t);var o=new Proxy(l.getProp(s.$data,r),{deleteProperty:function(e,t){return console.log("deleting "+String(t)+" from "+e),!0},set:function(e,t,r){return e[t]=r,console.log(e+" "+r+" "+String(t)),!0}});l.setProp(s,r,o)}else{l.setProp(s.$data,r,t);var i=u?l.getProp(s,u):s;Object.defineProperty(i,e,{get:function(){return l.getProp(s.$data,r)},set:function(e){var t=l.getProp(s.$data,r);l.setProp(s.$data,r,e),s.$watchers[r]&&s.$watchers[r].apply(s,[t,e]),s.render()}})}}}for(var t in a)e(t)}},{"./DataFns":3}],5:[function(e,t,c){"use strict";Object.defineProperty(c,"__esModule",{value:!0});var l=e("../etc/Regexes"),d=e("../vdom/CreateElement");c.traverse=function(e){var t=[],r={},n={},o="";Array.from(e.childNodes).forEach(function(e){1===e.nodeType?t.push(c.traverse(e)):t.push(e.data)});for(var i=0;i<e.attributes.length;i++){var s=e.attributes[i],a=s.name,u=s.value;if(a.startsWith("@"))n[a.slice(1)]=u;else if(a.startsWith("bindval"));else if("loopfor"===a);else if("ref"===a);else if("showif"===a){o=u.replace(l.Regexes.interpolationContent,function(e){return"this."+e})}else if("showelse"===a){o="!("+e.previousElementSibling.attributes.showif.value.replace(l.Regexes.interpolationContent,function(e){return"this."+e})+")"}else r[a]=u}return d.createEl(e.tagName,{attrs:r,events:n,conditionalCase:o,children:t})}},{"../etc/Regexes":8,"../vdom/CreateElement":10}],6:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.possibleEventList=["input","change","cached","error","abort","load","beforeunload","unload","online","offline","focus","blur","animationstart","animationend","animationiteration","transitionstart","transitioncancel","transitionend","transitionrun","reset","submit","resize","scroll","cut","copy","paste","keydown","keypress","keyup","mouseenter","mouseover","mousemove","mousedown","mouseup","auxclick","click","dblclick","contextmenu","wheel","mouseleave","mouseout","select","dragstart","drag","dragend","dragenter","dragover","dragleave","drop","durationchange","loadedmetadata","loadeddata","canplay","canplaythrough","ended","emptied","stalled","suspend","play","playing","pause","waiting","seeking","seeked","ratechange","timeupdate","volumechange","complete","audioprocess"]},{}],7:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.keyCodes={backspace:8,delete:46,down:40,enter:13,left:37,right:39,space:32,tab:9,up:38,esc:27}},{}],8:[function(e,t,r){"use strict";var n;Object.defineProperty(r,"__esModule",{value:!0}),(n=r.Regexes||(r.Regexes={})).interpolation=/({{.*?}})/,n.globalInterpolation=/({{.*?}})/g,n.innerInterpolation=/[\w\.]+/,n.innerFunctionInterpolation=/\w+\(\)/,n.interpolationContent=/[A-z]+((\.\w+)+)?(?=([^'\\]*(\\.|'([^'\\]*\\.)*[^'\\]*'))*[^']*$)/g,n.filterMatch=/(\|)(\s+)?\w+(.*)?\b(?=([^'\\]*(\\.|'([^'\\]*\\.)*[^'\\]*'))*[^']*$)/,n.filter2Match=/(\|)(\s+)?\w+(\.\w+)?(.*)?\b(?=([^'\\]*(\\.|'([^'\\]*\\.)*[^'\\]*'))*[^']*$)/,n.filterNames=/\w+(\.\w+)?/g},{}],9:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=e("../etc/Regexes");r.parse=function(r,e){return e.replace(n.Regexes.innerFunctionInterpolation,function(e){var t=e.substr(0,e.length-2);return r[t]?"this."+e:e})}},{"../etc/Regexes":8}],10:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.createEl=function(e,t){var r=t.attrs,n=void 0===r?{}:r,o=t.events,i=void 0===o?{}:o,s=t.conditionalCase,a=void 0===s?"":s,u=t.children;return{tagName:e,attrs:n,events:i,conditionalCase:a,children:void 0===u?[]:u}}},{}],11:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var C=e("../attributes/Events");r.renderElem=function(e,t){var r=t.tagName,n=t.attrs,o=t.events,i=t.conditionalCase,s=t.children,a=Boolean(Function('"use strict";return '+i+";").call(e));if(i&&!1===a)return document.createComment(" ");for(var u=document.createElement(r),c=0,l=Object.entries(n);c<l.length;c++){var d=l[c],f=d[0],v=d[1];u.setAttribute(f,v)}for(var p=0,h=Object.entries(o);p<h.length;p++){var m=h[p],g=(f=m[0],v=m[1],C.default(e,f,v)),y=g.eventName,b=g.fn,P=g.otherEventModifiers;u.addEventListener(y,b,P)}for(var w=0,E=s;w<E.length;w++){var $=E[w],O=_(e,$);u.appendChild(O)}return u};var _=function(e,t){return"string"==typeof t?document.createTextNode(t):r.renderElem(e,t)}},{"../attributes/Events":2}]},{},[1]);
//# sourceMappingURL=bundle.js.map
