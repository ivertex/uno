var mask = function(object) {
    this.object = object;
    this.tex = null;
    this.mask = null;
    this.tile = new uno.Rect(0, 0, 1000, 1000);
};

mask.id = 'mask';

mask.prototype.render = function(render, deltaTime) {

};

function create(render1, render2) {
    window.stage = uno.Object.create(resize);

    var obj = uno.Object.create(mask, uno.Transform, drag);
    obj.mask.tex = uno.Texture.load('assets/water.jpg');
    obj.mask.mask = uno.Texture.load('assets/test.png');
    stage.addChild(obj);

    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    createRenders(true, true);
}