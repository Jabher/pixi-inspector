require("./SplitView.css");

export default ({children}) => <div className="splitview">
    {children.map((element, i) => <div className="splitview__item" key={i}>{element}</div>) }
</div>