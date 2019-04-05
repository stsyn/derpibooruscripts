function addElem(tag, values, parent) {
	var t = InfernoAddElem(tag, values, []);
	parent.appendChild(t);
	return t;
}

function ChildsAddElem(tag, values,parent, childs) {
	var t = InfernoAddElem(tag, values, childs);
	parent.appendChild(t);
	return t;
}

function InfernoAddElem(e,t,d){var i;if(void 0!=t&&void 0!=t.id&&void 0!=document.getElementById(t.id))if(0==document.querySelectorAll(e+"#"+t.id).length)(i=document.getElementById(t.id)).parentNode.removeChild(i),i=document.createElement(e);else for(i=document.getElementById(t.id);i.firstChild;)i.removeChild(i.firstChild);else i=document.createElement(e);for(var l in t)"events"==l||"dataset"==l||"innerHTML"==l||"checked"==l||"disabled"==l||"value"==l||"selected"==l||"className"==l||"style"==l&&"object"==typeof t.style||i.setAttribute(l,t[l]);if(void 0!=t.dataset)for(var l in t.dataset)i.dataset[l]=t.dataset[l];if(void 0!=t.className&&(i.className=t.className),void 0!=t.innerHTML&&(i.innerHTML=t.innerHTML),void 0!=t.value&&(i.value=t.value),void 0!=t.checked&&(i.checked=t.checked),void 0!=t.selected&&(i.selected=t.selected),void 0!=t.disabled&&(i.disabled=t.disabled),void 0!=t.events&&t.events.forEach(function(e,t,d){i.addEventListener(e.t,e.f)}),"object"==typeof t.style)for(var l in t.style)i.style[l]=t.style[l];return void 0!=d&&void 0!=d.length&&d.forEach(function(e,t,d){i.appendChild(e.cloneNode(true))}),i}
