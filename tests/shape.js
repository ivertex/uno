var building = function(object) {
    this.object = object;
    this.points = [];
    this.points.push(new uno.Point(70, 70));
    this.points.push(new uno.Point(150, 10));
    this.points.push(new uno.Point(230, 70));
    this.points.push(new uno.Point(70, 70));
    this.alpha = 1;
    this.speed = 0.1;
};

building.id = 'building';

building.prototype.build = function(render) {
    render.beginShape();

    render.style(null, 0x00D025, 10);
    render.line(0, 200, 300, 200);
    render.style(0xA35B00, 0xDFA700, 5);
    render.rect(90, 70, 125, 125);
    render.style(0xFF0000, 0x0038DF);
    render.poly(this.points);
    render.style(uno.Color.GREEN, uno.Color.RED, 10);
    render.blend = uno.Render.BLEND_ADD;
    render.ellipse(150, 130, 50, 70);
    render.style(0xFFE51E, null, 0);
    render.blend = uno.Render.BLEND_NORMAL;
    render.circle(50, 0, 30);
    render.style(uno.Color.TRANSPARENT, uno.Color.BLUE, 30);
    render.blend = uno.Render.BLEND_ADD;
    render.arc(150, 200, 200, 0, uno.Math.PI, true);

    this.shape = render.endShape();
};

building.prototype.render = function(render, deltaTime) {
    if (!this.object.transform)
        return;

    if (!this.shape)
        this.build(render);

    this.alpha -= 1 / deltaTime * this.speed;
    if (this.alpha < 0 || this.alpha > 1)
        this.speed *= -1;

    render.transform = this.object.transform.matrix;
    render.alpha = this.alpha;
    render.shape(this.shape);
};


function create(render1, render2) {
    window.stage = uno.Object.create(resize);

    var obj = uno.Object.create(uno.Transform, building, drag);
    obj.transform.position.set(100, 100);

    stage.addChild(obj);

    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    createRenders(true, true);
}