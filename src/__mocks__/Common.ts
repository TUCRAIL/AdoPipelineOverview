import {ConfigurationWidgetState, WidgetConfigurationSettings, WidgetState} from "../State";
import {
    BuildResult,
    mockGetBuild,
    mockGetBuilds, mockGetDefinitions,
    mockGetTags,
    mockGetTimeline, TaskResult, TimelineRecordState
} from "./azure-devops-extension-api/Build";
import {mockGetProject} from "./azure-devops-extension-api/Common";
import {WidgetSettings} from "azure-devops-extension-api/Dashboard";

export function showRootComponent(component: React.ReactElement<any>) {}

export  const filledWidgetConfiguration : WidgetConfigurationSettings = new WidgetConfigurationSettings(1,
    "all", "definitionName",
    5, "all", false, true);

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
    mockGetBuilds.mockReturnValue([]);
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
    mockGetDefinitions.mockReturnValue([]);
}

export function getWidgetSettings(customData?: object) : WidgetSettings {
    return {
        name: "settings",
        size: {
            rowSpan: 3,
            columnSpan: 3
        },
        lightboxOptions: undefined,
        customSettings: {
            version: undefined,
            data: customData ? JSON.stringify(customData) : null!
        }
    }
}