import ReactDOM from "react-dom";
import PixiPanel from "./components/PixiPanel";

const devPanelId = '#devpanel';

const panelContainer = document.querySelector(devPanelId);

ReactDOM.render(<PixiPanel />, panelContainer);