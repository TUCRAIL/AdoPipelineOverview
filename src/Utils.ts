import { IListBoxItem } from "azure-devops-ui/ListBox";
import { DropdownMultiSelection } from "azure-devops-ui/Utilities/DropdownSelection";

/**
 * Converts a multi-selection into a comma-separated string of IDs.
 * Returns emptyValue if the selection is empty.
 * @param selection The multi-selection object
 * @param items The list of items in the dropdown
 * @param emptyValue The value to return if nothing is selected
 */
export function getSelectionString(selection: DropdownMultiSelection, items: IListBoxItem[], emptyValue: string = "all"): string {
    let newState = "";
    for (let i = 0; i < selection.value.length; i++) {
        const selectionRange = selection.value[i];
        for (let j = selectionRange.beginIndex; j <= selectionRange.endIndex; j++) {
            newState += items[j].id + ",";
        }
    }
    if (newState.endsWith(',')) {
        newState = newState.substring(0, newState.length - 1);
    }
    return newState === "" ? emptyValue : newState;
}

/**
 * Populates a list of items for a dropdown from a list of strings.
 * @param strings The list of strings to convert to items
 * @param textTransformer Optional function to transform the display text
 */
export function stringsToItems(strings: string[], textTransformer?: (s: string) => string): IListBoxItem[] {
    return strings.sort().map(s => ({
        id: s,
        text: textTransformer ? textTransformer(s) : s
    }));
}

/**
 * Restores selection in a DropdownMultiSelection from a comma-separated string of IDs.
 * @param selection The multi-selection object
 * @param items The list of items in the dropdown
 * @param selectionString The comma-separated string of IDs
 * @param options Optional settings for selection restoration
 * @returns true if any items were found and selected (or if "all" was handled)
 */
export function restoreSelection(selection: DropdownMultiSelection, items: IListBoxItem[], selectionString: string | undefined, options?: { makeAllUnselectable?: boolean, idTransformer?: (id: string) => string }): boolean {
    if (!selectionString || selectionString === "" || selectionString === "none") {
        return false;
    }
    if (selectionString === "all") {
        if (options?.makeAllUnselectable) {
            selection.addUnselectable(0, items.length);
        }
        return true;
    }
    const selectedIds = selectionString.split(",").map(s => {
        const trimmed = s.trim();
        return options?.idTransformer ? options.idTransformer(trimmed) : trimmed;
    });
    let foundAny = false;
    for (const id of selectedIds) {
        const index = items.findIndex((item) => item.id === id);
        if (index !== -1) {
            foundAny = true;
            selection.select(index, undefined, true, true);
        }
    }
    return foundAny;
}

/**
 * Gets the list of branches to fetch from Azure DevOps based on selection string.
 * @param selectedBranches Comma-separated selection string (e.g., "all", "refs/heads/main,refs/heads/dev")
 */
export function getBranchesToFetch(selectedBranches: string): (string | undefined)[] {
    return selectedBranches === 'all'
        ? [undefined]
        : selectedBranches === 'none' || selectedBranches === ''
            ? []
            : selectedBranches.split(',').map(b => b.trim());
}

/**
 * Gets the list of tags to fetch from Azure DevOps based on selection string.
 * @param selectedTag Comma-separated selection string (e.g., "all", "tag1,tag2")
 */
export function getTagsToFetch(selectedTag: string | undefined): (string | undefined)[] {
    return selectedTag === 'all' ? [undefined] : selectedTag?.split(',') ?? [];
}

/**
 * Exports a string content as a JSON file.
 * @param content The string content to export
 * @param fileName The name of the file to be downloaded
 */
export function exportToJsonFile(content: string, fileName: string): void {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
