// TODO: Replace with new TextField Props after migration to new TextField has completed
// import {TextFieldProps} from '../../../typings/components/Inputs';

// Note: enum values are uppercase due to legacy
export let PickerModes;
(function (PickerModes) {
  PickerModes["SINGLE"] = "SINGLE";
  PickerModes["MULTI"] = "MULTI";
})(PickerModes || (PickerModes = {}));
export let PickerFieldTypes;

// TODO: Remove type
// type PickerValueDeprecated = {value: string | number; label: string};
(function (PickerFieldTypes) {
  PickerFieldTypes["form"] = "form";
  PickerFieldTypes["filter"] = "filter";
  PickerFieldTypes["settings"] = "settings";
})(PickerFieldTypes || (PickerFieldTypes = {}));