function createRenders(render1, render2) {
    var settings = {
        container: document.body,
        width: uno.Screen.availWidth,
        height: uno.Screen.availHeight,
        transparent: false,
        autoClear: true,
        clearColor: new uno.Color(0, 0.5, 0.5),
        fps: 60
    };
    window.render1 = render1;
    window.render2 = render2;

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
    create(window.render1, window.render2);
}

function loadTest() {
    var match = window.location.pathname.match(/\/(.+)/i);
    var name = 'tint';
    if (match)
        name = match[1];
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'tests/' + name + '.js?' + Math.random();
    script.onload = function() { init(); };
    head.appendChild(script);
}