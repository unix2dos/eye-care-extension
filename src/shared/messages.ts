export const TOOLBAR_ICON_STATE_COMMAND = 'toolbar-icon-state';

export interface ToolbarIconStateMessage {
  type: typeof TOOLBAR_ICON_STATE_COMMAND;
  isSupportedPage: boolean;
  isActiveReading: boolean;
}
