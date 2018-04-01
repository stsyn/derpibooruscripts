function addElem(tag, values, parent) {
    var t = InfernoAddElem(tag, values, []);
	parent.appendChild(t);
	return t;
}

function ChildsAddElem(tag, values,parent, childs) {
    var t = InfernoAddElem(tag, values, []);
	parent.appendChild(t);
	return t;
}

function InfernoAddElem(tag, values, childs) {
	var t;
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

	for (var i in values) if (i!='events' && i!='dataset' && i!='innerHTML' && i!='className' && !(i=='style' && typeof values.style=='object')) t.setAttribute(i,values[i]);
	if (values.dataset != undefined) for (var i in values.dataset) t.dataset[i] = values.dataset[i];
	if (values.className != undefined) t.className = values.className;
	if (values.innerHTML != undefined) t.innerHTML = values.innerHTML;
	if (values.events != undefined) values.events.forEach(function(v,i,a) {t.addEventListener(v.t, v.f);});
	if (typeof values.style=='object') for (var i in values.style) t.style[i] = values.style[i];

	if (childs != undefined && childs.length != undefined) childs.forEach(function(c,i,a) {t.appendChild(c);});
	return t;
}
