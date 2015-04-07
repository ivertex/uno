var graphs = function(object) {
    this.object = object;
    this.groundColor = new uno.Color(0x00D025);
    this.wallColor = new uno.Color(0xDFA700);
    this.wallColor1 = new uno.Color(0xA35B00);
    this.roofColor = new uno.Color(0x0038DF);
    this.roofColor1 = new uno.Color(0xFF0000);
    this.sunColor = new uno.Color(0xFFE51E);
    this.points = [];
    this.points.push(new uno.Point(70, 70));
    this.points.push(new uno.Point(150, 10));
    this.points.push(new uno.Point(230, 70));
    this.points.push(new uno.Point(70, 70));
};

graphs.id = 'graphs';

graphs.prototype.build = function(render) {
    render.startShape();
    render.lineColor(this.groundColor);
    render.lineWidth(10);
    render.drawLine(0, 200, 300, 200);
    render.lineColor(this.wallColor);
    render.fillColor(this.wallColor1);
    render.lineWidth(5);
    render.drawRect(90, 70, 125, 125);
    render.lineColor(this.roofColor);
    render.fillColor(this.roofColor1);
    render.drawPoly(this.points);
    render.lineColor(uno.Color.RED);
    render.fillColor(uno.Color.GREEN);
    render.lineWidth(10);
    render.blend = uno.Render.BLEND_ADD;
    render.drawEllipse(150, 130, 50, 70);
    render.fillColor(this.sunColor);
    render.lineWidth(0);
    render.blend = uno.Render.BLEND_NORMAL;
    render.drawCircle(50, 0, 30);
    render.fillColor(null);
    render.lineColor(uno.Color.BLUE);
    render.lineWidth(30);
    render.blend = uno.Render.BLEND_ADD;
    render.drawArc(150, 200, 200, 0, uno.Math.PI, true);
    this.shape = render.endShape();
};

graphs.prototype.render = function(render, deltaTime) {
    if (!this.object.transform)
        return;
    if (!this.shape)
        this.build(render);
    render.transform = this.object.transform.matrix;
    render.drawShape(this.shape);
};


function create(render1, render2) {
    window.stage = uno.Object.create();

    var obj = uno.Object.create(uno.Transform, graphs, drag);
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