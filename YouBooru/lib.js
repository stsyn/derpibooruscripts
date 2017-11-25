function addElem(tag, values, parent) {
	if (values != undefined && values.id != undefined && document.getElementById(values.id) != undefined) return document.getElementById(values.id);
	var t = document.createElement(tag);
	for (var i in values) if (i!='events' && i!='dataset') t[i] = values[i];
	if (values.dataset != undefined) for (var i in values.dataset) t.dataset[i] = values.dataset[i];
	if (values.events != undefined) values.events.forEach(function(v,i,a) {
		t.addEventListener(v.t, v.f);
	});

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
			while (t.firstChild) {
			  t.removeChild(t.firstChild);
			}
		}
	}
	else t = document.createElement(tag);
	
	for (var i in values) if (i!='events' && i!='dataset') t[i] = values[i];
	if (values.dataset != undefined) for (var i in values.dataset) t.dataset[i] = values.dataset[i];
	if (values.events != undefined) values.events.forEach(function(v,i,a) {
		t.addEventListener(v.t, v.f);
	});
	
	if (childs != undefined && childs.length != undefined) childs.forEach(function(c,i,a) {
		t.appendChild(c);
	});
	
	return t;
}