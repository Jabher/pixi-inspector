import {Component, PropTypes} from "react";
import inspector from "../services/inspectorProxy";
import TreeView from "./TreeView";

export default class PixiTree extends Component {
    render() {
        const node = this.props.tree;
        const children = node.children || [];
        return <div>{children.map(node => <PixiNode node={node}/>)}</div>;
    }
};

const PixiNode = ({node}) => <TreeView
    key={node.id}
    title={node.name 
                ? node.type === 'Unknown' ? node.name : node.type + ' (' + node.name + ')' 
                : node.type}
    leaf={node.leaf}
    collapsed={node.collapsed}
    selected={node.id === this.props.selectedId}
    hovered={node.id === this.props.hoverId}
    renderChildren={this.subtree.bind(this, node)}
    onExpand={() => inspector.expand(node.id) }
    onCollapse={() => inspector.collapse(node.id) }
    onSelect={() => inspector.select(node.id) }
    onMouseEnter={() => inspector.highlight(node.id)}
    onMouseLeave={() => inspector.highlight(false)}
    onFocus={() => {
            inspector.highlight(node.id);
            node.id !== this.props.selectedId ? inspector.select(node.id) : void 0;
            }}
    onBlur={() => inspector.highlight(false)}
/>;


PixiTree.propTypes = {
    tree: PropTypes.object
};