import "azure-devops-ui/Core/override.css";
import * as API from "azure-devops-extension-api";
import {CommonServiceIds, IProjectPageService} from "azure-devops-extension-api";
import * as Dashboard from "azure-devops-extension-api/Dashboard";
import React, {ReactElement} from "react";
import { createRoot } from 'react-dom/client';
import {IProps, WidgetConfigurationSettings} from "./configuration";
import {
    Build, BuildQueryOrder,
    BuildRestClient,
    BuildResult,
    TaskResult,
    Timeline,
    TimelineRecord,
    TimelineRecordState
} from "azure-devops-extension-api/Build";
import {Status, Statuses, StatusSize} from "azure-devops-ui/Status";
import SDK = require("azure-devops-extension-sdk");
import {ZeroData} from "azure-devops-ui/ZeroData";
import {Dropdown} from "azure-devops-ui/Dropdown";
import {IListBoxItem} from "azure-devops-ui/ListBox";


class BuildWithTimeline {
    public build: Build
    public timeline: Timeline

    constructor(build: Build, timeline: Timeline) {
        this.build = build
        this.timeline = timeline
    }

}

class Widget extends React.Component<IProps, WidgetConfigurationSettings> implements Dashboard.IConfigurableWidget {


    private builds: BuildWithTimeline[] = []
    private projectId : string = ""
    private neutralStageResult : TaskResult[] = [
        TaskResult.Abandoned,
        TaskResult.Canceled,
        TaskResult.Skipped
    ]

    private tagItems : IListBoxItem[] = [];


    componentDidMount() {
        SDK.init().then(() => {
            SDK.register("DeploymentsWidget", this);
        });
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
     * Get the class to apply to the stage underline based on the task result
     * @param stageStatus The current status of the stage
     * @param failed If the stage failed
     * @param stageResult The result of the stage
     * @private
     */
    private getStageUnderlineClass(stageStatus: TimelineRecordState, failed: boolean,stageResult?: TaskResult) : string {
        if(stageResult !== undefined)
        {
            if(stageResult === TaskResult.Failed)
            {
                return 'stage-failed'
            }
            if(this.neutralStageResult.find(result => result === stageResult) !== undefined)
            {
                return 'stage-neutral'
            }
            if(stageResult === TaskResult.Succeeded)
            {
                return 'stage-success'
            }
            if(stageResult === TaskResult.SucceededWithIssues)
            {
                return 'stage-warning'
            }
        }

        if(failed)
        {
            return 'stage-failed'
        }
        if(stageStatus === TimelineRecordState.Completed)
        {
            return "stage-success"
        }
        else if(stageStatus === TimelineRecordState.Pending)
        {
            return "stage-neutral"
        }
        else
        {
            return "stage-active"
        }
    }

    /**
     * Converts a build result into a task result
     * @param buildResult The build result to convert
     * @private
     */
    private getTaskResultFromBuildResult(buildResult: BuildResult) : TaskResult {
        switch (buildResult) {
            case BuildResult.Succeeded: return TaskResult.Succeeded;
            case BuildResult.Failed: return TaskResult.Failed;
            case BuildResult.Canceled: return TaskResult.Canceled;
            case BuildResult.PartiallySucceeded: return TaskResult.SucceededWithIssues;
            case BuildResult.None: return TaskResult.Abandoned;
            default: return TaskResult.Failed;
        }
    }

    private onTagDropdownChange = (_event: React.SyntheticEvent<HTMLElement>, selectedDropdown: IListBoxItem) => {

        this.setState( {
            defaultTag:  selectedDropdown.text === undefined ? "all" : selectedDropdown.text
        }, () => {
            this.setStateFromWidgetSettings(this.state).then();
        });
    }

    /**
     * Fills up all known tags applied to builds in the current Azure DevOps project
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
                    <div className="inner-title">{this.state.definitionName ?? 'No definition found'}</div>
                    <div className="subtitle">{this.state.buildBranch ?? 'No branch found'}</div>
                </h2>

                <div className="content">
                    <div>
                        <label className="label">Filter by tag: </label>
                        <Dropdown items={this.tagItems}
                                  noItemsText={"No tag was found"}
                                  placeholder={this.state.defaultTag === "" ? "Select a tag" : this.state.defaultTag}
                                  onSelect={this.onTagDropdownChange}
                                  disabled={this.tagItems.length === 0}>

                        </Dropdown>
                    </div>
                    <div id="build-container">
                        <div>
                            <table>
                                <tbody>
                                {this.builds.map((buildWithTimeline, index) => {
                                    if (this.state.showStages) {
                                        return (<tr key={index}>
                                            <td>
                                                <a href={buildWithTimeline.build._links.web.href} target={"_blank"}>
                                                    {buildWithTimeline.build.buildNumber}
                                                </a>
                                            </td>
                                            {buildWithTimeline.timeline.records.map((record, indexTimeline) => {
                                                if (typeof record === undefined) {
                                                    return (<td key={`${index}/${indexTimeline}`} colSpan={99}>
                                                        <p> There was an error preventing the pipeline to run (invalid
                                                            YAML, service connection not existing ...)</p>
                                                    </td>)
                                                } else {
                                                    return (<td key={`${index}/${indexTimeline}`} className={"row"}>
                                                        <div
                                                            className={`stage ${this.getStageUnderlineClass(record.state, record.errorCount >= record.attempt, record.result)}`}>

                                                            <StageStatus taskResult={record.result}
                                                                         failed={record.errorCount >= record.attempt}
                                                                         stageStatus={record.state === null ? undefined : record.state}
                                                                         multiStage={buildWithTimeline.timeline.records.length > 1}
                                                                         startTime={record.startTime === undefined ? undefined : record.startTime}
                                                                         previousStatus={(indexTimeline > 0 && buildWithTimeline.timeline.records.length > 1 && buildWithTimeline.timeline.records[indexTimeline - 1].state !== undefined) ? buildWithTimeline.timeline.records[indexTimeline - 1].state : undefined}></StageStatus>
                                                            {record.name}
                                                        </div>
                                                    </td>)
                                                }
                                            })}
                                        </tr>)
                                    } else {
                                        return (<tr key={index}>
                                                <td>
                                                    <a href={buildWithTimeline.build._links.web.href} target={"_blank"}>
                                                        {buildWithTimeline.build.buildNumber}
                                                    </a>
                                                </td>
                                                <td>
                                                    <StageStatus
                                                        taskResult={this.getTaskResultFromBuildResult(buildWithTimeline.build.result)}
                                                        failed={buildWithTimeline.build.result === BuildResult.Failed}
                                                        multiStage={buildWithTimeline.timeline.records.length > 1}
                                                    ></StageStatus>
                                                </td>
                                            </tr>
                                        )
                                    }
                                })}
                                </tbody>

                            </table>

                        </div>
                    </div>
                </div>

            </div>


        );
    }

    /**
     * Takes the widget settings and configure the state of the component
     * @param widgetSettings The custom settings from the widget settings
     * @private
     */
    private async setStateFromWidgetSettings(widgetSettings: WidgetConfigurationSettings) {
        const settings = widgetSettings;

        const buildClient = API.getClient<BuildRestClient>(BuildRestClient);
        let buildPages = await buildClient.getBuilds(this.projectId, [settings.buildDefinition], undefined,
            undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            settings.defaultTag === 'all' ? undefined : [settings.defaultTag], undefined, settings.buildCount, undefined,
            undefined, undefined, BuildQueryOrder.StartTimeDescending, settings.buildBranch === 'all' ? undefined : `refs/heads/${settings.buildBranch}`,
            undefined, undefined, undefined);
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

    async preload(_widgetSettings: Dashboard.WidgetSettings) {
        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService)
        const projectInfo = await projectService.getProject();
        this.projectId = projectInfo?.id ?? "";
        return Dashboard.WidgetStatusHelper.Success();
    }

    async load(
        widgetSettings: Dashboard.WidgetSettings
    ): Promise<Dashboard.WidgetStatus> {
        try {
            console.debug("Loading widget data")
            const settings = JSON.parse(widgetSettings.customSettings.data) as WidgetConfigurationSettings
            await this.setStateFromWidgetSettings(settings);
            await this.fillTagsDropDown();
            return Dashboard.WidgetStatusHelper.Success();
        } catch (e) {
            return Dashboard.WidgetStatusHelper.Success();
            //return Dashboard.WidgetStatusHelper.Failure((e as any).toString());
        }
    }

    //@ts-ignore
    async reload(
        widgetSettings: Dashboard.WidgetSettings
    ): Promise<Dashboard.WidgetStatus | undefined> {
        try {
            console.debug("Reloading widget data")
            console.debug(JSON.stringify(widgetSettings.customSettings.data))
            const settings = JSON.parse(widgetSettings.customSettings.data) as WidgetConfigurationSettings

            await this.setStateFromWidgetSettings(settings);
            return Dashboard.WidgetStatusHelper.Success();
        } catch (e) {
            console.error("Failed reloading the widget data")
            return Dashboard.WidgetStatusHelper.Failure((e as any).toString());
        }
    }
}

interface IStageStatusProps {
    stageStatus?: TimelineRecordState
    previousStatus?: TimelineRecordState
    multiStage: boolean
    startTime?: Date
    failed: boolean
    taskResult?: TaskResult
}

interface IStageStatusState {
    stageStatus?: TimelineRecordState
    previousStatus?: TimelineRecordState
    multiStage: boolean
    startTime?: Date
    failed: boolean
    taskResult?: TaskResult
}

class StageStatus extends React.Component<IStageStatusProps, IStageStatusState> {
    constructor(props: IStageStatusProps) {
        super(props);
        this.state = {
            stageStatus: props.stageStatus,
            previousStatus: props?.previousStatus,
            multiStage: props.multiStage,
            startTime: props?.startTime,
            failed: props.failed,
            taskResult: props.taskResult

        };
    }

    renderBadge() : ReactElement<any, any> {

        if(this.state.taskResult === null)
        {
        if(this.state.stageStatus === TimelineRecordState.Pending){
            if((this.state.previousStatus === null && this.state.multiStage) || (this.state.previousStatus !== null && this.state.previousStatus !== TimelineRecordState.Completed))
            {
                return(
                    <Status size={StatusSize.m} {...Statuses.Queued} ></Status>
                );
            }
            return(
                <Status size={StatusSize.m} {...Statuses.Waiting} ></Status>)
        }
        else {
            if(this.state.startTime === null || this.state.startTime === undefined || typeof this.state.startTime === undefined)
            {
                return(<Status size={StatusSize.m}  {...Statuses.Waiting}></Status>);
            }
            if((Date.parse(this.state.startTime.toString()) || 0) !== 0)
            {
                return(<Status size={StatusSize.m}  {...Statuses.Running}></Status>)
            }
            return(
                <Status size={StatusSize.m} {...Statuses.Waiting} ></Status>)
        }
        }

        if(this.state.taskResult === TaskResult.Failed)
        {
            return(
                <Status size={StatusSize.m} {...Statuses.Failed} ></Status>
            )
        }
        if(this.state.taskResult === TaskResult.Succeeded)
        {
            return(
            <Status size={StatusSize.m} {...Statuses.Success} ></Status>);
        }
        if(this.state.taskResult === TaskResult.SucceededWithIssues) {
            return(
                <Status size={StatusSize.m} {...Statuses.Warning} ></Status>);
        }
        if(this.state.taskResult === TaskResult.Abandoned)
        {
            return(
                <Status size={StatusSize.m} {...Statuses.Canceled} ></Status>);
        }
        if(this.state.taskResult === TaskResult.Canceled) {
            return(
                <Status size={StatusSize.m} {...Statuses.Canceled} ></Status>);
        }
        else {
            return(
                <Status size={StatusSize.m} {...Statuses.Skipped} ></Status>);
        }

    }

    render() : JSX.Element {
        return this.renderBadge();
    }
}

const rootContainer = document.getElementById("root");

const root = createRoot(rootContainer);

root.render(<Widget/>);




