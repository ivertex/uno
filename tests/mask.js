var mask = function(object) {
    this.object = object;
    this.tex = null;
    this.mask = null;
    this.buf = new uno.Texture(1000, 1000);
};

mask.id = 'mask';

mask.prototype.render = function(render, deltaTime) {
    render.target = this.buf;
    render.clear();
    var ctx = render._context;
    ctx.globalCompositeOperation = 'source-over';
    render.drawTexture(this.tex);
    ctx.globalCompositeOperation = 'destination-atop';
    render.drawTexture(this.mask);
    ctx.globalCompositeOperation = 'source-over';
    render.target = null;
    render.drawTexture(this.buf);
};

function create(render1, render2) {
    window.stage = uno.Object.create(resize);

    var obj = uno.Object.create(mask);
    obj.mask.tex = uno.Texture.load('assets/test.jpg');
    obj.mask.mask = uno.Texture.load('assets/test.png');
    stage.addChild(obj);


    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    createRenders(true, false);
}