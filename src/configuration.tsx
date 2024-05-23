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
import {TextField} from "azure-devops-ui/TextField";
import {Checkbox} from "azure-devops-ui/Checkbox";


export interface IProps {}

interface IConfigurationWidgetState {
    isBranchDropdownDisabled: boolean;
    buildCount: number;
    showStages: boolean;
    selectedTag: string;
    selectedBuildDefinitionId: number;
    selectedBranch: string;
}


class ConfigurationWidget extends React.Component<IProps, IConfigurationWidgetState> implements Dashboard.IWidgetConfiguration{
    private projectId = "";

    private buildDefinitions : BuildDefinition3_2[] | undefined;
    private buildDefinitionItems : IListBoxItem[] = [];
    private selectedBuildDefinition = new ObservableValue<string>("");

    private widgetConfigurationContext?: Dashboard.IWidgetConfigurationContext;

    private branchItems : IListBoxItem[] = [];

    private tagItems : IListBoxItem[] = [];
    private tagSelection : DropdownSelection = new DropdownSelection();

    private getDataAsBuildReference(data: {}) : BuildDefinition3_2 {
        return data as BuildDefinition3_2;
    }

    constructor(props : IProps) {
        super(props)
        this.state = {
            isBranchDropdownDisabled: true,
            buildCount: 1,
            showStages: true,
            selectedTag: 'all',
            selectedBuildDefinitionId: 0,
            selectedBranch: ""
        }
    }

    async preload(_widgetSettings: Dashboard.WidgetSettings) {
        return Dashboard.WidgetStatusHelper.Success();
    }

    async load(
        widgetSettings: Dashboard.WidgetSettings,
        widgetConfigurationContext: Dashboard.IWidgetConfigurationContext
    ): Promise<Dashboard.WidgetStatus> {
        try {
            this.widgetConfigurationContext = widgetConfigurationContext;
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
        this.setState((state, props) => ({
            isBranchDropdownDisabled: true
        }));
        this.selectedBuildDefinition.value = selectedDropdown.text || "";
        console.debug(`Selected new build definition ${this.selectedBuildDefinition.value}`);
        this.setState((state, props) => ({
            selectedBuildDefinitionId: this.getDataAsBuildReference(selectedDropdown.data!).id,
            selectedBranch: ""
        }));
        this.branchItems[0] = {
            id: "all",
            text: "all"
        };

        const currentDefinition = this.buildDefinitionItems!.find(d =>
            Number(this.getDataAsBuildReference(d).id) === Number(this.getDataAsBuildReference(selectedDropdown.data!).id));

        this.fillBranchesDropDown(this.getDataAsBuildReference(selectedDropdown.data!).repository.id.toString(), 'all');
        this.fillTagsDropDown();

        console.debug(`Selected new build definition ${this.state.selectedBuildDefinitionId}`);
    };

    private onBuildCountChanged = (event:  React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, newValue : string) => {
        if(isNaN(parseInt(newValue, 10)))
        {
            return;
        }
        else if(parseInt(newValue, 10) < 1 || parseInt(newValue, 10) > 50)
        {
            return;
        }
        this.setState((state, props) => ({
            buildCount: parseInt(newValue, 10)
        }));
    }

    private onShowStagesChanged = (event: (React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement>), checked: boolean) => {
        this.setState((state, props) => ({
            showStages: checked
        }));
    };

    private onBranchDropdownChange = (event: React.SyntheticEvent<HTMLElement>, selectedDropdown: IListBoxItem<{}>) => {
        this.setState((state, props) => ({
            selectedBranch: selectedDropdown.text || ""
        }));
    };

    private async fillBranchesDropDown(definitionRepositoryId: string, buildBranch: string) {
        this.branchItems = [];
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
                this.setState((state, props) => ({
                    selectedBranch: branch
                }));
            }
            console.debug("Adding branch " + branch);
        });

        this.setState((state, props) => ({
            isBranchDropdownDisabled: false
        }));
    }

    private onTagDropdownChange = (event: React.SyntheticEvent<HTMLElement>, selectedDropdown: IListBoxItem<{}>) => {

        this.setState((state, props) => ({
            selectedTag: selectedDropdown.text || "all"
        }));
    }

    private async fillTagsDropDown() {
        const buildClient = API.getClient<BuildRestClient>(BuildRestClient);
        const tags = await buildClient.getTags(this.projectId);

        console.debug(`Starting to populate the tag dropdown. ${tags.length} tags to add`);
        this.tagItems = [];
        this.tagItems.push({
            id: "all",
            text: "all"
        });
        if (tags.length > 0) {
            tags.sort().forEach(tag => {
                const newItem : IListBoxItem<{}> = {
                    id: tag,
                    text: tag
                };

                this.tagItems.push(newItem);
            });
        }

        this.tagSelection.select(1);
        this.setState((state, props) => ({
            selectedTag: "all"
        }));
    }

    public componentDidMount() {
        SDK.init().then(() =>
        {
            SDK.register('DeploymentsWidget.Configuration', this/*, function () : IWidgetConfiguration {
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
            SDK.resize(350, 500)
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

    private async validateConfiguration() : Promise<Dashboard.SaveStatus>
    {
        const configuration = new WidgetConfigurationSettings(this.state.selectedBuildDefinitionId,
            this.state.selectedBranch,
            this.selectedBuildDefinition.value,
            this.state.buildCount,
            this.state.selectedTag,
            this.state.showStages);
        let errorMessage = "";
        if(configuration.buildDefinition === 0)
        {
            errorMessage += "The build definition selected is invalid \n";
        }
        if(configuration.buildBranch === "")
        {
            errorMessage += "The branch selected is invalid \n";
        }
        if(configuration.buildCount < 1 || configuration.buildCount > 50)
        {
            errorMessage += "The number of builds to show must be between 1 and 50 \n";
        }
        if(errorMessage !== "")
        {
            console.debug("Invalid configuration: \n" +
            errorMessage);
            return Dashboard.WidgetConfigurationSave.Invalid();
            // await this.widgetConfigurationContext?.notify(ConfigurationEvent.ConfigurationError, {
            //     data: errorMessage
            // });
        }
        else {
            const customSettings: CustomSettings = {
                data: JSON.stringify(configuration)
            };
            console.debug("Configuration is valid");
            await this.widgetConfigurationContext?.notify(ConfigurationEvent.ConfigurationChange, customSettings);
            return  Dashboard.WidgetConfigurationSave.Valid(customSettings);
        }
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IConfigurationWidgetState>, snapshot?: any) {
        this.validateConfiguration();
    }


    public render() {
        console.debug("Rendering configuration widget")
        return(
            <div>
                <div id={"build_definition"} className="flex-row" style={{margin: "8px", alignItems: "center"}}>
                    <Dropdown items={this.buildDefinitionItems}
                              onSelect={this.onBuildDropdownChange}

                    required={true}/>
                    <Observer selectedItem={this.selectedBuildDefinition}>
                        {(props: { selectedItem: string }) => {
                            return (
                                <span style={{marginLeft: "8px", width: "150px"}}>
                                Selected Item: {props.selectedItem}{" "}
                            </span>
                            );
                        }}
                    </Observer>
                </div>

                <div id={"branch"} className="flex-row" style={{margin: "8px", alignItems: "center"}}>
                    <Dropdown items={this.branchItems}
                              onSelect={this.onBranchDropdownChange}
                              disabled={this.state.isBranchDropdownDisabled}/>
                    <Observer selectedItem={this.state.selectedBranch}>
                        {(props: { selectedItem: string }) => {
                            return (
                                <span style={{marginLeft: "8px", width: "150px"}}>
                                Selected Item: {props.selectedItem}{" "}
                            </span>
                            );
                        }}
                    </Observer>
                </div>
                <div id={"build_count"} className="flex-row" style={{margin: "8px", alignItems: "center"}}>
                    <TextField
                        value={this.state.buildCount.toString()}
                        inputType={"number"}
                        onChange={this.onBuildCountChanged}
                        required={true}
                        label={"Builds to show"}
/>
                    <Observer selectedItem={this.state.buildCount.toString()}>
                        {(props: { selectedItem: string }) => {
                            return (
                                <span style={{marginLeft: "8px", width: "150px"}}>
                                Selected Item: {props.selectedItem}{" "}
                            </span>
                            );
                        }}
                    </Observer>
                </div>
                <div id={"tags"} className="flex-row" style={{margin: "8px", alignItems: "center"}}>
                    <Dropdown items={this.tagItems}
                              onSelect={this.onTagDropdownChange}
                              disabled={this.state.selectedBuildDefinitionId === 0}/>
                    <Observer selectedItem={this.state.selectedTag}>
                        {(props: { selectedItem: string }) => {
                            return (
                                <span style={{marginLeft: "8px", width: "150px"}}>
                                Selected Tag: {props.selectedItem}{" "}
                            </span>
                            );
                        }}
                    </Observer>
                </div>
                <div id={"show stages"} className="flex-row" style={{margin: "8px", alignItems: "center"}}>
                    <Checkbox
                        checked={this.state.showStages}
                        onChange={this.onShowStagesChanged}
                        label={"Show Stages"}
                    ></Checkbox>
                    <Observer selectedItem={this.state.showStages}>
                        {(props: { selectedItem: boolean }) => {
                            return (
                                <span style={{marginLeft: "8px", width: "150px"}}>
                                Selected Item: {props.selectedItem.toString()}{" "}
                            </span>
                            );
                        }}
                    </Observer>
                </div>


            </div>
        )
    }

    async onSave(): Promise<SaveStatus> {
        return await this.validateConfiguration();
    }
}


export class WidgetConfigurationSettings {
    public buildDefinition: number;
    public buildBranch: string;
    public definitionName: string;
    public buildCount: number;
    public defaultTag: string;
    public showStages: boolean;

    constructor(buildDefinition: number, buildBranch: string, definitionName: string, buildCount: number,
                defaultTag: string, showStages: boolean) {
        this.buildDefinition = buildDefinition;
        this.buildBranch = buildBranch;
        this.definitionName = definitionName;
        this.buildCount = buildCount;
        this.defaultTag = defaultTag;
        this.showStages = showStages;
    }

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
