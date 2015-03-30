var drag = function(object) {
    this.object = object;
    this.wheel = true;
    this.mouse = true;
    this.touch = true;
    this.scale = 0.0005;

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
            transform.scale.add(event.wheelY * this.scale, event.wheelY * this.scale);
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