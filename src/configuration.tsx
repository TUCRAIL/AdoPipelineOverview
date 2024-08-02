import * as SDK from "azure-devops-extension-sdk";
import * as API from "azure-devops-extension-api";
import {ObservableValue} from "azure-devops-ui/Core/Observable";
import {Dropdown} from "azure-devops-ui/Dropdown";
import {Observer} from "azure-devops-ui/Observer";
import * as Dashboard from "azure-devops-extension-api/Dashboard";

import React = require("react")
import {
    ConfigurationEvent,
    CustomSettings, SaveStatus
} from "azure-devops-extension-api/Dashboard";
import "azure-devops-ui/Core/override.css";
import "./configuration.scss"
import {IListBoxItem} from "azure-devops-ui/ListBox";
import {
    BuildDefinition3_2,
    BuildRestClient
} from "azure-devops-extension-api/Build";
import {GitRestClient} from "azure-devops-extension-api/Git";
import {CommonServiceIds, IProjectPageService} from "azure-devops-extension-api";
import {TextField} from "azure-devops-ui/TextField";
import {Checkbox} from "azure-devops-ui/Checkbox";
import {createRoot} from "react-dom/client";
import {DropdownMultiSelection} from "azure-devops-ui/Utilities/DropdownSelection";
import {ISelectionRange} from "azure-devops-ui/Utilities/Selection";


export interface IProps {}

interface IConfigurationWidgetState {
    isBranchDropdownDisabled: boolean;
    buildCount: number;
    showStages: boolean;
    selectedTag: string;
    selectedBuildDefinitionId: number;
    selectedBranch: string;
}


class ConfigurationWidget extends React.Component<IProps, WidgetConfigurationSettings> implements Dashboard.IWidgetConfiguration{
    private projectId = "";
    private buildDefinitionItems : IListBoxItem[] = [];
    private selectedBuildDefinition = new ObservableValue<string>("");
    private tagDropdownMultiSelection = new DropdownMultiSelection();

    private widgetConfigurationContext?: Dashboard.IWidgetConfigurationContext;

    private branchItems : IListBoxItem[] = [];

    private tagItems : IListBoxItem[] = [];

    private getDataAsBuildReference(data: {}) : BuildDefinition3_2 {
        return data as BuildDefinition3_2;
    }

    constructor(props : IProps) {
        super(props)
        this.state = {
            isBranchDropdownDisabled: true,
            buildCount: 1,
            showStages: true,
            defaultTag: 'all',
            buildDefinition: -1,
            buildBranch: "",
            definitionName: ""
        }
    }

    /**
     * Converts the widget settings to the state of the widget component
     * @param widgetSettings The widget settings to convert
     * @private
     */
    private async setStateFromWidgetSettings(widgetSettings: Dashboard.WidgetSettings) {
        const settings = widgetSettings.customSettings.data;
        const preFormattedSettings = JSON.parse(settings);
        let postFormattedSettings = JSON.parse(settings);
        postFormattedSettings.buildCount = parseInt(preFormattedSettings.buildCount);
        const configuration = JSON.parse(JSON.stringify(postFormattedSettings)) as WidgetConfigurationSettings;

        this.setState(configuration, async () => {
                await this.initializeState();
        });
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
            await this.setStateFromWidgetSettings(widgetSettings);
            return Dashboard.WidgetStatusHelper.Success();
        } catch (e) {
            console.error()
            return Dashboard.WidgetStatusHelper.Success((e as any).toString());
            //return Dashboard.WidgetStatusHelper.Failure((e as any).toString());
        }
    }

    async reload(
        widgetSettings: Dashboard.WidgetSettings
    ): Promise<Dashboard.WidgetStatus> {
        try {
            await this.setStateFromWidgetSettings(widgetSettings);
            return Dashboard.WidgetStatusHelper.Success();
        } catch (e) {
            return Dashboard.WidgetStatusHelper.Failure((e as any).toString());
        }
    }

    /**
     * Event handler for when the build definition dropdown is changed
     * @param _event
     * @param selectedDropdown
     */
    private onBuildDropdownChange = (_event: React.SyntheticEvent<HTMLElement>, selectedDropdown: IListBoxItem) => {
        this.setState({
            isBranchDropdownDisabled: true,
            defaultTag: 'all',
            buildBranch: "all"
        });
        this.selectedBuildDefinition.value = selectedDropdown.text || "";
        console.debug(`Selected new build definition ${this.selectedBuildDefinition.value}`);
        this.setState({
            buildDefinition: this.getDataAsBuildReference(selectedDropdown.data!).id,
            buildBranch: "all"
        });
        this.buildDefinitionItems!.find(d =>
            Number(this.getDataAsBuildReference(d).id) === Number(this.getDataAsBuildReference(selectedDropdown.data!).id));
        this.fillBranchesDropDown(this.getDataAsBuildReference(selectedDropdown.data!).repository.id.toString(), 'all')
            .then();
        this.fillTagsDropDown().then();

        console.debug(`Selected new build definition ${this.state.buildDefinition}`);
    };

    /**
     * Event handler for when the build count is changed. Also controls the min and max value of the input field
     * @param _event
     * @param newValue
     */
    private onBuildCountChanged = (_event:  React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, newValue : string) => {
        if(isNaN(parseInt(newValue, 10)))
        {
            return;
        }
        else if(parseInt(newValue, 10) < 1 || parseInt(newValue, 10) > 50)
        {
            return;
        }
        this.setState({
            buildCount: parseInt(newValue, 10)

        });
        this.validateConfiguration().then();
    }

    /**
     * Event handler for when the show stages checkbox is changed
     * @param _event
     * @param checked
     */
    private onShowStagesChanged = (_event: (React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement>), checked: boolean) => {
        this.setState({
            showStages: checked
        });
        this.validateConfiguration().then();
    };

    /**
     * Event handler for when the branch dropdown is changed
     * @param _event
     * @param selectedDropdown
     */
    private onBranchDropdownChange = (_event: React.SyntheticEvent<HTMLElement>, selectedDropdown: IListBoxItem) => {
        this.setState({
            buildBranch: selectedDropdown.text === undefined ? "" : selectedDropdown.text
        });
    };

    /**
     * Fills the branch dropdown with the branches of the selected build definition
     * @param definitionRepositoryId The repository id of the selected build definition
     * @param buildBranch The currently selected branch
     * @private
     */
    private async fillBranchesDropDown(definitionRepositoryId: string, buildBranch: string) {
        this.branchItems = [];
        const codeClient = API.getClient<GitRestClient>(GitRestClient);

        const repositoryBranches = await codeClient.getBranches(definitionRepositoryId,
            this.projectId, undefined);

        const branchesArray = repositoryBranches.map((branch) => `refs/heads/${branch.name}`)
            .filter((value, index, self) => self.indexOf(value) === index);

        console.debug(`Starting to populate the branch dropdown. ${branchesArray.length} branches to add`);

        this.branchItems.push({
            id: "all",
            text: "all"
        });

        let foundMatchingBranch = false;
        const RefBuildBranch = buildBranch.startsWith("refs/heads/") ? buildBranch : `refs/heads/${buildBranch}`;

        branchesArray.forEach(branch => {
            const newItem : IListBoxItem = {
                id: branch,
                text: branch.replace("refs/heads/", "")
            }
            this.branchItems.push(newItem)
            console.debug("comparing" + branch + "with " + RefBuildBranch)
            if(branch === RefBuildBranch)
            {
                foundMatchingBranch = true;
                console.debug("Found matching branch")
            }
            // if(branch === buildBranch)
            // {
            //     this.setState((state, props) => ({
            //         buildBranch: branch
            //     }));
            // }
            // else {
            //     this.setState((state, props) => ({
            //             buildBranch: ""
            //         }
            //     ));
            // }
            console.debug("Adding branch " + branch);
        });

        if(!foundMatchingBranch)
        {
            this.setState({
                    buildBranch: "all"
                }
            );
        }

        this.setState({
            isBranchDropdownDisabled: false
        });
    }

    /**
     * Event handler for when the tag dropdown is changed
     * @param _event
     * @param selectedDropdown
     */
    private onTagDropdownChange = (_event: React.SyntheticEvent<HTMLElement>, selectedDropdown: IListBoxItem) => {

        let newTagState = "";
        for(let i = 0;  i < this.tagDropdownMultiSelection.value.length;i++) {
            const selectionRange = this.tagDropdownMultiSelection.value[i];
            for(let j = selectionRange.beginIndex; j <= selectionRange.endIndex; j++)
            {
                newTagState += this.tagItems[j].id + ",";
            }
        }
        if(newTagState.endsWith(','))
        {
            newTagState = newTagState.substring(0, newTagState.length - 1);
        }
        this.setState({
            defaultTag:  newTagState === "" ? "all" : newTagState
        });
    }

    /**
     * Fills the tag dropdown with the tags of the selected build definition
     * @private
     */
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
                const newItem : IListBoxItem = {
                    id: tag,
                    text: tag
                };

                this.tagItems.push(newItem);
            });
        }

        this.setState({
            defaultTag: "all"
        });
    }

    public componentDidMount() {
        SDK.init().then(() =>
        {
            SDK.register('DeploymentsWidget.Configuration', this
            )
            SDK.resize(350, 500)
            console.debug("Initializing state")
            //this.initializeState().then();
        })
    }

    /**
     * Initializes the state of the widget dropdowns on load
     * @private
     */
    private async initializeState() {
        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService)
        console.debug("Entered registration")
        const project = await projectService.getProject()
        console.debug(`project id is ${project?.id}`)
        this.projectId = project?.id!;
        const buildClient = API.getClient<BuildRestClient>(BuildRestClient);
        const buildDefinitions = await buildClient.getDefinitions(project!.id, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined, true, undefined, undefined);


        await Promise.all(buildDefinitions.map(async (definition) => {
            this.buildDefinitionItems.push({
                id: definition.id.toString(),
                text: definition.name,
                data: definition
            });
            if(definition.id === this.state.buildDefinition)
            {
                this.selectedBuildDefinition.value = definition.name;
                this.setState({
                    isBranchDropdownDisabled: false
                });
                await this.fillBranchesDropDown(this.getDataAsBuildReference(definition).repository.id.toString(), this.state.buildBranch);
            }
        }));

    }

    /**
     * Validates the configuration of the widget
     * @private
     */
    private async validateConfiguration() : Promise<Dashboard.SaveStatus>
    {
        try {
            var branchName = this.state.buildBranch;
            if(branchName === "all")
            {

            }
            else if(branchName.startsWith("refs/heads/"))
            {
                branchName = branchName;
            }
            else {
                branchName = `refs/heads/${branchName}`;
            }
            const configuration = new WidgetConfigurationSettings(this.state.buildDefinition,
                branchName,
                this.selectedBuildDefinition.value,
                this.state.buildCount,
                this.state.defaultTag,
                this.state.showStages);
            let errorMessage = "";
            if(configuration.buildDefinition === -1)
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
                await this.widgetConfigurationContext?.notify(ConfigurationEvent.ConfigurationChange,
                    ConfigurationEvent.Args(customSettings));
                return  Dashboard.WidgetConfigurationSave.Valid(customSettings);
            }
        }
        catch (e) {
            console.error(e);
            return Dashboard.WidgetConfigurationSave.Invalid();
        }
    }

    componentDidUpdate(_prevProps: Readonly<IProps>, _prevState: Readonly<WidgetConfigurationSettings>, _snapshot?: any) {
        try {
            this.validateConfiguration().then();
        }
        catch (e)
        {
            console.error(e)
        }
    }

    public render() {
        return this.state && (
            <div>
                <div id={"build_definition"} className="flex-row" style={{margin: "8px", alignItems: "center"}}>
                    <Dropdown items={this.buildDefinitionItems}
                              noItemsText={"No build definition was found"}
                              placeholder={this.state.buildDefinition === 0 ? "Select a build definition" : this.selectedBuildDefinition.value}
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
                              noItemsText={"No branch was found"}
                              placeholder={this.state.buildBranch === "" ? "Select a branch" : this.state.buildBranch.replace("refs/heads/", "")}
                              onSelect={this.onBranchDropdownChange}
                              disabled={this.state.isBranchDropdownDisabled}/>
                    <Observer selectedItem={this.state.buildBranch.replace("refs/heads/", "")}>
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
                              noItemsText={"No tag was found"}
                              placeholder={this.state.defaultTag === "" ? "Select a tag" : this.state.defaultTag}
                              onSelect={this.onTagDropdownChange}
                              selection={this.tagDropdownMultiSelection}
                              disabled={this.state.buildDefinition === 0}/>
                    <Observer selectedItem={this.state.defaultTag}>
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
    //TODO: Remove this property and go back to use IConfigurationWidgetState for the configuration widget state
    public isBranchDropdownDisabled: boolean = false;

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

const rootContainer = document.getElementById("root");

const root = createRoot(rootContainer);

root.render(<ConfigurationWidget/>);
