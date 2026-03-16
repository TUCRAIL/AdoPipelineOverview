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
};

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

describe("Configuration Export Behavior", () => {

    beforeEach(() => {
        resetMocks();
        jest.clearAllMocks();
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
        const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);

        const exportButton = screen.getByText("Export Saved Configuration");
        fireEvent.click(exportButton);

        expect(createElementSpy).toHaveBeenCalledWith('a');
        
        // Verify that the exported data matches savedData, not the current state
        const exportedString = (mockAnchor.setAttribute as jest.Mock).mock.calls.find(call => call[0] === 'href')[1];
        const decodedJson = JSON.parse(decodeURIComponent(exportedString.replace("data:text/json;charset=utf-8,", "")));
        
        expect(decodedJson.definitionName).toBe("SavedDefinition");
        expect(decodedJson.buildCount).toBe(10);

        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
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
            selectedBranch: "develop",
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
        const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);

        const exportButton = screen.getByText("Export Saved Configuration");
        fireEvent.click(exportButton);

        const exportedString = (mockAnchor.setAttribute as jest.Mock).mock.calls.find(call => call[0] === 'href')[1];
        const decodedJson = JSON.parse(decodeURIComponent(exportedString.replace("data:text/json;charset=utf-8,", "")));
        
        expect(decodedJson.definitionName).toBe("NewDefinition");
        expect(decodedJson.buildCount).toBe(20);
        expect(decodedJson.buildDefinition).toBe(2);
        expect(decodedJson.buildBranch).toBe("refs/heads/develop"); // validateConfiguration adds refs/heads/

        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
    });
});
