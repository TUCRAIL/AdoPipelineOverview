import React, {ReactElement} from "react";
import {BuildResultRowState, IBuildResultRowProps, IStageResultCellProps, StageResultCellState} from "../State";
import {BuildResult, TaskResult, TimelineRecordState} from "azure-devops-extension-api/Build";
import {StageStatus} from "./StageStatus";
import {StageResultCell} from "./StageResultCell";

export class BuildResultRow extends React.Component<IBuildResultRowProps, BuildResultRowState>
{


    constructor(props : IBuildResultRowProps) {
        super(props);
        this.state = BuildResultRowState.createStateFromProperties(props);
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

    renderWithStages() : ReactElement<any, any> {
        return (<tr key={this.state.build.build.buildNumber + this.state.build.build.startTime.toISOString() + "with-stage"}>
            <td>
                <a href={this.state.build.build._links.web.href} target={"_blank"}>
                    {this.state.build.build.buildNumber}
                </a>
            </td>
            {this.state.build.timeline.records.map((record, indexTimeline) => {
                return (
                    <StageResultCell
                        timelineRecord={record} timelineIndex={indexTimeline}
                    buildIndex={this.state.buildIndex} isMultiStage={this.state.build.timeline.records.length > 1}
                    previousTimelineRecordState={BuildResultRowState.getPreviousTimelineRecordStateForIndex(this.state.build.timeline.records,
                    indexTimeline)}/>
                    )
                })
            }
        </tr>);
    }

    renderWithoutStages() : ReactElement<any, any> {
        return (
            <tr key={this.state.build.build.buildNumber + this.state.build.build.startTime.toISOString() + "no-stage"}>
                <td>
                    <a href={this.state.build.build._links.web.href} target={"_blank"}>
                        {this.state.build.build.buildNumber}
                    </a>
                </td>
                <td>
                    <StageStatus
                        taskResult={this.getTaskResultFromBuildResult(this.state.build.build.result)}
                        failed={this.state.build.build.result === BuildResult.Failed}
                        multiStage={this.state.build.timeline.records.length > 1}
                    ></StageStatus>
                </td>
            </tr>
        )
    }

    render() {
        if(this.state.showStages)
        {
            return this.renderWithStages();
        }
        else {
            return this.renderWithoutStages();
        }
    }
}