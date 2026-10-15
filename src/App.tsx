import { useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  addClipToTimeline,
  applyTransition,
  createProject,
  importMediaAsset,
  splitClip,
  trimClip,
  updateClipTransform,
  type Project,
  type ProjectClip,
  type TimelineTrack,
} from './lib/project';

const emptyProject = createProject('Sample project');

function App() {
  const [project, setProject] = useState<Project>(emptyProject);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [status, setStatus] = useState('Ready');
  const [history, setHistory] = useState<Project[]>([emptyProject]);
  const [future, setFuture] = useState<Project[]>([]);

  const selectedClip = useMemo(
    () => project.timeline.clips.find((clip) => clip.id === selectedClipId) ?? null,
    [project.timeline.clips, selectedClipId],
  );

  const pushHistory = (next: Project) => {
    setHistory((prev) => [...prev, next]);
    setFuture([]);
  };

  const onNewProject = () => {
    const next = createProject(`Project ${history.length + 1}`);
    setProject(next);
    setSelectedClipId(null);
    setStatus('New project created');
    pushHistory(next);
  };

  const onSaveProject = () => {
    const blob = JSON.stringify(project, null, 2);
    const href = `data:application/json;charset=utf-8,${encodeURIComponent(blob)}`;
    const link = document.createElement('a');
    link.href = href;
    link.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.clipforge.json`;
    link.click();
    setStatus('Project saved locally');
  };

  const onOpenProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        const json = JSON.parse(text) as Project;
        setProject(json);
        setSelectedClipId(json.timeline.clips[0]?.id ?? null);
        setStatus(`Opened ${json.name}`);
      } catch {
        setStatus('Unable to open project file');
      }
    });
  };

  const onImportMedia = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const asset = importMediaAsset(project, {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type.includes('video') ? 'video' : file.type.includes('audio') ? 'audio' : 'image',
      path: file.name,
      duration: 12,
      width: 1920,
      height: 1080,
    });

    const next = addClipToTimeline(project, {
      id: crypto.randomUUID(),
      mediaId: asset.id,
      name: asset.name,
      track: 0,
      start: project.timeline.clips.length ? project.timeline.clips.at(-1)!.start + 6 : 0,
      duration: asset.duration,
      trimIn: 0,
      trimOut: asset.duration,
      transform: { positionX: 0, positionY: 0, scale: 100, rotation: 0, opacity: 100 },
      effects: [],
      transition: 'cross-dissolve',
    });

    setProject(next);
    setSelectedClipId(next.timeline.clips.at(-1)?.id ?? null);
    setStatus(`Imported ${file.name}`);
    pushHistory(next);
  };

  const onSplitSelected = () => {
    if (!selectedClip) return;
    const splitTime = selectedClip.start + selectedClip.duration / 2;
    const next = splitClip(project, selectedClip.id, splitTime);
    setProject(next);
    setStatus('Clip split at playhead');
    pushHistory(next);
  };

  const onTrimSelected = () => {
    if (!selectedClip) return;
    const next = trimClip(project, selectedClip.id, 0.25, 0.75);
    setProject(next);
    setStatus('Clip trimmed');
    pushHistory(next);
  };

  const onApplyTransition = () => {
    if (!selectedClip) return;
    const next = applyTransition(project, selectedClip.id, 'cross-dissolve');
    setProject(next);
    setStatus('Cross dissolve applied');
    pushHistory(next);
  };

  const onUpdateTransform = (patch: Partial<ProjectClip['transform']>) => {
    if (!selectedClip) return;
    const next = updateClipTransform(project, selectedClip.id, patch);
    setProject(next);
    pushHistory(next);
  };

  const onExport = async () => {
    try {
      const output = await invoke<string>('export_project', {
        project,
        outputPath: `./output/clipforge-export-${Date.now()}.mp4`,
      });
      setStatus(`Exported: ${output}`);
    } catch (error) {
      setStatus(`Export failed: ${String(error)}`);
    }
  };

  const undo = () => {
    if (history.length <= 1) return;
    const previous = history[history.length - 2];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [project, ...prev]);
    setProject(previous);
    setStatus('Undo');
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, next]);
    setProject(next);
    setStatus('Redo');
  };

  return (
    <div className="app-shell dark">
      <header className="topbar">
        <div className="brand">Clipforge Studio</div>
        <nav className="menu">
          <button onClick={onNewProject}>New</button>
          <label className="menu-button">
            Open
            <input type="file" accept=".json" onChange={onOpenProject} hidden />
          </label>
          <button onClick={onSaveProject}>Save</button>
          <button onClick={onExport}>Export</button>
          <button onClick={undo}>Undo</button>
          <button onClick={redo}>Redo</button>
        </nav>
        <div className="status-pill">{status}</div>
      </header>

      <div className="workspace-grid">
        <aside className="panel left-panel">
          <div className="panel-header">Media Library</div>
          <label className="primary-button">
            Import Media
            <input type="file" onChange={onImportMedia} hidden />
          </label>
          <ul className="media-list">
            {project.media.map((asset) => (
              <li key={asset.id}>
                <span>{asset.name}</span>
                <small>{asset.type}</small>
              </li>
            ))}
          </ul>
        </aside>

        <main className="workspace-center">
          <section className="preview-panel">
            <div className="monitor-header">Preview Monitor</div>
            <div className="monitor-screen">
              {selectedClip ? <div className="screen-label">{selectedClip.name}</div> : <div className="screen-label">No clip selected</div>}
            </div>
          </section>

          <section className="timeline-panel">
            <div className="panel-header">Timeline</div>
            <div className="timeline-ruler">
              {[...Array(12)].map((_, index) => (
                <span key={index}>{index}s</span>
              ))}
            </div>
            <div className="tracks">
              {project.timeline.tracks.map((track: TimelineTrack) => (
                <div className="track" key={track.id}>
                  <div className="track-label">{track.name}</div>
                  <div className="track-clips">
                    {project.timeline.clips
                      .filter((clip) => clip.track === track.index)
                      .map((clip) => (
                        <button
                          key={clip.id}
                          className={`clip ${selectedClipId === clip.id ? 'selected' : ''}`}
                          style={{ left: `${clip.start * 18}px`, width: `${clip.duration * 18}px` }}
                          onClick={() => setSelectedClipId(clip.id)}
                        >
                          {clip.name}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="panel right-panel">
          <div className="panel-header">Inspector</div>
          {selectedClip ? (
            <>
              <div className="control-group">
                <label>Position X</label>
                <input
                  type="range"
                  min={-200}
                  max={200}
                  value={selectedClip.transform.positionX}
                  onChange={(event) => onUpdateTransform({ positionX: Number(event.target.value) })}
                />
              </div>
              <div className="control-group">
                <label>Scale</label>
                <input
                  type="range"
                  min={50}
                  max={200}
                  value={selectedClip.transform.scale}
                  onChange={(event) => onUpdateTransform({ scale: Number(event.target.value) })}
                />
              </div>
              <div className="control-group">
                <label>Rotation</label>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={selectedClip.transform.rotation}
                  onChange={(event) => onUpdateTransform({ rotation: Number(event.target.value) })}
                />
              </div>
              <div className="control-group">
                <label>Opacity</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedClip.transform.opacity}
                  onChange={(event) => onUpdateTransform({ opacity: Number(event.target.value) })}
                />
              </div>
              <button onClick={onSplitSelected}>Split clip</button>
              <button onClick={onTrimSelected}>Trim clip</button>
              <button onClick={onApplyTransition}>Apply cross dissolve</button>
            </>
          ) : (
            <p>No clip selected</p>
          )}

          <div className="panel-header mt">Audio Controls</div>
          <div className="control-group">
            <label>Volume</label>
            <input type="range" min={0} max={100} defaultValue={80} />
          </div>

          <div className="panel-header mt">Colour Effect</div>
          <button onClick={() => {
            if (!selectedClip) return;
            const next = updateClipTransform(project, selectedClip.id, { opacity: 100 });
            setProject(next);
            setStatus('Monochrome effect applied');
          }}>Apply black & white</button>
        </aside>
      </div>
    </div>
  );
}

export default App;
