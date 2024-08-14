import {IHostContext, IUserContext} from "azure-devops-extension-sdk";
import {EventArgs, Size} from "@tucrail/azure-devops-extension-api/Dashboard/WidgetContracts";
import {WidgetSettings, WidgetStatus} from "./@tucrail/azure-devops-extension-api/Dashboard";
import {CommonServiceIds} from "@tucrail/azure-devops-extension-api/Common";


/**
 * Mocking SDK's init function to return
 * resolve(successful execution/init) to activate the .then block
 */
export function init() : Promise<void> {
    return new Promise((resolve, reject) => resolve());
}

export let spyWidgetCallBackAccessor: IWidget;


type IWidget = () => {
    /** widgets use the settings provided along with the any cached data they may have to paint an interactive state. No network calls should be made by the widget.
     *  @param {WidgetSettings} settings of the widget as available when the widget render is called by the host.
     *  @returns object wrapped in a promise that encapsulates the success of this operation.
     *          when this calls are completed and the experience is done loading.
     */
    preload: (widgetSettings: WidgetSettings) => Promise<WidgetStatus>;
    /**
     *  Widgets use the settings provided as well as server side calls to complete their rendering experience.
     *  In the future, widgets are expected to provide a loading experience while the calls are being waited to be completed.
     *  Until then, the widget host will provide the loading experience
     *  @param {WidgetSettings} settings of the widget as available when the widget render is called by the host.
     *  @returns object wrapped in a promise that encapsulates the success of this operation.
     *          when this calls are completed and the experience is done loading.
     */
    load: (widgetSettings: WidgetSettings) => Promise<WidgetStatus>;
    /**
     * Widgets manage any operations that are not necessary for initial load but are required for the full widget experience.
     */
    onDashboardLoaded?: () => void;
    /**
     * The framework calls this method to determine if the widget should be disabled for users with stakeholder license
     * @param {WidgetSettings} settings of the widget as available when the widget render is called by the host.
     * @returns A boolean wrapped in a promise that determines if the widget should be disabled for users with stakeholder license
     */
    disableWidgetForStakeholders?: (widgetSettings: WidgetSettings) => Promise<boolean>;
    /**
     *  Run widget in lightboxed mode
     *  @param {WidgetSettings} settings of the widget as available when the widget render is called by the host.
     *  @param {LightboxSize} size of the lightbox
     *  @returns object wrapped in a promise that encapsulates the success of this operation.
     *          when this calls are completed and the experience is done loading.
     */
    lightbox?: (widgetSettings: WidgetSettings, lightboxSize: Size) => Promise<WidgetStatus>;
    /**
     *  Listen to message from host
     * @param {string} type of event
     * @param {eventArgs} arguments associated with the event.
     */
    listen?: <T>(event: string, eventArgs: EventArgs<T>) => void;
}

export function register(instanceId: string, instance: IWidget) : void {
    spyWidgetCallBackAccessor = instance;
}

/**
 * Indirect accessor to mocked getConfiguration values
 * here for "RepositoryId" with defaultValue "gitrepo".
 * The value can be overwritten in the test file by importing mockRepositoryId
 * and calling mockRepositoryId.mockReturnValue("other_value")
 */
export const mockRepositoryId = jest.fn().mockReturnValue("gitrepo");

/**
 * Mocking SDK.getConfiguration(), will return witInput parameters for all controls
 */
export function getConfiguration() {
    return {
        witInputs: {
            AppInsightsInstrumentationKey: "",
            LoggingLevel: "0",
            baseEndpointURL: "https://localhost:5000",
            DevOpsBaseUrl: "https://dev.azure.com/",
            RepositoryId: mockRepositoryId(),
            ProjectName: "react-unit-test",
            BranchName: "master",
            FieldName: "myField"
        }
    }
}

/**
 * Mocking SDK.getHost() and provide fixed values
 */
export function getHost(): IHostContext {
    return {
        id: "react-unit-test",
        name: "react-unit-test",
        isHosted: false,
        serviceVersion: "mockedVersion",
        type: 1
    }
}

/**
 * Mocking SDK.getUser() and provide fixed values
 */
export function getUser() : IUserContext {
    return {
        descriptor: "aad.base64",
        id: "jestwagner",
        displayName: "Jest Wagner",
        imageUrl: "https://someimageurl/jw.png",
        name: "jestwagner@email.com",
    }
}


export const mockGetProject = jest.fn().mockReturnValue({
    id: "buildClient",
    name: "buildClient"
});

/**
 * Mocked getService returns mocked methods
 */
export function getService(contributionId: string) {

    switch(contributionId) {
        case CommonServiceIds.ProjectPageService:
            return {
                // WorkItemFormService
                getProject: mockGetProject,
            }
    }
}

export function resize(width?: number, height?: number) {
    if(width && width <= 0)
    {
        throw new Error("Width must be greater than 0");
    }
    if(height && height <= 0)
    {
        throw new Error("Height must be greater than 0");
    }
}