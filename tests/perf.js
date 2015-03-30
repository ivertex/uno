var mover = function(object) {
    this.object = object;
    this.speed = new uno.Point(Math.random() * 10 + 1, Math.random() * 10 + 1);
    this.pos = object.transform.position;
};

mover.id = 'mover';

mover.prototype.update = function(render) {
    if (this.pos.x < 0 || this.pos.x > render.width)
        this.speed.x *= -1;
    if (this.pos.y < 0 || this.pos.y > render.height)
        this.speed.y *= -1;
    this.pos.add(this.speed);
};

function prefab(render, texture, blend) {
    var obj = uno.Object.create(uno.Transform, uno.Sprite, mover);
    obj.transform.setPosition(render.width * Math.random(), render.height * Math.random());
    obj.transform.setPivot(texture.width * 0.5, texture.height * 0.5);
    obj.sprite.texture = texture;
    if (blend)
        obj.sprite.blend = uno.Render.BLEND_ADD;
    return obj;
}

function create(render1, render2) {

    var tex = new uno.Texture();
    var stage = uno.Object.create();

    tex.load('assets/bunny.png');

    var b = false;
    for (var i = 0; i < 100000; ++i) {
        stage.addChild(prefab(render1 || render2, tex, b));
        //b = !b;
    }

    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    createRenders(false, true);
}