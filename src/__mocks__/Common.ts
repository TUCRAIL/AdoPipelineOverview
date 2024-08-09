import {WidgetConfigurationSettings} from "../State";

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