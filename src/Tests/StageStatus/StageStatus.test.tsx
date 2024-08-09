import {render, screen} from "@testing-library/react";
import {StageStatus} from "../../Components/StageStatus";
import React from "react";
import {TaskResult, TimelineRecordState} from "azure-devops-extension-api/Build";

jest.mock('../../Common');

describe('StageStatus', () => {
    test('StageStatus - Render', () => {
        render(<StageStatus multiStage={false} failed={true}/>)
        const badges = screen.getAllByRole("presentation")
        expect(badges).toBeDefined();
    });

    test('StageStatus - taskResult is null or undefined', () => {
        render(<StageStatus multiStage={false} failed={false} taskResult={undefined}/>)
        const badges = screen.getAllByRole("presentation")
        expect(badges).toBeDefined();
    });

    test('StageStatus - stageStatus is pending', () => {
        render(<StageStatus multiStage={false} failed={false} taskResult={undefined}
        stageStatus={TimelineRecordState.Pending}/>)
        const badges = screen.getAllByRole("presentation")
        expect(badges).toBeDefined();
    });

    test('StageStatus - stageStatus is pending with the previous stage completed', () => {
        render(<StageStatus multiStage={true} failed={false} taskResult={undefined}
                            stageStatus={TimelineRecordState.Pending}
                            previousStatus={TimelineRecordState.Completed}
                            />)
        const badges = screen.getAllByRole("presentation")
        expect(badges).toBeDefined();
    });

    test('StageStatus - taskResult is null or undefined with startTime', () => {
        render(<StageStatus multiStage={false} failed={false} taskResult={undefined}
        startTime={new Date(Date.now())}/>)
        const badges = screen.getAllByRole("presentation")
        expect(badges).toBeDefined();
    });

    test('StageStatus - taskResult is null or undefined with startTime at 0', () => {
        render(<StageStatus multiStage={false} failed={false} taskResult={undefined}
                            startTime={new Date(0)}/>)
        const badges = screen.getAllByRole("presentation")
        expect(badges).toBeDefined();
    });

    it.each([
        TaskResult.Abandoned,
        TaskResult.Failed,
        TaskResult.Succeeded,
        TaskResult.SucceededWithIssues,
        TaskResult.Skipped,
        TaskResult.Canceled
    ])("Stage Status - Can render badge for task result %s", (taskResult) => {
        render(<StageStatus multiStage={false} failed={false} taskResult={taskResult}/>)
        const badges = screen.getAllByRole("presentation")
        expect(badges).toBeDefined();
    });
});


