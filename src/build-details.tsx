import {createRoot} from "react-dom/client";
import React from "react";
import {IProps, WidgetConfigurationSettings} from "./State";
import SDK = require("azure-devops-extension-sdk");

import * as Dashboard from "azure-devops-extension-api/Dashboard";

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

const root = createRoot(rootContainer);

SDK.init();

SDK.register("DeploymentsWidget.BuildDetails", () => {});

root.render(<Dialog/>);