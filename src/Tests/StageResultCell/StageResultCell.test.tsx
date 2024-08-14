import {
    fireEvent,
    render,
    screen,
    waitFor,
    waitForElementToBeRemoved
} from '@testing-library/react';
import {StageResultCell} from "../../Components/StageResultCell";
import React from "react";
import {StageStatus} from "../../Components/StageStatus";
import {BuildRestClient, TaskResult, TimelineRecordState} from "@tucrail/azure-devops-extension-api/Build";
import {getClient} from "@tucrail/azure-devops-extension-api/Common";
import {
    createRecordsForTimeline,
    createTimelineRecord,
    mockGetTimeline
} from "../../__mocks__/@tucrail/azure-devops-extension-api/Build";

jest.mock('../../Common');

describe('StageResultCell', () => {
    test('StageResultCell - Render', () => {
        render(
            <table>
                <tbody>
                <tr>
                    <StageResultCell buildIndex={0}
                                     isMultiStage={false}
                                     previousTimelineRecordState={undefined}
                                     timelineIndex={0}
                                     timelineRecord={undefined}/>
                </tr>
                </tbody>

            </table>);
        const textElement = screen.getByText("There was an error preventing the pipeline to run", { selector: 'p', exact: false });
        expect(textElement).toBeDefined();
    });

    it.each([
        [undefined, "stage-success"],
        [TaskResult.Failed, "stage-failed"],
        [TaskResult.Succeeded, "stage-success"],
        [TaskResult.SucceededWithIssues, "stage-warning"],
        [TaskResult.Abandoned, "stage-neutral"],
        [TaskResult.Canceled, "stage-neutral"],
        [TaskResult.Skipped, "stage-neutral"]
    ])("StageResultCell - Get the stage underline class for stage result %s expecting %s as a result",
        async (stageResult, className) => {
        const buildClient = getClient<BuildRestClient>(BuildRestClient);
        const recordToRetrieve = createTimelineRecord('1', stageResult, TimelineRecordState.Completed);
        mockGetTimeline.mockReturnValue(
            createRecordsForTimeline([recordToRetrieve]));
        const timeline = await buildClient.getBuildTimeline("buildClient", -1);
        render(
            <table>
                <tbody>
                <tr>
                    <StageResultCell buildIndex={0}
                                     isMultiStage={false}
                                     previousTimelineRecordState={undefined}
                                     timelineIndex={0}
                                     timelineRecord={timeline.records[0]}/>
                </tr>
                </tbody>

            </table>);
        const foundMatchingElements = screen.queryAllByTestId(className);
        expect(foundMatchingElements.length).toBeGreaterThan(0);
    });

    it.each([
        [TimelineRecordState.Completed, 'stage-success'],
        [TimelineRecordState.Pending, 'stage-neutral'],
        [TimelineRecordState.InProgress, 'stage-active']
    ])("StageResultCell - Get the stge underline class for stage status %s expecting %s as a result",
        async (stageStatus, className) => {
            const buildClient = getClient<BuildRestClient>(BuildRestClient);
            const recordToRetrieve = createTimelineRecord('1', undefined, stageStatus);
            mockGetTimeline.mockReturnValue(
                createRecordsForTimeline([recordToRetrieve]));
            const timeline = await buildClient.getBuildTimeline("buildClient", -1);
            render(
                <table>
                    <tbody>
                    <tr>
                        <StageResultCell buildIndex={0}
                                         isMultiStage={false}
                                         previousTimelineRecordState={undefined}
                                         timelineIndex={0}
                                         timelineRecord={timeline.records[0]}/>
                    </tr>
                    </tbody>

                </table>);
            const foundMatchingElements = screen.queryAllByTestId(className);
            expect(foundMatchingElements.length).toBeGreaterThan(0);
        });

    test("StageResultCell - Get the stage underline class when the stage has failed", async () => {
        const buildClient = getClient<BuildRestClient>(BuildRestClient);
        const recordToRetrieve = createTimelineRecord('1', undefined,
            undefined, 10);
        mockGetTimeline.mockReturnValue(
            createRecordsForTimeline([recordToRetrieve]));
        const timeline = await buildClient.getBuildTimeline("buildClient", -1);
        render(
            <table>
                <tbody>
                <tr>
                    <StageResultCell buildIndex={0}
                                     isMultiStage={false}
                                     previousTimelineRecordState={undefined}
                                     timelineIndex={0}
                                     timelineRecord={timeline.records[0]}/>
                </tr>
                </tbody>

            </table>);
        const foundMatchingElements = screen.queryAllByTestId("stage-failed");
        expect(foundMatchingElements.length).toBeGreaterThan(0);
    });

});