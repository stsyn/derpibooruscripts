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

function InfernoAddElem(tag, values, childs) {
	var t;
    if (typeof values == 'undefined') values = {};
    if (typeof values == 'string') values = {innerHTML:values};
	if (values != undefined && values.id != undefined && document.getElementById(values.id) != undefined) {
		if (document.querySelectorAll(tag+'#'+values.id).length == 0) {
			t = document.getElementById(values.id);
			t.parentNode.removeChild(t);
			t = document.createElement(tag);
		}
		else {
			t = document.getElementById(values.id);
			while (t.firstChild) {t.removeChild(t.firstChild);}
		}
	}
	else t = document.createElement(tag);

	for (let i in values) if (i!='events' && i!='dataset' && i!='innerHTML' && i!='checked' && i!='disabled' && i!='value' && i!='selected' && i!='className' && !(i=='style' && typeof values.style=='object')) t.setAttribute(i,values[i]);
	if (values.dataset !== undefined) for (let i in values.dataset) t.dataset[i] = values.dataset[i];
	if (values.className !== undefined) t.className = values.className;
	if (values.innerHTML !== undefined) t.innerHTML = values.innerHTML;
	if (values.value !== undefined) t.value = values.value;
	if (values.checked !== undefined) t.checked = values.checked;
	if (values.selected !== undefined) t.selected = values.selected;
	if (values.disabled !== undefined) t.disabled = values.disabled;
	if (values.events !== undefined) {
        if (Array.isArray(values.events)) values.events.forEach(function(v,i,a) {t.addEventListener(v.t, v.f);});
        else for (let i in values.events) t.addEventListener(i, values.events[i]);
    }
	if (typeof values.style == 'object') for (let i in values.style) t.style[i] = values.style[i];

	if (childs && childs.length != undefined) childs.forEach(function(c,i,a) {t.appendChild(c.parentNode == null?c:c.cloneNode(true));});
	return t;
}
