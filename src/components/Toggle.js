require("./Toggle.css");

export default (props) => <span
    className={['toggle', props.value ? 'toggle--on' : 'toggle--off'].join(' ')}
    onClick={props.onChange.bind(null, !props.value) }>
        <span className={'toggle__icon toggle__icon--' + props.icon}
              title={props.title}/></span>
