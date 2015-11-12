var mask = function(object) {
    this.object = object;
    this.tex = null;
    this.mask = null;
};

mask.id = 'mask';

mask.prototype.render = function(render, deltaTime) {
    render.texture(this.tex);
    render.transform = this.object.transform.matrix;
    render.clip(100, 100, 200, 200);
    render.mask(this.mask);
    render.rect(0, 0, 500, 500);
    render.clip();
    render.texture(this.tex);
};

function create(render1, render2) {
    window.stage = uno.Object.create(resize);

    var obj = uno.Object.create(mask, uno.Transform, drag);

    obj.mask.tex = uno.Texture.load('assets/water.jpg');
    obj.mask.mask = uno.Texture.load('assets/test.png');

    //obj.transform.position.set(300, 300);

    stage.addChild(obj);

    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    createRenders(true, true);
}