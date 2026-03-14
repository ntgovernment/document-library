
var AU=AU||{};(function(AU){var accordion={}
function setAriaRoles(element,target,state){if(state==='closing'){element.setAttribute('aria-expanded',false);}
else{element.setAttribute('aria-expanded',true);}}
function toggleClasses(element,state,openingClass,closingClass){if(state==='opening'||state==='open'){var oldClass=openingClass||'au-accordion--closed';var newClass=closingClass||'au-accordion--open';}
else{var oldClass=closingClass||'au-accordion--open';var newClass=openingClass||'au-accordion--closed';}
removeClass(element,oldClass);addClass(element,newClass);}
function removeClass(element,className){if(element.classList){element.classList.remove(className);}
else{element.className=element.className.replace(new RegExp("(^|\\b)"+className.split(" ").join("|")+"(\\b|$)","gi")," ");}}
function addClass(element,className){if(element.classList){element.classList.add(className);}
else{element.className=element.className+" "+className;}}
accordion.Toggle=function(elements,speed,callbacks){try{window.event.cancelBubble=true;event.stopPropagation();}
catch(error){}
if(elements.length===undefined){elements=[elements];}
if(typeof callbacks!='object'){callbacks={};}
for(var i=0;i<elements.length;i++){var element=elements[i];var targetId=element.getAttribute('aria-controls');var target=document.getElementById(targetId);if(target==null){throw new Error('AU.accordion.Toggle cannot find the target to be toggled from inside aria-controls.\n'+'Make sure the first argument you give AU.accordion.Toggle is the DOM element (a button or a link) that has an aria-controls attribute that points '+'to a div that you want to toggle.');}
target.style.display='block';(function(element){AU.animate.Toggle({element:target,property:'height',speed:speed||250,prefunction:function(target,state){if(state==='opening'){target.style.display='block';if(typeof callbacks.onOpen==='function'){callbacks.onOpen();}}
else{if(typeof callbacks.onClose==='function'){callbacks.onClose();}}
setAriaRoles(element,target,state);toggleClasses(element,state);},postfunction:function(target,state){if(state==='closed'){target.style.display='';target.style.height='';if(typeof callbacks.afterClose==='function'){callbacks.afterClose();}}
else{target.style.display='';target.style.height='';if(typeof callbacks.afterOpen==='function'){callbacks.afterOpen();}}
toggleClasses(target,state);},});})(element);}
return false;}
accordion.Open=function(elements,speed){try{window.event.cancelBubble=true;event.stopPropagation();}
catch(error){}
if(elements.length===undefined){elements=[elements];}
for(var i=0;i<elements.length;i++){var element=elements[i];var targetId=element.getAttribute('aria-controls');var target=document.getElementById(targetId);var height=0;if(typeof getComputedStyle!=='undefined'){height=window.getComputedStyle(target).height;}
else{height=target.currentStyle.height;}
if(parseInt(height)===0){target.style.height='0px';}
target.style.display='';toggleClasses(target,'opening');toggleClasses(element,'opening');setAriaRoles(element,target,'opening');(function(target,speed,element){AU.animate.Run({element:target,property:'height',endSize:'auto',speed:speed||250,callback:function(){toggleClasses(element,'opening');},});})(target,speed,element);}}
accordion.Close=function(elements,speed){try{window.event.cancelBubble=true;event.stopPropagation();}
catch(error){}
if(elements.length===undefined){elements=[elements];}
for(var i=0;i<elements.length;i++){var element=elements[i];var targetId=element.getAttribute('aria-controls');var target=document.getElementById(targetId);toggleClasses(element,'closing');setAriaRoles(element,target,'closing');(function(target,speed){AU.animate.Run({element:target,property:'height',endSize:0,speed:speed||250,callback:function(){target.style.display='';toggleClasses(target,'close');},});})(target,speed);}}
AU.accordion=accordion;}(AU));if(typeof module!=='undefined'){module.exports=AU;}
var AU=AU||{};(function(AU){var animate={}
function CalculateAnimationSpecs(initialSize,endSize,speed){if(initialSize===endSize){return{stepSize:0,steps:0,intervalTime:0,};}
var distance=endSize-initialSize;var intervalTime=(speed/distance);var stepSize=distance<0?-1:1;var steps=Math.abs(distance/stepSize);intervalTime=speed/steps;if(Math.abs(intervalTime)<(1000/60)){intervalTime=(1000/60);steps=Math.ceil(Math.abs(speed/intervalTime));stepSize=distance/steps;}
return{stepSize:stepSize,steps:(steps-1),intervalTime:intervalTime,};}
if(typeof module!=='undefined'){animate.CalculateAnimationSpecs=CalculateAnimationSpecs;}
animate.GetCSSPropertyBecauseIE=function(element,property){if(typeof getComputedStyle!=='undefined'){return window.getComputedStyle(element)[property];}
else{var space=element.currentStyle[property];if(space==='auto'){space=AU.animate.CalculateAuto(element,property);}
return space;}};animate.CalculateAuto=function(element,dimension){var initialSize;var endSize;if(dimension==='height'){initialSize=element.clientHeight;element.style[dimension]='auto';endSize=element.clientHeight;element.style[dimension]=initialSize+'px';}
else{initialSize=element.clientWidth;element.style[dimension]='auto';endSize=element.clientWidth;element.style[dimension]=initialSize+'px';}
return parseInt(endSize);};animate.Stop=function(element){clearInterval(element.AUanimation);};animate.Run=function(options){var elements=options.element;var speed=options.speed||250;if(elements.length===undefined){elements=[elements];}
if(typeof options.callback!=='function'){options.callback=function(){};}
elements[0].AUinteration=0;elements[0].AUinterations=elements.length;for(var i=0;i<elements.length;i++){var element=elements[i];AU.animate.Stop(element);var initialSize=parseInt(AU.animate.GetCSSPropertyBecauseIE(element,options.property));var endSize=options.endSize;if(options.endSize==='auto'){endSize=AU.animate.CalculateAuto(element,options.property);}
var animationSpecs=CalculateAnimationSpecs(initialSize,endSize,speed);var iterateCounter=initialSize;if(animationSpecs.stepSize<0){element.AUtoggleState='closing';}
else if(animationSpecs.stepSize>0){element.AUtoggleState='opening';}
(function(element,initialSize,iterateCounter,animationSpecs,endSize){element.AUanimation=setInterval(function(){if(initialSize===endSize||animationSpecs.steps===0){AU.animate.Stop(element);element.style[options.property]=endSize+'px';element.AUtoggleState='';elements[0].AUinteration++;if(options.endSize==='auto'){element.style[options.property]='';}
if(elements[0].AUinteration>=elements[0].AUinterations){return options.callback();}}
else{iterateCounter+=animationSpecs.stepSize;element.style[options.property]=iterateCounter+'px';animationSpecs.steps--;}},Math.abs(animationSpecs.intervalTime));})(element,initialSize,iterateCounter,animationSpecs,endSize);}};animate.Toggle=function(options){var elements=options.element;var property=options.property||'height';var speed=options.speed||250;var closeSize=options.closeSize===undefined?0:options.closeSize;var openSize=options.openSize===undefined?'auto':options.openSize;if(elements.length===undefined){elements=[elements];}
if(typeof options.prefunction!=='function'){options.prefunction=function(){};}
if(typeof options.postfunction!=='function'){options.postfunction=function(){};}
if(typeof options.callback!=='function'){options.callback=function(){};}
elements[0].AUtoggleInteration=0;elements[0].AUtoggleInterations=elements.length;for(var i=0;i<elements.length;i++){var element=elements[i];AU.animate.Stop(element);var targetSize;var preState='';var postState='';var currentSize=parseInt(AU.animate.GetCSSPropertyBecauseIE(element,options.property));if(currentSize===closeSize||element.AUtoggleState==='closing'){targetSize=openSize;preState='opening';postState='open';}
else if(currentSize!==closeSize||element.AUtoggleState==='opening'){targetSize=closeSize;preState='closing';postState='closed';}
else{throw new Error('AU.animate.Toggle cannot determine state of element');}
options.prefunction(element,preState);AU.animate.Run({element:element,endSize:targetSize,property:property,speed:speed,callback:function(){elements[0].AUtoggleInteration++;if(elements[0].AUtoggleInteration===elements[0].AUinterations){var returnParam=options.callback(element,postState);options.postfunction(element,postState);return returnParam;}
options.postfunction(element,postState);},});}};AU.animate=animate;}(AU));if(typeof module!=='undefined'){module.exports=AU;}
if(typeof exports!=='undefined'){Object.defineProperty(exports,"__esModule",{value:true});eval('exports.default = AU');}
var AU=AU||{};(function(AU){var mainNav={};var mainNavEvents={};var mainNavAnimating=false;function toggleClasses(element,state,openingClass,closingClass){if(state==='opening'||state==='open'){var oldClass=openingClass||'au-main-nav__content--closed';var newClass=closingClass||'au-main-nav__content--open';}
else{var oldClass=closingClass||'au-main-nav__content--open';var newClass=openingClass||'au-main-nav__content--closed';}
removeClass(element,oldClass);addClass(element,newClass);}
function removeClass(element,className){if(element.classList){element.classList.remove(className);}
else{element.className=element.className.replace(new RegExp('(^|\\b)'+className.split(' ').join('|')+'(\\b|$)','gi'),' ');}}
function addClass(element,className){if(element.classList){element.classList.add(className);}
else{element.className=element.className+' '+className;}}
function addEvent(element,event,rawHandler){function listenHandler(event){var handler=rawHandler.apply(this,arguments);if(handler===false){event.stopPropagation();event.preventDefault();}
return(handler);}
function attachHandler(){var handler=rawHandler.call(element,window.event);if(handler===false){window.event.returnValue=false;window.event.cancelBubble=true;}
return(handler);}
if(element.addEventListener){element.addEventListener(event,listenHandler,false);return{element:element,handler:listenHandler,event:event};}else{element.attachEvent('on'+event,attachHandler);return{element:element,handler:attachHandler,event:event};}}
function removeEvent(token){if(token.element.removeEventListener){token.element.removeEventListener(token.event,token.handler);}else{token.element.detachEvent('on'+token.event,token.handler);}}
function getStyle(element,property){return(typeof getComputedStyle!=='undefined'?getComputedStyle(element,null):element.currentStyle)[property];}
mainNav.Toggle=function(element,speed,callbacks){if(mainNavAnimating){return;}
mainNavAnimating=true;try{window.event.cancelBubble=true;event.stopPropagation();}
catch(error){}
if(typeof callbacks!='object'){callbacks={};}
var targetId=element.getAttribute('aria-controls');var target=document.getElementById(targetId);var menu=target.querySelector('.au-main-nav__menu');var overlay=target.querySelector('.au-main-nav__overlay');var closeButton=target.querySelector('.au-main-nav__toggle--close');var openButton=target.querySelector('.au-main-nav__toggle--open');var focustrapTop=target.querySelector('.au-main-nav__focus-trap-top');var focustrapBottom=target.querySelector('.au-main-nav__focus-trap-bottom');var focusContent=menu.querySelectorAll('a, .au-main-nav__toggle');var closed=target.className.indexOf('au-main-nav__content--open')===-1;var menuWidth=menu.offsetWidth;var state=closed?'opening':'';overlay.style.display='block';(function(target,speed){AU.animate.Toggle({element:menu,property:'left',openSize:0,closeSize:-1*menuWidth,speed:speed||250,prefunction:function(){if(state==='opening'){menu.style.display='block';overlay.style.left=0;overlay.style.opacity=0.5;if(typeof callbacks.onOpen==='function'){callbacks.onOpen();}}
else{overlay.style.opacity='0';if(typeof callbacks.onClose==='function'){callbacks.onClose();}}},postfunction:function(){if(state==='opening'){closeButton.focus();focustrapTop.setAttribute('tabindex',0);focustrapBottom.setAttribute('tabindex',0);mainNavEvents.focusTop=addEvent(focustrapTop,'focus',function(){focusContent[focusContent.length-1].focus();});mainNavEvents.focusBottom=addEvent(focustrapBottom,'focus',function(){focusContent[0].focus();});mainNavEvents.escKey=addEvent(document,'keyup',function(){var event=event||window.event;var overlayOpen=getStyle(overlay,'display');if(event.keyCode===27&&overlayOpen==='block'){mainNav.Toggle(element,speed,callbacks);}});if(typeof callbacks.afterOpen==='function'){callbacks.afterOpen();}}
else{openButton.focus();focustrapTop.removeAttribute('tabindex');focustrapBottom.removeAttribute('tabindex');removeEvent(mainNavEvents.focusTop);removeEvent(mainNavEvents.focusBottom);removeEvent(mainNavEvents.escKey);if(typeof callbacks.afterClose==='function'){callbacks.afterClose();}}
toggleClasses(target,state);toggleClasses(document.body,state,'au-main-nav__scroll--unlocked','au-main-nav__scroll--locked');menu.style.display='';menu.style.left='';overlay.style.display='';overlay.style.left='';overlay.style.opacity='';mainNavAnimating=false;},});})(target,speed);}
AU.mainNav=mainNav;}(AU));if(typeof module!=='undefined'){module.exports=AU;}
var AU=AU||{};(function(AU){}(AU));if(typeof module!=='undefined'){module.exports=AU;}