import {Component} from 'react';
import {Observable} from 'rx';
import PixiTree from './PixiTree';
import DetailView from './DetailView';
import SplitView from './SplitView';
import Toggle from './Toggle';
import Toolbar from './Toolbar';
import scene from '../services/scene';
import refresh from '../services/refresh';
import detectPixi from '../services/detectPixi';
import proxy from '../services/proxy';
import inspectorProxy from '../services/inspectorProxy';

// require('../pixi.inspector'); // Enable for live reload
var DEBUG = false;

export default class PixiPanel extends Component {
    state = {
        tree: false,
        mode: 'NORMAL',
        selected: false,
        pixiDetected: false
    };

    componentDidMount() {
        this.subscriptions = [
            scene.subscribe(::this.setState,
                error => proxy.eval('typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__')
                    .then((type) => type === 'object' ? console.error(error) : location.reload())),
            detectPixi.subscribe((path) => this.setState({pixiDetected: path})),
            Observable.interval(500).subscribe(refresh)
        ];
    }

    componentWillUnmount() {
        this.subscriptions.forEach((subscription) => subscription.dispose());
    }


    render() {
        var tree = this.state.tree;
        var reboot = DEBUG
            ? <span onClick={() => location.reload()}>[ reboot {this.state.error} ]</span>
            : <span>{this.state.error}</span>;

        if (tree) {
            var selected = this.state.selected;

            return <span className="pixi-panel">{reboot}
            <Toolbar>
                <Toggle icon="node-search" value={this.state.selectMode}
                        onChange={value => inspectorProxy.selectMode(value)}
                        title="Select a node in the scene to inspect it"/></Toolbar>
			<SplitView>
				<PixiTree
                    tree={tree}
                    selectedId={selected ? selected._inspector.id : false}
                    hoverId={this.state.hover}
                    context={this.state.context || {}}/>

                {selected
                    ? <DetailView data={selected}/>
                    : false}
			</SplitView>
		</span>
        } else {
            return <div
                className="pixi-panel__message">
                {reboot} {this.state.pixiDetected ? 'Connecting to Pixi...' : 'Looking for Pixi...'}</div>
        }

    }
};
