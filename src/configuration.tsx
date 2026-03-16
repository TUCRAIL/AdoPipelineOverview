import * as SDK from "azure-devops-extension-sdk";
import {ObservableValue} from "azure-devops-ui/Core/Observable";
import {Dropdown} from "azure-devops-ui/Dropdown";
import { Toggle } from "azure-devops-ui/Toggle";
import {
    WidgetConfigurationSave,
    IWidgetConfiguration,
    IWidgetConfigurationContext,
    WidgetSettings, WidgetStatusHelper, WidgetStatus
} from "@tucrail/azure-devops-extension-api/Dashboard";

import React = require("react")
import {
    ConfigurationEvent,
    CustomSettings, SaveStatus
} from "@tucrail/azure-devops-extension-api/Dashboard";
import "azure-devops-ui/Core/override.css";
import "./configuration.scss"
import {IListBoxItem} from "azure-devops-ui/ListBox";
import {
    BuildDefinition3_2,
    BuildRestClient
} from "@tucrail/azure-devops-extension-api/Build";
import {GitRestClient} from "@tucrail/azure-devops-extension-api/Git";
import {CommonServiceIds, IProjectPageService, getClient} from "@tucrail/azure-devops-extension-api/Common";
import {TextField} from "azure-devops-ui/TextField";
import {Checkbox} from "azure-devops-ui/Checkbox";
import {DropdownMultiSelection} from "azure-devops-ui/Utilities/DropdownSelection";
import {ConfigurationWidgetState, IProps, WidgetConfigurationSettings} from "./State";
import {showRootComponent} from "./Common";
import {startsWith} from "azure-devops-ui/Core/Util/String";

export class ConfigurationWidget extends React.Component<IProps, ConfigurationWidgetState> implements IWidgetConfiguration{
    //#region fields

    private projectId = "";
    private buildDefinitionItems : IListBoxItem[] = [];
    private selectedBuildDefinition = new ObservableValue<string>("");
    private tagDropdownMultiSelection = new DropdownMultiSelection();
    private branchDropdownMultiSelection = new DropdownMultiSelection();

    private widgetConfigurationContext?: IWidgetConfigurationContext;

    private branchItems : IListBoxItem[] = [];

    private tagItems : IListBoxItem[] = [];

    //#endregion



    constructor(props : IProps) {
        super(props)
        this.state = ConfigurationWidgetState.getEmptyObject();
    }

    //#region Widget events

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

    componentDidUpdate(_prevProps: Readonly<IProps>, _prevState: Readonly<ConfigurationWidgetState>, _snapshot?: any) {
        try {
            this.validateConfiguration().then();
        }
        catch (e)
        {
            console.error(e)
        }
    }

    async onSave(): Promise<SaveStatus> {
        return await this.validateConfiguration();
    }

    async preload(_widgetSettings: WidgetSettings) {
        return WidgetStatusHelper.Success();
    }

    async load(
        widgetSettings: WidgetSettings,
        widgetConfigurationContext: IWidgetConfigurationContext
    ): Promise<WidgetStatus> {
        try {
            this.widgetConfigurationContext = widgetConfigurationContext;
            await this.setStateFromWidgetSettings(widgetSettings);
            return WidgetStatusHelper.Success();
        } catch (e) {
            console.error(e)
            return WidgetStatusHelper.Success((e as any).toString());
            //return WidgetStatusHelper.Failure((e as any).toString());
        }
    }

    async reload(
        widgetSettings: WidgetSettings
    ): Promise<WidgetStatus> {
        try {
            await this.setStateFromWidgetSettings(widgetSettings);
            return WidgetStatusHelper.Success();
        } catch (e) {
            console.error(e)
            return WidgetStatusHelper.Failure((e as any).toString());
        }
    }

    //#endregion

    //#region State management

    /**
     * Converts the widget settings to the state of the widget component
     * @param widgetSettings The widget settings to convert
     * @private
     */
    private async setStateFromWidgetSettings(widgetSettings: WidgetSettings) {
        const settings = widgetSettings.customSettings.data;
        if(settings === null || settings === undefined || typeof settings === "undefined")
        {
            await this.initializeState();
        }
        else {
            const configuration = JSON.parse(settings) as WidgetConfigurationSettings;
            this.selectedBuildDefinition.value = configuration.definitionName;

            this.setState(ConfigurationWidgetState.fromWidgetConfigurationSettings(configuration),
                async () => {
                    await this.initializeState();
                });
        }


    }

    /**
     * Fills the branch dropdown with the branches of the selected build definition
     * @param definitionRepositoryId The repository id of the selected build definition
     * @param buildBranch The currently selected branch
     * @private
     */
    private async fillBranchesDropDown(definitionRepositoryId: string, buildBranch: string) {
        this.branchItems = [];
        this.branchDropdownMultiSelection.clear();
        const codeClient = getClient<GitRestClient>(GitRestClient);

        const repositoryBranches = await codeClient.getBranches(definitionRepositoryId,
            this.projectId, undefined);

        const branchesArray = repositoryBranches.map((branch) => startsWith(branch.name, '/refs/heads/') ?
            branch.name : `refs/heads/${branch.name}`)
            .filter((value, index, self) => self.indexOf(value) === index);

        console.debug(`Starting to populate the branch dropdown. ${branchesArray.length} branches to add`);

        branchesArray.forEach(branch => {
            const newItem : IListBoxItem = {
                id: branch,
                text: branch.replace("refs/heads/", "")
            }
            this.branchItems.push(newItem);
            console.debug("Adding branch " + branch);
        });

        // Restore multi-selection for saved branches (supports comma-separated multi-branch or legacy single branch)
        if(buildBranch !== "all" && buildBranch !== "") {
            const savedBranches = buildBranch.split(",").map(b =>
                b.trim().startsWith("refs/heads/") ? b.trim() : `refs/heads/${b.trim()}`);
            let foundAny = false;
            for (const savedBranch of savedBranches) {
                const index = this.branchItems.findIndex((item) => item.id === savedBranch);
                if (index !== -1) {
                    foundAny = true;
                    this.branchDropdownMultiSelection.select(index, undefined, true, true);
                }
            }
            if (foundAny) {
                this.setState({
                    selectedBranches: savedBranches.filter(b =>
                        this.branchItems.some(item => item.id === b)).join(",")
                });
            } else {
                this.setState({ selectedBranches: "all" });
            }
        } else {
            this.setState({ selectedBranches: "all" });
        }

        this.setState({
            isBranchDropdownDisabled: false
        });
    }

    /**
     * Fills the tag dropdown with the tags of the selected build definition
     * @private
     */
    private async fillTagsDropDown() {
        const buildClient = getClient<BuildRestClient>(BuildRestClient);
        const tags = await buildClient.getTags(this.projectId);

        console.debug(`Starting to populate the tag dropdown. ${tags.length} tags to add`);
        this.tagItems = [];
        if (tags.length > 0) {
            tags.sort().forEach(tag => {
                const newItem : IListBoxItem = {
                    id: tag,
                    text: tag
                };

                this.tagItems.push(newItem);
            });
        }

        let tagFound : boolean = false;

        if(typeof this.state.selectedTag === "string" && this.state.selectedTag !== "all" && this.state.selectedTag !== "")
        {
            const tagArray = this.state.selectedTag.split(",");
            for (const tag of tagArray) {
                const index = this.tagItems.findIndex((item) => item.id === tag);
                if (index !== -1) {
                    tagFound = true;
                    this.tagDropdownMultiSelection.select(index, undefined, true, true);
                }
            }
            if(tagFound)
            {
                this.setState({
                    selectedTag: this.state.selectedTag
                });
            }

        }
        if(!tagFound)
        {
            this.setState({
                selectedTag: "all"
            });
        }


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
        const buildClient = getClient<BuildRestClient>(BuildRestClient);
        const buildDefinitions = await buildClient.getDefinitions(project!.id, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined, true, undefined, undefined);


        await Promise.all(buildDefinitions.map(async (definition) => {
            this.buildDefinitionItems.push({
                id: definition.id.toString(),
                text: definition.name,
                data: definition
            });
            if(definition.id === this.state.selectedBuildDefinitionId)
            {
                this.selectedBuildDefinition.value = definition.name;
                this.setState({
                    isBranchDropdownDisabled: false
                });
                await this.fillBranchesDropDown(this.getDataAsBuildReference(definition).repository.id.toString(),
                    this.state.selectedBranches);
                await this.fillTagsDropDown();
            }
        }));
    }

    /**
     * Validates the configuration of the widget
     * @private
     */
    private async validateConfiguration() : Promise<SaveStatus>
    {
        try {
            let branchName = this.state.selectedBranches;
            if(branchName !== "all" && branchName !== "") {
                branchName = branchName.split(",")
                    .map(b => b.trim().startsWith("refs/heads/") ? b.trim() : `refs/heads/${b.trim()}`)
                    .join(",");
            }
            let configuration = ConfigurationWidgetState
                .toWidgetConfigurationSettings(this.state, this.selectedBuildDefinition.value)
            configuration.buildBranch = branchName;
            let errorMessage = "";
            if(configuration.buildDefinition === -1)
            {
                errorMessage += "The build definition selected is invalid \n";
            }
            if(configuration.buildBranch === "" || configuration.buildBranch === "all")
            {
                errorMessage += "At least one branch must be selected \n";
            }
            if(typeof configuration.buildCount === "string")
            {
                configuration.buildCount = parseInt(configuration.buildCount);
            }
            if(configuration.buildCount < 1 || configuration.buildCount > 50)
            {
                errorMessage += "The number of builds to show must be between 1 and 50 \n";
            }
            if(errorMessage !== "")
            {
                console.debug("Invalid configuration: \n" +
                    errorMessage);
                return WidgetConfigurationSave.Invalid();
            }
            else {
                const customSettings: CustomSettings = {
                    data: JSON.stringify(configuration)
                };
                console.debug("Configuration is valid");
                await this.widgetConfigurationContext?.notify(ConfigurationEvent.ConfigurationChange,
                    ConfigurationEvent.Args(customSettings));
                return  WidgetConfigurationSave.Valid(customSettings);
            }
        }
        catch (e) {
            console.error(e);
            return WidgetConfigurationSave.Invalid();
        }
    }

    //#endregion

    //#region Event handlers

    /**
     * Event handler for when the build definition dropdown is changed
     * @param _event
     * @param selectedDropdown
     */
    private onBuildDropdownChange = async (_event: React.SyntheticEvent<HTMLElement>, selectedDropdown: IListBoxItem) => {
        this.branchDropdownMultiSelection.clear();
        this.tagDropdownMultiSelection.clear();
        this.setState({
            isBranchDropdownDisabled: true,
            selectedTag: 'all',
            selectedBranches: "all"
        });
        this.selectedBuildDefinition.value = selectedDropdown.text || "";
        console.debug(`Selected new build definition ${this.selectedBuildDefinition.value}`);
        this.setState({
            selectedBuildDefinitionId: this.getDataAsBuildReference(selectedDropdown.data!).id,
            selectedBranches: "all"
        });
        this.buildDefinitionItems!.find(d =>
            Number(this.getDataAsBuildReference(d).id) === Number(this.getDataAsBuildReference(selectedDropdown.data!).id));
        await this.fillBranchesDropDown(this.getDataAsBuildReference(selectedDropdown.data!).repository.id.toString(), 'all');
        await this.fillTagsDropDown();

        console.debug(`Selected new build definition ${this.state.selectedBuildDefinitionId}`);
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
     * @param _selectedDropdown
     */
    private onBranchDropdownChange = (_event: React.SyntheticEvent<HTMLElement>, _selectedDropdown: IListBoxItem) => {
        let newBranchState = "";
        for(let i = 0; i < this.branchDropdownMultiSelection.value.length; i++) {
            const selectionRange = this.branchDropdownMultiSelection.value[i];
            for(let j = selectionRange.beginIndex; j <= selectionRange.endIndex; j++) {
                newBranchState += this.branchItems[j].id + ",";
            }
        }
        if(newBranchState.endsWith(',')) {
            newBranchState = newBranchState.substring(0, newBranchState.length - 1);
        }
        this.setState({
            selectedBranches: newBranchState === "" ? "all" : newBranchState
        });
    };

    private onClearBranchDropdownSelectionClicked() {
        this.branchDropdownMultiSelection.clear();
        this.setState({ selectedBranches: "all" });
    }

    private onSelectAllBranchesClicked() {
        if (this.branchItems.length === 0) {
            return;
        }
        this.branchDropdownMultiSelection.clear();
        this.branchDropdownMultiSelection.select(0, this.branchItems.length, true, true);
        const allBranches = this.branchItems.map(item => item.id as string).join(",");
        this.setState({ selectedBranches: allBranches });
    }


    /**
     * Event handler for when the tag dropdown is changed
     * @param _event
     * @param _selectedDropdown
     */
    private onTagDropdownChange = (_event: React.SyntheticEvent<HTMLElement>, _selectedDropdown: IListBoxItem) => {

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
            selectedTag:  newTagState === "" ? "all" : newTagState
        });
    }

    private onClearTagDropdownSelectionClicked()
    {
        this.tagDropdownMultiSelection.clear();
        this.setState({
            selectedTag: "all"
        });
    }

    private onTagToggleChange = (_event: React.SyntheticEvent<HTMLElement>, checked: boolean) => {
        this.setState({
            matchAnyTagSelected: this.state.matchAnyTagSelected === undefined ? true : checked
        })
    }

    //#endregion

    //#region Helper methods

    private getDataAsBuildReference(data: {}) : BuildDefinition3_2 {
        return data as BuildDefinition3_2;
    }

    //#endregion


    //#region render
    public render() {
        return this.state && (
            <div className={"widget-configuration"}>
                <div id={"build_definition"} className="flex-row" style={{margin: "8px", alignItems: "center"}}>
                    <label>Build Definition: </label>
                    <Dropdown items={this.buildDefinitionItems}
                              noItemsText={"No build definition was found"}
                              className={"dropdown-element"}
                              placeholder={this.state.selectedBuildDefinitionId === -1 ? "Select a build definition" : this.selectedBuildDefinition.value}
                              onSelect={this.onBuildDropdownChange}

                    required={true}/>

                </div>

                <div id={"branch"} className="flex-row" style={{margin: "8px", alignItems: "center"}}>
                    <label>Branch: </label>
                    <Dropdown role={"branch-dropdown"}
                              items={this.branchItems}
                              noItemsText={"No branch was found"}
                              containerClassName={"full-width"}
                              className={"dropdown-element full-width"}
                              showFilterBox={true}
                              filterPlaceholderText={"Search branches..."}
                              actions={[
                                  {
                                      className: "bolt-dropdown-action-right-button",
                                      disabled: this.branchItems.length === 0,
                                      iconProps: { iconName: "CheckList" },
                                      text: "Select all",
                                      onClick: () => {
                                          this.onSelectAllBranchesClicked();
                                      }
                                  },
                                  {
                                      className: "bolt-dropdown-action-right-button",
                                      disabled: this.branchDropdownMultiSelection.selectedCount === 0,
                                      iconProps: { iconName: "Clear" },
                                      text: "Clear",
                                      onClick: () => {
                                          this.onClearBranchDropdownSelectionClicked();
                                      }
                                  }
                              ]}
                              placeholder={this.state.selectedBranches === "" ? "Select a branch" :
                                  this.state.selectedBranches === "all" ? "all" :
                                  this.state.selectedBranches.split(",").map(b => b.replace("refs/heads/", "")).join(", ")}
                              onSelect={this.onBranchDropdownChange}
                              disabled={this.state.isBranchDropdownDisabled}
                              selection={this.branchDropdownMultiSelection}/>

                </div>
                <div id={"build_count"} className="flex-row" style={{margin: "8px", alignItems: "center"}}>
                    <TextField
                        value={this.state.buildCount.toString()}
                        inputType={"number"}
                        onChange={this.onBuildCountChanged}
                        required={true}
                        className={"dropdown-element"}
                        label={"Builds to show"}/>

                </div>
                <div id={"tags"} className="flex-row" style={{margin: "8px", alignItems: "center"}}>
                    <label>Tags: </label>
                    <Dropdown role={"tag-dropdown"}
                                items={this.tagItems}
                              width={320}
                              className={"dropdown-element"}
                              actions={[
                                  {
                                      className: "bolt-dropdown-action-right-button",
                                      disabled: this.tagDropdownMultiSelection.selectedCount === 0,
                                      iconProps: { iconName: "Clear" },
                                      text: "Clear",
                                      onClick: () => {
                                          this.onClearTagDropdownSelectionClicked();
                                      }
                                  }
                              ]}
                              noItemsText={"No tag was found"}
                              placeholder={this.state?.selectedTag === "" ? "Select a tag" : this.state?.selectedTag ?? "all"}                              onSelect={this.onTagDropdownChange}
                              selection={this.tagDropdownMultiSelection}
                              />

                    <Toggle offText={"Match all"}
                            onText={"Match any"}
                            checked={this.state.matchAnyTagSelected}
                            onChange={this.onTagToggleChange }>
                    </Toggle>

                </div>
                <div id={"show stages"} className="flex-row" style={{margin: "8px", alignItems: "center"}}>
                    <Checkbox
                        checked={this.state.showStages}
                        className={"dropdown-element"}
                        onChange={this.onShowStagesChanged}
                        label={"Show Stages"}
                    ></Checkbox>
                </div>


            </div>
        )
    }

    //#endregion
}

showRootComponent(<ConfigurationWidget/>);
