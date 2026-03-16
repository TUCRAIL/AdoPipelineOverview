import "azure-devops-ui/Core/override.css";
import {WidgetSettings, IConfigurableWidget, WidgetStatusHelper, WidgetStatus}
    from "@tucrail/azure-devops-extension-api/Dashboard";
import React from "react";
//import { createRoot } from 'react-dom/client';
import {
    Build, BuildQueryOrder,
    BuildRestClient,
    TimelineRecord,
} from "@tucrail/azure-devops-extension-api/Build";
import * as SDK from "azure-devops-extension-sdk";
import {
    getClient,
    CommonServiceIds/*, IHostPageLayoutService*/,
    IProjectPageService,
    ILocationService
} from "@tucrail/azure-devops-extension-api/Common";
import {ZeroData} from "azure-devops-ui/ZeroData";
import {Dropdown} from "azure-devops-ui/Dropdown";
import {IListBoxItem} from "azure-devops-ui/ListBox";
import {DropdownMultiSelection} from "azure-devops-ui/Utilities/DropdownSelection";
import {
    getBranchesToFetch,
    getSelectionString,
    getTagsToFetch,
    restoreSelection,
    stringsToItems
} from "./Utils";
import {
    IProps,
    WidgetConfigurationSettings,
    WidgetState
} from "./State";
import {BuildWithTimeline} from "./Models/BuildWithTimeline";
import {BuildResultRow} from "./Components/BuildResultRow";
import {showRootComponent} from "./Common";

export class Widget extends React.Component<IProps, WidgetState> implements IConfigurableWidget {

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
        return this.handleSettings(widgetSettings, false);
    }

    //@ts-ignore
    async reload(
        widgetSettings: WidgetSettings
    ): Promise<WidgetStatus | undefined> {
        return this.handleSettings(widgetSettings, true);
    }

    private async handleSettings(widgetSettings: WidgetSettings, isReload: boolean): Promise<WidgetStatus> {
        try {
            console.info(`${isReload ? "Reloading" : "Loading"} widget data`)
            const settingsData = widgetSettings.customSettings.data;

            if(!settingsData)
            {
                if (!isReload) {
                    console.warn("Widget settings are not configured. Please configure the widget");
                }
                this.setState(null);
            }
            else {
                const settings = JSON.parse(settingsData) as WidgetConfigurationSettings
                await this.initializeState(WidgetState.fromWidgetConfigurationSettings(settings,
                    widgetSettings.customSettings.version));
                if (!isReload) {
                    await this.fillTagsDropDown();
                }
            }
            return WidgetStatusHelper.Success();
        } catch (e) {
            console.error(`Failed ${isReload ? "reloading" : "loading"} the widget data`)
            console.error(e)
            if (isReload) {
                return WidgetStatusHelper.Failure((e as any).toString());
            }
            return WidgetStatusHelper.Success();
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

        console.info(`Initializing widget state for build definition ${settings.selectedBuildDefinitionId} on project ${this.projectId}`);

        const buildClient = getClient<BuildRestClient>(BuildRestClient);
        const branches = getBranchesToFetch(settings.selectedBranches);
        const tagsToFetch = getTagsToFetch(settings.selectedTag);

        let buildPages = await this.fetchBuilds(buildClient, settings, branches, tagsToFetch);

        buildPages = buildPages.filter((value, index, self) => self.indexOf(value) === index)
            .sort((a, b) => b.id - a.id);

        const buildsToFetchTimelinesFor = buildPages.slice(0, settings.buildCount);
        console.info(`Found ${buildPages.length} builds matching criteria`);

        this.builds = await this.fetchTimelinesForBuilds(buildClient, buildsToFetchTimelinesFor);
        this.setState(settings);
    }

    private async fetchBuilds(buildClient: BuildRestClient, settings: WidgetState, branches: (string | undefined)[], tagsToFetch: (string | undefined)[]): Promise<Build[]> {
        let buildPages: Build[] = [];
        for (const branch of branches) {
            if (settings.matchAnyTagSelected && settings.selectedTag !== 'all') {
                for (const tag of tagsToFetch) {
                    const builds = await this.getBuilds(buildClient, settings.selectedBuildDefinitionId, tag ? [tag] : undefined, branch, settings.buildCount as number);
                    buildPages = buildPages.concat(builds);
                }
            } else {
                const builds = await this.getBuilds(buildClient, settings.selectedBuildDefinitionId, tagsToFetch[0] === undefined ? undefined : tagsToFetch as string[], branch, settings.buildCount as number);
                buildPages = buildPages.concat(builds);
            }
        }
        return buildPages;
    }

    private async fetchTimelinesForBuilds(buildClient: BuildRestClient, builds: Build[]): Promise<BuildWithTimeline[]> {
        const tempBuilds: BuildWithTimeline[] = [];
        for (let build of builds) {
            const timeline = await buildClient.getBuildTimeline(this.projectId, build.id);
            const newBuild = new BuildWithTimeline(build, timeline);
            newBuild.timeline.records = newBuild.timeline.records
                .filter(this.filterTimelineByStage)
                .sort((a, b) => a.order - b.order);
            tempBuilds.push(newBuild);
        }
        return tempBuilds;
    }

    //#endregion

    //#region helpers

    private async getBuilds(buildClient: BuildRestClient, definitionId: number, tags: string[] | undefined, branch: string | undefined, buildCount: number): Promise<Build[]> {
        return await buildClient.getBuilds(this.projectId, [definitionId], undefined,
            undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            tags, undefined, buildCount, undefined,
            undefined, undefined, BuildQueryOrder.StartTimeDescending, branch,
            undefined, undefined, undefined);
    }

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

        console.info(`Starting to populate the tag dropdown. ${tags.length} tags to add`);
        this.tagItems = stringsToItems(tags);

        if (!restoreSelection(this.tagDropdownMultiSelection, this.tagItems, this.state.selectedTag)) {
            this.setState({
                selectedTag: "all"
            });
        } else {
            this.setState({
                selectedTag: this.state.selectedTag
            })
        }
    }

    //#endregion

    //#region Event handlers

    private onTagDropdownChange = (_event: React.SyntheticEvent<HTMLElement>, _selectedDropdown: IListBoxItem) => {
        this.setState({
            selectedTag: getSelectionString(this.tagDropdownMultiSelection, this.tagItems)
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
            <div id="widget-container" className={"widget"}>

                <h2 className="title">
                    <div className="inner-title">{this.state.selectedDefinitionName ?? 'No definition found'}</div>
                    <div className="subtitle">
                        {this.state.selectedBranches === "all"
                            ? "All branches"
                            : this.state.selectedBranches === "none" || this.state.selectedBranches === ""
                                ? "No branches selected"
                                : this.state.selectedBranches.split(",").map(b => b.replace("refs/heads/", "")).join(", ")}
                    </div>
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
                                  placeholder={this.state?.selectedTag === "" ? "Select a tag" : this.state?.selectedTag ?? "all"}
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

showRootComponent(<Widget></Widget>);

