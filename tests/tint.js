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
    sprite.frame.x += this.offset;
    sprite.frame.y += this.offset;
    if (sprite.frame.y <= 0.05 || sprite.frame.y + sprite.frame.height >= sprite.texture.height - 0.05)
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

var debug = function(object) {
    this.object = object;
};

debug.id = 'debug';

debug.prototype.input = function(event) {
    if (uno.Mouse.down(event, uno.Mouse.RIGHT)) {
        window.render2._loseContext();
        var s = this.object.sprite;
        s.blend = s.blend > 3 ? 0 : s.blend + 1;
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

    window.stage = uno.Object.create(resize);

    var obj1 = prefab1(render1 || render2, tex1);
    stage.addChild(obj1);

    var obj2 = prefab2(tex2);
    obj1.addChild(obj2);

    tex1.load('assets/test.jpg', function() {
        obj1.transform.setPivot(tex1.width * 0.25, tex1.height * 0.25);
        obj1.sprite.frame.set(0, 0, tex1.width * 0.5, tex1.height * 0.5);
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
    createRenders(true, true);
}