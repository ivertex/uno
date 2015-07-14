var resize = function(object) {
    this.object = object;
    this._size = new uno.Point(uno.Screen.availWidth, uno.Screen.availHeight);
    this._timer = 0;
};

resize.id = 'resize';

resize.prototype.update = function() {
    if (!this._size.equal(uno.Screen.availWidth, uno.Screen.availHeight)) {
        if (this._timer)
            clearTimeout(this._timer);
        this._timer = setTimeout(this.resize.bind(this), 50);
        this._size.set(uno.Screen.availWidth, uno.Screen.availHeight);
    }
};

resize.prototype.resize = function() {
    var w = uno.Screen.availWidth;
    var h = uno.Screen.availHeight;
    var renders = uno.Render.renders;
    if (renders.length == 1) {
        renders[0].resize(w, h);
    } else {
        if (w > h)
            w = Math.floor(w * 0.5);
        else
            h = Math.floor(h * 0.5);
        for (var i = 0, l = renders.length; i < l; ++i)
            renders[i].resize(w, h);
    }
    this._timer = 0;
};