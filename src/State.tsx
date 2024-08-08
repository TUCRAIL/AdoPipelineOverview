import {TaskResult, TimelineRecord, TimelineRecordState} from "azure-devops-extension-api/Build";
import {BuildWithTimeline} from "./Models/BuildWithTimeline";

export class WidgetConfigurationSettings {
    public buildDefinition: number;
    public buildBranch: string;
    public definitionName: string;
    public buildCount: number | string;
    public defaultTag: string;
    public showStages: boolean;
    public matchAnyTag: boolean = false;

    constructor(buildDefinition: number, buildBranch: string, definitionName: string, buildCount: number,
                defaultTag: string, showStages: boolean, matchAnyTag?: boolean) {
        this.buildDefinition = buildDefinition;
        this.buildBranch = buildBranch;
        this.definitionName = definitionName;
        this.buildCount = buildCount;
        this.defaultTag = defaultTag;
        this.showStages = showStages;
        this.matchAnyTag = matchAnyTag === undefined ? false : matchAnyTag;
    }
}

export interface IProps {

}

export class ConfigurationWidgetState {
    isBranchDropdownDisabled: boolean;
    buildCount: number;
    showStages: boolean;
    selectedTag: string;
    selectedBuildDefinitionId: number;
    selectedBranch: string;
    matchAnyTagSelected: boolean;

    constructor(selectedBuilDefinitionId: number, selectedBranch: string, selectedTag: string, buildCount: number, showStages: boolean, isBranchDropdownDisabled?: boolean, matchAnyTagSelected?: boolean) {
        this.selectedBuildDefinitionId = selectedBuilDefinitionId;
        this.selectedBranch = selectedBranch;
        this.selectedTag = selectedTag;
        this.buildCount = buildCount;
        this.showStages = showStages;
        this.isBranchDropdownDisabled = isBranchDropdownDisabled === undefined ? false : isBranchDropdownDisabled;
        this.matchAnyTagSelected = matchAnyTagSelected === undefined ? false : matchAnyTagSelected
    }

    public static getEmptyObject() : ConfigurationWidgetState{
        return new ConfigurationWidgetState(-1, "", "all", 1,
            true, true, false);
    }

    public static fromWidgetConfigurationSettings(settings: WidgetConfigurationSettings) : ConfigurationWidgetState {
        if(typeof settings.buildCount === "string")
        {
            settings.buildCount = parseInt(settings.buildCount)
        }
        return new ConfigurationWidgetState(settings.buildDefinition, settings.buildBranch, settings.defaultTag,
            settings.buildCount, settings.showStages, settings.buildBranch === "", settings.matchAnyTag);
    }

    public static toWidgetConfigurationSettings(state: ConfigurationWidgetState, definitionName: string) : WidgetConfigurationSettings {
        return new WidgetConfigurationSettings(state.selectedBuildDefinitionId, state.selectedBranch, definitionName, state.buildCount,
            state.selectedTag, state.showStages, state.matchAnyTagSelected);
    }

    public clone() : ConfigurationWidgetState {
        //Do a conversion to ultimately make sure that no user still has a string for the build count

        return new ConfigurationWidgetState(this.selectedBuildDefinitionId, this.selectedBranch, this.selectedTag,
            this.buildCount, this.showStages, this.isBranchDropdownDisabled, this.matchAnyTagSelected);
    }



    public copy(original : ConfigurationWidgetState)
    {
        this.selectedBuildDefinitionId = original.selectedBuildDefinitionId;
        this.selectedBranch = original.selectedBranch;
        this.selectedTag = original.selectedTag;
        this.buildCount = original.buildCount;
        this.showStages = original.showStages;
        this.isBranchDropdownDisabled = original.isBranchDropdownDisabled;
        this.matchAnyTagSelected = original.matchAnyTagSelected;


    }

}

export class WidgetState {
    selectedDefinitionName: string;
    selectedBuildDefinitionId: number;
    selectedBranch: string;
    selectedTag: string;
    buildCount: number;
    showStages: boolean;
    matchAnyTagSelected: boolean;

    constructor(selectedDefinitionName: string, selectedBuildDefinitionId: number, selectedBranch: string, selectedTag: string, buildCount: number, showStages: boolean, matchAnyTagSelected?: boolean) {
        this.selectedDefinitionName = selectedDefinitionName;
        this.selectedBuildDefinitionId = selectedBuildDefinitionId;
        this.selectedBranch = selectedBranch;
        this.selectedTag = selectedTag;
        this.buildCount = buildCount;
        this.showStages = showStages;
        this.matchAnyTagSelected = matchAnyTagSelected === undefined ? false : matchAnyTagSelected;
    }

    public static getEmptyObject() : WidgetState{
        return new WidgetState("", -1, "", "all", 1,
            true, false);
    }

    public static fromWidgetConfigurationSettings(settings: WidgetConfigurationSettings) : WidgetState {
        if(typeof settings.buildCount === "string")
        {
            settings.buildCount = parseInt(settings.buildCount)
        }
        return new WidgetState(settings.definitionName, settings.buildDefinition, settings.buildBranch, settings.defaultTag,
            settings.buildCount, settings.showStages, settings.matchAnyTag);
    }

    public clone() : WidgetState {
        return new WidgetState(this.selectedDefinitionName, this.selectedBuildDefinitionId, this.selectedBranch, this.selectedTag,
            this.buildCount, this.showStages, this.matchAnyTagSelected);
    }

    public copy(original : WidgetState)
    {
        this.selectedDefinitionName = original.selectedDefinitionName;
        this.selectedBuildDefinitionId = original.selectedBuildDefinitionId;
        this.selectedBranch = original.selectedBranch;
        this.selectedTag = original.selectedTag;
        this.buildCount = original.buildCount;
        this.showStages = original.showStages;
        this.matchAnyTagSelected = original.matchAnyTagSelected;
    }
}

export interface IStageStatusProps {
    stageStatus?: TimelineRecordState
    previousStatus?: TimelineRecordState
    multiStage: boolean
    startTime?: Date
    failed: boolean
    taskResult?: TaskResult
}

export interface IStageStatusState {
    stageStatus?: TimelineRecordState
    previousStatus?: TimelineRecordState
    multiStage: boolean
    startTime?: Date
    failed: boolean
    taskResult?: TaskResult
}

interface ICloneable<T extends ICloneable<T>> {
    clone(): T;
}

export interface IBuildResultRowProps {
    showStages: boolean,
    build: BuildWithTimeline
    buildIndex: number
}
export class BuildResultRowState {

    showStages: boolean;
    build: BuildWithTimeline;
    buildIndex: number

    constructor(showStages: boolean, build: BuildWithTimeline, buildIndex: number) {
        this.showStages = showStages;
        this.build = build;
        this.buildIndex = buildIndex;
    }

    public static createStateFromProperties(props: IBuildResultRowProps) : BuildResultRowState {
        return new BuildResultRowState(props.showStages, props.build, props.buildIndex);
    }

    public static getPreviousTimelineRecordStateForIndex(records: TimelineRecord[], index: number) : TimelineRecordState | undefined {
        return (index > 0 &&
            records.length > 1
            && records[index - 1].state !== undefined) ?
            records[index - 1].state
            : undefined
    }
}

export interface IStageResultCellProps {
    timelineRecord: TimelineRecord
    timelineIndex: number
    buildIndex: number
    isMultiStage: boolean
    previousTimelineRecordState: TimelineRecordState | undefined
}

export class StageResultCellState {
    timelineRecord: TimelineRecord
    timelineIndex: number
    buildIndex: number
    isMultiStage: boolean
    previousTimelineRecordState: TimelineRecordState | undefined

    constructor(timelineRecord: TimelineRecord, timelineIndex: number, buildIndex: number, isMultiStage: boolean, previousTimelineRecordState: TimelineRecordState | undefined) {
        this.timelineRecord = timelineRecord;
        this.timelineIndex = timelineIndex;
        this.buildIndex = buildIndex;
        this.isMultiStage = isMultiStage;
        this.previousTimelineRecordState = previousTimelineRecordState
    }

    public static createStateFromProperties(props: IStageResultCellProps) : StageResultCellState {
        return new StageResultCellState(props.timelineRecord, props.timelineIndex, props.buildIndex, props.isMultiStage, props.previousTimelineRecordState);
    }
}