import {Component, PropTypes} from "react";
require("./TreeView.css");

/**
 * "dumb" TreeView component.
 */
export default class TreeView extends Component {
    componentDidUpdate(prevProps) {
        if (!prevProps.selected && this.props.selected) {
            this.refs.node.focus();
        }
    }

    render() {
        var nodes = [];
        if (!this.collapsed) {
            nodes = <div style={{paddingLeft: 14}}>{this.props.renderChildren()}</div>;
        }
        var className = 'treeview' + (this.props.selected ? ' treeview--selected' : '') + (this.props.hovered ? ' treeview--hovered' : '');
        return <div>
            <div
                ref="node"
                className={ className }
                onMouseDown={::this.click}
                tabIndex="1"
                onKeyDown={::this.keyDown}
                onFocus={this.props.onSelect}
                onMouseEnter={this.props.onMouseEnter}
                onMouseLeave={this.props.onMouseLeave}
                onFocus={this.props.onFocus}
                onBlur={this.props.onBlur}>
                <Icon {...props} />{this.props.title}
            </div>
            {nodes}
        </div>
    }


    click(e) {
        if (e.target.classList.contains('tree-toggle')) {
            return;
        }
        if (this.props.selected) {
            if (this.props.collapsed) {
                this.props.onExpand(e);
            }
        } else {
            this.props.onSelect(e);
        }
    }
};

const Icon = ({leaf, collapsed, onExpand, onCollapse}) => {
    var style = {
        display: "inline-block",
        width: 12
    };

    if (leaf) {
        return <span className="tree-toggle" style={style}/>
    } else if (collapsed) {
        return <span className="tree-toggle tree-toggle--expand" style={style}
                     onClick={onExpand}>+</span>
    } else {
        return <span className="tree-toggle tree-toggle--collapse" style={style}
                     onClick={onCollapse}>-</span>
    }
} 

var noop = () => {};

TreeView.propTypes = {
    title: React.PropTypes.any.isRequired,
    collapsed: React.PropTypes.bool.isRequired,
    selected: React.PropTypes.bool,
    leaf: React.PropTypes.bool
};

TreeView.defaultProps = {
    leaf: false,
    selected: false,

    onExpand: noop,
    onCollapse: noop,
    onSelect: noop,
    onMouseEnter: noop,
    onMouseLeave: noop,
    onFocus: noop,
    onBlur: noop
}
