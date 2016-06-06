import {Component} from "react";
import DetailValue from "./DetailValue";
import proxy from "../services/proxy";
import "./DetailView.css";
import dump from "../services/dump";

export default class DetailView extends Component {
    render() {
        var data = this.props.data;
        var formatted = dump(data, ['children', 'parent', 'worldTransform']);

        return <div className="detailview">{
            Object.keys(formatted)
                .map(label => <div key={label}>
                    <span className="detailview__label">{label}</span>
                    <DetailValue className="detailview__value"
                                 onChange={val => proxy.eval("$pixi." + label + " = " + val)}
                                 value={formatted[label]}
                    />
                </div>)
        }</div>
    }
};
