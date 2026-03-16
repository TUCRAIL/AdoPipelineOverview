import type {IListBoxItem} from "azure-devops-ui/ListBox";
import type {ISelectionRange} from "azure-devops-ui/Utilities/Selection";

/**
 * Builds a comma-separated string of item IDs from a multi-selection dropdown.
 * @param items The full list of dropdown items
 * @param selectionRanges The selected ranges from a DropdownMultiSelection
 * @param emptyValue The value to return when no items are selected
 * @returns A comma-separated string of selected item IDs, or emptyValue if nothing is selected
 */
export function buildSelectionString(items: IListBoxItem[], selectionRanges: ISelectionRange[], emptyValue: string): string {
	const ids: string[] = [];
	for (let i = 0; i < selectionRanges.length; i++) {
		const selectionRange = selectionRanges[i];
		for (let j = selectionRange.beginIndex; j <= selectionRange.endIndex; j++) {
			ids.push(items[j].id!);
		}
	}
	return ids.length === 0 ? emptyValue : ids.join(',');
}

/**
 * Triggers a browser download of the given data as a JSON file.
 * @param data The JSON string to export
 * @param filename The name of the downloaded file
 */
export function exportJsonAsFile(data: string, filename: string): void {
	const blob = new Blob([data], {type: "application/json"});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
