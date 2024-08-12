import {SemanticVersion} from "azure-devops-extension-api/Dashboard/Dashboard";
import {EventArgs, SaveStatus, Size} from "azure-devops-extension-api/Dashboard/WidgetContracts";

export enum WidgetStatusType {
    /**
     * The widget loaded successfully
     */
    Success = 0,
    /**
     * The widget failed to load
     */
    Failure = 1,
    /**
     * The widget needs to be configured
     */
    Unconfigured = 2
}


export interface WidgetStatus {
    /**
     * the rendered state of the widget serialized to a string.
     */
    state?: string;
    /**
     * Used to determine which widget status helper was called
     */
    statusType?: WidgetStatusType;
}

export class WidgetStatusHelper {
    /**
     * method to encapsulate a successful result for a widget loading operation (load, reload, openLightbox etc)
     * @param state any state information to be passed to the initiator of the loading call.
     * @param title title for the lightbox of a widget when available.
     * @returns promise encapsulating the status of the widget loading operations.
     */
    static Success(state?: string): Promise<WidgetStatus> {
        return new Promise((resolve) => {
            resolve({ statusType: WidgetStatusType.Success, state: state });
        })
    };
    /**
     * method to encapsulate a failed result for a widget loading operation (load, reload, openLightbox etc)
     * @param message message to display as part within the widget error experience.
     * @param isUserVisible indicates whether the message should be displayed to the user or a generic error message displayed. Defaults to true.
     * @param isRichText indicates whether the message is an html that can be rendered as a rich experience. Defaults to false. Only trusted extensions are
     * allowed to set this to true. For any 3rd party widgets passing this value as true, it will be ignored.
     * @returns promise encapsulating the status of the widget loading operations.
     */
    static Failure(message: string, isUserVisible?: boolean, isRichText?: boolean): Promise<WidgetStatus> {
        return new Promise((resolve) => {
            resolve({ statusType: WidgetStatusType.Failure, state: message });
        })
    };
    /**
     * method to encapsulate a result for a widget loading operation that results in the widget being in an unconfigured state.
     * @returns promise encapsulating the status of the widget loading operations.
     */
    static Unconfigured(): Promise<WidgetStatus> {
        return new Promise((resolve) => {
            resolve({ statusType: WidgetStatusType.Unconfigured });
        })
    };
}

export interface WidgetSize {
    /**
     * The Width of the widget, expressed in dashboard grid columns.
     */
    columnSpan: number;
    /**
     * The height of the widget, expressed in dashboard grid rows.
     */
    rowSpan: number;
}

export interface CustomSettings {
    /**
     * the settings data serialized as a string.
     */
    data: string;
    /**
     * (Optional) version for the settings represented as a semantic version object.
     * If none is available, the version defaults to {major:1, minor:0, patch:0} or "1.0.0"
     */
    version?: SemanticVersion;
}

export interface LightboxOptions {
    /**
     * Height of desired lightbox, in pixels
     */
    height: number;
    /**
     * True to allow lightbox resizing, false to disallow lightbox resizing, defaults to false.
     */
    resizable: boolean;
    /**
     * Width of desired lightbox, in pixels
     */
    width: number;
}

export interface WidgetSettings {
    /**
     * size of the widget (in case of configuration, this maps to the size sub section in the general section of the configuration panel)
     */
    size: WidgetSize;
    /**
     * name of the widget (in case of configuration, this maps to the name sub section in the general section of the configuration panel)
     */
    name: string;
    /**
     * settings of the widget
     */
    customSettings: CustomSettings;
    /**
     * Lightbox options
     */
    lightboxOptions?: LightboxOptions;
}

export class NotifyResult {
    /**
     * Gets a response from the subscriber of the notification, if they provide one as part of the schema for the event.
     * @returns A promise with the data representing the return payload serialized as a string.
     */
    getResponse(): Promise<string> {
        return new Promise((resolve) => {
            resolve("");
        });
    }
}

export class IWidgetConfigurationContext {
    public notify<T>(event: string, eventArgs: EventArgs<T>)  : Promise<NotifyResult> {
        const notifyResult = new NotifyResult();
        if(event === ConfigurationEvent.ConfigurationChange) {
            console.log("Configuration has been changed to the following : \n" +
            JSON.stringify(eventArgs.data));
            return new Promise((resolve) => {
                resolve(notifyResult);
            });
        }
        else {
            throw new Error("Event not supported");
        }
    }
}

export class ConfigurationEvent {
    /**
     * Configuration has changed. When this event is notified, the preview is updated and Save button is enabled.
     *
     * The payload expected when notifying this event: { data: customSettings }
     *
     * {customSettings} is the serialized custom config settings pertaining to the widget.
     */
    static ConfigurationChange: string;
    /**
     * Configuration tries to execute API calls and fails. When this event is notified, the config does not render a view and we pass an error message to the configuration host.
     *
     * The payload expected when notifying this event: { data: string }
     *
     * {string} is the error message that is displayed at the top of the configuration.
     */
    static ConfigurationError: string;
    /**
     * Widget configuration general settings changed. When this event is notified, the widget name or widget size is updated.
     *
     * The payload expected when notifying this event: { data: { IGeneralSettings } }
     *
     * {generalSettings} is the serialized object containing WidgetName and WidgetSize
     */
    static GeneralSettingsChanged: string;
    /**
     * @param payload the event arguments we pass when we want to notify the configuration.
     */
    static Args<T>(payload: T): EventArgs<T> {
        return { data: payload };
    }
}

export class WidgetConfigurationSave {
    /**
     * method to encapsulate a valid state that is returned by the widget configuration
     * @param customSettings settings from the widget configuration to be returned as part of this state.
     * @returns promise encapsulating the state being returned.
     */
    static Valid(customSettings: CustomSettings): Promise<SaveStatus> {
        console.log("Widget configuration has been validated with the following settings : \n" +
        JSON.stringify(customSettings));
        return new Promise((resolve) => {
            resolve({ customSettings: customSettings, isValid: true });
        });
    }
    /**
     * method to encapsulate an invalid state that is returned by the widget configuration
     * @returns promise encapsulating the state being returned.
     */
    static Invalid(): Promise<SaveStatus> {
        console.error("Widget configuration is invalid");
        return new Promise((resolve) => {
            resolve({ isValid: false });
        });
    }
}


