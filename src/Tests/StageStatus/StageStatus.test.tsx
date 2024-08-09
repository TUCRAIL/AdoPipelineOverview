import {render, screen} from "@testing-library/react";
import {StageStatus} from "../../Components/StageStatus";
import React from "react";

jest.mock('../../Common');

describe('StageStatus', () => {
    test('StageStatus - Render', () => {
        render(<StageStatus multiStage={false} failed={true}/>)
        const badges = screen.getAllByRole("presentation")
        expect(badges).toBeDefined();
    });
});

