export const TOOLBAR_ICON_STATE_COMMAND = 'toolbar-icon-state';
export const REQUEST_RUNTIME_STATUS_COMMAND = 'request-runtime-status';

export interface ToolbarIconStateMessage {
  type: typeof TOOLBAR_ICON_STATE_COMMAND;
  isSupportedPage: boolean;
  isActiveReading: boolean;
}

export interface RequestRuntimeStatusMessage {
  type: typeof REQUEST_RUNTIME_STATUS_COMMAND;
}
