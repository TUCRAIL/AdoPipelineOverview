VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

let projectId = "";

let buildDropdown = document.getElementById("build-dropdown");
let branchDropdown = document.getElementById("branch-dropdown");
let buildCountInput = document.getElementById("build-count");
let defaultTagDropdown = document.getElementById("build-default-tag-dropdown")
let showStagesDropdown = document.getElementById("show-stages");
let codeClient;

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
 * @param WidgetHelpers TFS/Dashboards/WidgetHelpers
 * @param widgetConfigurationContext IWidgetConfigurationContext
 * @param definitions BuildDefinition[]
 */
async function onBuildDropdownChange(WidgetHelpers, widgetConfigurationContext, definitions)
{
    console.debug("Resetting the branch dropdown");
    branchDropdown.innerHTML = '<option value="all" selected>all</option>';
    branchDropdown.value = "all";

    let buildDefinition = buildDropdown.value
    let currentDefinition = definitions.find(d => Number(d.id) === Number(buildDefinition));

    console.debug(`Retrieving the branches for the repository ${currentDefinition.repository.name}`);
    await fillBranchesDropDown(currentDefinition.repository.id, 'all');

    console.debug(`Selected build ${buildDropdown.value} for definition ${currentDefinition.name}`);
    notifyWidgetConfigurationContext(WidgetHelpers, widgetConfigurationContext, currentDefinition.name);
}

async function fillBranchesDropDown(definitionRepository, buildBranch)
{
    let repositoryBranches = await codeClient.getBranches(definitionRepository, projectId, null);

    // The branches as not formatted as "refs" when retrieved.
    let branchArray = repositoryBranches.map((branch) => `refs/heads/${branch.name}`)
        .filter((value, index, self) => self.indexOf(value) === index);

    console.debug(`Starting to populate the branch dropdown. ${branchArray.length} branches to add`);
    branchArray.forEach(branch => {
        let newOption = document.createElement('option');
        newOption.setAttribute('value', branch);
        newOption.text = branch.replace("refs/heads/", "");
        branchDropdown.append(newOption);
    });

    branchDropdown.value = buildBranch;
}

/**
 *
 * @param WidgetHelpers TFS/Dashboards/WidgetHelpers
 * @param widgetConfigurationContext IWidgetConfigurationContext
 * @param definitions BuildDefinition[]
 */
function onBranchDropdownChange(WidgetHelpers, widgetConfigurationContext, definitions) {
    let definitionName = definitions.filter(definition => definition.id == buildDropdown.value)[0].name;
    console.debug(`Selected branch ${branchDropdown.value} for definition ${definitionName}`);
    notifyWidgetConfigurationContext(WidgetHelpers, widgetConfigurationContext, definitionName);
}

/**
 *
 * @param WidgetHelpers TFS/Dashboards/WidgetHelpers
 * @param widgetConfigurationContext IWidgetConfigurationContext
 * @param definitions BuildDefinition[]
 */
function onBuildCountInputChange(WidgetHelpers, widgetConfigurationContext, definitions) {
    let definitionName = definitions.filter(definition => definition.id == buildDropdown.value)[0].name;
    console.debug(`Selected to display ${buildDropdown.value} for branch ${branchDropdown.value} and definition ${definitionName}`);
    notifyWidgetConfigurationContext(WidgetHelpers, widgetConfigurationContext, definitionName);
}

/**
 *
 * @param WidgetHelpers TFS/Dashboards/WidgetHelpers
 * @param widgetConfigurationContext IWidgetConfigurationContext
 * @param definitions BuildDefinition[]
 */
function onDefaultTagDropdownChange(WidgetHelpers, widgetConfigurationContext, definitions) {
    let definitionName = definitions.filter(definition => definition.id == buildDropdown.value)[0].name;
    console.debug(`Selected to filter by tag ${defaultTagDropdown.value} for branch ${branchDropdown.value} and definition ${definitionName}`);
    notifyWidgetConfigurationContext(WidgetHelpers, widgetConfigurationContext, definitionName);
}

/**
 *
 * @param WidgetHelpers TFS/Dashboards/WidgetHelpers
 * @param widgetConfigurationContext IWidgetConfigurationContext
 * @param definitions BuildDefinition[]
 */
function onShowStagesDropdownChange(WidgetHelpers, widgetConfigurationContext, definitions) {
    let definitionName = definitions.filter(definition => definition.id == buildDropdown.value)[0].name;
    console.debug(`Selected stage ${showStagesDropdown.value} for branch ${branchDropdown.value} and definition ${definitionName}`);
    notifyWidgetConfigurationContext(WidgetHelpers, widgetConfigurationContext, definitionName);
}

function notifyWidgetConfigurationContext(WidgetHelpers, widgetConfigurationContext, definitionName)
{
    let customSettings = {
        data: JSON.stringify({
          buildDefinition: buildDropdown.value,
          buildBranch: branchDropdown.value,
          definitionName: definitionName,
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
            codeClient = TFS_VSC_webApi.getClient();

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
                        await fillBranchesDropDown(definitionRepository, settings.buildBranch);
                    }
                    else {
                        console.debug("Settings are either not present or valid. This will be a first setup for the configuration.");
                    }

                    //Create a json object and pass it as widget settings
                    buildDropdown.onchange = async function () {
                        await onBuildDropdownChange(WidgetHelpers, widgetConfigurationContext, definitions);
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
