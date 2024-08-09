import "azure-devops-ui/Core/override.css";
import {WidgetSettings, IConfigurableWidget, WidgetStatusHelper, WidgetStatus}
    from "azure-devops-extension-api/Dashboard";
import React from "react";
//import { createRoot } from 'react-dom/client';
import {
    Build, BuildQueryOrder,
    BuildRestClient,
    TimelineRecord,
} from "azure-devops-extension-api/Build";
import SDK from "azure-devops-extension-sdk";
import {getClient, CommonServiceIds/*, IHostPageLayoutService*/, IProjectPageService} from "azure-devops-extension-api/Common";
import {ZeroData} from "azure-devops-ui/ZeroData";
import {Dropdown} from "azure-devops-ui/Dropdown";
import {IListBoxItem} from "azure-devops-ui/ListBox";
import {DropdownMultiSelection} from "azure-devops-ui/Utilities/DropdownSelection";
import {
    IProps,
    WidgetConfigurationSettings,
    WidgetState
} from "./State";
import {BuildWithTimeline} from "./Models/BuildWithTimeline";
import {BuildResultRow} from "./Components/BuildResultRow";
import {render} from "react-dom";

class Widget extends React.Component<IProps, WidgetState> implements IConfigurableWidget {

    //#region fields

    private builds: BuildWithTimeline[] = []
    private projectId : string = ""

    private tagDropdownMultiSelection = new DropdownMultiSelection();
    private tagItems : IListBoxItem[] = [];




    //#endregion

    //#region widget events

    componentDidMount() {
        SDK.init().then(() => {
            SDK.register("DeploymentsWidget", this);
        });
    }

    async preload(_widgetSettings: WidgetSettings) {
        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService)
        const projectInfo = await projectService.getProject();
        this.projectId = projectInfo?.id ?? "";
        return WidgetStatusHelper.Success();
    }

    async load(
        widgetSettings: WidgetSettings
    ): Promise<WidgetStatus> {
        try {
            console.debug("Loading widget data")
            const settings = JSON.parse(widgetSettings.customSettings.data) as WidgetConfigurationSettings

            if(settings === null || settings === undefined || typeof settings === "undefined")
            {
                console.warn("Widget settings are not configured. Please configure the widget");
                this.setState(null);
            }
            else {
                await this.initializeState(WidgetState.fromWidgetConfigurationSettings(settings));
                await this.fillTagsDropDown();
            }
            return WidgetStatusHelper.Success();
        } catch (e) {
            console.error("Failed loading the widget data")
            console.error(e)
            return WidgetStatusHelper.Success();
            //return WidgetStatusHelper.Failure((e as any).toString());
        }
    }

    //@ts-ignore
    async reload(
        widgetSettings: WidgetSettings
    ): Promise<WidgetStatus | undefined> {
        try {
            console.debug("Reloading widget data")
            console.debug(JSON.stringify(widgetSettings.customSettings.data))
            const settings = JSON.parse(widgetSettings.customSettings.data) as WidgetConfigurationSettings
            if(settings === null || settings === undefined || typeof settings === "undefined")
            {
                this.setState(null);
            }
            else {
                await this.initializeState(WidgetState.fromWidgetConfigurationSettings(settings));
            }
            return WidgetStatusHelper.Success();
        } catch (e) {
            console.error("Failed reloading the widget data")
            console.error(e)
            return WidgetStatusHelper.Failure((e as any).toString());
        }
    }

    //#endregion

    //#region state

    /**
     * Takes the state object and re-hydrate the component
     * @param widgetState The custom state object of the component
     * @private
     */
    private async initializeState(widgetState: WidgetState) {

        //Need to get empty object and copy because the widgetState could actually be of type ReadOnly<WidgetState>
        const settings = WidgetState.getEmptyObject();
        settings.copy(widgetState);

        console.debug("Setting state from widget settings" + JSON.stringify(settings));

        const buildClient = getClient<BuildRestClient>(BuildRestClient);
        let buildPages: Build[] = [];
        if(settings.matchAnyTagSelected)
        {
            for(let tag of settings.selectedTag.split(',')) {
                let buildPage = await buildClient.getBuilds(this.projectId, [settings.selectedBuildDefinitionId], undefined,
                    undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                    settings.selectedTag === 'all' ? undefined : [tag], undefined, settings.buildCount, undefined,
                    undefined, undefined, BuildQueryOrder.StartTimeDescending, settings.selectedBranch === 'all' ? undefined : settings.selectedBranch,
                    undefined, undefined, undefined);
                buildPages = buildPages.concat(buildPage);
            }
        }
        else {
            let buildPage = await buildClient.getBuilds(this.projectId, [settings.selectedBuildDefinitionId], undefined,
                undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                settings.selectedTag === 'all' ? undefined : settings.selectedTag.split(','), undefined, settings.buildCount, undefined,
                undefined, undefined, BuildQueryOrder.StartTimeDescending, settings.selectedBranch === 'all' ? undefined : settings.selectedBranch,
                undefined, undefined, undefined);
            buildPages = buildPages.concat(buildPage);
        }
        buildPages = buildPages.filter((value, index, self) => self.indexOf(value) === index);


        buildPages = buildPages.sort(function (a, b) {
            return b.id - a.id;
        });


        let builds: Build[];


        builds = buildPages.map(buildPage => buildPage).slice(0, settings.buildCount);


        this.builds = [];
        const tempBuilds: BuildWithTimeline[] = [];
        for (let build of builds) {
            const timeline = await buildClient.getBuildTimeline(this.projectId, build.id);
            const newBuild = new BuildWithTimeline(build, timeline);
            newBuild.timeline.records = newBuild.timeline.records.filter(this.filterTimelineByStage).sort(function (a, b) {
                return a.order - b.order;
            });
            tempBuilds.push(newBuild);
        }

        this.builds = tempBuilds;
        this.setState(settings);
    }

    //#endregion

    //#region helpers

    /**
     * Checks if the timeline record is a stage
     * @param item
     * @private
     */
    private filterTimelineByStage(item : TimelineRecord) : boolean {
        return item.type === "Stage";

    }

    /**
     * Fills up all known tags applied to builds in the current Azure DevOps project
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

        if(this.state.selectedTag !== "all" && this.state.selectedTag !== "")
        {
            const tagArray = this.state.selectedTag.split(",");
            for (const tag of tagArray) {
                const index = this.tagItems.findIndex((item) => item.id === tag);
                if (index !== -1) {
                    this.tagDropdownMultiSelection.select(index, undefined, true, true);
                }
            }
            this.setState({
                selectedTag: this.state.selectedTag
            })
        }
        else {
            this.setState({
                selectedTag: "all"
            });
        }
    }

    //#endregion

    //#region Event handlers

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
        }, async () => {
            await this.initializeState(this.state);
        });
    }

    private onClearTagDropdownSelectionClick()
    {
        this.tagDropdownMultiSelection.clear();
        this.setState({
            selectedTag: "all"
        }, async () => {
            await this.initializeState(this.state);
        });
    }

    //TODO: Update this when implementing dialog to show the result of each stages in a dialog (ie: when there are too many stages to show)
    // private onDialogButtonClick = async () => {
    //     var extensionContext = SDK.getExtensionContext();
    //
    //     var contributionId = extensionContext.publisherId + "." +
    //         extensionContext.extensionId + ".DeploymentsWidget.BuildDetails";
    //
    //     var dialogOptions = {
    //         title: "My dialog",
    //         width: 800,
    //         height: 600,
    //         urlReplacementObject: { buildId: "0"}
    //     }
    //
    //     var dialogService = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
    //
    //     dialogService.openCustomDialog(contributionId, dialogOptions);
    //
    //
    //
    // }

     //#endregion


    //#region render
    render(): JSX.Element {
        if(!this.state)
        {
            return (<div>
                <ZeroData imageAltText={"Widget not configured"}
                          primaryText={"The widget must be configured"}
                          secondaryText={
                    <span>
                        The widget is not configured or an update made the old configuration invalid. Please configure the widget.
                    </span>
                          }

                />
            </div>
            )
        }
        return this.state && (
            <div id="widget-container">

                <h2 className="title">
                    <div className="inner-title">{this.state.selectedDefinitionName ?? 'No definition found'}</div>
                    <div className="subtitle">{this.state.selectedBranch.replace("refs/heads/", "") ?? 'No branch found'}</div>
                </h2>

                <div className="content">
                    <div className={"widget-tag-container"}>
                        <label className="label">Filter by tag: </label>
                        <Dropdown items={this.tagItems}
                                  actions={[
                                      {
                                          className: "bolt-dropdown-action-right-button",
                                          disabled: this.tagDropdownMultiSelection.selectedCount === 0,
                                          iconProps: { iconName: "Clear" },
                                          text: "Clear",
                                          onClick: () => {
                                              this.onClearTagDropdownSelectionClick();
                                          }
                                      }
                                  ]}
                                  noItemsText={"No tag was found"}
                                  placeholder={this.state.selectedTag === "" ? "Select a tag" : this.state.selectedTag}
                                  onSelect={this.onTagDropdownChange}
                                  selection={this.tagDropdownMultiSelection}
                                  className={"widget-tag-dropdown dropdown-element"}
                                  >

                        </Dropdown>
                    </div>
                    <div id="build-container">
                        <div>
                            <table>
                                <tbody>
                                {
                                    this.builds.map((buildWithTimeline, index) => {
                                    return (<BuildResultRow key={buildWithTimeline.build.id + "/" + index}
                                                    showStages={this.state.showStages}
                                                    build={buildWithTimeline}
                                                    buildIndex={index} />)
                                    })
                                }
                                </tbody>

                            </table>

                        </div>
                    </div>
                </div>

            </div>


        );
    }
    //#endregion
}

const rootContainer = document.getElementById("root");

//const root = createRoot(rootContainer);

//root.render(<Widget/>);

render(<Widget/>, rootContainer);



