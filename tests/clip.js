var clip = function(object) {
    this.object = object;
    this.tex = null;
    this.tile = new uno.Rect(0, 0, 1000, 1000);
};

clip.id = 'clip';

clip.prototype.render = function(render, deltaTime) {
    var m = this.object.transform.matrix;
    render.clip(100 + m.tx, 100 + m.ty, 200 * m.a, 200 * m.d);
    render.texture(this.tex, this.tile);
    render.thickness = 5;
    render.fill = uno.Color.RED;
    render.clip(200 + m.tx, 200 + m.ty, 100, 100);
    render.circle(200, 200, 100);
    render.clip(false);
    render.fill = uno.Color.GREEN;
    render.circle(300, 300, 100);
};

function create(render1, render2) {
    window.stage = uno.Object.create(resize);

    var obj = uno.Object.create(clip, uno.Transform, drag);
    obj.clip.tex = uno.Texture.load('assets/water.jpg');

    stage.addChild(obj);

    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    createRenders(true, true);
}