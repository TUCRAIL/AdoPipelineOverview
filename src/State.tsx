export class WidgetConfigurationSettings {
    public buildDefinition: number;
    public buildBranch: string;
    public definitionName: string;
    public buildCount: number | string;
    public defaultTag: string;
    public showStages: boolean;
    public isBranchDropdownDisabled: boolean = false;
    public matchAnyTag: boolean = false;

    constructor(buildDefinition: number, buildBranch: string, definitionName: string, buildCount: number,
                defaultTag: string, showStages: boolean, isBranchDropdownDisabled?: boolean, matchAnyTag?: boolean) {
        this.buildDefinition = buildDefinition;
        this.buildBranch = buildBranch;
        this.definitionName = definitionName;
        this.buildCount = buildCount;
        this.defaultTag = defaultTag;
        this.showStages = showStages;
        this.isBranchDropdownDisabled = isBranchDropdownDisabled === undefined ? false : isBranchDropdownDisabled;
        this.matchAnyTag = matchAnyTag === undefined ? false : matchAnyTag;
    }

    public static getEmptyObject() : WidgetConfigurationSettings{
        return new WidgetConfigurationSettings(-1, "", "", 1,
            "all", true, true, false);
    }

    public clone() : WidgetConfigurationSettings {
        //Do a conversion to ultimately make sure that no user still has a string for the build count
        if(typeof this.buildCount === "string")
        {
            this.buildCount = parseInt(this.buildCount)
        }
        return new WidgetConfigurationSettings(this.buildDefinition, this.buildBranch, this.definitionName,
            this.buildCount, this.defaultTag, this.showStages, this.isBranchDropdownDisabled, this.matchAnyTag);
    }



    public copy(original : WidgetConfigurationSettings)
    {
        this.buildDefinition = original.buildDefinition;
        this.buildBranch = original.buildBranch;
        this.definitionName = original.definitionName;
        this.buildCount = original.buildCount;
        this.defaultTag = original.defaultTag;
        this.showStages = original.showStages;
        this.isBranchDropdownDisabled = original.isBranchDropdownDisabled;
        this.matchAnyTag = original.matchAnyTag;

        if(typeof this.buildCount === "string")
        {
            this.buildCount = parseInt(this.buildCount)
        }
    }

    public getBuildCount() : number {
        return typeof this.buildCount === "string" ?
            parseInt(this.buildCount) :
            this.buildCount;
    }
}

export interface IProps {

}

export class ConfigurationWidgetState {
    isBranchDropdownDisabled: boolean;
    buildCount: number | number ;
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
            settings.buildCount, settings.showStages, settings.isBranchDropdownDisabled, settings.matchAnyTag);
    }

    public static toWidgetConfigurationSettings(state: ConfigurationWidgetState, definitionName: string) : WidgetConfigurationSettings {
        return new WidgetConfigurationSettings(state.selectedBuildDefinitionId, state.selectedBranch, definitionName, state.buildCount,
            state.selectedTag, state.showStages, state.isBranchDropdownDisabled, state.matchAnyTagSelected);
    }

    public clone() : ConfigurationWidgetState {
        //Do a conversion to ultimately make sure that no user still has a string for the build count
        if(typeof this.buildCount === "string")
        {
            this.buildCount = parseInt(this.buildCount)
        }
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

        if(typeof this.buildCount === "string")
        {
            this.buildCount = parseInt(this.buildCount)
        }
    }

    public getBuildCount() : number {
        return typeof this.buildCount === "string" ?
            parseInt(this.buildCount) :
            this.buildCount;
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
        //Do a conversion to ultimately make sure that no user still has a string for the build count
        if(typeof this.buildCount === "string")
        {
            this.buildCount = parseInt(this.buildCount)
        }
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

        if(typeof this.buildCount === "string")
        {
            this.buildCount = parseInt(this.buildCount)
        }
    }

    public getBuildCount() : number {
        return typeof this.buildCount === "string" ?
            parseInt(this.buildCount) :
            this.buildCount;
    }
}