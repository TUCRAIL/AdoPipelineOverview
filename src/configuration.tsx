import * as SDK from "azure-devops-extension-sdk";
import * as API from "azure-devops-extension-api";
import * as ReactDOM from "react-dom";
import {ObservableValue} from "azure-devops-ui/Core/Observable";
import {Dropdown} from "azure-devops-ui/Dropdown";
import {Observer} from "azure-devops-ui/Observer";

import React = require("react")
import {WidgetConfigurationSave, WidgetStatusHelper} from "azure-devops-extension-api/Dashboard";
import "azure-devops-ui/Core/override.css";
import "./configuration.scss"

export default class ConfigurationDropdown extends React.Component {

    private selectedBuildDefinition = new ObservableValue<string>("");

    public render() {
        return(
            <div>
                <Dropdown items={[
                    {id: "i1", text: "item1"},
                    {id: "i2", text: "item2"}
                ]} placeholder="build definition"
                          onSelect={(event, item) => this.selectedBuildDefinition.value = item.id}></Dropdown>

                <Observer selectedItem={this.selectedBuildDefinition}>
                    {(props: { selectedItem: string }) => {
                        return (
                            <span style={{ marginLeft: "8px", width: "150px" }}>
                                Selected Item: {props.selectedItem}{" "}
                            </span>
                        );
                    }}
                </Observer>
            </div>

        )
    }
}
SDK.init({
    loaded: false,
    applyTheme: true
});

SDK.register("DeploymentsWidget.Configuration", async function () {
    return {
        load: function () {
            return WidgetStatusHelper.Success();
        }
    }
})


ReactDOM.render(<ConfigurationDropdown/>, document.getElementById("root"));

SDK.notifyLoadSucceeded();