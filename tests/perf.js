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
    var settings = {
        container: document.body,
        width: 800,
        height: 600,
        transparent: false,
        autoClear: true,
        clearColor: new uno.Color.BLACK.clone(),
        fps: 60
    };
    window.render1 = false;
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