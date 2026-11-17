import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Download, ImagePlus, RotateCcw } from 'lucide-react';
import { enhanceFile, validateFile } from './enhanceImage';
import './Enhance.css';

const Enhance = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [phase, setPhase] = useState('idle');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [live, setLive] = useState('');
  const [split, setSplit] = useState(50);
  const [originalUrl, setOriginalUrl] = useState('');
  const [enhancedUrl, setEnhancedUrl] = useState('');
  const [downloadName, setDownloadName] = useState('enhanced.jpg');
  const [meta, setMeta] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const runRef = useRef(0);
  const urlsRef = useRef([]);
  const stageRef = useRef('');
  const dragDepth = useRef(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Enhance a photo · Excel Analytics';
    return () => {
      document.title = previous;
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current = [];
    };
  }, []);

  const trackUrl = (url) => {
    urlsRef.current.push(url);
    return url;
  };

  const revokeUrls = () => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
  };

  const reset = () => {
    runRef.current += 1;
    revokeUrls();
    setOriginalUrl('');
    setEnhancedUrl('');
    setPhase('idle');
    setError('');
    setNote('');
    setProgress(0);
    setStage('');
    setLive('');
    setMeta(null);
    setSplit(50);
    stageRef.current = '';
  };

  const processFile = async (file) => {
    const runId = runRef.current + 1;
    runRef.current = runId;
    const cancelled = () => runId !== runRef.current;

    revokeUrls();
    setOriginalUrl('');
    setEnhancedUrl('');
    setMeta(null);
    setNote('');
    setSplit(50);
    stageRef.current = '';

    const problem = validateFile(file);
    if (problem) {
      setPhase('error');
      setError(problem);
      setLive(problem);
      setProgress(0);
      return;
    }

    setPhase('working');
    setError('');
    setProgress(2);
    setStage('Opening the photo');
    setLive('Opening the photo');

    try {
      const result = await enhanceFile(file, {
        isCancelled: cancelled,
        onPreview: (blob) => {
          if (cancelled()) return;
          setOriginalUrl(trackUrl(URL.createObjectURL(blob)));
        },
        onProgress: (pct, nextStage) => {
          if (cancelled()) return;
          setProgress(pct);
          setStage(nextStage);
          if (nextStage && nextStage !== stageRef.current && nextStage !== 'Done') {
            stageRef.current = nextStage;
            setLive(nextStage);
          }
        },
      });
      if (cancelled()) return;

      setEnhancedUrl(trackUrl(URL.createObjectURL(result.blob)));
      setDownloadName(result.filename);
      setMeta(result.meta);
      setNote(result.note);
      setProgress(100);
      setPhase('done');
      setLive('Enhancement finished. Drag the slider to compare, then download the photo if you want to keep it.');
    } catch (err) {
      if (cancelled() || err?.code === 'CANCELLED') return;
      const message = err?.expose
        ? err.message
        : 'Enhancement failed. Try another photo.';
      setPhase('error');
      setError(message);
      setLive(message);
    }
  };

  const onInput = (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (file) processFile(file);
  };

  const onDragEnter = (event) => {
    event.preventDefault();
    dragDepth.current += 1;
    setDragActive(true);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragActive(false);
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragActive(false);
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const onSplit = (event) => {
    setSplit(Number(event.target.value));
  };

  const showPicker = phase === 'idle' || phase === 'error';
  const homeHref = isAuthenticated ? '/dashboard' : '/login';

  return (
    <div
      className={`enhance-page${dragActive ? ' is-dragging' : ''}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <header className="enhance-header">
        <Link className="enhance-brand" to={homeHref}>
          Excel Analytics
        </Link>
        <span className="enhance-header-mark">Photo enhancer</span>
      </header>

      <main className="enhance-main">
        <h1>Clear up a blurry photo</h1>
        <p className="enhance-lead">
          Drop in a picture and this page pulls soft focus back into view, including
          faces and words in the photo, then sharpens what is left. Small photos are
          enlarged. Everything runs on this device.
        </p>

        <p className="enhance-sr" role="status">{live}</p>

        {error && (
          <p className="enhance-error" role="alert">{error}</p>
        )}

        {showPicker && (
          <div className={`enhance-dropzone${dragActive ? ' is-active' : ''}`}>
            <ImagePlus size={36} aria-hidden="true" color="#2563eb" />
            <p className="enhance-drop-title">
              {dragActive ? 'Drop the photo to enhance it' : 'Drop a blurry photo here'}
            </p>
            <p className="enhance-drop-hint">JPEG, PNG, or WebP</p>
            <div className="enhance-choose">
              <input
                ref={inputRef}
                id="photo-input"
                className="enhance-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                aria-label="Choose a JPEG, PNG, or WebP photo"
                onChange={onInput}
              />
              <span className="enhance-choose-face" aria-hidden="true">Choose a photo</span>
            </div>
            <p className="enhance-fine">
              Photos over 12 megapixels are scaled down before processing. Files over 40 MB are declined.
            </p>
          </div>
        )}

        {phase === 'working' && (
          <section className="enhance-progress-block" aria-busy="true">
            <label htmlFor="enhance-progress">Enhancement progress</label>
            <progress id="enhance-progress" max="100" value={Math.round(progress)} />
            <p className="enhance-stage" aria-hidden="true">
              {stage} · {Math.round(progress)}%
            </p>
          </section>
        )}

        {phase === 'working' && originalUrl && (
          <div className="enhance-preview">
            <img src={originalUrl} alt="Original upload, enhancement in progress" />
          </div>
        )}

        {phase === 'done' && originalUrl && enhancedUrl && (
          <section>
            <div className="enhance-compare" style={{ '--split': `${split}%` }}>
              <img className="is-after" src={enhancedUrl} alt="Enhanced version" />
              <img className="is-before" src={originalUrl} alt="" aria-hidden="true" />
              <span className="enhance-tag enhance-tag-left">Original</span>
              <span className="enhance-tag enhance-tag-right">Enhanced</span>
              <div className="enhance-divider" aria-hidden="true" />
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={split}
                aria-label="Comparison position. Left shows the original photo, right shows the enhanced photo."
                aria-valuetext={`${split} percent original`}
                onChange={onSplit}
                onInput={onSplit}
              />
            </div>
            <p className="enhance-caption">
              Drag the handle, or focus it and use the arrow keys. Left is the original, right is enhanced.
            </p>
            {meta && (
              <p className="enhance-meta">
                Original {meta.sourceWidth}×{meta.sourceHeight}. Enhanced {meta.outputWidth}×{meta.outputHeight}.
              </p>
            )}
            {note && <p className="enhance-note">{note}</p>}
            <div className="enhance-actions">
              <a className="enhance-btn enhance-btn-primary" href={enhancedUrl} download={downloadName}>
                <Download size={18} aria-hidden="true" />
                Download enhanced image
              </a>
              <button type="button" className="enhance-btn enhance-btn-secondary" onClick={reset}>
                <RotateCcw size={18} aria-hidden="true" />
                Try another photo
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Enhance;
