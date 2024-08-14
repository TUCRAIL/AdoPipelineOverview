import React, {ReactElement} from "react";
import {IStageResultCellProps, StageResultCellState} from "../State";
import {TaskResult, TimelineRecordState} from "@tucrail/azure-devops-extension-api/Build";
import {StageStatus} from "./StageStatus";

export class StageResultCell extends React.Component<IStageResultCellProps, StageResultCellState> {


    private neutralStageResult: TaskResult[] = [
        TaskResult.Abandoned,
        TaskResult.Canceled,
        TaskResult.Skipped
    ]

    constructor(props: IStageResultCellProps) {
        super(props);
        this.state = StageResultCellState.createStateFromProperties(props);
    }

    /**
     * Get the class to apply to the stage underline based on the task result
     * @param stageStatus The current status of the stage
     * @param failed If the stage failed
     * @param stageResult The result of the stage
     * @private
     */
    private getStageUnderlineClass(stageStatus: TimelineRecordState, failed: boolean, stageResult?: TaskResult): string {
        if (stageResult !== undefined) {
            if (stageResult === TaskResult.Failed) {
                return 'stage-failed'
            }
            if (this.neutralStageResult.find(result => result === stageResult) !== undefined) {
                return 'stage-neutral'
            }
            if (stageResult === TaskResult.Succeeded) {
                return 'stage-success'
            }
            if (stageResult === TaskResult.SucceededWithIssues) {
                return 'stage-warning'
            }
        }

        if (failed) {
            return 'stage-failed'
        }
        if (stageStatus === TimelineRecordState.Completed) {
            return "stage-success"
        } else if (stageStatus === TimelineRecordState.Pending) {
            return "stage-neutral"
        } else {
            return "stage-active"
        }
    }

    renderValidCell(): ReactElement<any, any> {
        if(this.state.timelineRecord === undefined)
        {
            return this.renderInvalidBuild();
        }
        const underlineClassName = `${this.getStageUnderlineClass(this.state.timelineRecord.state, 
            this.state.timelineRecord.errorCount >= 
            this.state.timelineRecord.attempt, 
            this.state.timelineRecord.result)}`
        return (
            <td data-testid="result-cell" className={"row"}>
                <div
                    data-testid={underlineClassName}
                    className={`stage ${underlineClassName}`}>

                    <StageStatus
                                 taskResult={this.state.timelineRecord.result}
                                 failed={this.state.timelineRecord.errorCount >= this.state.timelineRecord.attempt}
                                 stageStatus={this.state.timelineRecord.state === null ? undefined : this.state.timelineRecord.state}
                                 multiStage={this.state.isMultiStage}
                                 startTime={this.state.timelineRecord.startTime === undefined ? undefined : this.state.timelineRecord.startTime}
                                 previousStatus={this.state.previousTimelineRecordState}>$
                    </StageStatus>
                    {this.state.timelineRecord.name}
                </div>
            </td>
        )
    }

    renderInvalidBuild(): ReactElement<any, any> {
        return (
            <td data-testid="result-cell" colSpan={99}>
                <p>There was an error preventing the pipeline to run (invalid
                    YAML, service connection not existing ...)</p>
            </td>
        );
    }

    render() {
        if(!this.state.timelineRecord) {
            return this.renderInvalidBuild();
        }
        else {
            return this.renderValidCell();
        }
    }
}