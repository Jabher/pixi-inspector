import dump from './services/dump'

(function init() {
    if (typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__ === 'undefined')
        throw new Error('PIXI must be detected before loading pixi.inspector.js');

    if (typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__ === 'object')
        return console.log('Injected twice');

    var path = window.__PIXI_INSPECTOR_GLOBAL_HOOK__;
    var PIXI = eval(path);

    var inspector = new Inspector();
    inspector.use(PIXI);
    window.__PIXI_INSPECTOR_GLOBAL_HOOK__ = inspector;
}());


class Inspector {
    selectMode = false;

    _highlight = {
        node: false,
        stage: false,
        point: false,
        graphics: new PIXI.Graphics()
    };

    /**
     * Root of the Pixi object tree.
     */
    root = {
        children: [],
        _inspector: {
            id: 1,
            type: 'root',
            collapsed: false
        }
    };

    symbolRender = Symbol('wrapped render fn');

    patch(Renderer) {
        var inspector = this;
        Renderer.prototype[this.symbolRender] = Renderer.prototype.render;
        Renderer.prototype.render = function (stage) {
            inspector.beforeRender(stage);
            var retval = this[inspector.symbolRender](stage);
            inspector.afterRender(stage, retval);
            return retval;
        }
    }

    beforeRender(stage) {
        if (this.root.children.indexOf(stage) === -1) {
            this.root.children.push(stage);
            if (!window.$pixi) {
                window.$pixi = stage;
            }
        }

        var canvas = this.view;
        if (!canvas._inspector) {
            canvas._inspector = {
                id: generateId()
            };
            canvas.addEventListener('click', (e) => {
                if (!this.selectMode)
                    return;

                e.preventDefault();
                e.stopPropagation();
                var rect = e.target.getBoundingClientRect();
                this.selectMode = false;
                this._highlight.point = false;
                this._highlight.node = false;
                this.selectAt(stage, new PIXI.Point(
                    ( ( e.clientX - rect.left ) * (canvas.width / rect.width  ) ) / this.resolution,
                    ( ( e.clientY - rect.top ) * (canvas.height / rect.height  ) ) / this.resolution
                ));
            }, true);
            canvas.addEventListener('mousemove', (e) => {
                if (!this.selectMode)
                    return;

                var rect = e.target.getBoundingClientRect();
                this._highlight.point = new PIXI.Point(
                    ( ( e.clientX - rect.left ) * (canvas.width / rect.width  ) ) / this.resolution,
                    ( ( e.clientY - rect.top ) * (canvas.height / rect.height  ) ) / this.resolution
                );
            }, false);

            canvas.addEventListener('mouseleave', (e) => {
                this._highlight.point = false;
                this._highlight.node = false;
            }, false);
        }
        // @todo remove stages after an idle period
        if (this._highlight.point) {
            this._highlight.node = this.highlightAt(stage, this._highlight.point);
        }

        var highlightNode = this._highlight.node;
        if (this._highlight.graphics && highlightNode && highlightNode.getBounds) {
            var box = this._highlight.graphics;
            box.clear();
            box.beginFill(0x007eff, 0.3);
            box.lineStyle(1, 0x007eff, 0.6);
            var bounds = highlightNode.getBounds();
            box.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
            box.endFill();
            stage.addChild(box);
            this._highlight.shouldRemove = true;
        }
    }

    afterRender(stage) {
        if (this._highlight.shouldRemove) {
            stage.removeChild(this._highlight.graphics);
            this._highlight.shouldRemove = false;
        }
    }

    /**
     * Aggregate results  for services/scene.js
     */
    scene() {
        var scene = {
            tree: this.tree(),
            selectMode: this.selectMode,
            selected: false,
            hover: false,
            context: {}
        };
        if (this._highlight.node && this._highlight.node._inspector) {
            scene.hover = this._highlight.node._inspector.id;
        }
        if (window.$pixi) {
            scene.selected = this.selection();
            if (window.$pixi._inspector) {
                scene.context = this.context(window.$pixi._inspector.id);
            }
        }
        return scene;
    }

    tree() {
        return this.node(this.root);
    }

    expand(id) {
        var node = this.find(id);
        if (node) {
            node._inspector.collapsed = false;
        }
    }

    collapse(id) {
        var node = this.find(id);
        if (node) {
            node._inspector.collapsed = true;
        }
    }

    select(id) {
        window.$pixi = this.find(id);
        return this.selection();
    }

    selectAt(node, point) {
        if (node === this._highlight.graphics) {
            return false;
        }
        if (node.containsPoint) {
            if (node.containsPoint(point)) {
                this.node(node);
                window.$pixi = node;
                return node;
            }
        } else if (node.children && node.children.length) {
            for (var i = node.children.length - 1; i >= 0; i--) {
                var result = this.selectAt(node.children[i], point);
                if (result) {
                    this.node(node);
                    node._inspector.collapsed = false;
                    return result;
                }
            }
        }
        if (node.getBounds && node.getBounds().contains(point.x, point.y)) {
            window.$pixi = node;
            return node;
        }
    }

    highlight(id) {
        if (id === false) {
            this._highlight.node = false;
            this._highlight.point = false;
        } else {
            this._highlight.node = this.find(id);
        }
    }

    highlightAt(node, point) {
        if (node === this._highlight.graphics) {
            return false;
        }
        if (node.containsPoint) {
            if (node.containsPoint(point)) {
                return node;
            }
        } else if (node.children && node.children.length) {
            for (var i = node.children.length - 1; i >= 0; i--) {
                var hit = this.highlightAt(node.children[i], point);
                if (hit) {
                    return hit;
                }
            }
        }
        if (node.getBounds && node.getBounds().contains(point.x, point.y)) {
            return node;
        }
        return false;
    }

    selection() {
        return Object.assign(dump(window.$pixi), {_inspector: window.$pixi._inspector});
    }

    /**
     * Get the surounding nodes (prev, next, parent. For tree keyboard navigation)
     */
    context(id, tree) {
        tree = tree || this.tree();
        var context = {};
        if (tree.id === id) {
            if (!tree.collapsed && !tree.leaf) {
                context.next = tree.children[0].id;
            }
            return context;
        }
        if (!tree.collapsed && !tree.leaf) {
            var found = false;
            var prev = tree;
            for (var i in tree.children) {
                var node = tree.children[i];
                if (found) {
                    context.next = node.id;
                    return context;
                }
                context = this.context(id, node);
                if (context) {
                    if (!context.parent && tree.type !== 'root') {
                        context.parent = tree.id;
                    }
                    if (!context.prev && prev.type !== 'root') {
                        context.prev = prev.id;
                    }
                    if (context.next) {
                        return context;
                    }
                    found = true;
                    continue; // collect context.next id
                }
                prev = node
            }
            if (found) {
                return context;
            }
        }
        return false;
    }

    find(id, node) {
        if (!node) {
            node = this.root;
        }
        if (!node._inspector) {
            return false;
        }
        if (node._inspector.id === id) {
            return node;
        }
        if (node.children) {
            var length = node.children.length;
            for (var i = 0; i < length; i++) {
                var found = this.find(id, node.children[i]);
                if (found) {
                    return found;
                }
            }
        }
        return false;
    }

    node(node) {
        var inspector = node._inspector || {};
        var defaultTo = (obj, prop, value) => obj[prop] = obj.hasOwnProperty(prop) ? obj[prop] : value;

        defaultTo(inspector, 'id', generateId());
        defaultTo(inspector, 'collapsed', true);
        defaultTo(inspector, 'type', this.detectType(node));

        node._inspector = inspector;

        var result = {
            id: inspector.id,
            type: inspector.type,
            leaf: (!node.children || node.children.length === 0),
            collapsed: inspector.collapsed,
            name: node.name
        };

        if (result.leaf === false && inspector.collapsed === false) {
            result.children = [];
            var length = node.children.length;
            for (var i = 0; i < length; i++) {
                result.children.push(this.node(node.children[i]));
            }
        }
        return result;
    }

    detectType(node) { return node.constructor.name || 'Unknown'; }

    use(_PIXI) {
        PIXI = _PIXI;
        this.patch(PIXI.CanvasRenderer);
        this.patch(PIXI.WebGLRenderer);
    }
}

generateId.idx = 0;
function generateId() {
    return ++this.idx;
}