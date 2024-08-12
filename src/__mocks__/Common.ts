import {ConfigurationWidgetState, WidgetConfigurationSettings, WidgetState} from "../State";
import {
    BuildResult,
    mockGetBuild,
    mockGetBuilds,
    mockGetTags,
    mockGetTimeline, TaskResult, TimelineRecordState
} from "./azure-devops-extension-api/Build";
import {mockGetProject} from "./azure-devops-extension-api/Common";

export function showRootComponent(component: React.ReactElement<any>) {}

export  const filledWidgetConfiguration : WidgetConfigurationSettings = {
    buildBranch: "all",
    buildCount: "5",
    defaultTag: "all",
    buildDefinition: 1,
    definitionName: "definitionName",
    matchAnyTag: true,
    showStages: false
}

export const filledWidgetConfigurationAsConfigurationState : ConfigurationWidgetState = new ConfigurationWidgetState(
    1,
    "all",
    "all",
    5,
    false,
    false,
    true
)

export function widgetConfigurationEqualsConfigurationWidgetState(configuration: WidgetConfigurationSettings, state: ConfigurationWidgetState, definitionName: string = "definitionName" ) {
    expect(state.selectedBuildDefinitionId).toBe(configuration.buildDefinition);
    expect(state.selectedBranch).toBe(configuration.buildBranch);
    expect(state.selectedTag).toBe(configuration.defaultTag);
    expect(state.buildCount).toBe(configuration.buildCount);
    expect(state.showStages).toBe(configuration.showStages);
    expect(state.matchAnyTagSelected).toBe(configuration.matchAnyTag);
    expect(definitionName).toBe(configuration.definitionName);
}

export function widgetConfigurationEqualsWidgetState(configuration: WidgetConfigurationSettings, state: WidgetState) {
    expect(state.selectedBuildDefinitionId).toBe(configuration.buildDefinition);
    expect(state.selectedBranch).toBe(configuration.buildBranch);
    expect(state.selectedTag).toBe(configuration.defaultTag);
    expect(state.buildCount).toBe(configuration.buildCount);
    expect(state.showStages).toBe(configuration.showStages);
    expect(state.matchAnyTagSelected).toBe(configuration.matchAnyTag);
}

export function resetMocks() {
    mockGetTags.mockReturnValue([]);
    mockGetBuild.mockReturnValue({
        _links: {
            web: {
                href: "https://buildUrl.com"
            }
        },
        buildNumber: -1,
        id: -1,
        result: BuildResult.Succeeded
    });
    mockGetBuilds.mockReturnValue([{}]);
    mockGetTimeline.mockReturnValue({
        records: [
            {
                id: "1",
                result: TaskResult.Succeeded,
                state: TimelineRecordState.Completed,
                errorCount: 0,
                attempt: 1,
                type: "Stage"
            },
            {
                id: "2",
                result: TaskResult.Succeeded,
                state: TimelineRecordState.Completed,
                errorCount: 0,
                attempt: 1,
                type: "Stage"
            }
        ]
    });
    mockGetProject.mockReturnValue({
        id: "buildClient",
        name: "buildClient"
    });
}