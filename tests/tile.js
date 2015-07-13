var tiles = function(object) {
    this.object = object;
    this.frame = new uno.Rect();
    this.tex = null;
    this.offset = 1;
};

tiles.id = 'tiles';

tiles.prototype.input = function(event) {
    if (uno.Mouse.down(event, uno.Mouse.RIGHT)) {
        var f = this.frame;
        var t = this.tex;
        f.width += t.width;
        f.height += t.height;
        if (f.width > t.width * 5) {
            f.width = t.width;
            f.height = t.height;
        }
        this.object.transform.pivot.set(f.width * 0.5, f.height * 0.5);
    }
};

tiles.prototype.render = function(render, deltaTime) {
    if (!this.object.transform && this.tex)
        return;
    this.frame.x += this.offset;
    this.frame.y += this.offset;
    this.object.transform.rotation += 0.001;
    render.transform = this.object.transform.matrix;
    render.alpha = 0.5;
    render.blend = uno.Render.BLEND_ADD;
    render.drawTexture(this.tex, this.frame);
};

function create(render1, render2) {
    var stage = uno.Object.create(resize);

    var w = render1 ? render1.width : render2.width;
    var h = render1 ? render1.height : render2.height;

    var tex = uno.Texture.load('assets/test.png', function() {
        /*var tex2 = new uno.Texture(uno.Math.nextPOT(tex.width), uno.Math.nextPOT(tex.height));

        render2.target = tex2;
        render2.transform.reset();
        render2.drawTexture(tex);
        render2.target = null;

        tex = tex2;
        */

        var obj = uno.Object.create(uno.Transform, tiles, drag);
        var frame = obj.tiles.frame;
        obj.tiles.tex = tex;
        frame.set(0, 0, tex.width * 3, tex.height * 3);
        obj.transform.scale.set(0.25, 0.25);
        obj.transform.position.set(w * 0.5, h * 0.5);
        obj.transform.pivot.set(frame.width * 0.5, frame.height * 0.5);
        stage.addChild(obj);
    });

    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    createRenders(true, true);
}