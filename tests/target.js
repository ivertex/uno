var target = function(object) {
    this.object = object;
    this.texture = null;
    this.target = new uno.Texture(300, 300);
    this.filter = true;
    this.m1 = new uno.Matrix();
    this.matrix = new uno.Matrix();
    this.filterVal = 0;
    this.filterOffset = 0.001;
    //this.matrix.rotate(uno.Math.HALF_PI);
    //this.matrix.translate(300, 300);
    this.data = new Uint8Array(4);
};

target.id = 'target';

target.prototype.filterTexture = function(render, texture) {
    var data = render.getPixels(texture, 100, 100, 200, 200);
    this.filterVal += this.filterOffset;
    if (this.filterVal > 0.5 || this.filterVal < -0.5)
        this.filterOffset = -this.filterOffset;
    var val = this.filterVal;
    for (var i = 0, l = data.length; i < l; i += 4) {
        data[i] = data[i + 1] = data[i + 2] = val * (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
        val += 0.00003;
    }
    render.setPixels(texture, data, 50, 50, 200, 200);
};

target.prototype.update = function(render) {
    this.matrix.rotate(0.0005);
    this.m1.rotate(-0.001);
    this.object.transform.rotation += 0.001;
};

target.prototype.render = function(render) {
    if (!this.texture || !this.texture.ready)
        return;
    render.fillColor = uno.Color.BLUE;
    render.drawCircle(200, 200, 100);
    if (this.filter) {
        render.target = this.target;
        render.clear(uno.Color.WHITE);
        render.transform = this.matrix;
        render.drawTexture(this.texture);
        render.transform = this.m1;
        render.fillColor = uno.Color.GREEN;
        render.drawRect(100, 100, 100, 100);
        this.filterTexture(render, this.target);
        //console.log(render.type, render.getPixels(this.target, 100, 100, 1, 1));
        render.target = null;
    }
    //render.clear();
    //render.fillColor = uno.Color.RED;
    render.transform = this.object.transform.matrix;
    render.drawTexture(this.filter ? this.target : this.texture);

    if (render.type === uno.Render.RENDER_WEBGL) {
        render._batch.flush();
        //render._context.readPixels(uno.Mouse.x, render.height - uno.Mouse.y, 1, 1, render._context.RGBA, render._context.UNSIGNED_BYTE, this.data);
        //console.log(this.data);

    }
};

target.prototype.input = function(event) {
    if (uno.Mouse.down(event, uno.Mouse.RIGHT)) {
        this.filter = !this.filter;
    }
};

function prefab1(render, texture) {
    var obj = uno.Object.create(uno.Transform, uno.Sprite, target, drag);
    obj.transform.setPivot(150, 150);
    obj.transform.setPosition(render.width * 0.5, render.height * 0.5);
    obj.target.texture = texture;
    return obj;
}

function create(render1, render2) {
    var tex = new uno.Texture();

    window.stage = uno.Object.create(resize);

    var obj = prefab1(render1 || render2, tex);
    stage.addChild(obj);

    tex.load('assets/test.jpg');

    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    createRenders(true, true);
}