export const RESET_DATA_LABEL = '清空本地数据';
export const RESET_CONFIRMATION_MESSAGE = '这会清空本地阅读统计，并将提醒设置恢复默认值。确认继续吗？';

type ConfirmFn = (message?: string) => boolean;

export function shouldResetLocalData(confirmFn: ConfirmFn): boolean {
  return confirmFn(RESET_CONFIRMATION_MESSAGE);
}
