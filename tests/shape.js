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
    render.blendMode(uno.Render.BLEND_ADD);
    render.drawEllipse(150, 130, 50, 70);
    render.fillColor(this.sunColor);
    render.lineWidth(0);
    render.blendMode(uno.Render.BLEND_NORMAL);
    render.drawCircle(50, 0, 30);
    render.fillColor(null);
    render.lineColor(uno.Color.BLUE);
    render.lineWidth(30);
    render.blendMode(uno.Render.BLEND_ADD);
    render.drawArc(150, 200, 200, 0, uno.Math.PI, true);
    this.shape = render.endShape();
};

graphs.prototype.render = function(render, deltaTime) {
    if (!this.object.transform)
        return;
    if (!this.shape)
        this.build(render);
    render.transform(this.object.transform.matrix);
    render.drawShape(this.shape);
};

var drag = function(object) {
    this.object = object;
    this.wheel = true;
    this.mouse = true;
    this.touch = true;

    this._p1 = new uno.Point();
    this._p2 = new uno.Point();
    this._move = new uno.Point();
    this._distance = 0;
    this._angle = 0;
};

drag.id = 'draggable';

drag.prototype.input = function(event) {
    var transform = this.object.transform;

    if (this.wheel && uno.Mouse.wheel(event)) {
        if (event.wheelX || event.wheelY)
            transform.position.subtract(event.wheelX, event.wheelY);
        return;
    }

    if (this.mouse) {
        if (uno.Mouse.down(event, uno.Mouse.LEFT)) {
            this._p1.set(event.x, event.y);
            this._move.set(this._p1);
        }
        if (uno.Mouse.move(event, uno.Mouse.LEFT)) {
            this._p1.set(event.x, event.y);
            transform.position.subtract(this._move.subtract(this._p1));
            this._move.set(this._p1);
        }
    }

    if (this.touch && uno.Touch.any(event)) {
        if (event.points.length > 0)
            this._p1.set(event.points.item(0));
        var angle = false, distance = false;
        if (event.points.length > 1) {
            this._p2.set(event.points.item(1));
            angle = this._p1.angle(this._p2);
            distance = this._p1.distance(this._p2);
        }
        if (uno.Touch.move(event)) {
            transform.position.subtract(this._move.subtract(this._p1));
            if (angle !== false)
                transform.rotation += angle - this._angle;
            if (distance !== false)
                transform.scale.add((distance - this._distance) * 0.005).clamp(0.1, 1);
        }
        this._angle = angle;
        this._distance = distance;
        this._move.set(this._p1);
    }
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
    var settings = {
        container: document.body,
        width: uno.Screen.availWidth,
        height: uno.Screen.availHeight,
        transparent: false,
        autoClear: true,
        clearColor: new uno.Color(0, 0.5, 0.5),
        fps: 60
    };
    window.render1 = true;
    window.render2 = true;

    if (window.render1) {
        settings.mode = uno.Render.RENDER_CANVAS;
        settings.ups = 60;
        if (window.render2) {
            if (settings.width > settings.height)
                settings.width /= 2;
            else
                settings.height /= 2;
        }
        window.render1 = uno.Render.create(settings);
    }
    if (window.render2) {
        try {
            settings.mode = uno.Render.RENDER_WEBGL;
            settings.ups = 60;
            window.render2 = uno.Render.create(settings);
        } catch (e) {
            console.log(e);
        }
    }
    create(render1, render2);
}