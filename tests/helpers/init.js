function createRenders(render1, render2, type) {
    var settings = {
        container: document.body,
        width: uno.Screen.width,
        height: uno.Screen.height,
        fps: 60,
        //background: false
        //background: new uno.Color(0, 0, 0, 0)
        background: new uno.Color(0, 0.5, 0.5)
    };

    window.render1 = render1;
    window.render2 = render2;

    if (window.render1) {
        settings.mode = type || uno.Render.RENDER_CANVAS;
        settings.ups = 60;
        if (window.render2) {
            if (settings.width > settings.height)
                settings.width = Math.floor(settings.width * 0.5);
            else
                settings.height = Math.floor(settings.height * 0.5);
        }
        window.render1 = uno.Render.create(settings);
    }

    if (window.render2) {
        try {
            settings.mode = type || uno.Render.RENDER_WEBGL;
            settings.ups = 60;
            window.render2 = uno.Render.create(settings);
        } catch (e) {
            console.log(e);
        }
    }

    create(window.render1, window.render2);
}

function onLoad(name) {
    name = sessionStorage.getItem('current');
    if (!name) {
        name = 'tint';
    }
    createPanel(name);
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'tests/' + name + '.js?' + Math.random();
    script.onload = function() { init(); };
    head.appendChild(script);
}

function onClick(e) {
    var name = e.target.attributes[0].value;
    if (name === 'pause') {
        for (var i in uno.Render.renders) {
            var render = uno.Render.renders[i];
            render.ups = render.ups ? 0 : 60;
            render.fps = render.fps ? 0 : 60;
        }
        if (render.ups)
            e.target.classList.remove('active');
        else
            e.target.classList.add('active');
        return;
    }
    if (name === 'docs') {
        window.open('engine/docs', '_blank');
        return;
    }
    sessionStorage.setItem('current', name);
    window.location.reload();
}

function createPanel(active) {
    var panel = document.getElementsByClassName('panel')[0];
    if (!panel)
        return;
    for (var i = 0, l = panel.children.length; i < l; ++i) {
        var item = panel.children[i];
        if (item.attributes[0].value === active)
            item.classList.add('active');
        item.addEventListener('click', onClick);
        item.addEventListener('touchend', onClick);
    }
}