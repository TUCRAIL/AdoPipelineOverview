
export class WidgetConfigurationSettings {
    public buildDefinition: number;
    public buildBranch: string;
    public definitionName: string;
    public buildCount: number | string;
    public defaultTag: string;
    public showStages: boolean;
    //TODO: Remove this property and go back to use IConfigurationWidgetState for the configuration widget state
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

export interface IProps {}

interface IConfigurationWidgetState {
    isBranchDropdownDisabled: boolean;
    buildCount: number;
    showStages: boolean;
    selectedTag: string;
    selectedBuildDefinitionId: number;
    selectedBranch: string;
}