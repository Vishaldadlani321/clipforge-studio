import { describe, expect, it } from 'vitest';
import { createProject, splitClip, trimClip, updateClipTransform, exportProject } from './project';

describe('Clipforge Studio project logic', () => {
  it('creates a valid project with default tracks and clips', () => {
    const project = createProject('Milestone 1');
    expect(project.name).toBe('Milestone 1');
    expect(project.timeline.tracks.length).toBeGreaterThan(0);
    expect(project.timeline.clips.length).toBeGreaterThan(0);
  });

  it('splits a clip at a valid boundary and keeps the timeline consistent', () => {
    const project = createProject('Split test');
    const clip = project.timeline.clips[0];
    const split = splitClip(project, clip.id, 5);
    expect(split.timeline.clips.length).toBe(2);
    expect(split.timeline.clips[0].duration).toBeLessThan(clip.duration);
  });

  it('trims a clip duration according to the supplied ratio', () => {
    const project = createProject('Trim test');
    const clip = project.timeline.clips[0];
    const trimmed = trimClip(project, clip.id, 0.1, 0.8);
    expect(trimmed.timeline.clips[0].duration).toBeLessThan(clip.duration);
  });

  it('updates transform values on the selected clip', () => {
    const project = createProject('Transform test');
    const clip = project.timeline.clips[0];
    const updated = updateClipTransform(project, clip.id, { scale: 120, rotation: 15 });
    expect(updated.timeline.clips[0].transform.scale).toBe(120);
    expect(updated.timeline.clips[0].transform.rotation).toBe(15);
  });

  it('creates an export descriptor that can be fed to the app export flow', () => {
    const project = createProject('Export test');
    const exported = exportProject(project, './output/clipforge-export.mp4');
    expect(exported.status).toBe('success');
    expect(exported.outputPath).toContain('.mp4');
  });
});
