var mask = function(object) {
    this.object = object;
    this.tex = null;
    this.mask1 = null;
    this.mask2 = null;
    this.buf = uno.Texture.create(500, 500);
    this.tile = new uno.Rect(0, 0, 1000, 1000);
    this.rot = 0;
};

mask.id = 'mask';

mask.prototype.render = function(render, deltaTime) {
    this.rot += 1 / deltaTime * 0.1;
    //this.object.transform.rotation = this.rot;

    if (this.mask1.ready)
        this.object.transform.pivot.set(this.mask1.width * 0.5, this.mask1.height * 0.5);

    render.mask(this.mask1, this.object.transform.matrix);

    render.texture(this.tex, this.tile);
    render.texture(this.mask2);

    /*render.fill = uno.Color.GREEN;
    render.blend = uno.Render.BLEND_ADD;
    render.circle(300, 300, 200);
    render.blend = uno.Render.BLEND_NORMAL;

    render.target = this.buf;

    render.mask(this.mask2, this.object.transform.matrix);
    render.clear(uno.Color.TRANSPARENT);

    render.clip(100, 100, 300, 300);
    if (this.mask2.ready) {
        render.fill = uno.Color.BLUE;
        render.rect(0, 0, 300, 300);
    }

    render.target = null;
    render.transform.reset().translate(300, 300);
    render.texture(this.buf);*/
};

function create(render1, render2) {
    window.stage = uno.Object.create(resize);

    var obj = uno.Object.create(mask, uno.Transform, drag);
    obj.mask.tex = uno.Texture.load('assets/water.jpg');
    //obj.mask.mask1 = uno.Texture.create(300, 300);
    obj.mask.mask1 = uno.Texture.load('assets/test.png');
    obj.mask.mask2 = uno.Texture.load('assets/test.png');
    obj.transform.position.set(300, 300);
    stage.addChild(obj);

    //render1.target = obj.mask.mask1;
    //render1.rect(1.5, 1.5, 297, 297);
    //render1.target = null;
    /*render2.target = obj.mask.mask1;
    render2.circle(75, 150, 75);
    render2.circle(225, 150, 75);
    render2.circle(0, 0, 30);
    render2.target = null;*/

    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    createRenders(true, true);
}