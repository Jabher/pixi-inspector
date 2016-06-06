import {Component} from "react";

export default class DetailValue extends Component {
    render() {
        var value = this.props.value;
        if (typeof value === 'boolean') {
            value = value ? 'true' : 'false'
        } else if (value === null) {
            value = 'null';
        }
        return <span ref="input"
                     contentEditable={true}
                     onInput={::this.onInput}
                     onKeyDown={::this.onKeyDown}
                     dangerouslySetInnerHTML={{__html: value}}/>
    }

    onInput(e) {
        var value = e.target.innerText;
        if (value.match(/[0-9.]+/)) {
            this.props.onChange(parseFloat(value, 10));
        } else if (['true', 'false', 'null'].indexOf(value.toLowerCase()) !== -1) {
            this.props.onChange(value.toLowerCase());
        }
    }

    onKeyDown(e) {
        var value = parseFloat(e.target.innerText, 10);
        var update = false;
        var size = e.altKey ? 0.1 : 1;
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                break;
            case 'ArrowUp':
                update = !isNaN(value);
                value = value + size;
                break;
            case 'ArrowDown':
                update = !isNaN(value);
                value = value - size;
                break;
        }
        if (update) {
            e.target.innerText = value;
            this.props.onChange(value);
        }
    }
};
