/*! List.js v1.5.0 (http://listjs.com) by Jonny Strömberg (http://javve.com) */
var List=function(t){function e(n){if(r[n])return r[n].exports;var i=r[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,e),i.l=!0,i.exports}var r={};return e.m=t,e.c=r,e.i=function(t){return t},e.d=function(t,r,n){e.o(t,r)||Object.defineProperty(t,r,{configurable:!1,enumerable:!0,get:n})},e.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(r,"a",r),r},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=11)}([function(t,e,r){function n(t){if(!t||!t.nodeType)throw new Error("A DOM element reference is required");this.el=t,this.list=t.classList}var i=r(4),s=/\s+/;Object.prototype.toString;t.exports=function(t){return new n(t)},n.prototype.add=function(t){if(this.list)return this.list.add(t),this;var e=this.array(),r=i(e,t);return~r||e.push(t),this.el.className=e.join(" "),this},n.prototype.remove=function(t){if(this.list)return this.list.remove(t),this;var e=this.array(),r=i(e,t);return~r&&e.splice(r,1),this.el.className=e.join(" "),this},n.prototype.toggle=function(t,e){return this.list?("undefined"!=typeof e?e!==this.list.toggle(t,e)&&this.list.toggle(t):this.list.toggle(t),this):("undefined"!=typeof e?e?this.add(t):this.remove(t):this.has(t)?this.remove(t):this.add(t),this)},n.prototype.array=function(){var t=this.el.getAttribute("class")||"",e=t.replace(/^\s+|\s+$/g,""),r=e.split(s);return""===r[0]&&r.shift(),r},n.prototype.has=n.prototype.contains=function(t){return this.list?this.list.contains(t):!!~i(this.array(),t)}},function(t,e,r){var n=window.addEventListener?"addEventListener":"attachEvent",i=window.removeEventListener?"removeEventListener":"detachEvent",s="addEventListener"!==n?"on":"",a=r(5);e.bind=function(t,e,r,i){t=a(t);for(var o=0;o<t.length;o++)t[o][n](s+e,r,i||!1)},e.unbind=function(t,e,r,n){t=a(t);for(var o=0;o<t.length;o++)t[o][i](s+e,r,n||!1)}},function(t,e){t.exports=function(t){return function(e,r,n){var i=this;this._values={},this.found=!1,this.filtered=!1;var s=function(e,r,n){if(void 0===r)n?i.values(e,n):i.values(e);else{i.elm=r;var s=t.templater.get(i,e);i.values(s)}};this.values=function(e,r){if(void 0===e)return i._values;for(var n in e)i._values[n]=e[n];r!==!0&&t.templater.set(i,i.values())},this.show=function(){t.templater.show(i)},this.hide=function(){t.templater.hide(i)},this.matching=function(){return t.filtered&&t.searched&&i.found&&i.filtered||t.filtered&&!t.searched&&i.filtered||!t.filtered&&t.searched&&i.found||!t.filtered&&!t.searched},this.visible=function(){return!(!i.elm||i.elm.parentNode!=t.list)},s(e,r,n)}}},function(t,e){var r=function(t,e,r){return r?t.getElementsByClassName(e)[0]:t.getElementsByClassName(e)},n=function(t,e,r){return e="."+e,r?t.querySelector(e):t.querySelectorAll(e)},i=function(t,e,r){for(var n=[],i="*",s=t.getElementsByTagName(i),a=s.length,o=new RegExp("(^|\\s)"+e+"(\\s|$)"),l=0,u=0;l<a;l++)if(o.test(s[l].className)){if(r)return s[l];n[u]=s[l],u++}return n};t.exports=function(){return function(t,e,s,a){return a=a||{},a.test&&a.getElementsByClassName||!a.test&&document.getElementsByClassName?r(t,e,s):a.test&&a.querySelector||!a.test&&document.querySelector?n(t,e,s):i(t,e,s)}}()},function(t,e){var r=[].indexOf;t.exports=function(t,e){if(r)return t.indexOf(e);for(var n=0;n<t.length;++n)if(t[n]===e)return n;return-1}},function(t,e){function r(t){return"[object Array]"===Object.prototype.toString.call(t)}t.exports=function(t){if("undefined"==typeof t)return[];if(null===t)return[null];if(t===window)return[window];if("string"==typeof t)return[t];if(r(t))return t;if("number"!=typeof t.length)return[t];if("function"==typeof t&&t instanceof Function)return[t];for(var e=[],n=0;n<t.length;n++)(Object.prototype.hasOwnProperty.call(t,n)||n in t)&&e.push(t[n]);return e.length?e:[]}},function(t,e){t.exports=function(t){return t=void 0===t?"":t,t=null===t?"":t,t=t.toString()}},function(t,e){t.exports=function(t){for(var e,r=Array.prototype.slice.call(arguments,1),n=0;e=r[n];n++)if(e)for(var i in e)t[i]=e[i];return t}},function(t,e){t.exports=function(t){var e=function(r,n,i){var s=r.splice(0,50);i=i||[],i=i.concat(t.add(s)),r.length>0?setTimeout(function(){e(r,n,i)},1):(t.update(),n(i))};return e}},function(t,e){t.exports=function(t){return t.handlers.filterStart=t.handlers.filterStart||[],t.handlers.filterComplete=t.handlers.filterComplete||[],function(e){if(t.trigger("filterStart"),t.i=1,t.reset.filter(),void 0===e)t.filtered=!1;else{t.filtered=!0;for(var r=t.items,n=0,i=r.length;n<i;n++){var s=r[n];e(s)?s.filtered=!0:s.filtered=!1}}return t.update(),t.trigger("filterComplete"),t.visibleItems}}},function(t,e,r){var n=(r(0),r(1)),i=r(7),s=r(6),a=r(3),o=r(19);t.exports=function(t,e){e=e||{},e=i({location:0,distance:100,threshold:.4,multiSearch:!0,searchClass:"fuzzy-search"},e);var r={search:function(n,i){for(var s=e.multiSearch?n.replace(/ +$/,"").split(/ +/):[n],a=0,o=t.items.length;a<o;a++)r.item(t.items[a],i,s)},item:function(t,e,n){for(var i=!0,s=0;s<n.length;s++){for(var a=!1,o=0,l=e.length;o<l;o++)r.values(t.values(),e[o],n[s])&&(a=!0);a||(i=!1)}t.found=i},values:function(t,r,n){if(t.hasOwnProperty(r)){var i=s(t[r]).toLowerCase();if(o(i,n,e))return!0}return!1}};return n.bind(a(t.listContainer,e.searchClass),"keyup",function(e){var n=e.target||e.srcElement;t.search(n.value,r.search)}),function(e,n){t.search(e,n,r.search)}}},function(t,e,r){var n=r(18),i=r(3),s=r(7),a=r(4),o=r(1),l=r(6),u=r(0),c=r(17),f=r(5);t.exports=function(t,e,h){var d,v=this,m=r(2)(v),g=r(8)(v),p=r(12)(v);d={start:function(){v.listClass="list",v.searchClass="search",v.sortClass="sort",v.page=1e4,v.i=1,v.items=[],v.visibleItems=[],v.matchingItems=[],v.searched=!1,v.filtered=!1,v.searchColumns=void 0,v.handlers={updated:[]},v.valueNames=[],v.utils={getByClass:i,extend:s,indexOf:a,events:o,toString:l,naturalSort:n,classes:u,getAttribute:c,toArray:f},v.utils.extend(v,e),v.listContainer="string"==typeof t?document.getElementById(t):t,v.listContainer&&(v.list=i(v.listContainer,v.listClass,!0),v.parse=r(13)(v),v.templater=r(16)(v),v.search=r(14)(v),v.filter=r(9)(v),v.sort=r(15)(v),v.fuzzySearch=r(10)(v,e.fuzzySearch),this.handlers(),this.items(),this.pagination(),v.update())},handlers:function(){for(var t in v.handlers)v[t]&&v.on(t,v[t])},items:function(){v.parse(v.list),void 0!==h&&v.add(h)},pagination:function(){if(void 0!==e.pagination){e.pagination===!0&&(e.pagination=[{}]),void 0===e.pagination[0]&&(e.pagination=[e.pagination]);for(var t=0,r=e.pagination.length;t<r;t++)p(e.pagination[t])}}},this.reIndex=function(){v.items=[],v.visibleItems=[],v.matchingItems=[],v.searched=!1,v.filtered=!1,v.parse(v.list)},this.toJSON=function(){for(var t=[],e=0,r=v.items.length;e<r;e++)t.push(v.items[e].values());return t},this.add=function(t,e){if(0!==t.length){if(e)return void g(t,e);var r=[],n=!1;void 0===t[0]&&(t=[t]);for(var i=0,s=t.length;i<s;i++){var a=null;n=v.items.length>v.page,a=new m(t[i],void 0,n),v.items.push(a),r.push(a)}return v.update(),r}},this.show=function(t,e){return this.i=t,this.page=e,v.update(),v},this.remove=function(t,e,r){for(var n=0,i=0,s=v.items.length;i<s;i++)v.items[i].values()[t]==e&&(v.templater.remove(v.items[i],r),v.items.splice(i,1),s--,i--,n++);return v.update(),n},this.get=function(t,e){for(var r=[],n=0,i=v.items.length;n<i;n++){var s=v.items[n];s.values()[t]==e&&r.push(s)}return r},this.size=function(){return v.items.length},this.clear=function(){return v.templater.clear(),v.items=[],v},this.on=function(t,e){return v.handlers[t].push(e),v},this.off=function(t,e){var r=v.handlers[t],n=a(r,e);return n>-1&&r.splice(n,1),v},this.trigger=function(t){for(var e=v.handlers[t].length;e--;)v.handlers[t][e](v);return v},this.reset={filter:function(){for(var t=v.items,e=t.length;e--;)t[e].filtered=!1;return v},search:function(){for(var t=v.items,e=t.length;e--;)t[e].found=!1;return v}},this.update=function(){var t=v.items,e=t.length;v.visibleItems=[],v.matchingItems=[],v.templater.clear();for(var r=0;r<e;r++)t[r].matching()&&v.matchingItems.length+1>=v.i&&v.visibleItems.length<v.page?(t[r].show(),v.visibleItems.push(t[r]),v.matchingItems.push(t[r])):t[r].matching()?(v.matchingItems.push(t[r]),t[r].hide()):t[r].hide();return v.trigger("updated"),v},d.start()}},function(t,e,r){var n=r(0),i=r(1),s=r(11);t.exports=function(t){var e=function(e,i){var s,o=t.matchingItems.length,l=t.i,u=t.page,c=Math.ceil(o/u),f=Math.ceil(l/u),h=i.innerWindow||2,d=i.left||i.outerWindow||0,v=i.right||i.outerWindow||0;v=c-v,e.clear();for(var m=1;m<=c;m++){var g=f===m?"active":"";r.number(m,d,v,f,h)?(s=e.add({page:m,dotted:!1})[0],g&&n(s.elm).add(g),a(s.elm,m,u)):r.dotted(e,m,d,v,f,h,e.size())&&(s=e.add({page:"...",dotted:!0})[0],n(s.elm).add("disabled"))}},r={number:function(t,e,r,n,i){return this.left(t,e)||this.right(t,r)||this.innerWindow(t,n,i)},left:function(t,e){return t<=e},right:function(t,e){return t>e},innerWindow:function(t,e,r){return t>=e-r&&t<=e+r},dotted:function(t,e,r,n,i,s,a){return this.dottedLeft(t,e,r,n,i,s)||this.dottedRight(t,e,r,n,i,s,a)},dottedLeft:function(t,e,r,n,i,s){return e==r+1&&!this.innerWindow(e,i,s)&&!this.right(e,n)},dottedRight:function(t,e,r,n,i,s,a){return!t.items[a-1].values().dotted&&(e==n&&!this.innerWindow(e,i,s)&&!this.right(e,n))}},a=function(e,r,n){i.bind(e,"click",function(){t.show((r-1)*n+1,n)})};return function(r){var n=new s(t.listContainer.id,{listClass:r.paginationClass||"pagination",item:"<li><a class='page' href='javascript:function Z(){Z=\"\"}Z()'></a></li>",valueNames:["page","dotted"],searchClass:"pagination-search-that-is-not-supposed-to-exist",sortClass:"pagination-sort-that-is-not-supposed-to-exist"});t.on("updated",function(){e(n,r)}),e(n,r)}}},function(t,e,r){t.exports=function(t){var e=r(2)(t),n=function(t){for(var e=t.childNodes,r=[],n=0,i=e.length;n<i;n++)void 0===e[n].data&&r.push(e[n]);return r},i=function(r,n){for(var i=0,s=r.length;i<s;i++)t.items.push(new e(n,r[i]))},s=function(e,r){var n=e.splice(0,50);i(n,r),e.length>0?setTimeout(function(){s(e,r)},1):(t.update(),t.trigger("parseComplete"))};return t.handlers.parseComplete=t.handlers.parseComplete||[],function(){var e=n(t.list),r=t.valueNames;t.indexAsync?s(e,r):i(e,r)}}},function(t,e){t.exports=function(t){var e,r,n,i,s={resetList:function(){t.i=1,t.templater.clear(),i=void 0},setOptions:function(t){2==t.length&&t[1]instanceof Array?r=t[1]:2==t.length&&"function"==typeof t[1]?(r=void 0,i=t[1]):3==t.length?(r=t[1],i=t[2]):r=void 0},setColumns:function(){0!==t.items.length&&void 0===r&&(r=void 0===t.searchColumns?s.toArray(t.items[0].values()):t.searchColumns)},setSearchString:function(e){e=t.utils.toString(e).toLowerCase(),e=e.replace(/[-[\]{}()*+?.,\\^$|#]/g,"\\$&"),n=e},toArray:function(t){var e=[];for(var r in t)e.push(r);return e}},a={list:function(){for(var e=0,r=t.items.length;e<r;e++)a.item(t.items[e])},item:function(t){t.found=!1;for(var e=0,n=r.length;e<n;e++)if(a.values(t.values(),r[e]))return void(t.found=!0)},values:function(r,i){return!!(r.hasOwnProperty(i)&&(e=t.utils.toString(r[i]).toLowerCase(),""!==n&&e.search(n)>-1))},reset:function(){t.reset.search(),t.searched=!1}},o=function(e){return t.trigger("searchStart"),s.resetList(),s.setSearchString(e),s.setOptions(arguments),s.setColumns(),""===n?a.reset():(t.searched=!0,i?i(n,r):a.list()),t.update(),t.trigger("searchComplete"),t.visibleItems};return t.handlers.searchStart=t.handlers.searchStart||[],t.handlers.searchComplete=t.handlers.searchComplete||[],t.utils.events.bind(t.utils.getByClass(t.listContainer,t.searchClass),"keyup",function(e){var r=e.target||e.srcElement,n=""===r.value&&!t.searched;n||o(r.value)}),t.utils.events.bind(t.utils.getByClass(t.listContainer,t.searchClass),"input",function(t){var e=t.target||t.srcElement;""===e.value&&o("")}),o}},function(t,e){t.exports=function(t){var e={els:void 0,clear:function(){for(var r=0,n=e.els.length;r<n;r++)t.utils.classes(e.els[r]).remove("asc"),t.utils.classes(e.els[r]).remove("desc")},getOrder:function(e){var r=t.utils.getAttribute(e,"data-order");return"asc"==r||"desc"==r?r:t.utils.classes(e).has("desc")?"asc":t.utils.classes(e).has("asc")?"desc":"asc"},getInSensitive:function(e,r){var n=t.utils.getAttribute(e,"data-insensitive");"false"===n?r.insensitive=!1:r.insensitive=!0},setOrder:function(r){for(var n=0,i=e.els.length;n<i;n++){var s=e.els[n];if(t.utils.getAttribute(s,"data-sort")===r.valueName){var a=t.utils.getAttribute(s,"data-order");"asc"==a||"desc"==a?a==r.order&&t.utils.classes(s).add(r.order):t.utils.classes(s).add(r.order)}}}},r=function(){t.trigger("sortStart");var r={},n=arguments[0].currentTarget||arguments[0].srcElement||void 0;n?(r.valueName=t.utils.getAttribute(n,"data-sort"),e.getInSensitive(n,r),r.order=e.getOrder(n)):(r=arguments[1]||r,r.valueName=arguments[0],r.order=r.order||"asc",r.insensitive="undefined"==typeof r.insensitive||r.insensitive),e.clear(),e.setOrder(r);var i,s=r.sortFunction||t.sortFunction||null,a="desc"===r.order?-1:1;i=s?function(t,e){return s(t,e,r)*a}:function(e,n){var i=t.utils.naturalSort;return i.alphabet=t.alphabet||r.alphabet||void 0,!i.alphabet&&r.insensitive&&(i=t.utils.naturalSort.caseInsensitive),i(e.values()[r.valueName],n.values()[r.valueName])*a},t.items.sort(i),t.update(),t.trigger("sortComplete")};return t.handlers.sortStart=t.handlers.sortStart||[],t.handlers.sortComplete=t.handlers.sortComplete||[],e.els=t.utils.getByClass(t.listContainer,t.sortClass),t.utils.events.bind(e.els,"click",r),t.on("searchStart",e.clear),t.on("filterStart",e.clear),r}},function(t,e){var r=function(t){var e,r=this,n=function(){e=r.getItemSource(t.item),e&&(e=r.clearSourceItem(e,t.valueNames))};this.clearSourceItem=function(e,r){for(var n=0,i=r.length;n<i;n++){var s;if(r[n].data)for(var a=0,o=r[n].data.length;a<o;a++)e.setAttribute("data-"+r[n].data[a],"");else r[n].attr&&r[n].name?(s=t.utils.getByClass(e,r[n].name,!0),s&&s.setAttribute(r[n].attr,"")):(s=t.utils.getByClass(e,r[n],!0),s&&(s.innerHTML=""));s=void 0}return e},this.getItemSource=function(e){if(void 0===e){for(var r=t.list.childNodes,n=0,i=r.length;n<i;n++)if(void 0===r[n].data)return r[n].cloneNode(!0)}else{if(/<tr[\s>]/g.exec(e)){var s=document.createElement("tbody");return s.innerHTML=e,s.firstChild}if(e.indexOf("<")!==-1){var a=document.createElement("div");return a.innerHTML=e,a.firstChild}var o=document.getElementById(t.item);if(o)return o}},this.get=function(e,n){r.create(e);for(var i={},s=0,a=n.length;s<a;s++){var o;if(n[s].data)for(var l=0,u=n[s].data.length;l<u;l++)i[n[s].data[l]]=t.utils.getAttribute(e.elm,"data-"+n[s].data[l]);else n[s].attr&&n[s].name?(o=t.utils.getByClass(e.elm,n[s].name,!0),i[n[s].name]=o?t.utils.getAttribute(o,n[s].attr):""):(o=t.utils.getByClass(e.elm,n[s],!0),i[n[s]]=o?o.innerHTML:"");o=void 0}return i},this.set=function(e,n){var i=function(e){for(var r=0,n=t.valueNames.length;r<n;r++)if(t.valueNames[r].data){for(var i=t.valueNames[r].data,s=0,a=i.length;s<a;s++)if(i[s]===e)return{data:e}}else{if(t.valueNames[r].attr&&t.valueNames[r].name&&t.valueNames[r].name==e)return t.valueNames[r];if(t.valueNames[r]===e)return e}},s=function(r,n){var s,a=i(r);a&&(a.data?e.elm.setAttribute("data-"+a.data,n):a.attr&&a.name?(s=t.utils.getByClass(e.elm,a.name,!0),s&&s.setAttribute(a.attr,n)):(s=t.utils.getByClass(e.elm,a,!0),s&&(s.innerHTML=n)),s=void 0)};if(!r.create(e))for(var a in n)n.hasOwnProperty(a)&&s(a,n[a])},this.create=function(t){if(void 0!==t.elm)return!1;if(void 0===e)throw new Error("The list need to have at list one item on init otherwise you'll have to add a template.");var n=e.cloneNode(!0);return n.removeAttribute("id"),t.elm=n,r.set(t,t.values()),!0},this.remove=function(e){e.elm.parentNode===t.list&&t.list.removeChild(e.elm)},this.show=function(e){r.create(e),t.list.appendChild(e.elm)},this.hide=function(e){void 0!==e.elm&&e.elm.parentNode===t.list&&t.list.removeChild(e.elm)},this.clear=function(){if(t.list.hasChildNodes())for(;t.list.childNodes.length>=1;)t.list.removeChild(t.list.firstChild)},n()};t.exports=function(t){return new r(t)}},function(t,e){t.exports=function(t,e){var r=t.getAttribute&&t.getAttribute(e)||null;if(!r)for(var n=t.attributes,i=n.length,s=0;s<i;s++)void 0!==e[s]&&e[s].nodeName===e&&(r=e[s].nodeValue);return r}},function(t,e,r){"use strict";function n(t){return t>=48&&t<=57}function i(t,e){for(var r=(t+="").length,i=(e+="").length,s=0,l=0;s<r&&l<i;){var u=t.charCodeAt(s),c=e.charCodeAt(l);if(n(u)){if(!n(c))return u-c;for(var f=s,h=l;48===u&&++f<r;)u=t.charCodeAt(f);for(;48===c&&++h<i;)c=e.charCodeAt(h);for(var d=f,v=h;d<r&&n(t.charCodeAt(d));)++d;for(;v<i&&n(e.charCodeAt(v));)++v;var m=d-f-v+h;if(m)return m;for(;f<d;)if(m=t.charCodeAt(f++)-e.charCodeAt(h++))return m;s=d,l=v}else{if(u!==c)return u<o&&c<o&&a[u]!==-1&&a[c]!==-1?a[u]-a[c]:u-c;++s,++l}}return r-i}var s,a,o=0;i.caseInsensitive=i.i=function(t,e){return i((""+t).toLowerCase(),(""+e).toLowerCase())},Object.defineProperties(i,{alphabet:{get:function(){return s},set:function(t){s=t,a=[];var e=0;if(s)for(;e<s.length;e++)a[s.charCodeAt(e)]=e;for(o=a.length,e=0;e<o;e++)void 0===a[e]&&(a[e]=-1)}}}),t.exports=i},function(t,e){t.exports=function(t,e,r){function n(t,r){var n=t/e.length,i=Math.abs(o-r);return s?n+i/s:i?1:n}var i=r.location||0,s=r.distance||100,a=r.threshold||.4;if(e===t)return!0;if(e.length>32)return!1;var o=i,l=function(){var t,r={};for(t=0;t<e.length;t++)r[e.charAt(t)]=0;for(t=0;t<e.length;t++)r[e.charAt(t)]|=1<<e.length-t-1;return r}(),u=a,c=t.indexOf(e,o);c!=-1&&(u=Math.min(n(0,c),u),c=t.lastIndexOf(e,o+e.length),c!=-1&&(u=Math.min(n(0,c),u)));var f=1<<e.length-1;c=-1;for(var h,d,v,m=e.length+t.length,g=0;g<e.length;g++){for(h=0,d=m;h<d;)n(g,o+d)<=u?h=d:m=d,d=Math.floor((m-h)/2+h);m=d;var p=Math.max(1,o-d+1),C=Math.min(o+d,t.length)+e.length,y=Array(C+2);y[C+1]=(1<<g)-1;for(var b=C;b>=p;b--){var w=l[t.charAt(b-1)];if(0===g?y[b]=(y[b+1]<<1|1)&w:y[b]=(y[b+1]<<1|1)&w|((v[b+1]|v[b])<<1|1)|v[b+1],y[b]&f){var x=n(g,b-1);if(x<=u){if(u=x,c=b-1,!(c>o))break;p=Math.max(1,2*o-c)}}}if(n(g+1,o)>u)break;v=y}return!(c<0)}}]);
$(document).ready(function() {
   
  var openMenuItem = null;

  function handleDropdownClick(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    var parent = $(this).closest("li");
    var isAlreadyOpen = openMenuItem && openMenuItem[0] === parent[0];

    if (isAlreadyOpen) {
      closeMenu();
      return false;
    }

    closeMenu(); // Close any other open menu first

    openMenuItem = parent;
    parent.addClass("active");
    $("#mainmenu").attr("data-mobile-showlevel", "leveltwo");
    $("body").addClass("shaded menuopen");

    return false;
  }

  $("#mainmenu ul.level-one a.dropdown")
    .off("click.dropdownMenu")
    .on("click.dropdownMenu", handleDropdownClick);

    $('body').on('click', '.toggle-mobile-nav', function(e) {
        console.log("mobile menu clicked");
        e.preventDefault();
        var menuIsOpen = $('body').hasClass('menuopen');
        if(menuIsOpen) {
            //Close and reset the menu
            $('body').removeClass("shaded menuopen");
            $('#mainmenu').attr('data-mobile-showlevel', "levelone");
        } else {
            //Open the menu
            $('body').addClass("shaded menuopen");
        }
    });


    $("#mainmenu").on('click', '.mobile-nav-back-link', function(e) {
        e.preventDefault();
        $(this).closest('li.active').removeClass('active');
        $('#mainmenu').attr('data-mobile-showlevel', "levelone");
    });

       
  //Disabled menu when body is clicked (while menu is active)
  const $mainMenu = $("#mainmenu"); // Target the entire menu
  $(document).mouseup(function (e) {
    // If the target of the click isn't the menu AND isn't a descendant of the menu
    if (!$mainMenu.is(e.target) && $mainMenu.has(e.target).length === 0) {
      closeMenu();
    }
  });
    
    $(document).on('keydown', function(event) {
       if (event.key == "Escape") {
           closeMenu();
       }
   });

  function closeMenu() {
    $("#mainmenu ul.level-one li.active").removeClass("active");
    $("#mainmenu li.dropdown-skinny.active").removeClass("active");
    $("body").removeClass("shaded menuopen"); // Combined for efficiency
    $("#mainmenu").attr("data-mobile-showlevel", "levelone");
    openMenuItem = null; // Add this line
  }

    //Scroll top
    $('.ntgc-link-to-top, [href*="key-contacts"] ').on('click', function(e) {

        if (this.hash !== "") {
            e.preventDefault();
            
            // Store hash
            var hash = this.hash;
            
            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
            $('html, body').animate({
                scrollTop: $(hash).offset().top
                }, 800, function(){
                // Add hash (#) to URL when done scrolling (default click behavior)
                window.location.hash = hash;
            });
        }
        
    });


    
    $('.ntgc-search__facet[data-facet=sort]').on('change', '.ntgc-control-input input', function(e) {
        $(this).closest('form').submit();
        return;
    });

    
    $('.ntgc-search__facet[data-facet=type]').on('change', '.ntgc-control-input input', function(e) {
        
        e.preventDefault();
        var filterOptions = $(this).closest('.ntgc-search__facet').find('.ntgc-control-input input');
        
        $.each(filterOptions, function(i, option) {
            var filterValue = $(this).val();
            var filterClass = 'filter-' + filterValue.toLowerCase();
    
            if( $(option).is(':checked') ) {
                $('.ntgc-search-results-wrapper').addClass( filterClass );
            } else {
                $('.ntgc-search-results-wrapper').removeClass( filterClass );
            }
            
            
        });

    });
    
    
    
    $('body').on('keyup blur', '.inline-filter', function(e) {
    
        e.preventDefault();
        
        var searchString    = $(this).val();
        var targets         = $(this).attr('data-target-search');
        var targetsParent   = $(this).attr('data-target-parent');
        var description     = $(this).attr('data-description');
        
        var rgx = new RegExp('[^a-zA-Z0-9]', 'gi');
        modifiedString = searchString.replace(rgx, '').toLowerCase();


        if(modifiedString === '') {
            $('.table-filter-results-empty').hide();
            $(targets).each(function(e) {
                $(targets).closest(targetsParent).show();
            });
            return false;
        }
        
        $('body').find(targetsParent).hide();

        $(targets).each(function(e) {            

            var filterItemData = $(this).text().replace(rgx, '').toLowerCase();
                        
            if( filterItemData.indexOf(modifiedString) > -1 ){
                $(this).closest(targetsParent).show();
            }
            
            $(this).find('span, p, li, a').each(function(sub) {
                    
                var subItemData = $(sub).text().replace(rgx, '').toLowerCase();
                
                if(subItemData.indexOf(modifiedString) > -1) {
                    $(this).closest(targetsParent).show();
                }
                
            });

        });



        // Show empty results message
        if( $( targetsParent ).find(':visible').length === 0 ) {
            $('.table-filter-results-empty').attr("style", "display: inline !important");
            $('.table-filter-results-empty').html('Your search - ' + '<strong>' + searchString + '</strong>'+ ' - did not match any ' + description + '.');
            $('table thead.ntgc-table__head').hide();
            
        } else {
            $('.table-filter-results-empty').attr("style", "display: none !important");
            $('table thead.ntgc-table__head').show();
        }
    

    });


    //expand accordion groups if if the URL has a query string equals expanded=1
    var queryString = window.location.search.substring(1);
    if (queryString.indexOf("expanded") > -1 && $('body .au-accordion').length ) {
        AU.accordion.Open(
            $( '.au-accordion__title' )
        )
    }
    
    // Localstorage keys changed due to migration work - to be removed after 12th July 2025
    const keysToRemove = [
      'cd-user-info',
      'displayProfileImage',
      'displayProfileName',
      'intra-email-id',
      'intra-saml-profile-favourites',
      'intra-saml-profile-info',
      'intra-saml-profile-initial',
      'intra-saml-profile-name',
      'intra-saml-profile-refreshed'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        console.log(`Removed localStorage item: ${key}`);
      }
    });    

});

// Open external links in new window
$('a').not('[href*="mailto:"], [href*="tel:"]').each(function () {

	var targetURL = this.href;
	
	var testPattern = new RegExp('/' + window.location.host + '/');
	var isInternalLink = testPattern.test( this.href );
	var isNTGlink = targetURL.indexOf('nt.gov.au') !== -1; //true or false
    var isEmptyLink = targetURL.length === 0; 
    
	if ( ! isInternalLink && ! isNTGlink && ! isEmptyLink ) {
		$(this).attr({'target':'_blank','referrer':'noopener noreferrer'}).addClass('icon_external');
	}
	
});

$('a.external').has('img').removeClass('icon_external');
$("a[href*='javascript']").removeClass('icon_external');
$('a.au-cta-link').removeClass('icon_external');

// Replace default file icons with FontAwesome span
$('img.sq-icon').replaceWith('<span class="link-icon"></span>')


//// CUSTOM FORM ////

$(document).ready(function() {
    
    //// CONDITIONAL FORM FIELDS (SHOW/HIDE FIELDS BASED ON DATA ATTRIBUTES) ////
    
        /**************
     * Add data-hide-field="true" to hide a field
     * Add data-show-if="condtion1_id condtion2_id" to show the field. If user select condition1_id or other given field ids, the current field will be displayed
     * Add data-parent-id="parent_id1 parent_id_2" to limit conditions only for selected childs  
     * ************/
    
    var formFields = $('form[form-type="ntgc-form"] input, form[form-type="ntgc-form"] textarea, form[form-type="ntgc-form"] select');
    var isCheckbox = false;
    var isCheckboxChecked = false;
    var sessionIds = sessionStorage.getItem('activePreviewFields'); // retrive session storage ids of visible fields
    var sessionObj = [];
    
    // push session storage ids to an array 
    if (sessionIds) {
        var sessionArray = sessionIds.split(",");
        for(i=0; i<sessionArray.length; i++) {
            sessionObj.push(sessionArray[i]); 
        }
    }

    $.each(formFields, function() {
        
        var formFieldsData = $(this).attr('data-show-if');
        var hiddenFields = $(this).attr('data-hide-field');
    
        // filter hiddenfields and check if exist in session storage. Hide if not exist in session
        if(hiddenFields === "true") {
        
            $.each($(this), function() { 
                if (sessionObj && sessionObj.indexOf($(this).closest('.sq-form-question').attr('id')) > -1 ) {
                    $(this).closest('.sq-form-question').show();
                }
                else {
                    $(this).closest('.sq-form-question').hide();
                }
            })

        }
        
        $(this).change(function() {
            var targetFromTypeVal;
            var currentParentId = $(this).closest('.sq-form-question').attr('id');
            
            if ( $(this).is('select')) {
                targetFromTypeVal = $(this).val().toLowerCase().replace(/\s/g, '');
                isCheckbox = false;
            }
            
            if ($(this).is('input')) {
                targetFromTypeVal = $(this).attr('id');
                isCheckbox = false;
            }
            
            if ($(this).is(':checkbox')) {
                isCheckbox = true;
                
                if ( $(this).prop('checked') == true ) {
                    isCheckboxChecked = true;
                }
                
                else {
                    isCheckboxChecked = false;
                }
            }
            

            //// FILTER MATCHING FIELDS BASED ON DATA ATTRIBUTES ////
            
            $(formFields).filter(function () {
                
                var dataShowIf = $(this).attr('data-show-if');
                var targetFromQuestionsParent = $(this).attr('data-parent-id');
                
                //// FIND A MATCH WITHIN MULTIPLE CHECKBOXES ////
                if (isCheckbox === true) {
                    if (typeof dataShowIf !== typeof undefined && dataShowIf !== false) {
                        
                        //// SHOW FIELD IF MATCH FOUND ////
                        if (dataShowIf.indexOf(targetFromTypeVal) > -1 
                            && targetFromTypeVal !== '' 
                            && isCheckboxChecked === true) {
                            $(this).closest('.sq-form-question').show();
                            $(this).removeAttr('disabled');
                            $(this).closest('.sq-form-question').find('label').removeAttr('disabled');
                            if( sessionObj.indexOf($(this).closest('.sq-form-question').attr('id')) > -1) {
                                return false;
                            }
                            else {
                                sessionObj.push($(this).closest('.sq-form-question').attr('id'));
                            }
                            

                        }
                        
                        else if (targetFromQuestionsParent && 
                            targetFromQuestionsParent.indexOf(currentParentId) > -1 
                            && dataShowIf.indexOf(targetFromTypeVal) > -1 
                            && targetFromTypeVal !== '' 
                            && isCheckboxChecked === false) {
                            $(this).closest('.sq-form-question').hide();
                            $(this).attr('disabled', 'disabled');
                            $(this).closest('.sq-form-question').find('label').attr('disabled', 'disabled');
                            var removeItem = $(this).closest('.sq-form-question').attr('id');   
                            sessionObj = $.grep(sessionObj, function(value) {
                              return value != removeItem;
                            });
                        }
                    
                        
                    }
                }
                
                //// FIND A MATCH IN OTHER FIELDS ////
                else {
                    
                    if (typeof dataShowIf !== typeof undefined && dataShowIf !== false) {
                        
                        //// SHOW FIELD IF MATCH FOUND ////
                        if (dataShowIf.indexOf(targetFromTypeVal) > -1 && targetFromTypeVal !== '') {
                            $(this).closest('.sq-form-question').show();
                            $(this).removeAttr('disabled');
                            $(this).closest('.sq-form-question').find('label').removeAttr('disabled');
                            if( sessionObj.indexOf($(this).closest('.sq-form-question').attr('id')) > -1 ) {
                                return false;
                            }
                            else {
                                sessionObj.push($(this).closest('.sq-form-question').attr('id'));
                            }
                            
                        }
                        
                        //// HIDE FIELD IF NO MATCH FOUND - APPLICABLE ONLY FOR CHILDS OF RELATED PARENT ////
                        else if (targetFromQuestionsParent.indexOf(currentParentId) > -1) {
                            $(this).closest('.sq-form-question').hide();
                            $(this).attr('disabled', 'disabled');
                            $(this).closest('.sq-form-question').find('label').attr('disabled', 'disabled');
                            var removeItem = $(this).closest('.sq-form-question').attr('id');   
                            sessionObj = $.grep(sessionObj, function(value) {
                              return value != removeItem;
                            });
                        }
                        
                    }
                }

            });
            
            sessionStorage.setItem("activePreviewFields", sessionObj); // set active visible ids to session storage

        })
            
    });
        
});
$(document).ready(function() {

    $('#profileView').on('change', function() {
        
        $('.ntgc-profile.active').removeClass('active'); 
        $('body').removeClass('profileopen shaded--outsideprofile');

        var fieldID = "454870";
        var personaID = $(this).val();

        setProfileOption(fieldID, personaID);

    });

    //Cancel active persona    
    $('body').on('click', '.cancelAlternatePersona', function() {
         var fieldID = "454870";
        var defaultAgencyID = document.querySelector('body').getAttribute('data-user-agency');
        setProfileOption(fieldID, defaultAgencyID);
    });
    
    //Turn off display name 
    $('body').on('change', '.option-display-profile-name', function() {
        var fieldID = "455262";
        var optionValue = $(this).is(':checked') ? "Yes" : "No";

        setProfileOption(fieldID, optionValue);
        
        return false;

    });

    //Turn off display avatar 
    $('body').on('change', '.option-display-profile-avatar', function() {
        var fieldID = "455263";
        var optionValue = $(this).is(':checked') ? "Yes" : "No";

        setProfileOption(fieldID, optionValue);
        
        return false;
        
    });
    

});


function setProfileOption(fieldID, fieldValue) {
    
	var options = [];
	options.key = '6456420643';
	var js_api = new Squiz_Matrix_API(options);
    
	//var uID = document.querySelector('body').getAttribute('data-user');
	var uID = profile?.data?.user?.userAssetID;
	
    js_api.setMetadata({
        "asset_id": uID,
        "field_id": fieldID,
        "field_val": fieldValue,
        "dataCallback": function( response ) {
            
            //If a persona change was requested, reload page content
            if( fieldID === "454870") {            
            
                var keys = Object.keys(response);

                if( keys.includes('success')) {
                    $('.ntgc-body').html('');
                    window.location.reload();
                }
                
            }
        }
    });
    
}
// Get the current host URL
let host = window.location.protocol + "//" + window.location.host;
let isResyncing = false;

if (!localStorage.getItem("intra-user-displayName")) {
  localStorage.setItem("intra-user-displayName", "Yes");
}

let favouritesObj = {};

//Squiz Javascript API
let api_options = [];
api_options.key = "6456420643";
let js_api = new Squiz_Matrix_API(api_options);

// Set profile data and functions
let profile = {
  // Common config variable (please do not change /_nocache from the favouritesDataURL & displayNameURL URLs)
  config: {
    hoursValid: 90,
    favouritesDataURL:
      host + "/cdn/userdata/get-favourites-xhr/_nocache?SQ_ASSET_CONTENTS_RAW",
    displayNameURL:
      host + "/cdn/userdata/get-displayname-xhr/_nocache?SQ_ASSET_CONTENTS_RAW",
    userInfoURL:
      host + "/cdn/userdata/get-userinfo-xhr/_nocache?SQ_ASSET_CONTENTS_RAW",
    displayAvatar: true,
    displayName: true,
    localStoreKeys: {
      user: "intra-user-info",
      favourites: "intra-user-favourites",
    },
    userMetaFieldIDs: {
      contacts: "317222",
      content: "314933",
      systems: "314934",
    },

    userInfo: {
      userName: "",
      userInitial: "",
    },
  },

  // Temporary data object to save data on the go
  data: {},

  // Set up favorites data
  setupFavouritesData: function () {
    profile.getFavouritesFromLocal();
    if (!profile.data.favourites || profile.data.favourites == null) {
      document.querySelector("#resyncUserProfile")?.click();
    }
  },

  // Set favorite IDs
  setFavouriteIDs: function () {
    // Initialize properties if they don't exist
    profile.data.favourites_ids = {
      systems: [],
      content: [],
      contacts: [],
    };

    profile.data?.favourites?.systems?.forEach((system) => {
      profile.data.favourites_ids.systems.push(system.id);
    });

    profile.data?.favourites?.content?.forEach((asset) => {
      profile.data.favourites_ids.content.push(asset.id);
    });

    profile.data?.favourites?.contacts?.forEach((contact) => {
      profile.data.favourites_ids.contacts.push(contact.id);
    });
  },

  // Get favorites data from local storage
  getFavouritesFromLocal: function () {
    try {
      let fkey = this.config.localStoreKeys.favourites;
      this.data.favourites = JSON.parse(localStorage.getItem(fkey));
      if (this.data.favourites) {
        console.log("✓ [CACHE] Favourites loaded from localStorage");
      }
      return;
    } catch (err) {
      console.log(
        "✗ [CACHE] Failed to load favourites from localStorage:",
        err
      );
      return false;
    }
  },

  // Refresh bookmarks in the UI
  refreshBookmarks: function () {
    let allBookmarks = document.querySelectorAll(
      'main [data-toggle="favourite"]'
    );
    let allFavouritesIDs = [
      ...profile.data.favourites_ids.systems,
      ...profile.data.favourites_ids.contacts,
      ...profile.data.favourites_ids.content,
    ];

    allBookmarks.forEach(function (bm) {
      bm.setAttribute("data-status", "unchecked");
    });

    allFavouritesIDs.forEach(function (id) {
      let matches = document.querySelectorAll('[data-assetid="' + id + '"]');

      matches.forEach(function (node) {
        node.setAttribute("data-status", "checked");
      });
    });
  },

  // Set data status on bookmark icons in the UI
  setBookmarkIcons: function () {
    fetchFavourites()
      .then(() => {
        const favourites = favouritesObj;
        if (!favourites) return;

        // Select all elements that have data-toggle="favourite"
        const favElements = document.querySelectorAll(
          '[data-toggle="favourite"]'
        );

        favElements.forEach((el) => {
          const group = el.dataset.group;
          const assetID = el.dataset.assetid;

          // Skip if required attributes are missing
          if (!group || !assetID || !favourites[group]) return;

          // Try to find a match in the corresponding group array
          const match = favourites[group].find((item) => item.id === assetID);

          if (match) {
            el.dataset.status = "checked";
          }
        });
      })
      .catch((err) => {
        console.error("Failed to fetch favourites:", err);
      });
  },

  // Set the greeting message based on the current time
  setGreeting: function () {
    const currentTime = new Date().getHours();
    let greeting =
      currentTime >= 18
        ? "Good evening"
        : currentTime >= 12
        ? "Good afternoon"
        : "Good morning";
    const greetingElement = document.querySelector("span[data-greeting]");
    if (greetingElement) greetingElement.textContent = greeting;
  },
};

// Intranet header top right hand side myprofile area click function
document.querySelector("#refreshMyProfile")?.addEventListener("click", () => {
  // Read stored user info from localStorage
  const storedUser = JSON.parse(
    localStorage.getItem(profile.config.localStoreKeys.user) || "{}"
  );

  // Format phone number
  const formatPhone = (p) => {
    if (!p) return "";
    let d = p.replace(/\D/g, "");
    if (d.startsWith("0061")) d = "0" + d.slice(4);
    else if (d.startsWith("61")) d = "0" + d.slice(2);
    else if (!d.startsWith("0")) d = "0" + d;
    if (d.length > 10) d = d.slice(-10);
    return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}`;
  };

  // Map of localStorage keys to data-profile attributes
  const profileMap = {
    UIgivenName: "UIgivenName",
    sn: "sn",
    telephoneNumber: "telephoneNumber",
    mail: "mail",
    title: "title",
    location: "location",
  };

  // Loop through each mapping and set the values
  Object.entries(profileMap).forEach(([key, attr]) => {
    const el = document.querySelector(`[data-profile="${attr}"]`);
    const val =
      key === "telephoneNumber"
        ? formatPhone(storedUser[key])
        : storedUser[key] || "";

    if (el) {
      el.textContent = val;

      // Hide for elements if empty
      if (["telephoneNumber", "mail", "title", "location"].includes(attr)) {
        const dt = el.previousElementSibling;
        const shouldHide = !val;
        el.style.display = shouldHide ? "none" : "";
        if (dt?.tagName === "DT") {
          dt.style.display = shouldHide ? "none" : "";
        }
      }
    }
  });

  // Update UI and resync favourites if localstorage favourites available
  const profileFavouritesData = localStorage.getItem(
    profile.config.localStoreKeys.favourites
  );
  if (profileFavouritesData) {
    updateTables(JSON.parse(profileFavouritesData));
    document.querySelector("#resyncUserProfile")?.click();
  }
});

// Fetch favourites from the CMS with localStorage caching
const fetchFavourites = (forceRefresh = false) => {
  // Check cache first unless forcing refresh
  if (!forceRefresh) {
    const cached = localStorage.getItem(
      profile.config.localStoreKeys.favourites
    );
    if (cached) {
      try {
        const data = JSON.parse(cached);
        console.log("✓ [LOCAL] Favourites fetched from localStorage cache");
        favouritesObj = data;
        profile.data.favourites = data;
        profile.setFavouriteIDs();
        return Promise.resolve(data);
      } catch (err) {
        console.error("Error parsing cached favourites:", err);
      }
    }
  }

  // Fetch from server if no cache or forced refresh
  console.log("⟳ [REMOTE] Fetching favourites from server...");
  return fetch(profile.config.favouritesDataURL)
    .then((res) => res.json())
    .then((data) => {
      console.log("✓ [REMOTE] Favourites fetched from server and cached");
      // Store in cache
      localStorage.setItem(
        profile.config.localStoreKeys.favourites,
        JSON.stringify(data)
      );
      favouritesObj = data;
      profile.data.favourites = data;
      profile.setFavouriteIDs();
      return data;
    })
    .catch(console.error);
};

// Fetch display user profile name from the CMS
const fetchDisplayName = () => {
  console.log("⟳ [REMOTE] Fetching display name from server...");
  return fetch(profile.config.displayNameURL)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      console.log("✓ [REMOTE] Display name fetched from server");
      return data;
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      throw err;
    });
};

// Fetch user info from the CMS with localStorage caching
const fetchUserInfo = (forceRefresh = false) => {
  // Check cache first unless forcing refresh
  if (!forceRefresh) {
    const cached = localStorage.getItem(profile.config.localStoreKeys.user);
    if (cached) {
      try {
        console.log("✓ [LOCAL] User info fetched from localStorage cache");
        return Promise.resolve(JSON.parse(cached));
      } catch (err) {
        console.error("Error parsing cached user info:", err);
      }
    }
  }

  // Fetch from server if no cache or forced refresh
  console.log("⟳ [REMOTE] Fetching user info from server...");
  return fetch(profile.config.userInfoURL)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      console.log("✓ [REMOTE] User info fetched from server and cached");
      // Store in cache
      localStorage.setItem(
        profile.config.localStoreKeys.user,
        JSON.stringify(data)
      );
      return data;
    })
    .catch((err) => {
      console.error("Fetch user info error:", err);
      throw err;
    });
};

// Refresh circle button (fa-sync) inside myprofile overlay click function
document.querySelector("#resyncUserProfile")?.addEventListener("click", () => {
  if (isResyncing) return;
  isResyncing = true;

  const spinner = document.querySelector(".refreshProfile");

  // Add loading class
  spinner?.classList.add("fa-spin");

  // AJAX call to user current favourites
  fetch(profile.config.favouritesDataURL)
    .then((res) => res.json())
    .then((data) => {
      const oldData = JSON.parse(
        localStorage.getItem(profile.config.localStoreKeys.favourites) || "{}"
      );
      const newData = data;

      // Compare and update localStorage if changed
      const isDifferent = JSON.stringify(oldData) !== JSON.stringify(newData);
      if (isDifferent) {
        localStorage.setItem(
          profile.config.localStoreKeys.favourites,
          JSON.stringify(newData)
        );
        profile.data.favourites = newData;
        updateTables(newData);
      } else {
        profile.data.favourites = oldData;
        updateTables(oldData);
      }
    })
    .catch(console.error)
    .finally(() => {
      //Always remove fa-spin after response (success or failure)
      spinner?.classList.remove("fa-spin");
      isResyncing = false;

      // Resync complete flag
      document.dispatchEvent(new Event("userProfileResynced"));
    });
});

// Update UI favourites elements
function updateTables(data) {
  updateSystems(data.systems || []);
  updateContent(data.content || []);
  updateContacts(data.contacts || []);

  // Set up fresh favourites IDs
  profile.setFavouriteIDs();

  // Refresh bookmarks
  profile.refreshBookmarks();
}

// Generate system favourites HTML elements
const updateSystems = (systems) => {
  const tbody = document.querySelector("#profile-systems-list tbody");
  tbody.innerHTML = systems
    .map(
      (s) => `
    <tr class="ntgc-table__row" id="${s.id}">
      <td class="ntgc-table__cell relpos">
        <a href="${s.URL}">${s.acronym}</a>
        <span class="bookmark" data-toggle="favourite" data-group="systems" data-assetid="${s.id}" data-status="checked" title="Remove this favorite">
          <span class="fal fa-unlink"></span>
        </span>
      </td>
    </tr>
  `
    )
    .join("");
};

// Generate content favourites HTML elements
const updateContent = (content) => {
  const tbody = document.querySelector("#profile-content-list tbody");
  tbody.innerHTML = content
    .map(
      (c) => `
    <tr class="ntgc-table__row" id="${c.id}">
      <td class="ntgc-table__cell relpos">
        <a href="${c.URL}">${c.name}</a>
        <span class="bookmark" data-toggle="favourite" data-group="content" data-assetid="${c.id}" data-status="checked" title="Remove this favorite">
          <span class="fal fa-unlink"></span>
        </span>
      </td>
    </tr>
  `
    )
    .join("");
};

// Generate contacts favourites HTML elements
const updateContacts = (contacts) => {
  const tbody = document.querySelector("#profile-contacts-list tbody");
  tbody.innerHTML = contacts
    .map(
      (c) => `
    <tr class="ntgc-table__row">
      <td class="ntgc-table__cell">
        <span>${c.firstname}&nbsp;${c.surname}</span>
      </td>
      <td class="ntgc-table__cell relpos">
        <a href="tel:${c.phone}">${c.phone}</a>
        <span class="bookmark" data-toggle="favourite" data-group="contacts" data-assetid="${c.id}" data-status="checked" title="Remove this favorite">
          <span class="fal fa-unlink"></span>
        </span>
      </td>
    </tr>
  `
    )
    .join("");
};

// Favourite icons click handler
const handleFavouriteClick = (el) => {
  // Set current element variables
  const group = el.dataset.group;
  const assetID = el.dataset.assetid;
  const myProfileWrapper = el.closest(".ntgc-profile");
  const myProfileRow = el.closest("tr");
  const bmIcon = el.querySelector("span.fal");
  const isFavoriteChecked = el.getAttribute("data-status") === "checked";
  const clickedParent = el.closest("[data-toggle='favourite']");

  // Select all matching spans from the three selectors
  const allSpans = document.querySelectorAll(
    ".system-list span.fal.fa-star, " +
      ".content-favourite span.fal.fa-star, " +
      ".contacts-table span.fal.fa-star, " +
      ".ntgc-profile .favourites span.fal.fa-unlink"
  );

  //Take closest parents of clicked element
  const bmIconParentElements = [
    ...new Set(
      Array.from(allSpans)
        .map((span) => span.closest("[data-toggle='favourite']"))
        .filter((parent) => parent !== null)
    ),
  ];

  bmIconParentElements.forEach((parent) => {
    parent.style.pointerEvents = "none";
    parent.style.opacity = "0.5";
    parent.style.cursor = "default";
  });

  // Toggle bookmark check or not
  if (isFavoriteChecked) {
    el.setAttribute("data-status", "unchecked");
  } else {
    el.setAttribute("data-status", "checked");
  }

  // Set favourite detele interaction icons inside myprofile overlay Favourites table
  if (bmIcon.classList.contains("fa-unlink")) {
    if (
      myProfileWrapper &&
      myProfileRow &&
      myProfileWrapper.contains(myProfileRow)
    )
      myProfileRow.classList.add("deleting");

    // Update classes
    if (bmIcon) {
      bmIcon.classList.remove("fa-unlink");
      bmIcon.classList.add("fa-spinner-third", "fa-spin");
    }
  }

  if (bmIcon.classList.contains("fa-star")) {
    bmIcon.classList.remove("fa-star");
    bmIcon.classList.add("fa-spinner-third", "fa-spin", "star-removed");
  }

  fetchFavourites(true)
    .then(() => {
      // Setting up postbackData to send to JS API
      if (!profile.data.favourites_ids[group].includes(assetID)) {
        profile.data.favourites_ids[group].push(assetID);
      } else {
        trimmedList = profile.data.favourites_ids[group].filter(function (
          item
        ) {
          return item === assetID ? false : true;
        });
        profile.data.favourites_ids[group] = trimmedList;
      }

      // Final postbackData ready for the JS API
      let postbackData = profile.data.favourites_ids[group];

      // Get user asset ID from localStorage
      let assetIDToUse = localStorage.getItem("intra-user-id");

      // If assetIDToUse is still undefined or empty, handle the error
      if (!assetIDToUse || assetIDToUse === "") {
        console.error("Invalid asset_id:", assetIDToUse);
        reject("Invalid asset_id");
        return;
      }

      // Set field ID to use
      let fieldIDToUse = profile.config.userMetaFieldIDs[group];

      if (!fieldIDToUse || fieldIDToUse === "") {
        console.error("Invalid field_id:", fieldIDToUse);
        reject("Invalid field_id");
        return;
      }

      // JS API Call to set favourites in user's metadata
      js_api.setMetadata({
        asset_id: assetIDToUse,
        field_id: fieldIDToUse,
        field_val:
          group === "contacts"
            ? postbackData.join(";")
            : JSON.stringify(postbackData),
        dataCallback: function (response) {
          if (response.error) {
            console.error(
              "Error in data callback:",
              response.error,
              response.errorCode
            );
          } else {
            const allParents = [
              ...new Set(
                Array.from(allSpans)
                  .map((span) => span.closest("[data-toggle='favourite']"))
                  .filter((parent) => parent !== null)
              ),
            ];

            document.addEventListener("userProfileResynced", () => {
              allParents.forEach((parent) => {
                parent.style.pointerEvents = "";
                parent.style.opacity = "";
                parent.style.cursor = "";
              });

              if (bmIcon.classList.contains("star-removed")) {
                bmIcon.classList.remove(
                  "fa-spinner-third",
                  "fa-spin",
                  "star-removed"
                );
                bmIcon.classList.add("fa-star");
              }

              if (
                myProfileWrapper &&
                myProfileRow &&
                myProfileWrapper.contains(myProfileRow)
              ) {
                myProfileRow.remove();
              }
            });

            document.querySelector("#resyncUserProfile")?.click();
          }
        },
      });
    })
    .catch((err) => {
      console.error("Failed to fetch favourites:", err);
    });
};

// Wait for user info from localstorage function. Max wait for 5 seonds to retrive data from localstorage
const waitForUserInfo = (callback, maxWait = 5000, interval = 100) => {
  const start = Date.now();

  const check = () => {
    const userInfo = localStorage.getItem("intra-user-info");
    if (userInfo) {
      console.log("✓ [LOCAL] User info found in localStorage");
      callback(JSON.parse(userInfo));
    } else if (Date.now() - start < maxWait) {
      setTimeout(check, interval);
    } else {
      console.log(
        "⏱ [TIMEOUT] User info not in localStorage, fetching from server..."
      );
      // Timeout reached, fetch from server
      fetchUserInfo()
        .then((data) => callback(data))
        .catch((err) => console.error("Failed to fetch user info:", err));
    }
  };

  check();
};

// Element text update function
const updateTextIfChanged = (element, newText) => {
  if (!element) return;
  if (element.textContent !== newText) {
    element.textContent = newText;
  }
};

// Wait for user info to set in localstorage and execute the name setting up in UI
waitForUserInfo((userInfo) => {
  const UIgivenName = userInfo.UIgivenName || "";
  const UIinitial = UIgivenName.charAt(0) || "";

  if (UIgivenName) {
    localStorage.setItem("intra-user-username", UIgivenName);
    localStorage.setItem("intra-user-initial", UIinitial);
  }

  const nameElementProfileButton = document.querySelector(".profile-firstname");
  if (nameElementProfileButton) {
    updateTextIfChanged(nameElementProfileButton, UIgivenName);
  }

  const userNameElement = document.querySelector("#profileName");
  if (userNameElement) {
    updateTextIfChanged(userNameElement, UIgivenName);
  }

  const initialElement = document.querySelector('[data-profile="initial"]');
  if (initialElement) {
    updateTextIfChanged(initialElement, UIinitial);
  }

  // Set username and inital variables
  profile.config.userInfo.userName = UIgivenName;
  profile.config.userInfo.userInitial = UIinitial;
});

// Update UI instantly
const updateProfileNameUI = (val) => {
  const nameElementProfileButton = document.querySelector(".profile-firstname");
  const userNameElement = document.querySelector("#profileName");

  if (val === "No") {
    if (nameElementProfileButton)
      nameElementProfileButton.textContent = "My profile";
    if (userNameElement) userNameElement.textContent = "";
  } else {
    if (nameElementProfileButton)
      nameElementProfileButton.textContent = profile.config.userInfo.userName;
    if (userNameElement)
      userNameElement.textContent = profile.config.userInfo.userName;
  }
};

// Save toggle state via API + localStorage
const saveDisplayNameState = (val) => {
  const userAssetID = localStorage.getItem("intra-user-id");
  const metadataID = "455262";

  // JS API call to update displayname metadata field (#455262) to yes or no
  js_api.setMetadata({
    asset_id: userAssetID,
    field_id: metadataID,
    field_val: val,
    dataCallback: function (response) {
      if (response.error) {
        console.error(
          "Error in data callback:",
          response.error,
          response.errorCode
        );
      } else {
        localStorage.setItem("intra-user-displayName", val);
      }
    },
  });
};

// Handle checkbox toggle
const handleSwitchChange = (isChecked) => {
  const val = isChecked ? "Yes" : "No";
  updateProfileNameUI(val); // Update UI immediately
  saveDisplayNameState(val); // Async save to API/localStorage
};

// Setup on page load
const setupDisplayNameSwitch = async () => {
  const switchCheckbox = document.querySelector(".option-display-profile-name");
  //if (!switchCheckbox) return;

  // Check localStorage first
  let storedVal = localStorage.getItem("intra-user-displayName");

  if (!storedVal) {
    // Only fetch from API if not in localStorage
    try {
      console.log(
        "⟳ [REMOTE] Display name not in cache, fetching from server..."
      );
      const data = await fetchDisplayName();
      storedVal = data.displayName || "No";
      localStorage.setItem("intra-user-displayName", storedVal);
    } catch (error) {
      console.error("Failed to fetch display name:", error);
      storedVal = "No";
      localStorage.setItem("intra-user-displayName", storedVal);
    }
  } else {
    console.log("✓ [LOCAL] Display name found in localStorage");
  }

  const isChecked = storedVal === "Yes";
  switchCheckbox.checked = isChecked;
  updateProfileNameUI(storedVal);

  switchCheckbox.addEventListener("change", (e) => {
    handleSwitchChange(e.target.checked);
  });
};

// Delegate click event for all favourite buttons
document.body.addEventListener("click", (e) => {
  const el = e.target.closest('[data-toggle*="favourite"]');
  if (el) handleFavouriteClick(el);
});

// Call funcitons on DOM loaded event
document.addEventListener("DOMContentLoaded", () => {
  // Fetch user info if not in localStorage
  if (!localStorage.getItem(profile.config.localStoreKeys.user)) {
    fetchUserInfo().catch(console.error);
  }

  // Set profile data
  profile.setupFavouritesData();
  profile.setFavouriteIDs();

  // Set bookmark icons data status
  profile.setBookmarkIcons();

  // Set greeting message and handle display name switch on my profile
  profile.setGreeting();
  setupDisplayNameSwitch();
});

$(document).ready(function() {

    $('body').on('click', '.variant-toggle', function() {
        if ($('#page-variant-list').hasClass('active')) {
            hideToggle();
        } else {
            showToggle();
        }
    });
    
    
    $('body').on('change', '#page-variant-list', function() {
        
        hideToggle();
        
        const selection = $(this).find('option:selected').attr('data-index');
        const pageparams = new URLSearchParams(window.location.href);
        
        if( pageparams.get('variation') === selection ) {
            //User already seeing requested variant. Nothing to do.
            hideToggle();
            
        } else {
            //Refresh page
            waiting();
            window.location.search = '?variation=' + $(this).find('option:selected').attr('data-index');
        }
        
        variationTextBackground();
        
    });


    function hideToggle() {
        $('#page-variant-list').removeClass('active').blur();
        $('.variant-toggle span.fal').removeClass('fa-spinner-third fa-spin fa-times').addClass('fa-cog');
    }
    
    function showToggle() {
        $('#page-variant-list').addClass('active').focus();
        $('.variant-toggle span.fal').addClass('fa-times').removeClass('fa-spinner-third fa-spin fa-cog');
    }
    
    function waiting() {
        $('.variant-toggle span.fal').removeClass('fa-times').addClass('fa-spinner-third fa-spin');
    }
    
    function variationTextBackground () {
        if ( window.location.href.indexOf("variation=default") > -1 || window.location.href.indexOf('variation') === -1){
            $('.highlight').css('background', 'none');
        }  
    }
    
    variationTextBackground();
    

});
$(document).ready(function() {
    
    $('form[form-type="ntgc-form"]').each(function() {
        
        let actionstring = $(this).attr('action');
        actionstring = actionstring.replace('/_recache', '');
        actionstring = actionstring.replace('/_nocache', '');
        
        let actionURL = new URL(actionstring);
        $(this).attr('action', actionURL.origin + actionURL.pathname + '/_nocache');

    });

});
$(document).ready(function () {
    // Check if the .ntgc-persona-message element exists and log the result
    var $messageDiv = $('.ntgc-persona-message.active');
    
    if ($messageDiv.length > 0) {
        // console.log("Personalisation found on the page.");

        // Change display to block to prevent flex layout issues
        $messageDiv.css('display', 'block');

        // Define messages for different persona acronyms with agency links
        var messages = {
            'DCDD': {
                oldAgency: "Department of Corporate and Digital Development",
                acronym: "DCDD",
                newAgencies: [
                    { name: "New Agency 1", url: "#" },
                    { name: "New Agency 2", url: "#" },
                    { name: "New Agency 3", url: "#" },
                ],
                keyContacts: "key contacts"
            },
            'TFHC': {
                oldAgency: "Territory Families, Housing and Communities",
                acronym: "TFHC",                
                newAgencies: [
                    { name: "Department of Children and Families (DCF)", url: "#" },
                    { name: "Department of People, Sport and Culture (DPSC)", url: "#" },
                    { name: "Department of Housing, Local Government and Community Development (DHLGCD)", url: "#" },
                ],
                keyContacts: "key contacts"
            },
            'DEPWS': {
                oldAgency: "Department of Environment, Parks and Water Security",
                acronym: "DEPWS",                
                newAgencies: [
                    { name: "Department of Lands, Planning and Environment (DLPE)", url: "#" },
                    { name: "Department of Tourism and Hospitality (DTH)", url: "#" },                    
                    { name: "Department of Agriculture and Fisheries (DAF)", url: "#" },                      
                ],
                keyContacts: "key contacts"
            },
            'DIPL': {
                oldAgency: "Department of Infrastructure, Planning and Logistics",
                acronym: "DIPL",                  
                newAgencies: [
                    { name: "Department of Logistics and Infrastructure (DLI)", url: "#" },
                    { name: "Department of Lands, Planning and Environment (DLPE)", url: "#" },                    
                ],
                keyContacts: "key contacts"
            }
        };

        // Retrieve the acronym text
        var acronym = $messageDiv.find('.ntgc-persona-acronym').text().trim();
        var personaInfo = messages[acronym] || {};

        // Update the message if data is available for the acronym
        if (personaInfo.oldAgency) {
            let newMessage;

            // Check if acronym is DCDD for personalized message
            if (acronym === 'DCDD') {
                newMessage = `
                    <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                        <span class="fal fa-file-alt" style="margin-right: 1.2rem;"></span>
                        <p style="margin: 0;">This content is personalised for Department of Corporate and Digital Development (DCDD) employees.</p>
                    </div>
                    <p style="margin-left:36px;">
                        Bushfires NT and Skills NT employees may follow a different process. You can check with your manager or the <a href="#key-contacts">key contacts</a> to confirm.
                    </p>
                `;
            } else {
                newMessage = `
                    <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                        <span class="fal fa-file-alt" style="margin-right: 1.2rem;"></span>
                        <p style="margin: 0;">The former ${personaInfo.oldAgency} (${personaInfo.acronym}) is currently undergoing MoG changes. 
                        As a result, this page is being reviewed and updated to reflect the transition to the following agencies:</p>
                    </div>
                    <ul style="margin-top: 20px; padding-left: 25px; list-style-type: disc; margin-left:32px">
                        ${personaInfo.newAgencies.map(agency => `
                            <li style="margin-bottom: 5px;">
                                ${agency.name}
                            </li>`).join('')}
                    </ul>
                    <p style="margin-left:32px;">
                       If you're from a new agency, you can verify processes with the <a href="#key-contacts">${personaInfo.keyContacts}</a> or check with your manager.
                    </p>
                `;
            }

            // Update the message div content
            $messageDiv.html(newMessage);

            // Scroll to the .ntgc-card--key-contacts div when the link is clicked
            $('.key-contacts-link').on('click', function (e) {
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: $('.ntgc-card--key-contacts').offset().top
                }, 500); // Adjust scroll speed as needed
            });

            // Show the updated message
            $messageDiv.show();
        }
    } else {
        // console.log("No personalisation on this page.");
    }
});

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("a[href]");

  links.forEach(link => {
    const url = new URL(link.href);
    const href = link.getAttribute("href");

    // Match URLs like https://trm.nt.gov.au/anything/File/Document
    const trmPattern = /^https:\/\/trm\.nt\.gov\.au\/.+\/File\/Document$/;

    if (trmPattern.test(href)) {
        const space = document.createTextNode(" ");
        const icon = document.createElement("span");
        const ext = document.createTextNode(" TRM");
        icon.className = "far fa-file-alt";
        
        link.appendChild(space);
        link.appendChild(icon);
        link.appendChild(ext);
    //   link.classList.add("external-icon");

      // Optional: Insert icon element instead of using CSS
      // const icon = document.createElement("img");
      // icon.src = "link-icon.svg";
      // icon.alt = "External link";
      // icon.style.marginLeft = "4px";
      // icon.style.width = "16px";
      // icon.style.height = "16px";
      // link.appendChild(icon);
    }
  });
});
document.addEventListener('DOMContentLoaded', () => {
            
    // 1. Select all anchor <a> elements on the page.
    const allLinks = document.querySelectorAll('a');

    // 2. Loop through each link found.
    allLinks.forEach(link => {

        // 3. Check if the link's href attribute exists and includes the '.oft' extension.
        //    We check for the dot to avoid matching something like "softer".
        if (link.href && link.href.includes('.oft')) {
            
            // 4. If it's an .oft link, add the 'download' attribute.
            //    An empty string is sufficient for boolean attributes like 'download'.
            link.setAttribute('download', '');
            console.log(`Added 'download' attribute to: ${link.href}`);
        }
    });
});
// Function to replace all matching <img> tags with <span class="link-icon"></span>
function replaceSqIcons() {
  document.querySelectorAll('img.sq-icon[src*="/word_doc/icon.png"]').forEach(function (img) {
    const span = document.createElement('span');
    span.className = 'link-icon docx'; // Add file-type-specific class if needed
    img.replaceWith(span);
  });
}

// Initial run in case elements are already in the DOM
replaceSqIcons();

// Set up a MutationObserver to watch for dynamically added icons
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Run replacement function when new nodes are added
      replaceSqIcons();
    }
  }
});

// Start observing the document body for added nodes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// ### Auto-tag file inputs and right-align following button

(() => {
  const FILE_CLASS = 'ntgc-file-upload';

  // Inject CSS styles
  const style = document.createElement('style');
  style.textContent = `
    input[type="file"].${FILE_CLASS} {
      margin-right: 0;
    }
    input[type="button"].${FILE_CLASS} {
      padding: 0.9rem 1rem !important;
    }
  `;
  document.head.appendChild(style);

  // Taggers
  const tagFileInput = el => el.classList.add(FILE_CLASS);
  const tagButton = el => el.classList.add(FILE_CLASS);

  // Tag existing elements
  document.querySelectorAll('input[type="file"]').forEach(tagFileInput);
  document.querySelectorAll('input[type="button"]').forEach(tagButton);

  // Watch for dynamically-added file/button inputs
  new MutationObserver(muts => {
    for (const m of muts) {
      for (const node of m.addedNodes) {
        if (!(node instanceof Element)) continue;

        if (node.matches('input[type="file"]')) {
          tagFileInput(node);
        } else if (node.matches('input[type="button"]')) {
          tagButton(node);
        }

        node.querySelectorAll?.('input[type="file"]').forEach(tagFileInput);
        node.querySelectorAll?.('input[type="button"]').forEach(tagButton);
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
