import "azure-devops-ui/Core/override.css";
// import * as SDK from "azure-devops-extension-sdk";
import * as API from "azure-devops-extension-api";
import {CommonServiceIds, IProjectPageService} from "azure-devops-extension-api";
import * as Dashboard from "azure-devops-extension-api/Dashboard";
import React, {ReactElement} from "react";
import * as ReactDOM from "react-dom";
import {IProps, WidgetConfigurationSettings} from "./configuration";
import {Build, BuildRestClient, Timeline, TimelineRecord, TimelineRecordState} from "azure-devops-extension-api/Build";
import {Status, Statuses, StatusSize} from "azure-devops-ui/Status";
import SDK = require("azure-devops-extension-sdk");


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

    componentDidMount() {
        SDK.init().then(() => {
            SDK.register("DeploymentsWidget", this);
        });
    }

    private filterTimelineByStage(item : TimelineRecord) : boolean {
        if(item.type === "Stage")
        {
            return true;
        }
        return false;
    }

    private getStageUnderlineClass(stageStatus: TimelineRecordState, failed: boolean) : string {
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



    render(): JSX.Element {
        return (

                <div>
                   <table>
                       <tbody>
                       {this.builds.map((buildWithTimeline, index) => {
                           return( <tr key={index}>
                               <td>
                                   <a href={buildWithTimeline.build._links.web.href} target={"_blank"}>
                                       {buildWithTimeline.build.buildNumber}
                                   </a>
                               </td>
                               {buildWithTimeline.timeline.records.map((record, indexTimeline) => {
                                   if(typeof record === undefined)
                                   {
                                       return(<td key={`${index}/${indexTimeline}`} colSpan={99}>
                                           <p> There was an error preventing the pipeline to run (invalid YAML, service connection not existing ...)</p>
                                       </td>)
                                   }
                                   else {
                                       return(<td key={`${index}/${indexTimeline}`} className={"row"}>
                                           <div className={`stage ${this.getStageUnderlineClass(record.state, record.errorCount >= record.attempt)}`}>
                                               {/*<template>*/}

                                                   <StageStatus failed={record.errorCount >= record.attempt} stageStatus={record.state === undefined ? undefined : record.state} multiStage={buildWithTimeline.timeline.records.length > 1} startTime={record.startTime} previousStatus={index > 0 && buildWithTimeline.timeline.records.length > 1 && buildWithTimeline.timeline.records[indexTimeline - 1].state !== undefined ? buildWithTimeline.timeline.records[indexTimeline - 1].state : undefined}></StageStatus>
                                               {record.name}
                                               {/*</template>*/}
                                           </div>
                                       </td>)
                                   }
                               })}
                           </tr>)
                       })}
                       </tbody>

                   </table>

                </div>

        );
    }

    private async setStateFromWidgetSettings(widgetSettings: Dashboard.WidgetSettings) {
        const settings = JSON.parse(widgetSettings.customSettings.data) as WidgetConfigurationSettings;

        const buildClient = API.getClient<BuildRestClient>(BuildRestClient);
        let buildPages = await buildClient.getBuilds(this.projectId, [settings.buildDefinition], undefined,
            undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            settings.defaultTag === 'all' ? undefined : [settings.defaultTag], undefined, undefined, undefined,
            undefined, undefined, undefined, undefined/*settings.buildBranch === 'all' ? undefined : [`refs/heads/${settings.buildBranch}`]*/,
            undefined, undefined, undefined);
        buildPages = buildPages.sort(function(a, b) {
            return b.id - a.id;
        });

        let builds : Build[] = [];

        console.log(`build length: ${buildPages.length}`)

        if(builds.length > settings.buildCount)
        {
            builds = buildPages.slice(0, settings.buildCount);
        }

        else {
            builds = buildPages.map(buildPage => buildPage);
        }

        console.log(`build length: ${builds.length}`)

        for (let build of builds) {
            const timeline = await buildClient.getBuildTimeline(this.projectId, build.id);
            const newBuild = new BuildWithTimeline(build, timeline);
            newBuild.timeline.records = newBuild.timeline.records.filter(this.filterTimelineByStage).sort(function(a,b) {
                return a.order - b.order;
            });
            this.builds.push(newBuild);
            console.log(this.builds[0].timeline.records.length)
        }

        this.setState(settings);
    }

    async preload(_widgetSettings: Dashboard.WidgetSettings) {
        var projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService)
        const projectInfo = await projectService.getProject();
        this.projectId = projectInfo?.id ?? "";
        return Dashboard.WidgetStatusHelper.Success();
    }

    async load(
        widgetSettings: Dashboard.WidgetSettings
    ): Promise<Dashboard.WidgetStatus> {
        try {
            await this.setStateFromWidgetSettings(widgetSettings);
            return Dashboard.WidgetStatusHelper.Success();
        } catch (e) {
            return Dashboard.WidgetStatusHelper.Failure((e as any).toString());
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
}

interface IStageStatusProps {
    stageStatus?: TimelineRecordState
    previousStatus?: TimelineRecordState
    multiStage: boolean
    startTime: Date
    failed: boolean
}

interface IStageStatusState {
    stageStatus?: TimelineRecordState
    previousStatus?: TimelineRecordState
    multiStage: boolean
    startTime: Date
    failed: boolean
}

class StageStatus extends React.Component<IStageStatusProps, IStageStatusState> {
    constructor(props: IStageStatusProps, state: IStageStatusState) {
        console.log(JSON.stringify(props))
        super(props);
        this.state = {
            stageStatus: props.stageStatus,
            previousStatus: props?.previousStatus,
            multiStage: props.multiStage,
            startTime: props.startTime,
            failed: props.failed

        };
    }

    renderBadge() : ReactElement<any, any> {
        console.log(JSON.stringify(this.state))
        if(this.state.failed)
        {
            return(
                <Status size={StatusSize.m} {...Statuses.Failed} ></Status>
            )
        }
        if(this.state.stageStatus === TimelineRecordState.Completed)
        {
            return(
            <Status size={StatusSize.m} {...Statuses.Success} ></Status>);
        }
        else if(this.state.stageStatus === TimelineRecordState.Pending){
            if((this.state.previousStatus === undefined && this.state.multiStage) || (this.state.previousStatus !== undefined && this.state.previousStatus !== TimelineRecordState.Completed))
            {
                return(
                    <Status size={StatusSize.m} {...Statuses.Queued} ></Status>
                );
            }
            return(
            <Status size={StatusSize.m} {...Statuses.Waiting} ></Status>)
        }
        else {
            if(this.state.startTime === undefined || typeof this.state.startTime === undefined)
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

    render() : JSX.Element {
        return this.renderBadge();
    }
}

ReactDOM.render(<Widget/>, document.getElementById("root"));



