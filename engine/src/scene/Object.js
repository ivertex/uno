/**
 * Scene object
 * @constructor
 */
uno.Object = function() {
    /**
     * Object parent. If null there is no parent
     * @type {uno.Object}
     * @default null
     * @private
     */
    this._parent = null;
};

/**
 * Object parent. If null there is no parent
 * @name uno.Object#parent
 * @type {uno.Object}
 */
Object.defineProperty(uno.Object.prototype, 'parent', {
    get: function () {
        return this._parent;
    },
    set: function(value) {
        if (this._parent === value)
            return;
        this.removeSelf();
        value.addChild(this);
    }
});

/**
 * Children count
 * @name uno.Object#length
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.Object.prototype, 'length', {
    get: function () {
        return this._children ? this._children.length : 0;
    }
});

/**
 * Add child object
 * @param {uno.Object} child - Child to add
 * @param {Number} index - Where to add object
 * @returns {uno.Object}
 */
uno.Object.prototype.addChild = function(child, index) {
    if (!this._children)
        this._children = [];
    var children = this._children;
    index = index || children.length;
    if (index < 0 || index > children.length)
        return uno.error('The index [', index, '] out of bounds');
    if (index === children.length)
        children.push(child);
    else
        children.splice(index, 0, child);
    child._parent = this;
    return child;
};

/**
 * Remove child object
 * @param {Number|uno.Object} childOrIndex - Index or object to remove
 * @returns {Boolean} - Is child removed
 */
uno.Object.prototype.removeChild = function(childOrIndex) {
    if (!this._children)
        return false;
    var children = this._children;
    var index = childOrIndex || 0;
    if (childOrIndex instanceof uno.Object) {
        index = children.indexOf(childOrIndex);
        if (index === -1)
            return false;
    } else {
        if (index < 0 || index >= children.length)
            return false;
        childOrIndex = children[index];
    }
    children.splice(index, 1);
    childOrIndex._parent = null;
    return true;
};

/**
 * Remove children objects
 * @returns {Boolean} - Is any child removed
 */
uno.Object.prototype.removeAll = function() {
    if (!this._children)
        return false;
    var children = this._children;
    for (var i = 0, l = children.length; i < l; ++i)
        children[i]._parent = null;
    children.length = 0;
    return true;
};

/**
 * Remove this object from the parent
 * @returns {Boolean}
 */
uno.Object.prototype.removeSelf = function() {
    if (!this._parent)
        return true;
    this._parent.remove(this);
    return true;
};

/**
 * Get child at index
 * @param {Number} index - Index of the child
 * @returns {uno.Object}
 */
uno.Object.prototype.getChild = function(index) {
    if (!this._children)
        return undefined;
    index = index || 0;
    if (index < 0 || index >= this._children.length)
        return undefined;
    return this._children[index];
};

/**
 * Add component to object<br>
 *     Component should have static property <code>name</code> with value not have name with first character "_"<br>
 *     Name of the component should be unique for current object<br>
 *     Component can have methods <code>update</code> and <code>render</code> they will call every frame
 * @param {Function} component - Constructor of the component
 * @returns {Boolean}
 */
uno.Object.prototype.addComponent = function(component) {
    var id = component.id;
    if (!id)
        return uno.error('Component have no property name');
    if (id.charCodeAt(0) === '_')
        return uno.error('Component should not have name with first character "_" [', id, ']');
    if (this[id])
        return uno.error('Component with name [', id, '] already exist');
    var c = this[id] = new component(this);
    if (component.prototype.update) {
        if (this._updates)
            this._updates.push(c);
        else
            this._updates = [c];
    }
    if (component.prototype.render) {
        if (this._renders)
            this._renders.push(c);
        else
            this._renders = [c];
    }
    if (component.prototype.input) {
        if (this._inputs)
            this._inputs.push(c);
        else
            this._inputs = [c];
    }
    return true;
};

/**
 * Remove component from object
 * @param {Function} component
 * @returns {boolean}
 */
uno.Object.prototype.removeComponent = function(component) {
    var c = this[component.id];
    if (!c)
        return false;
    c.object = null;
    var index;
    if (this._updates) {
        index = this._updates.indexOf(c);
        if (index !== -1)
            this._updates.splice(index, 1);
    }
    if (this._renders) {
        index = this._renders.indexOf(c);
        if (index !== -1)
            this._renders.splice(index, 1);
    }
    if (this._inputs) {
        index = this._inputs.indexOf(c);
        if (index !== -1)
            this._inputs.splice(index, 1);
    }
    delete this[component.id];
    return true;
};

/**
 * Destroy object and components
 */
uno.Object.prototype.destroy = function() {
    this.removeAll();
    this.removeSelf();
    var i, list;
    list = this._updates;
    if (list) {
        i = list.length;
        while (i--)
            this[list[i]] = null;
        list.length = 0;
    }
    list = this._renders;
    if (list) {
        i = list.length;
        while (i--)
            this[list[i]] = null;
        list.length = 0;
    }
    list = this._inputs;
    if (list) {
        i = list.length;
        while (i--)
            this[list[i]] = null;
        list.length = 0;
    }
};

/**
 * Call <code>update</code> method for current object and all children recursively
 * @param {uno.CanvasRender|uno.WebglRender} render - Render for using it in update handler
 * @param {Number} deltaTime - Time after last update
 */
uno.Object.prototype.update = function(render, deltaTime) {
    var i, l, items;
    if (this._updates) {
        items = this._updates;
        for (i = 0, l = items.length; i < l; ++i)
            items[i].update(render, deltaTime);
    }
    items = this._children;
    if (!items || !items.length)
        return;
    for (i = 0, l = items.length; i < l; ++i)
        items[i].update(render, deltaTime);
};

/**
 * Call <code>render</code> method for current object and all children recursively
 * @param {uno.CanvasRender|uno.WebglRender} render - Render for using it in render handler
 * @param {Number} deltaTime - Time after last render
 */
uno.Object.prototype.render = function(render, deltaTime) {
    var i, l, items;
    if (this._renders) {
        items = this._renders;
        for (i = 0, l = items.length; i < l; ++i)
            items[i].render(render, deltaTime);
    }
    items = this._children;
    if (!items || !items.length)
        return;
    for (i = 0, l = items.length; i < l; ++i)
        items[i].render(render, deltaTime);
};

/**
 * Call <code>input</code> method for current object and all children recursively
 * @param {Object} event - Input event
 * @param {uno.CanvasRender|uno.WebglRender} render - Render for using it in input handler
 */
uno.Object.prototype.input = function(event, render) {
    var i, l, items;
    if (this._inputs) {
        items = this._inputs;
        for (i = 0, l = items.length; i < l; ++i)
            items[i].input(event, render);
    }
    items = this._children;
    if (!items || !items.length)
        return;
    for (i = 0, l = items.length; i < l; ++i)
        items[i].input(event, render);
};

/**
 * Object factory helper
 * @param components
 * @returns {uno.Object}
 */
uno.Object.create = function(components) {
    if (!(components instanceof Array))
        components = Array.prototype.slice.call(arguments);
    var object = new uno.Object();
    for (var i = 0, l = components.length; i < l; ++i)
        object.addComponent(components[i]);
    return object;
};