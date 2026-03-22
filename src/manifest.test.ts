import { describe, expect, it } from 'vitest';

import manifest from '../public/manifest.json';

describe('manifest', () => {
  it('keeps the WeRead content script in the default isolated world so extension APIs remain available', () => {
    expect('world' in (manifest.content_scripts?.[0] ?? {})).toBe(false);
  });

  it('keeps scripting permission and requests other sites through optional host permissions', () => {
    expect(manifest.permissions).toContain('scripting');
    expect(manifest.optional_host_permissions).toEqual(expect.arrayContaining(['http://*/*', 'https://*/*']));
  });

  it('does not expose the old page runner or MediaPipe assets anymore', () => {
    const resources = (
      manifest as typeof manifest & {
        web_accessible_resources?: Array<{
          matches?: string[];
          resources?: string[];
        }>;
      }
    ).web_accessible_resources;
    const hasLegacyVisionResource = resources?.some(
      (entry) =>
        entry.matches?.includes('https://*/*') &&
        ((entry.resources?.includes('page/main.js') ?? false) ||
          (entry.resources?.includes('assets/mediapipe/models/face_landmarker.task') ?? false) ||
          (entry.resources?.includes('assets/mediapipe/wasm/*') ?? false))
    );

    expect(hasLegacyVisionResource ?? false).toBe(false);
  });

  it('exposes the bundled reminder audio to any supported page', () => {
    const resources = (
      manifest as typeof manifest & {
        web_accessible_resources?: Array<{
          matches?: string[];
          resources?: string[];
        }>;
      }
    ).web_accessible_resources;

    const hasReminderAudioResource = resources?.some(
      (entry) =>
        entry.matches?.includes('https://*/*') && (entry.resources?.includes('audio/reminder.m4a') ?? false)
    );

    expect(hasReminderAudioResource ?? false).toBe(true);
  });
});
