export const MEDICAL_DISCLAIMER_SUMMARY = '本扩展只提供日常休息提醒与本地统计，不替代医生诊疗、处方或医疗建议。';
export const DOCTOR_PRIORITY_NOTICE = '如果医生给了更具体的用眼方案，请优先遵循医生建议。';
export const DISCOMFORT_NOTICE = '如果出现疼痛、视物模糊或明显不适，请停止使用并咨询专业医生。';
export const LOCAL_PRIVACY_NOTICE = '阅读统计、健康报告和版本预览都只保存在当前浏览器本地，不会上传到远端服务器。';

export function getPopupHealthDisclaimer(): string {
  return `${MEDICAL_DISCLAIMER_SUMMARY} ${DOCTOR_PRIORITY_NOTICE}`;
}

export function getOptionsHealthNoticeLines(): string[] {
  return [MEDICAL_DISCLAIMER_SUMMARY, DOCTOR_PRIORITY_NOTICE, DISCOMFORT_NOTICE, LOCAL_PRIVACY_NOTICE];
}
