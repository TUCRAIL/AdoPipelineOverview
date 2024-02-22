VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

let projectId = "";

let buildDropdown = document.getElementById("build-dropdown");
let branchDropdown = document.getElementById("branch-dropdown");
let buildCountInput = document.getElementById("build-count");
let defaultTagDropdown = document.getElementById("build-default-tag-dropdown")
let defaultBranchDropdownOptions = '<option value="" selected disabled hidden>Please select a query</option>';
let showStagesDropdown = document.getElementById("show-stages");

/**
 * @description Add definition names to the build definition dropdown
 * @param definitions BuildDefinition[]
 */
function populateBuildDefinitionDropdown(definitions)
{
    console.debug(`Starting to populate the build definition dropdown. ${definitions.length} definitions to add.`);
    definitions.forEach(definition => {
        let newOption = document.createElement('option');
        newOption.setAttribute('value', definition.id);
        newOption.text = definition.name;
        buildDropdown.append(newOption);
        console.debug(`Added definition ${definition.name} to the dropdown list`)
    });
}

/**
 * @description Add tags to the tag dropdown. As there is no API to retrieve all tags appearing in any build inside a specific definition, it is populating the dropdown with all tags from the project.
 * @param buildClient TFS/Build/RestClient
 * @returns {Promise<IPromise<string[]>>}
 */
async function populateTagDropdown(buildClient) {
    let tags = await buildClient.getTags(projectId);
    console.debug(`Starting to populate the tag dropdown. ${tags.length} tags to add`);
    if (tags.length > 0) {
        tags.sort().forEach(tag => {
            let newOption = document.createElement('option');
            newOption.setAttribute('value', tag);
            newOption.text = tag;
            defaultTagDropdown.append(newOption);
        });
    }
    defaultTagDropdown.value = 'all';

    return tags;
}

/**
 * @description Populate the branch dropdown
 * @param definitionRepository string
 * @param codeClient TFS/VersionControl/GitRestClient
 * @param settings object
 * @returns {Promise<void>}
 */
async function populateBuildBranchDropdown(definitionRepository, codeClient, settings)
{
    /**
     * @type GitBranchStats[]
     */
    let repositoryBranches = await codeClient.getBranches(definitionRepository, projectId, null);

    // The branches as not formatted as "refs" when retrieved.
    let branchArray = repositoryBranches.map((branch) => `refs/heads/${branch.name}`)
        .filter((value, index, self) => self.indexOf(value) === index);

    console.debug(`Starting to populate the branch dropdown. ${branchArray.length} branches to add`);
    if (branchArray.length > 0) {
        branchArray.forEach(branch => {
            let newOption = document.createElement('option');
            newOption.setAttribute('value', branch);
            newOption.text = branch.replace("refs/heads/", "");
            branchDropdown.append(newOption);
        });
        branchDropdown.removeAttribute('disabled');
    }
    console.debug(`Branch dropdown value set to ${settings.buildBranch}`);
    branchDropdown.value = settings.buildBranch;
}

/**
 * @description Update the branch dropdown when the build definition dropdown is changed.
 * @param definitions BuildDefinition[]
 * @param codeClient TFS/VersionControl/GitRestClient
 * @returns {Promise<void>}
 */
async function onBuildDropdownChange(definitions, codeClient)
{
    console.debug("Resetting the branch dropdown");
    branchDropdown.innerHTML = defaultBranchDropdownOptions;
    branchDropdown.value = "";
    let buildDefinition = buildDropdown.value

    let currentDefinition = definitions.find(d => Number(d.id) === Number(buildDefinition));

    let definitionRepository = currentDefinition.repository.id;

    console.debug(`Retrieving the branches for the repository ${currentDefinition.repository.name}`);
    /**
     * @type GitBranchStats[]
     */
    let repositoryBranches = await codeClient.getBranches(definitionRepository, projectId, null);

    let branchArray = repositoryBranches.map((branch) => `refs/heads/${branch.name}`)
        .filter((value, index, self) => self.indexOf(value) === index);

    console.debug(`Starting to populate the branch dropdown. ${branchArray.length} branches to add`);
    if (branchArray.length > 0) {
        branchArray.forEach(branch => {
            let newOption = document.createElement('option');
            newOption.setAttribute('value', branch);
            newOption.text = branch.replace("refs/heads/", "");
            branchDropdown.append(newOption);
        });
        branchDropdown.removeAttribute('disabled');
    } else {
        branchDropdown.setAttribute('disabled', true);
    }
}

/**
 *
 * @param WidgetHelpers TFS/Dashboards/WidgetHelpers
 * @param widgetConfigurationContext IWidgetConfigurationContext
 * @param definitions BuildDefinition[]
 */
function onBranchDropdownChange(WidgetHelpers, widgetConfigurationContext, definitions) {
    let definition = definitions.filter(definition => Number(definition.id) === Number(buildDropdown.value))[0];
    console.debug(`Selected branch ${branchDropdown.value} for definition ${definition.name}`);
    let customSettings = {
        data: JSON.stringify({
            buildDefinition: buildDropdown.value,
            buildBranch: branchDropdown.value,
            definitionName: definition.name,
            buildCount: buildCountInput.value,
            defaultTag: defaultTagDropdown.value,
            showStages: showStagesDropdown.value,
        })
    };
    let eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
    let eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
    widgetConfigurationContext.notify(eventName, eventArgs);
}

function onBuildCountInputChange(WidgetHelpers, widgetConfigurationContext, definitions) {
    if (branchDropdown.value !== "" && buildDropdown.value != "") {
        let definition = definitions.filter(definition => definition.id == buildDropdown.value)[0];
        console.debug(`Selected to display ${buildDropdown.value} for branch ${branchDropdown.value} and definition ${definition.name}`);
        let customSettings = {
            data: JSON.stringify({
                buildDefinition: buildDropdown.value,
                buildBranch: branchDropdown.value,
                definitionName: definition.name,
                buildCount: buildCountInput.value,
                defaultTag: defaultTagDropdown.value,
                showStages: showStagesDropdown.value,
            })
        };
        let eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
        let eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
        widgetConfigurationContext.notify(eventName, eventArgs);
    }
}

function onDefaultTagDropdownChange(WidgetHelpers, widgetConfigurationContext, definitions) {
    if (branchDropdown.value !== "" && buildDropdown.value != "") {
        let definition = definitions.filter(definition => definition.id == buildDropdown.value)[0];
        console.debug(`Selected to filter by tag ${defaultTagDropdown.value} for branch ${branchDropdown.value} and definition ${definition.name}`);
        let customSettings = {
            data: JSON.stringify({
                buildDefinition: buildDropdown.value,
                buildBranch: branchDropdown.value,
                definitionName: definition.name,
                buildCount: buildCountInput.value,
                defaultTag: defaultTagDropdown.value,
                showStages: showStagesDropdown.value,
            })
        };
        let eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
        let eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
        widgetConfigurationContext.notify(eventName, eventArgs);
    }
}

function onShowStagesDropdownChange(WidgetHelpers, widgetConfigurationContext, definitions) {
  let definition = definitions.filter((definition) => definition.id == buildDropdown.value)[0];
  let customSettings = {
    data: JSON.stringify({
      buildDefinition: buildDropdown.value,
      buildBranch: branchDropdown.value,
      definitionName: definition.name,
      buildCount: buildCountInput.value,
      defaultTag: defaultTagDropdown.value,
      showStages: showStagesDropdown.value,
    }),
  };
  
  let eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
  let eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
  widgetConfigurationContext.notify(eventName, eventArgs);
}

/**
 *
 * @param WidgetHelpers TFS/Dashboards/WidgetHelpers
 * @param definitions BuildDefinition[]
 * @returns {IPromise<SaveStatus>|*}
 */
function saveSettings(WidgetHelpers, definitions)
{
    let definition = definitions.filter(definition => definition.id == buildDropdown.value)[0];
    console.debug("Starting to save settings");
    if (branchDropdown.value === "") {
        console.debug(`No branch was selected for the build definition ${definition.name}. Settings will not be saved`);
        return WidgetHelpers.WidgetStatusHelper.Invalid("The branch selected is invalid");
    }


    let customSettings = {
        data: JSON.stringify({
            buildDefinition: buildDropdown.value,
            buildBranch: branchDropdown.value,
            definitionName: definition.name,
            buildCount: buildCountInput.value,
            defaultTag: defaultTagDropdown.value,
            showStages: showStagesDropdown.value,
        })
    };

    console.debug(`Setting that will be saved are: 
        ${JSON.stringify(customSettings.data)}`);
    return WidgetHelpers.WidgetConfigurationSave.Valid(customSettings);
}

VSS.require(["TFS/Dashboards/WidgetHelpers", "VSS/Service", "TFS/Build/RestClient", "TFS/VersionControl/GitRestClient"],
    async function (WidgetHelpers, VSS_Service, TFS_Build_webApi, TFS_VSC_webApi) {
        WidgetHelpers.IncludeWidgetConfigurationStyles();
        VSS.register("DeploymentsWidget.Configuration", async function () {
            console.debug("Preparing setup for configuration data");

            projectId = VSS.getWebContext().project.id;
            console.debug(`Project ID is now ${projectId}`)
            let buildClient = TFS_Build_webApi.getClient();
            console.debug("Retrieving available build definitions");
            /**
             * @type BuildDefinition[]
             */
            let definitions = await buildClient.getDefinitions(projectId, null, null, null, null, null, null, null,
             null, null, null, null, true, null, null);
            let codeClient = TFS_VSC_webApi.getClient();

            populateBuildDefinitionDropdown(definitions);

            console.debug(`Retrieving available tags in project ${VSS.getWebContext().project.name}`);
            let tags = await populateTagDropdown(buildClient);


            return {
                load: async function (widgetSettings, widgetConfigurationContext) {
                    console.debug("Initializing configuration data")
                    let settings = JSON.parse(widgetSettings.customSettings.data);

                    // Must verify if the settings is null for the first configuration of the widget
                    if (!settings?.defaultTag || !tags.includes(settings.defaultTag)) {
                        //Do not change from default
                        console.debug('No default tag was configured or the previous value is no longer valid. The tag filter will show pipelines with any tag');
                    }
                    else {
                        console.debug(`Found a valid tag. Filter will be by tag ${settings.defaultTag}`);
                        defaultTagDropdown.value = settings.defaultTag;
                    }

                    if (settings && settings.buildDefinition !== "" && settings.buildBranch !== "") {
                        console.debug(`Settings have been found and validated. Current settings are: 
                            ${JSON.stringify(settings)}`);
                        buildDropdown.value = settings.buildDefinition;
                        buildCountInput.value = settings.buildCount;
                        showStagesDropdown.value = settings.showStages;

                        let buildDefinition = settings.buildDefinition;

                        /**
                         * @type BuildDefinition
                         */
                        let currentDefinition = definitions.find(d => Number(d.id) === Number(buildDefinition));

                        let definitionRepository = currentDefinition.repository.id;
                        console.debug("Populating branches as a definition is already set.")
                        await populateBuildBranchDropdown(definitionRepository, codeClient, settings);

                    }
                    else {
                        console.debug("Settings are either not present or valid. This will be a first setup for the configuration.");
                    }

                    //Create a json object and pass it as widget settings
                    buildDropdown.onchange = async function () {
                        await onBuildDropdownChange(definitions, codeClient);
                    };
                    branchDropdown.onchange = function()
                    {
                        onBranchDropdownChange(WidgetHelpers, widgetConfigurationContext, definitions);
                    };
                    buildCountInput.onchange = function () {
                        onBuildCountInputChange(WidgetHelpers, widgetConfigurationContext, definitions);
                    };

                    defaultTagDropdown.onchange = function () {
                        onDefaultTagDropdownChange(WidgetHelpers, widgetConfigurationContext, definitions);
                    };
                    showStagesDropdown.onchange = function () {
                      onShowStagesDropdownChange(WidgetHelpers, widgetConfigurationContext, definitions);
                    };

                    return WidgetHelpers.WidgetStatusHelper.Success();
                },
                onSave: function () {
                    return saveSettings(WidgetHelpers, definitions);
                }
            }
        });
        console.debug("Configuration ready for use");
        VSS.notifyLoadSucceeded();
    });
