jest.mock('../../Common');

import {render, screen, fireEvent} from "@testing-library/react";
import {ConfigurationWidget} from "../../configuration";
import {spyWidgetCallBackAccessor} from "../../__mocks__/azure-devops-extension-sdk";
import {WidgetSettings} from "@tucrail/azure-devops-extension-api/Dashboard";
import {IWidgetConfigurationContext} from "../../__mocks__/@tucrail/azure-devops-extension-api/Dashboard";
import React from "react";
import {resetMocks} from "../../__mocks__/Common";

// Mock document methods
const mockAnchor = {
    setAttribute: jest.fn(),
    click: jest.fn(),
    remove: jest.fn(),
    href: "",
    download: ""
};

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

describe("Configuration Export Behavior", () => {

    beforeEach(() => {
        resetMocks();
        jest.clearAllMocks();
        
        // Mock URL methods
        window.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
        window.URL.revokeObjectURL = jest.fn();
    });

    test("Export button should use saved configuration from load, not current state", async () => {
        const savedData = JSON.stringify({ 
            definitionName: "SavedDefinition", 
            buildCount: 10,
            buildDefinition: 1,
            buildBranch: "master",
            defaultTag: "all",
            showStages: true,
            matchAnyTag: false
        });

        render(<ConfigurationWidget />);
        await delay(100); // Wait for SDK.init() and register()
        
        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;
        
        const settings: WidgetSettings = {
            customSettings: { data: savedData }
        } as any;
        
        await widget.load(settings, new IWidgetConfigurationContext());
        await delay(100);

        // Change state to simulate editing (but NOT saving)
        widget.setState({ buildCount: 5 });
        // @ts-ignore
        widget.selectedBuildDefinition.value = "EditedDefinition";
        await delay(100);

        // Mock document methods ONLY for the export call
        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
        const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
        const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

        // Test Export Saved Configuration
        const exportSavedButton = screen.getByText("Export Saved Configuration");
        fireEvent.click(exportSavedButton);

        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect((widget as any).persistedConfigurationData).toBe(savedData);
        expect(mockAnchor.download).toBe("widget-configuration-saved.json");

        // Test Export Working Configuration
        const exportWorkingButton = screen.getByText("Export Working Configuration");
        fireEvent.click(exportWorkingButton);

        expect((widget as any).workingConfigurationData).toContain('"buildCount":5');
        expect(mockAnchor.download).toBe("widget-configuration-working.json");
        
        // Let's also check if createObjectURL was called with the right data
        // (Blob content is tricky to check in jsdom, but we can verify the mock was called)
        expect(window.URL.createObjectURL).toHaveBeenCalled();

        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
    });

    test("Export button should reflect newly saved configuration after onSave", async () => {
        const initialData = JSON.stringify({ 
            definitionName: "Initial", 
            buildCount: 10,
            buildDefinition: 1,
            buildBranch: "master",
            defaultTag: "all",
            showStages: true,
            matchAnyTag: false
        });

        render(<ConfigurationWidget />);
        await delay(100); // Wait for SDK.init() and register()
        
        // @ts-ignore
        const widget = spyWidgetCallBackAccessor as ConfigurationWidget;
        
        const settings: WidgetSettings = {
            customSettings: { data: initialData }
        } as any;
        
        await widget.load(settings, new IWidgetConfigurationContext());
        await delay(100);

        // Change state and SAVE
        widget.setState({ 
            buildCount: 20,
            selectedBuildDefinitionId: 2,
            selectedBranches: "develop",
            selectedTag: "tag1",
            showStages: false,
            matchAnyTagSelected: true
        });
        // @ts-ignore
        widget.selectedBuildDefinition.value = "NewDefinition";
        await delay(100);
        
        await widget.onSave();

        // Mock document methods ONLY for the export call
        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
        const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
        const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

        const exportSavedButton = screen.getByText("Export Saved Configuration");
        fireEvent.click(exportSavedButton);

        expect((widget as any).persistedConfigurationData).toContain('"buildCount":20');
        expect((widget as any).persistedConfigurationData).toContain('"definitionName":"NewDefinition"');
        expect(mockAnchor.download).toBe("widget-configuration-saved.json");

        const exportWorkingButton = screen.getByText("Export Working Configuration");
        fireEvent.click(exportWorkingButton);

        expect((widget as any).workingConfigurationData).toContain('"buildCount":20');
        expect(mockAnchor.download).toBe("widget-configuration-working.json");

        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
    });
});
