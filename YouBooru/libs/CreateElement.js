function createElement(tag, values, children) {
    function isElement(obj) {
        try {
            return obj instanceof HTMLElement;
        }
        catch(e){
            return (typeof obj==="object") &&
                (obj.nodeType===1) && (typeof obj.style === "object") &&
                (typeof obj.ownerDocument ==="object");
        }
    }

    var element;
    var i;

    if (typeof values == 'undefined') {
        values = {};
    }
    if (typeof values == 'string' || typeof values == 'number' || typeof values == 'boolean') {
        values = {innerHTML:values.toString()};
    }
    if (isElement(values)) {
        children = [values];
        values = {};
    }
    if (typeof children == 'undefined' && Array.isArray(values)) {
        children = values;
        values = {};
    }
    if (!Array.isArray(children)) children = [children];

    var classes = tag.split('.');
    tag = classes.shift();
    if (classes.length > 0) {
      values.className = (values.className ? values.className + ' ' : '') + classes.join(' ');
    }
    var id = tag.split('#');
    tag = id.shift();
    id = id.shift();

    if (id) {
        values.id = id;
    }

    element = document.createElement(tag);

    var applyAsJsField = ['innerHTML', 'checked', 'disabled', 'value', 'selected', 'className', 'crossOrigin'];
    var applyNotAsAttribute = applyAsJsField.concat(['events', 'dataset', 'style']);

    for (i in values) {
        if (applyNotAsAttribute.indexOf(i) === -1) {
            element.setAttribute(i, values[i]);
        }
        if (applyAsJsField.indexOf(i) !== -1) {
            element[i] = values[i];
        }
    }

    if (values.dataset !== undefined) {
        for (i in values.dataset) {
            if (values.dataset[i] !== undefined && values.dataset[i] !== null) {
                element.dataset[i] = values.dataset[i];
            }
        }
    }
    if (values.events !== undefined) {
        for (i in values.events) {
            element.addEventListener(i, values.events[i]);
        }
    }
    if (typeof values.style == 'object') {
        for (i in values.style) {
            element.style[i] = values.style[i];
        }
    } else if (typeof values.style == 'string') {
        element.style = values.style;
    }

    if (children && children.length) {
        var textCollection = null;
        for (i = 0; i < children.length; i++) {
            var c = children[i];
            if (c === undefined || c === null) continue;
            if (typeof c !== 'object' || !isElement(c)) {
                if (textCollection === null) {
                    textCollection = c.toString();
                } else {
                    textCollection += c.toString();
                }
            } else {
                if (textCollection) {
                    if (textCollection.indexOf('<') === -1) {
                        element.appendChild(document.createTextNode(textCollection));
                    } else {
                        var temp = document.createElement('span');
                        temp.innerHTML = textCollection;
                        while (temp.firstChild) {
                            element.appendChild(temp.firstChild);
                        }
                    }
                    textCollection = null;
                }
                element.appendChild(c.parentNode == null ? c : c.cloneNode(true));
            }
        }
        if (textCollection) {
            if (textCollection.indexOf('<') === -1) {
                element.appendChild(document.createTextNode(textCollection));
            } else {
                var temp = document.createElement('span');
                temp.innerHTML = textCollection;
                while (temp.firstChild) {
                    element.appendChild(temp.firstChild);
                }
            }
            textCollection = null;
        }
    }
    return element;
}

function wrapElement(element, target) {
    var parent = target.parentNode;
    parent.insertBefore(element, target);
    element.appendChild(target);
}

function clearElement(element) {
    while (element.hasChildNodes()) {
        element.removeChild(element.lastChild);
    }
}
