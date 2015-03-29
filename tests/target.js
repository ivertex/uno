var target = function(object) {
    this.object = object;
    this.texture = null;
    this.target = null;
    this.frame1 = null;
    this.frame2 = null;
    this.filter = true;
    this.m1 = new uno.Matrix();
    this.matrix = new uno.Matrix();
    this.filterVal = 0;
    this.filterOffset = 0.01;
    //this.matrix.rotate(uno.Math.HALF_PI);
    //this.matrix.translate(300, 300);
};

target.id = 'target';

target.prototype.filterTexture = function(render, texture) {
    var data = render.getPixels(texture);
    this.filterVal += this.filterOffset;
    if (this.filterVal > 0.3 || this.filterVal < -0.3)
        this.filterOffset = -this.filterOffset;
    var val = this.filterVal;
    for (var i = 0, l = data.length; i < l; i += 4) {
        data[i] = data[i + 1] = data[i + 2] = 0.2126 * data[i] + (0.7152 - val) * data[i + 1] + 0.0722 * data[i + 2];
        val += 0.00001;
    }
    render.setPixels(texture, data);
};

target.prototype.update = function(render) {
    this.matrix.rotate(0.005);
    this.m1.rotate(-0.01);
};

target.prototype.render = function(render) {
    if (!this.texture || !this.texture.ready)
        return;
    if (!this.frame1)
        this.frame1 = new uno.Frame(this.texture.width, this.texture.height);
    if (!this.target) {
        this.target = new uno.Texture(300, 300);
        this.frame2 = new uno.Frame(this.target.width, this.target.height);
    }
    if (this.filter) {
        render.target(this.target);
        render.transform(this.matrix);
        render.clear();
        render.drawTexture(this.texture, this.frame1);
        render.transform(this.m1);
        render.fillColor(uno.Color.RED);
        render.drawRect(100, 100, 100, 100);
        this.filterTexture(render, this.target);
        render.target();
    }
    render.transform(uno.Matrix.IDENTITY);
    render.fillColor(uno.Color.WHITE);
    render.drawRect(0, 0, render.width, render.height);
    render.transform(this.object.transform.matrix);
    render.drawTexture(this.filter ? this.target : this.texture, this.filter ? this.frame2 : this.frame1);
};

target.prototype.input = function(event) {
    if (uno.Mouse.down(event, uno.Mouse.RIGHT)) {
        this.filter = !this.filter;
    }
};

var drag = function(object) {
    this.object = object;
    this.wheel = true;
    this.mouse = true;
    this.touch = true;
    this.scale = 0.0005;

    this._p1 = new uno.Point();
    this._p2 = new uno.Point();
    this._move = new uno.Point();
    this._distance = 0;
    this._angle = 0;
};

drag.id = 'draggable';

drag.prototype.input = function(event) {
    var transform = this.object.transform;

    if (this.wheel && uno.Mouse.wheel(event)) {
        if (event.wheelX || event.wheelY)
            transform.scale.add(event.wheelY * this.scale, event.wheelY * this.scale);
        return;
    }

    if (this.mouse) {
        if (uno.Mouse.down(event, uno.Mouse.LEFT)) {
            this._p1.set(event.x, event.y);
            this._move.set(this._p1);
        }
        if (uno.Mouse.move(event, uno.Mouse.LEFT)) {
            this._p1.set(event.x, event.y);
            transform.position.subtract(this._move.subtract(this._p1));
            this._move.set(this._p1);
        }
    }

    if (this.touch && uno.Touch.any(event)) {
        if (event.points.length > 0)
            this._p1.set(event.points.item(0));
        var angle = false, distance = false;
        if (event.points.length > 1) {
            this._p2.set(event.points.item(1));
            angle = this._p1.angle(this._p2);
            distance = this._p1.distance(this._p2);
        }
        if (uno.Touch.move(event)) {
            transform.position.subtract(this._move.subtract(this._p1));
            if (angle !== false)
                transform.rotation += angle - this._angle;
            if (distance !== false)
                transform.scale.add((distance - this._distance) * 0.005).clamp(0.1, 1);
        }
        this._angle = angle;
        this._distance = distance;
        this._move.set(this._p1);
    }
};

var resizer = function(object) {
    this.object = object;
    this._size = new uno.Point(uno.Screen.availWidth, uno.Screen.availHeight);
};

resizer.id = 'resizer';

resizer.prototype.update = function() {
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

function prefab1(render, texture) {
    var obj = uno.Object.create(uno.Transform, uno.Sprite, target, drag);
    obj.transform.setPosition(render.width / 2, render.height / 2);
    //obj.transform.setScale(0.7, 0.7);
    obj.target.texture = texture;
    return obj;
}

function create(render1, render2) {
    var tex1 = new uno.Texture();

    window.stage = uno.Object.create(resizer);

    var obj1 = prefab1(render1 || render2, tex1);
    stage.addChild(obj1);

    tex1.load('assets/test.jpg', function() {
        obj1.transform.setPivot(tex1.width * 0.5, tex1.height * 0.5);
    });

    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    var settings = {
        container: document.body,
        width: uno.Screen.availWidth,
        height: uno.Screen.availHeight,
        transparent: false,
        autoClear: true,
        clearColor: new uno.Color(0, 0.5, 0.5),
        fps: 60
    };
    window.render1 = true;
    window.render2 = true;

    if (window.render1) {
        settings.mode = uno.Render.RENDER_CANVAS;
        settings.ups = 60;
        if (window.render2) {
            if (settings.width > settings.height)
                settings.width /= 2;
            else
                settings.height /= 2;
        }
        window.render1 = uno.Render.create(settings);
    }
    if (window.render2) {
        try {
            settings.mode = uno.Render.RENDER_WEBGL;
            settings.ups = 60;
            window.render2 = uno.Render.create(settings);
        } catch (e) {
            console.log(e);
        }
    }
    create(render1, render2);
}