var mask = function(object) {
    this.object = object;
    this.tex = null;
    this.mask = null;
    //this.buf = new uno.Texture(1000, 1000);
    this.tile = new uno.Rect(0, 0, 1000, 1000);
    this.i = 0;
};

mask.id = 'mask';

mask.prototype.render = function(render, deltaTime) {
    //render.target = this.buf;
    //render.clear(uno.Color.TRANSPARENT);
    //var ctx = render._context;
    //ctx.globalCompositeOperation = 'source-over';
    render.startMask();
    render.fillColor = uno.Color.BLACK;
    render.fillColor.a = 0.1;
    render.lineWidth = 0;
    render.transform = this.object.transform.matrix;
    for (var r = 0; r < 30; ++r) {
        render.drawCircle(500 - this.i, 500 - this.i, 100 - r * 2);
        render.drawCircle(600 + this.i, 600 + this.i, 100 - r * 2);
    }
    this.i += 0.1;
    //ctx.globalCompositeOperation = 'source-in';
    render.startMask();
    render.fillColor = uno.Color.BLACK;
    render.drawRect(400, 400, 200, 200);
    render.transform = uno.Matrix.IDENTITY;
    //render.startMask();
    render.drawCircle(550, 550, 200);

    render.drawTexture(this.tex, this.tile);
    render.clearMask();
    //render.transform = uno.Matrix.IDENTITY;
    //render.drawTexture(this.tex, this.tile);
    //ctx.globalCompositeOperation = 'source-over';
    //render.clearMask();
    //render.target = null;
    //render.drawTexture(this.buf);
};

function create(render1, render2) {
    window.stage = uno.Object.create(resize);

    var obj = uno.Object.create(mask, uno.Transform, drag);
    obj.mask.tex = uno.Texture.load('assets/water.jpg');
    obj.mask.mask = uno.Texture.load('assets/test.png');
    stage.addChild(obj);

    render1.background = uno.Color.WHITE;

    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    createRenders(true, false);
}