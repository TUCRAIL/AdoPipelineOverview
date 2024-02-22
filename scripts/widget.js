// HTML for all status badges
const svgInProgress = '<svg class="bolt-status flex-noshrink active stage-icon-margin animate spinner" height="16" role="presentation" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle><path d="M4.75 8a3.25 3.25 0 0 1 1.917-2.965c.33-.148.583-.453.583-.814 0-.479-.432-.848-.881-.683A4.752 4.752 0 0 0 3.29 8.62c.064.49.616.697 1.043.45.303-.175.443-.528.423-.877A3.304 3.304 0 0 1 4.75 8zm6.5 0c0 .065-.002.13-.006.194-.02.349.12.702.422.877.428.247.98.04 1.044-.45a4.752 4.752 0 0 0-3.078-5.084c-.45-.164-.882.205-.882.684 0 .36.253.666.583.814A3.25 3.25 0 0 1 11.25 8zM8 11.25c.758 0 1.455-.26 2.008-.694.293-.23.696-.31 1.019-.123.402.233.51.77.167 1.083A4.733 4.733 0 0 1 8 12.75c-1.23 0-2.35-.467-3.194-1.234-.344-.312-.235-.85.168-1.083.322-.186.725-.108 1.018.123.553.435 1.25.694 2.008.694z" fill="#fff" ></path></svg>';
const svgWaitingToStart = '<svg class="bolt-status flex-noshrink neutral stage-icon-margin queued" height="16" role="presentation" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="7" fill="#fff"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm0-1.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z"></path></svg>';
const svgSuccess = '<svg class="bolt-status flex-noshrink success status-example flex-self-center" height="16" role="presentation" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle><path d="M6.062 11.144l-.003-.002-1.784-1.785A.937.937 0 1 1 5.6 8.031l1.125 1.124 3.88-3.88A.937.937 0 1 1 11.931 6.6l-4.54 4.54-.004.004a.938.938 0 0 1-1.325 0z" fill="#fff"></path></svg>';
const svgFailed = '<svg class="bolt-status flex-noshrink failed status-example flex-self-center" height="16" role="presentation" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle><path d="M10.984 5.004a.9.9 0 0 1 0 1.272L9.27 7.99l1.74 1.741a.9.9 0 1 1-1.272 1.273l-1.74-1.741-1.742 1.74a.9.9 0 1 1-1.272-1.272l1.74-1.74-1.713-1.714a.9.9 0 0 1 1.273-1.273l1.713 1.713 1.714-1.713a.9.9 0 0 1 1.273 0z" fill="#fff"></path></svg>';
const svgWaiting = '<svg class="bolt-status flex-noshrink active status-example flex-self-center waiting" height="16" role="presentation" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle><path d="M8 3.5a.9.9 0 0 1 .9.9v3.325l2.002 2.001A.9.9 0 1 1 9.629 11L7.408 8.778A.898.898 0 0 1 7.1 8.1V4.4a.9.9 0 0 1 .9-.9z" fill="#fff"></path></svg>';
const svgInfo = '<svg class="rotate bolt-status flex-noshrink active status-example flex-self-center info" height="16" role="presentation" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M8.91 3.9a.9.9 0 0 0-1.8 0v4.7a.9.9 0 1 0 1.8 0V3.9zm-.95 8.65a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8z" fill="#fff"></path></svg>';
const svgSkip = '<svg class="bolt-status flex-noshrink neutral status-example flex-self-center skip" height="16" role="presentation" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="7" fill="#fff"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-1.5 0a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0zM6.752 4.372a.861.861 0 0 1 1.218 0l3.005 3.005a.86.86 0 0 1 .252.62.859.859 0 0 1-.252.626L7.97 11.628a.861.861 0 1 1-1.218-1.218L9.162 8l-2.41-2.41a.861.861 0 0 1 0-1.218z"></path></svg>';
const svgCancel = '<svg class="bolt-status flex-noshrink neutral status-example flex-self-center cancel" height="16" role="presentation" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="7" fill="#fff"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-1.5 0a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0zM6.41 5.124a.9.9 0 1 0-1.274 1.272l4.385 4.385a.9.9 0 1 0 1.272-1.273L6.41 5.124z"></path></svg>';

//Object to recover the stage result as a string
const getStageResult = {
    0: 'succeeded',
    1: 'succeededwithissues',
    2: 'failed',
    3: 'canceled',
    4: 'skipped',
    5: 'abandoned'
};

//Object to recover the build result as a string
const getBuildResult = {
    2: "succeeded",
    8: "failed",
    32: "canceled",
  };

//Object to recover the stage state as a string
const getStageState = {
    0: 'pending',
    1: 'inprogress',
    2: 'completed'
}

//How many builds should be fetched for their timeline
let buildsToTake = 5;

//Switch reset after parsing each timeline to know if a pending stage already was parsed
let alreadyPending = false;

//Object to represent a stage minimally
/** An object representing a stage record*/
class Stage {
    /**
     *@param {TimelineRecord} record - A record fetched directly from ADO API
     */
    constructor(record)
    {
        this.name = record.name;
        this.state = getStageState[record.state];
        this.result  = getStageResult[record.result];
        this.startTime = record.startTime;
        
    }
}
//Used to contact the build rest api inside functions
let timelineClient;
let projectId;

// Used to filter the builds
let buildTag = 'all'

let initialized = false;
let reloading = false;


//Initialize the widget
VSS.init({                        
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

let settingBuildDefinition;
let settingBuildBranch;
let defaultTagDropdown;
let showStages;

/**
 * @description Validates the settings and prompt the user to configure the widget if they are invalid or no longer valid
 * @param widgetSettings
 * @returns {Promise<void>}
 * @constructor
 */
async function GetBuildWidget(widgetSettings){
    console.debug("Starting validation of the settings");
    //Retrieve settings from configuration
    let settings = JSON.parse(widgetSettings.customSettings.data);
    console.debug("Verifying settings");

    console.debug(`settings are: 
        ${JSON.stringify(settings)}`);
    //If the necessary settings aren't there => configuration must be done / modified
    if (!settings || !settings.buildDefinition || !settings.buildBranch) {
        console.debug("Missing settings for the widget");
        let buildContainer = document.getElementById('build-container');
        buildContainer.innerHTML = '<p>Sorry nothing to show, please configure the widget.</p>';

    }
    else{
        console.debug("All settings are set for the widget");
        //Replace default value if setting is set
        if(settings.buildCount)
        {
            console.debug(`Builds to display set at ${settings.buildCount}`)
            buildsToTake = settings.buildCount;
        }
        if(settings.defaultTag)
        {
            console.debug(`Default filter tag set at ${settings.defaultTag}`)
            buildTag = settings.defaultTag;
        }
        //Set title as definition name and subtitle as branch name
        let title = document.getElementsByClassName('inner-title');
        title[0].textContent = settings.definitionName;
        let subtitle = document.getElementsByClassName('subtitle');
        subtitle[0].textContent = settings.buildBranch.replace("refs/heads/", "");

        settingBuildDefinition = settings.buildDefinition;
        settingBuildBranch = settings.buildBranch;
        showStages = settings.showStages == "true";

        console.debug("Starting to build UI")
        await GetBuilds(settings.buildDefinition, settings.buildBranch);

    }
}

/**
 * @description Reset the UI when the tag dropdown is changed
 * @returns {Promise<void>}
 * @constructor
 */
async function ResetUI()
{
    console.debug("Restart process of building the UI container");
    let buildContainer = document.getElementById('build-container');
    buildContainer.replaceChildren();
    await GetBuilds(settingBuildDefinition, settingBuildBranch)
}

/**
 * @description Main function to populate the build-container
 * @param {number} buildDefinition - The definition id
 * @param {string} buildBranch - The name of the branch with refs/heads/
 */
async function GetBuilds(buildDefinition, buildBranch)
{
    console.debug("Starting process to retrieve builds")
    let buildDefinitions = [buildDefinition]
    let tags = buildTag === 'all' ? null : [buildTag]
    let branches = buildBranch === 'all' ? null : [buildBranch]
    //Retrieve all the builds in a build definition (pipeline)
    console.debug(`Parameters that will be passed to the api call are: \n
        projectid:${projectId} \n
        buildDefinition: ${buildDefinition} \n
        tag: ${tags} \n
        branch: ${branches}`);
    
    /**
     * @type Build[]
     */
    let builds = await timelineClient.getBuilds(projectId, buildDefinitions,null, null, null, null, null, null, null, null, tags, null, null, null, null, null, null, branches, null, null, null);

    // Descending sort of the build ids and retrieve only builds for the wanted branch
    // Filtering on the branch is deprecated as it is now done in the getBuilds function
    builds = builds.sort(function(a, b) {
        return b.id - a.id;
    });

    console.debug(`Taking at most ${buildsToTake} of available ${builds.length} for display`);
    //Reduce array size if bigger than number of builds wanted
    if(builds.length > buildsToTake)
    {
        builds = builds.slice(0, buildsToTake);
    }

    console.debug("Starting to build html table")
    //Creating html table
    let table = document.createElement('table');
    let buildsLength = builds.length;
    //For loop because foreach returns a string
    for(let i = 0; i < buildsLength; i++)
    {
        console.debug(`Building row number ${i}`);
        alreadyPending = false;
        if (showStages == true) {
            //Get the timeline for a specific build run
            let timeline = await timelineClient.getBuildTimeline(projectId, builds[i].id);
            if(typeof timeline === "undefined")
            {
                console.debug("Could not build a valid row");
                let tableRow = document.createElement('tr');
                tableRow.appendChild(BuildRowNameElement(builds[i]._links.web.href, builds[i].buildNumber));
                let tableErrorCell = document.createElement('td');
                tableErrorCell.setAttribute('colspan', (99).toString());
                tableErrorCell.textContent = "There was an error preventing the pipeline to run (invalid YAML, service connection not existing ...)";
                tableRow.appendChild(tableErrorCell);
                table.appendChild(tableRow);
            }
            else {
                let stageArray = [];
                //Sort stages by their order to append elements in the correct order
                timeline.records.filter(FilterTimelineByStage).sort(function(a,b){
                    return a.order - b.order;
                }).forEach(record => { //Create an object from the records
                    let stage = new Stage(record);
                    stageArray.push(stage);
                });
                console.debug(`Starting to builds columns for the ${stageArray.length} build stages`);
                //Build row using our arrays
                table.appendChild(BuildHtmlRow(stageArray, builds[i]._links.web.href, builds[i].buildNumber));
            }
        }
        else {
            table.appendChild(
                BuildHtmlRowNoStages(
                  getBuildResult[builds[i].result],
                  builds[i]._links.web.href,
                  builds[i].buildNumber
                )
              );
        }
    }

    let buildContainer = document.getElementById('build-container');

    try{
        console.debug("Build container was successfully built");
        buildContainer.replaceChildren(table);
        initialized = true;
    }
    catch(error)
    {
        console.error(error);
    }
}
/**
 * @description Iterate over each timeline item and only return stages
 * @param {TimelineRecord} item - A record of the timeline where the record is a stage, job, ...
 * @return {TimelineRecord}
 */
function FilterTimelineByStage(item) {
    if(item.type === "Stage")
    {
        return item;
    }
}

/**
 * @param {Stage[]} stages - The stages of the build
 * @param {string} buildUrl - Url of the build viewable in a browser
 * @param {string} buildBuildNumber - id of the build. YYYY.MM.DD by default
 * @description - Create a row containing a link to the build, all the stages and their status
 * @return {HTMLTableRowElement}
 */
function BuildHtmlRow(stages, buildUrl, buildBuildNumber)
{

    let rowElement = document.createElement('tr');
    rowElement.setAttribute('class', 'row');

    rowElement.appendChild(BuildRowNameElement(buildUrl, buildBuildNumber));

    //Get all stages status cell
    let tdElements = BuildRowStagesElements(stages);

    tdElements.forEach(element => {
        rowElement.appendChild(element);
    });
    console.debug("Row successfully built");
    return rowElement;
}

/**
 * @param {string} buildStatus - status of the build
 * @param {string} buildUrl - Url of the build viewable in a browser
 * @param {string} buildNumber - id of the build. YYYY.MM.DD by default
 * @description - Create a row containing a link to the build and the status
 * @return {HTMLTableRowElement}
 */
function BuildHtmlRowNoStages(buildStatus, buildUrl, buildNumber) {
    let rowElement = document.createElement("tr");
    rowElement.setAttribute("class", "row");

    let tdElement = BuildRowElementNoStage(buildStatus, buildNumber, buildUrl);
    rowElement.appendChild(tdElement);

    console.debug("Row successfully built");
  
    return rowElement;
  }

/**
 * @param {string} url - Url of the build viewable in a browser
 * @param {string} number - id of the build. YYYY.MM.DD by default
 * @description - Create a cell containing a link to the build
 * @return {HTMLTableCellElement}
 */
function BuildRowNameElement(url, number)
{
    let buildNameTd = document.createElement('td');

    buildNameTd.setAttribute('class', 'buildName');

    let buildNameLink = document.createElement('a');
    buildNameLink.href = url;
    buildNameLink.target = '_blank';
    buildNameLink.text = number;

    buildNameTd.appendChild(buildNameLink);

    return buildNameTd;
}
/**
 * @description Creates cells for the stages
 * @param {Stage[]} stages - The stages of the build
 * @return {HTMLTableCellElement[]}
 */
function BuildRowStagesElements(stages){
    let tdElements = []
    let previousState = undefined
    stages.forEach(stage => {

        let tdElement = document.createElement('td');
        let container = document.createElement('div');

        let badgeElement = document.createElement('template');
        badgeElement.innerHTML = GetStageBadge(stage.state,stage.result, stage.startTime, previousState, stages.length > 1);

        let stageState = GetStageUnderline(badgeElement.innerHTML);
        container.setAttribute('class', `stage ${stageState}`);

        container.replaceChildren(badgeElement.content.firstChild);

        container.append(stage.name);
        tdElement.appendChild(container);

        tdElements.push(tdElement);
        previousState = stage.state;
    });

    return tdElements;
}

/**
 * @description Creates cell for the build
 * @param {string} buildStatus - The status of the build
 * @param {string} buildName - The name of the build
 * @param {string} buildUrl - Url of the build viewable in a browser
 * @return {HTMLTableCellElement}
 */
function BuildRowElementNoStage(buildStatus, buildName, buildUrl) {
    let tdElement = document.createElement("td");
    let buildLinkContainer = document.createElement("a");
    buildLinkContainer.href = buildUrl;
    buildLinkContainer.target = "_blank";
    tdElement.appendChild(buildLinkContainer);
    
    
    let container = document.createElement("div");
  
    let badgeElement = document.createElement("template");
    badgeElement.innerHTML = GetBadgeSvg(buildStatus);
  
    let buildState = GetStageUnderline(badgeElement.innerHTML);
    container.setAttribute("class", `stage ${buildState}`);
  
    container.replaceChildren(badgeElement.content.firstChild);
  
    container.append(buildName);
    buildLinkContainer.appendChild(container);
  
    return tdElement;
  }

/**
 * @description Get the colour of the underline of the stage name
 * @param {string} svg - The html corresponding to the svg displayed on the stage
 * @return {string} - The class corresponding to the underline that should be displayed
 */
function GetStageUnderline(svg)
{
    // The complete svgInprogress is modified as the icon rotates, so it will always return stage-neutral. So we cut the length
    let truncatedSvg = svg.substring(0, 90);
    if(truncatedSvg === svgInProgress.substring(0, 90) || truncatedSvg === svgWaiting.substring(0, 90))
    {
        return 'stage-active';
    }
    else if(truncatedSvg === svgSuccess.substring(0, 90) || truncatedSvg === svgInfo.substring(0, 90)) {
        return 'stage-success';
    }
    else if(truncatedSvg === svgFailed.substring(0, 90))
    {
        return 'stage-failed'
    }
    return 'stage-neutral';
}
/**
 * @description Get the status badge of the stage based on its result
 * @param {string} state - A stage state
 * @param {string} result - A stage result
 * @param {Date} startTime - The date when the stage started to run
 * @param {string} previousState - The previous stage state
 * @param {boolean} isMultistage - Whether the pipeline has multiple stages
 * @return {string}
 */
function GetStageBadge(state, result, startTime, previousState, isMultistage)
{
    if(state === "completed")
    {
        return GetBadgeSvg(result);
    }
    else {
        switch(state){
            case 'pending':
                if((typeof previousState === "undefined" && isMultistage) ||(typeof previousState !== "undefined" && previousState !== "completed"))
                {
                    alreadyPending = true;
                    return svgWaitingToStart;
                }
                return svgWaiting;
            case 'inprogress':
                // If the startTime is null, it means that the stage is waiting in a queue due to not enough workers being present
                // Or needing a gate approval
                if(startTime === null || typeof startTime === "undefined")
                {
                    return svgWaiting;
                }
                let date = Date.parse(startTime.toString()) || 0;
                if(date !== 0)
                {
                    return svgInProgress;
                }
                return svgWaiting;
        }
    }
}

/**
 * @description Get the status badge of the build based on its result
 * @param {string} result - A build result
 * @return {string}
 */
function GetBadgeSvg(result) {
    switch (result) {
      case "succeeded":
        return svgSuccess;
      case "succeededwithissues":
        return svgInfo;
      case "failed":
        return svgFailed;
      case "canceled":
        return svgCancel;
      case "skipped":
        return svgSkip;
      case "abandoned":
        return svgCancel;
      case undefined:
        return svgInProgress;
    }
}

/**
 *@description Create the HTML elements prepending the build container based on the settings
 * @param widgetSettings object?
 * @returns {Promise<void>}
 */
async function buildWidgetHeader(widgetSettings)
{
    let settingsTag = JSON.parse(widgetSettings?.customSettings?.data)?.defaultTag ?? "all"
    if(!initialized)
    {
        await timelineClient.getTags(projectId).then(function (tags) {
            console.debug(tags)
            if(tags.length > 0)
            {
                console.debug(`Tags found are ${tags.join(",").toString()}`)
                tags.sort().forEach(tag => {
                    let newOption = document.createElement('option');
                    newOption.setAttribute('value', tag);
                    newOption.text = tag;
                    defaultTagDropdown.append(newOption);
                });
            }
            if(tags == [] || !tags.includes(settingsTag))
            {
                console.debug(`The selected tag ${settingsTag} is no longer present in the pipelines. \n
            Reverting to default "all" tags"`)
                defaultTagDropdown.value = 'all'
            }
            else {
                console.debug(`Setting current tag filter to ${settingsTag}`)
                defaultTagDropdown.value = settingsTag;
            }
        });
    }
    if(initialized)
    {
        const opts = document.querySelectorAll("select option");
        let tags = [...opts]
            .map(el => el.value);
        if(tags == [] || !tags.includes(settingsTag))
        {
            console.debug(`The selected tag ${settingsTag} is no longer present in the pipelines. \n
                    Reverting to default "all" tags"`)
            defaultTagDropdown.value = 'all'
        }
        else {
            console.debug(`Setting current tag filter to ${settingsTag}`)
            defaultTagDropdown.value = settingsTag;
        }
    }
    defaultTagDropdown.onchange = async function() {

        if(initialized && !reloading)
        {
            buildTag = defaultTagDropdown.value;
            await ResetUI();
        }
    }
}

VSS.require(["TFS/Dashboards/WidgetHelpers", "TFS/Build/RestClient"], 
function (WidgetHelpers, TFS_Build_webApi) {
    WidgetHelpers.IncludeWidgetStyles();
    VSS.register("DeploymentsWidget", async function () {
        console.debug("Preparing setup for the widget data");
        projectId = VSS.getWebContext().project.id;
        timelineClient = TFS_Build_webApi.getClient();
        defaultTagDropdown =  document.getElementById("build-tag-dropdown");
        
        return {
            //Triggered when entering the dashboard
            load: async function (widgetSettings) {
                try {
                    console.debug("Loading widget data");
                    await  buildWidgetHeader(widgetSettings);
                    await GetBuildWidget(widgetSettings);
                    return WidgetHelpers.WidgetStatusHelper.Success();
                } catch (error) {
                    console.debug(`Hit an error while loading: ${error}`);
                }
            },
            // Triggered when clicking "reload" or changing branch in the configuration
            reload: async function(widgetSettings) {
                try {
                    console.debug("Updating widget data");
                    reloading = true;
                    await buildWidgetHeader(widgetSettings);
                    reloading = false;
                    await GetBuildWidget(widgetSettings);
                    return WidgetHelpers.WidgetStatusHelper.Success();
                } catch (error) {
                    console.debug(`Hit an error while loading: ${error}`);
                }
            }
        }
    });
    console.debug("The widget was successfully loaded");
    VSS.notifyLoadSucceeded();
});