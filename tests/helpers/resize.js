var resize = function(object) {
    this.object = object;
    this._counter = 0;
    this._size = new uno.Point(uno.Screen.availWidth, uno.Screen.availHeight);
};

resize.id = 'resize';

resize.prototype.update = function() {
    if (++this._counter < 30)
        return;
    this._counter = 0;
    if (!this._size.equal(uno.Screen.availWidth, uno.Screen.availHeight)) {
        var w = uno.Screen.availWidth;
        var h = uno.Screen.availHeight;
        if (w > h)
            w /= 2;
        else
            h /= 2;
        for (var i in uno.Render.renders)
            uno.Render.renders[i].resize(w, h);
        this._size.set(uno.Screen.availWidth, uno.Screen.availHeight);
    }
};