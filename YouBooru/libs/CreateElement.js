function createElement(tag, values, children) {
    var element;
    var i;

    if (typeof values == 'undefined') {
        values = {};
    }
    if (typeof values == 'string') {
        values = {innerHTML:values};
    }
    if (typeof children == 'undefined' && Array.isArray(values)) {
        children = values;
        values = {};
    }

    element = document.createElement(tag);

    var applyNotAsAttribute = ['events', 'dataset', 'innerHTML', 'checked', 'disabled', 'value', 'selected', 'className', 'style'];
    var applyAsJsField = ['innerHTML', 'checked', 'disabled', 'value', 'selected', 'className'];

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
            element.dataset[i] = values.dataset[i];
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
            if (typeof c == 'string') {
                if (textCollection === null) {
                    textCollection = c;
                } else {
                    textCollection += c;
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

function clearElement(element) {
    /*if (!element.parentNode) {
        return;
    }
    var cNode = element.cloneNode(false);
    element.parentNode.replaceChild(cNode, element);*/
    element.innerHTML = '';
}
