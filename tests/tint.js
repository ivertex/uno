var tinter = function(object) {
    this.object = object;
    this.tint = 0.002;
    this.offset = 0.1;
};

tinter.id = 'tinter';

tinter.prototype.update = function(render, deltaTime) {
    var sprite = this.object.sprite;
    sprite.tint.r += this.tint;
    if (sprite.tint.r === 0 || sprite.tint.r === 1)
        this.tint *= -1;
    sprite.frame.setPosition(sprite.frame.x + this.offset, sprite.frame.y + this.offset);
    if (sprite.frame.y <= 0.05 || sprite.frame.y + sprite.frame.height >= sprite.frame.maxHeight - 0.05)
        this.offset *= -1;
};

var rotator = function(object) {
    this.object = object;
    this.rotation = 0;
};

rotator.id = 'rotator';

rotator.prototype.update = function(render, deltaTime) {
    this.object.transform.rotation += this.rotation;
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

var debug = function(object) {
    this.object = object;
};

debug.id = 'debug';

debug.prototype.input = function(event) {
    if (uno.Mouse.down(event, uno.Mouse.RIGHT)) {
        var s = this.object.sprite;
        s.blend = s.blend > 3 ? 0 : s.blend + 1;
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
    var obj = uno.Object.create(uno.Transform, uno.Sprite, rotator, tinter, drag, debug);
    obj.transform.setPosition(render.width / 2, render.height / 2);
    obj.transform.setScale(0.7, 0.7);
    obj.rotator.rotation = 0.001;
    obj.sprite.texture = texture;
    obj.sprite.tint.set(0, 1, 0);
    obj.sprite.alpha = 1;
    return obj;
}

function prefab2(texture) {
    var obj = uno.Object.create(uno.Transform, uno.Sprite, rotator, drag);
    obj.transform.setScale(0.5, 0.5);
    obj.rotator.rotation = 0.003;
    obj.sprite.texture = texture;
    obj.sprite.alpha = 0.5;
    obj.sprite.blend = uno.Render.BLEND_ADD;
    return obj;
}

function create(render1, render2) {
    var tex1 = new uno.Texture();
    var tex2 = new uno.Texture();

    window.stage = uno.Object.create(resizer);

    var obj1 = prefab1(render1 || render2, tex1);
    stage.addChild(obj1);

    var obj2 = prefab2(tex2);
    obj1.addChild(obj2);

    tex1.load('assets/test.jpg', function() {
        obj1.transform.setPivot(tex1.width * 0.25, tex1.height * 0.25);
        obj1.sprite.frame.setSize(tex1.width * 0.5, tex1.height * 0.5);
        obj2.transform.setPosition(tex1.width * 0.25, tex1.height * 0.25);
    });
    tex2.load('assets/test.png', function() {
        obj2.transform.setPivot(tex2.width * 0.5, tex2.height * 0.5);
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