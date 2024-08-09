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

});