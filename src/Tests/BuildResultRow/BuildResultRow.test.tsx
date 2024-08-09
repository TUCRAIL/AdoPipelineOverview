import {render, screen} from "@testing-library/react";
import React from "react";
import {BuildResultRow} from "../../Components/BuildResultRow";
import {BuildWithTimeline} from "../../Models/BuildWithTimeline";
import {getClient} from "azure-devops-extension-api/Common";
import {BuildRestClient} from "azure-devops-extension-api/Build";
import {mockGetTags} from "../../__mocks__/azure-devops-extension-api/Build";

jest.mock('../../Common');

describe('BuildResultRow', () => {
    test('BuildResultRow - Render - no stages', async () => {
        const buildClient = getClient<BuildRestClient>(BuildRestClient);
        const build = await buildClient.getBuild("buildClient", -1);
        const timeline = await buildClient.getBuildTimeline("buildClient", -1);
        const buildWithTimeline = new BuildWithTimeline(build, timeline);
        render(<table>
            <tbody>
            <BuildResultRow showStages={false} build={buildWithTimeline} buildIndex={0}></BuildResultRow>
            </tbody>
        </table>)
        const rowsWithoutStages = screen.queryAllByTestId("row-without-stage");
        const rowsWithStages = screen.queryAllByTestId("row-with-stage");
        expect(rowsWithoutStages.length).toBeGreaterThan(0);
        expect(rowsWithStages.length).toEqual(0);
    });

    test('BuildResultRow - Render - with stages', async () => {
        const buildClient = getClient<BuildRestClient>(BuildRestClient);
        const build = await buildClient.getBuild("buildClient", -1);
        const timeline = await buildClient.getBuildTimeline("buildClient", -1);
        const buildWithTimeline = new BuildWithTimeline(build, timeline);
        render(<table>
            <tbody>
            <BuildResultRow showStages={true} build={buildWithTimeline} buildIndex={0}></BuildResultRow>
            </tbody>
        </table>)
        const rowsWithStages = screen.queryAllByTestId("row-with-stage");
        const rowsWithoutStages = screen.queryAllByTestId("row-without-stage");
        expect(rowsWithStages.length).toBeGreaterThan(0);
        expect(rowsWithoutStages.length).toEqual(0);
    });
});

