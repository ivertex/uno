var debug = function(object) {
    this.object = object;
};

debug.id = 'debug';

debug.prototype.render = function(render, deltaTime) {

};

function create(render1, render2) {
    window.stage = uno.Object.create(resize);

    if (render1)
        render1.root = stage;

    if (render2)
        render2.root = stage;
}

function init() {
    //createRenders(true, true);
    window.render = new uno.Render();
}