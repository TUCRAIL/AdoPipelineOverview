import {render, screen} from "@testing-library/react";
import React from "react";
import {BuildResultRow} from "../../Components/BuildResultRow";
import {BuildWithTimeline} from "../../Models/BuildWithTimeline";
import {getClient} from "azure-devops-extension-api/Common";
import {BuildRestClient, BuildResult} from "azure-devops-extension-api/Build";
import {createBuild, mockGetBuild, mockGetTags} from "../../__mocks__/azure-devops-extension-api/Build";

jest.mock('../../Common');

describe('BuildResultRow', () => {
    test('BuildResultRow - Render - No stages', async () => {
        const buildClient = getClient<BuildRestClient>(BuildRestClient);
        const build = await buildClient.getBuild("buildClient", -1);
        const timeline = await buildClient.getBuildTimeline("buildClient", -1);
        const buildWithTimeline = new BuildWithTimeline(build, timeline);
        render(<table>
            <tbody>
            <BuildResultRow showStages={false} build={buildWithTimeline}
                            buildIndex={0}></BuildResultRow>
            </tbody>
        </table>)
        const renderedCells = screen.getAllByTestId("result-cell");
        expect(renderedCells.length).toEqual(1);
    });

    test('BuildResultRow - Render - With stages', async () => {
        const buildClient = getClient<BuildRestClient>(BuildRestClient);
        const build = await buildClient.getBuild("buildClient", -1);
        const timeline = await buildClient.getBuildTimeline("buildClient", -1);
        const buildWithTimeline = new BuildWithTimeline(build, timeline);
        render(<table>
            <tbody>
            <BuildResultRow showStages={true} build={buildWithTimeline}
                            buildIndex={0}></BuildResultRow>
            </tbody>
        </table>)
        const renderedCells = screen.queryAllByTestId("result-cell");
        expect(renderedCells.length).toBeGreaterThan(1);
    });

    it.each([
        BuildResult.Succeeded,
        BuildResult.Failed,
        BuildResult.Canceled,
        BuildResult.PartiallySucceeded,
        BuildResult.None,
        10 // Fake value that shouldn't exist and should hit the default "TaskResult.Failed"
    ])("Create a widget row for a build with '%s' as a result", async (buildResult) => {
        const buildClient = getClient<BuildRestClient>(BuildRestClient);
        mockGetBuild.mockReturnValue(createBuild(buildResult));
        const build = await buildClient.getBuild("buildClient", -1);
        const timeline = await buildClient.getBuildTimeline("buildClient", -1);
        const buildWithTimeline = new BuildWithTimeline(build, timeline);
        render(<table>
            <tbody>
            <BuildResultRow showStages={false} build={buildWithTimeline}
                            buildIndex={0}></BuildResultRow>
            </tbody>
        </table>)
        const renderedCells = screen.getAllByTestId("result-cell");
        expect(renderedCells.length).toEqual(1);
    });
});

