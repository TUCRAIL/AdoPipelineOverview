//import {createRoot} from "react-dom/client";
import React from "react";
import {IProps} from "./State";
import SDK from "azure-devops-extension-sdk";
import {render} from "react-dom";

interface  IState {

}

class Dialog extends React.Component<IProps, IState> {

    render() {
        return (
            <h1> Dialog activated</h1>
        );
    }
}

const rootContainer = document.getElementById("root");

//const root = createRoot(rootContainer);

SDK.init();

SDK.register("DeploymentsWidget.BuildDetails", () => {});

//root.render(<Dialog/>);

render(<Dialog/>, rootContainer);