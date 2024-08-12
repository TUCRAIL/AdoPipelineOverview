import {TaskResult, TimelineRecord, TimelineRecordState} from "azure-devops-extension-api/Build";
import {BuildWithTimeline} from "./Models/BuildWithTimeline";
import {SemanticVersion} from "azure-devops-extension-api/Dashboard/Dashboard";

export class WidgetConfigurationSettings {
    public buildDefinition: number;
    public buildBranch: string;
    public definitionName: string;
    public buildCount: number | string;
    public defaultTag: string | undefined;
    public showStages: boolean;
    public matchAnyTag: boolean = false;

    constructor(buildDefinition: number, buildBranch: string, definitionName: string, buildCount: number,
                defaultTag: string, showStages: boolean, matchAnyTag?: boolean) {
        this.buildDefinition = buildDefinition as number;
        this.buildBranch = buildBranch;
        this.definitionName = definitionName;
        this.buildCount = buildCount;
        this.defaultTag = defaultTag;
        this.showStages = showStages;
        this.matchAnyTag = matchAnyTag === undefined ? false : matchAnyTag;
    }

    public static getEmptyObject() : WidgetConfigurationSettings {
        return new WidgetConfigurationSettings(-1, "",
            "", 1, "all",
            true, false);
    }

    public clone() : WidgetConfigurationSettings {
        return new WidgetConfigurationSettings(this.buildDefinition as number, this.buildBranch, this.definitionName,
            this.buildCount as number, this.defaultTag ?? "all", this.showStages, this.matchAnyTag);
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

    public static version = '2.0.0'

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

    public static fromWidgetConfigurationSettings(settings: WidgetConfigurationSettings, version?: SemanticVersion) : ConfigurationWidgetState {
        if(!version?.major || version.major === 1)
        {
            if(typeof settings.buildCount === "string")
            {
                settings.buildCount = parseInt(settings.buildCount);
            }
            if(typeof settings.buildDefinition === "string")
            {
                settings.buildDefinition = parseInt(settings.buildDefinition);
            }
        }
        return new ConfigurationWidgetState(settings.buildDefinition as number, settings.buildBranch, settings.defaultTag ?? "all",
            settings.buildCount as number, settings.showStages, settings.buildBranch === "", settings.matchAnyTag);
    }

    public static toWidgetConfigurationSettings(state: ConfigurationWidgetState, definitionName: string) : WidgetConfigurationSettings {
        return new WidgetConfigurationSettings(state.selectedBuildDefinitionId as number, state.selectedBranch, definitionName, state.buildCount,
            state.selectedTag, state.showStages, state.matchAnyTagSelected);
    }

    public clone() : ConfigurationWidgetState {
        //Do a conversion to ultimately make sure that no user still has a string for the build count

        return new ConfigurationWidgetState(this.selectedBuildDefinitionId as number, this.selectedBranch, this.selectedTag,
            this.buildCount, this.showStages, this.isBranchDropdownDisabled, this.matchAnyTagSelected);
    }



    public copy(original : ConfigurationWidgetState)
    {
        this.selectedBuildDefinitionId = original.selectedBuildDefinitionId as number;
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
    selectedTag: string | undefined;
    buildCount: number;
    showStages: boolean;
    matchAnyTagSelected: boolean;

    constructor(selectedDefinitionName: string, selectedBuildDefinitionId: number, selectedBranch: string, selectedTag: string, buildCount: number, showStages: boolean, matchAnyTagSelected?: boolean) {
        this.selectedDefinitionName = selectedDefinitionName;
        this.selectedBuildDefinitionId = selectedBuildDefinitionId as number;
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

    public static fromWidgetConfigurationSettings(settings: WidgetConfigurationSettings, version?: SemanticVersion) : WidgetState {
        if(!version?.major || version.major === 1)
        {
            if(typeof settings.buildCount === "string")
            {
                settings.buildCount = parseInt(settings.buildCount);
            }
            if(typeof settings.buildDefinition === "string")
            {
                settings.buildDefinition = parseInt(settings.buildDefinition);
            }
        }
        return new WidgetState(settings.definitionName, settings.buildDefinition, settings.buildBranch, settings.defaultTag ?? "all",
            settings.buildCount as number, settings.showStages, settings.matchAnyTag);
    }

    public clone() : WidgetState {
        return new WidgetState(this.selectedDefinitionName, this.selectedBuildDefinitionId, this.selectedBranch, this.selectedTag ?? "all",
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
    taskResult?: TaskResult | undefined
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
        if(index > 0 && records.length > 1 &&  records[index - 1].state !== undefined)
        {
            return records[index - 1].state;
        }
        else {
            return  undefined;
        }
    }
}

export interface IStageResultCellProps {
    timelineRecord: TimelineRecord | undefined
    timelineIndex: number
    buildIndex: number
    isMultiStage: boolean
    previousTimelineRecordState: TimelineRecordState | undefined
}

export class StageResultCellState {
    timelineRecord: TimelineRecord | undefined
    timelineIndex: number
    buildIndex: number
    isMultiStage: boolean
    previousTimelineRecordState: TimelineRecordState | undefined

    constructor(timelineRecord: TimelineRecord | undefined, timelineIndex: number, buildIndex: number, isMultiStage: boolean, previousTimelineRecordState: TimelineRecordState | undefined) {
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