import { SELECT_RANGE, SCROLL } from "../constants";

export const selectRange = selectedRange => {
	return {
		type: SELECT_RANGE,
		selectedRange
	};
};

export const selectCell = cell => {
	return {
		type: SELECT_RANGE,
		selectedRange: {
			selectedCellStart: cell,
			selectedCellEnd: cell
		}
	};
};

export const scrollToIndex = (scrollToRow, scrollToColumn) => {
	return {
		type: SCROLL,
		scrollToRow,
		scrollToColumn
	};
};
