var mask = function(object) {
    this.object = object;
    this.tex = null;
    this.mask = null;
    this.buf = uno.Texture.create(300, 300);
    this.tile = new uno.Rect(0, 0, 1000, 1000);
    this.rot = 0;
};

mask.id = 'mask';

mask.prototype.render = function(render, deltaTime) {
    this.rot += 1 / deltaTime * 0.1;
    this.object.transform.rotation = this.rot;
    if (this.mask.ready)
        this.object.transform.pivot.set(this.mask.width * 0.5, this.mask.height * 0.5);
    render.transform = this.object.transform.matrix;
    render.mask = this.mask;
    render.transform.reset();
    render.drawTexture(this.tex, this.tile);
    render.fillColor = uno.Color.WHITE;
    render.drawCircle(300, 300, 200);
    //render.target = this.buf;
    //render.drawCircle(100, 100, 200);
    //render.target = false;
    render.transform.translate(100, 100);
    render.mask = false;
    render.mask = this.mask;
    render.transform.reset();
    //render.drawTexture(this.buf);
    render.drawTexture(this.mask);
    //render.mask = false;
};

function create(render1, render2) {
    window.stage = uno.Object.create(resize);

    var obj = uno.Object.create(mask, uno.Transform, drag);
    obj.mask.tex = uno.Texture.load('assets/water.jpg');
    obj.mask.mask = uno.Texture.load('assets/logo1.png');
    obj.transform.scale.set(0.5);
    obj.transform.position.set(400, 400);
    stage.addChild(obj);

    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    createRenders(true, false);
}