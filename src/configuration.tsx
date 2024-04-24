import * as SDK from "azure-devops-extension-sdk";
import * as API from "azure-devops-extension-api";
import * as ReactDOM from "react-dom";
import {ObservableValue} from "azure-devops-ui/Core/Observable";
import {Dropdown} from "azure-devops-ui/Dropdown";
import {Observer} from "azure-devops-ui/Observer";
import * as Dashboard from "azure-devops-extension-api/Dashboard";

import React = require("react")
import {
    ConfigurationEvent,
    CustomSettings, IWidgetConfiguration, IWidgetConfigurationContext, SaveStatus,
    WidgetConfigurationSave,
    WidgetStatusHelper
} from "azure-devops-extension-api/Dashboard";
import "azure-devops-ui/Core/override.css";
import "./configuration.scss"
import {DropdownSelection} from "azure-devops-ui/Utilities/DropdownSelection";
import {IListBoxItem} from "azure-devops-ui/ListBox";
import {
    BuildDefinition3_2,
    BuildDefinitionReference, BuildDefinitionReference3_2,
    BuildReference,
    BuildRestClient
} from "azure-devops-extension-api/Build";
import {GitRestClient, GitServiceIds} from "azure-devops-extension-api/Git";
import {CommonServiceIds, IProjectPageService} from "azure-devops-extension-api";


class ConfigurationWidget extends React.Component implements Dashboard.IConfigurableWidget {
    private projectId = "";

    private buildDefinitions : BuildDefinition3_2[] | undefined;
    private buildDefinitionItems : IListBoxItem[] = [];
    private selectedBuildDefinitionId = 0;
    private selectedBuildDefinition = new ObservableValue<string>("");

    private branchItems : IListBoxItem[] = [];
    private selectedBranchDefinition = new ObservableValue<string>("all");

    private getDataAsBuildReference(data: {}) : BuildDefinition3_2 {
        return data as BuildDefinition3_2;
    }

    async preload(_widgetSettings: Dashboard.WidgetSettings) {
        return Dashboard.WidgetStatusHelper.Success();
    }

    async load(
        widgetSettings: Dashboard.WidgetSettings
    ): Promise<Dashboard.WidgetStatus> {
        try {
            //await this.setStateFromWidgetSettings(widgetSettings);
            return Dashboard.WidgetStatusHelper.Success();
        } catch (e) {
            return Dashboard.WidgetStatusHelper.Failure((e as any).toString());
        }
    }

    async reload(
        widgetSettings: Dashboard.WidgetSettings
    ): Promise<Dashboard.WidgetStatus> {
        try {
            //await this.setStateFromWidgetSettings(widgetSettings);
            return Dashboard.WidgetStatusHelper.Success();
        } catch (e) {
            return Dashboard.WidgetStatusHelper.Failure((e as any).toString());
        }
    }

    private onBuildDropdownChange = (event: React.SyntheticEvent<HTMLElement>, selectedDropdown: IListBoxItem<{}>) => {
        this.isBranchDropdownDisabled.value = true;
        this.selectedBuildDefinition.value = selectedDropdown.text || "";
        this.selectedBuildDefinitionId = this.getDataAsBuildReference(selectedDropdown.data!).id;
        console.debug(`Selected new build definition ${this.selectedBuildDefinition.value}`);
        this.selectedBranchDefinition.value = "";
        this.branchItems[0] = {
            id: "all",
            text: "all"
        };

        const currentDefinition = this.buildDefinitionItems!.find(d =>
            Number(this.getDataAsBuildReference(d).id) === Number(this.getDataAsBuildReference(selectedDropdown.data!).id));

        this.fillBranchesDropDown(this.getDataAsBuildReference(selectedDropdown.data!).repository.id.toString(), 'all');
    };

    private onBranchDropdownChange = (event: React.SyntheticEvent<HTMLElement>, selectedDropdown: IListBoxItem<{}>) => {
        this.selectedBranchDefinition.value = selectedDropdown.text || "";
    };

    private async fillBranchesDropDown(definitionRepositoryId: string, buildBranch: string) {
        const codeClient = API.getClient<GitRestClient>(GitRestClient);

        const repositoryBranches = await codeClient.getBranches(definitionRepositoryId,
            this.projectId, undefined);

        const branchesArray = repositoryBranches.map((branch) => `refs/heads/${branch.name}`)
            .filter((value, index, self) => self.indexOf(value) === index);

        console.debug(`Starting to populate the branch dropdown. ${branchesArray.length} branches to add`);
        branchesArray.forEach(branch => {
            const newItem : IListBoxItem<{}> = {
                id: branch,
                text: branch.replace("refs/heads/", "")
            }
            this.branchItems.push(newItem)
            if(branch === buildBranch)
            {
                this.selectedBranchDefinition.value =branch;
            }
            console.debug("Adding branch " + branch);
        });

        this.isBranchDropdownDisabled.value = false;
    }

    public componentDidMount() {
        SDK.init().then(() =>
        {
            SDK.register(SDK.getContributionId(), this/*, function () : IWidgetConfiguration {
            console.log("Registering contribution")
            return {
                onSave(): Promise<SaveStatus> {
                    return WidgetConfigurationSave.Valid({data: ""});
                },
                load: function (widgetHelpers : WidgetStatusHelper) {
                return WidgetStatusHelper.Success();
            }
        }*/
            )
            this.initializeState();
        }

    )

    }

    private async initializeState() {
        //@ts-ignore
        var projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService)
        console.debug("Entered registration")
        var project = await projectService.getProject()
        console.debug(`project id is ${project?.id}`)
        this.projectId = project?.id!;
        const buildClient = API.getClient<BuildRestClient>(BuildRestClient);
        const buildDefinitions = await buildClient.getDefinitions(project!.id, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined, true, undefined, undefined);


        buildDefinitions.forEach(definition => {
            this.buildDefinitionItems.push({
                id: definition.id.toString(),
                text: definition.name,
                data: definition
            });
        });

        /*await SDK.ready(async function() {
            var projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService)
            console.debug("Entered registration")
            var project = await projectService.getProject()
            console.debug(`project id is ${project?.id}`)
            let projectId = SDK.getWebContext().project.id;
            console.debug(`Instance id is ${SDK.getContributionId()}`)
            console.debug(`Project ID is now ${projectId}`)
        });*/
    }

    private isBranchDropdownDisabled = new ObservableValue<boolean>(true);


    public render() {
        console.debug("Rendering configuration widget")
        return(
            <div>
                <Dropdown items={this.buildDefinitionItems}
                          onSelect={this.onBuildDropdownChange}/>
                <Observer selectedItem={this.selectedBuildDefinition}>
                    {(props: { selectedItem: string }) => {
                        return (
                            <span style={{ marginLeft: "8px", width: "150px" }}>
                                Selected Item: {props.selectedItem}{" "}
                            </span>
                        );
                    }}
                </Observer>
                <Dropdown items={this.branchItems}
                          onSelect={this.onBranchDropdownChange}
                          disabled={this.isBranchDropdownDisabled.value}/>
                <Observer selectedItem={this.selectedBranchDefinition}>
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



class WidgetConfigurationSettings {
    public buildDefinition : number;
    public buildBranch : string;
    public definitionName : string;
    public buildCount : number;
    public defaultTag : string;
    public showStages : boolean;

    constructor(buildDefinition: number, buildBranch: string, definitionName: string, buildCount: number,
                defaultTag: string, showStages: boolean)
    {
        this.buildDefinition = buildDefinition;
        this.buildBranch = buildBranch;
        this.definitionName = definitionName;
        this.buildCount = buildCount;
        this.defaultTag = defaultTag;
        this.showStages = showStages;
    }

}

async function notifyWidgetConfigurationContext(definitionName: string, widgetConfigurationContext: IWidgetConfigurationContext)
{
    const configuration = new WidgetConfigurationSettings(1, "" +
        "", definitionName, 0, "", false);

    const customSettings : CustomSettings = {
        data: JSON.stringify(configuration)
    };

    await widgetConfigurationContext.notify(ConfigurationEvent.ConfigurationChange, customSettings);
}


// SDK.init({
//     loaded: false,
//     applyTheme: true
// });

console.log('host is init')
// // @ts-ignore
// SDK.ready(function () {
//     console.log('Host ready callback')
//     SDK.register(SDK.getContributionId(), function () {
//
//         return {
//             load: function () {
//                 return WidgetStatusHelper.Success();
//             }
//         }
//     })
//     SDK.notifyLoadSucceeded();
// }).then(r => {
//     console.log('Host ready then function')
//     console.debug(`host context id is ${SDK.getHost().id}`)
//     SDK.register(SDK.getContributionId(), function () {
//         console.debug("Entered registration")
//         let projectId = SDK.getWebContext().project.id;
//         console.debug(`Instance id is ${SDK.getContributionId()}`)
//         console.debug(`Project ID is now ${projectId}`)
//         ReactDOM.render(<ConfigurationWidget/>, document.getElementById("root"));
//         return {
//             load: function () {
//                 return WidgetStatusHelper.Success();
//             }
//         }
//     })
//     SDK.notifyLoadSucceeded();
// });

ReactDOM.render(<ConfigurationWidget/>, document.getElementById("root"));
