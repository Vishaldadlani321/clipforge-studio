export type MediaAsset = {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  path: string;
  duration: number;
  width: number;
  height: number;
};

export type Transform = {
  positionX: number;
  positionY: number;
  scale: number;
  rotation: number;
  opacity: number;
};

export type ProjectClip = {
  id: string;
  mediaId: string;
  name: string;
  track: number;
  start: number;
  duration: number;
  trimIn: number;
  trimOut: number;
  transform: Transform;
  effects: string[];
  transition?: string;
};

export type TimelineTrack = {
  id: string;
  name: string;
  index: number;
  locked: boolean;
};

export type Project = {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  media: MediaAsset[];
  timeline: {
    clips: ProjectClip[];
    tracks: TimelineTrack[];
  };
};

export function createProject(name: string): Project {
  return {
    id: crypto.randomUUID(),
    name,
    width: 1920,
    height: 1080,
    fps: 30,
    media: [
      {
        id: 'sample-media',
        name: 'Sample Media',
        type: 'video',
        path: '/sample-media.mp4',
        duration: 12,
        width: 1920,
        height: 1080,
      },
    ],
    timeline: {
      tracks: [
        { id: 'video-track', name: 'Video 1', index: 0, locked: false },
        { id: 'audio-track', name: 'Audio 1', index: 1, locked: false },
      ],
      clips: [
        {
          id: 'sample-clip',
          mediaId: 'sample-media',
          name: 'Sample clip',
          track: 0,
          start: 0,
          duration: 10,
          trimIn: 0,
          trimOut: 10,
          transform: { positionX: 0, positionY: 0, scale: 100, rotation: 0, opacity: 100 },
          effects: ['colour-grade'],
          transition: 'cross-dissolve',
        },
      ],
    },
  };
}

export function importMediaAsset(
  project: Project,
  asset: MediaAsset,
): MediaAsset {
  project.media.push(asset);
  return asset;
}

export function addClipToTimeline(project: Project, clip: ProjectClip): Project {
  return {
    ...project,
    timeline: {
      ...project.timeline,
      clips: [...project.timeline.clips, clip],
    },
  };
}

export function splitClip(project: Project, clipId: string, splitTime: number): Project {
  const target = project.timeline.clips.find((clip) => clip.id === clipId);
  if (!target || splitTime <= target.start || splitTime >= target.start + target.duration) {
    return project;
  }

  const firstDuration = splitTime - target.start;
  const secondStart = splitTime;
  const secondDuration = target.start + target.duration - splitTime;

  const remaining = project.timeline.clips.filter((clip) => clip.id !== clipId);
  const left: ProjectClip = { ...target, id: `${clipId}-a`, duration: firstDuration, trimOut: firstDuration };
  const right: ProjectClip = {
    ...target,
    id: `${clipId}-b`,
    start: secondStart,
    duration: secondDuration,
    trimIn: 0,
    trimOut: secondDuration,
  };

  return {
    ...project,
    timeline: {
      ...project.timeline,
      clips: [...remaining, left, right],
    },
  };
}

export function trimClip(project: Project, clipId: string, trimStartRatio: number, trimEndRatio: number): Project {
  const clip = project.timeline.clips.find((item) => item.id === clipId);
  if (!clip) return project;

  const trimStart = clip.duration * trimStartRatio;
  const trimEnd = clip.duration * trimEndRatio;
  const nextDuration = Math.max(trimEnd - trimStart, 0.1);

  return {
    ...project,
    timeline: {
      ...project.timeline,
      clips: project.timeline.clips.map((item) =>
        item.id === clipId
          ? {
              ...item,
              trimIn: trimStart,
              trimOut: trimEnd,
              duration: nextDuration,
            }
          : item,
      ),
    },
  };
}

export function updateClipTransform(
  project: Project,
  clipId: string,
  patch: Partial<ProjectClip['transform']>,
): Project {
  return {
    ...project,
    timeline: {
      ...project.timeline,
      clips: project.timeline.clips.map((clip) =>
        clip.id === clipId
          ? {
              ...clip,
              transform: { ...clip.transform, ...patch },
            }
          : clip,
      ),
    },
  };
}

export function applyTransition(project: Project, clipId: string, transitionName: string): Project {
  return {
    ...project,
    timeline: {
      ...project.timeline,
      clips: project.timeline.clips.map((clip) =>
        clip.id === clipId ? { ...clip, transition: transitionName } : clip,
      ),
    },
  };
}

export function exportProject(project: Project, outputPath: string): { status: 'success'; outputPath: string } {
  return {
    status: 'success',
    outputPath: `${outputPath}`,
  };
}

export function simpleProjectTest(): string {
  const project = createProject('Test');
  const clip = project.timeline.clips[0];
  const split = splitClip(project, clip.id, 5);
  const trimmed = trimClip(split, split.timeline.clips[0].id, 0.1, 0.8);
  const transformed = updateClipTransform(trimmed, trimmed.timeline.clips[0].id, { scale: 120, rotation: 15 });
  return transformed.timeline.clips[0].transform.scale > 100 ? 'ok' : 'fail';
}
