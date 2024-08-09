//#region Status Badge component

import {IStageStatusProps, IStageStatusState} from "../State";
import {ReactElement} from "react";
import {TaskResult, TimelineRecordState} from "azure-devops-extension-api/Build";
import {Status, Statuses, StatusSize} from "azure-devops-ui/Status";
import React from "react";

export class StageStatus extends React.Component<IStageStatusProps, IStageStatusState> {
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

    renderBadge(): ReactElement<any, any> {

        if (this.state.taskResult === null) {
            if (this.state.stageStatus === TimelineRecordState.Pending) {
                if ((this.state.previousStatus === null && this.state.multiStage) || (this.state.previousStatus !== null && this.state.previousStatus !== TimelineRecordState.Completed)) {
                    return (
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

    render() {
        return this.renderBadge();
    }
}

//#endregion