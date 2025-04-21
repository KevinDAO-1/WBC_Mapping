import React, { useEffect, useRef, memo } from 'react';
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, Color3, MeshBuilder, ActionManager, ExecuteCodeAction, TransformNode, DefaultRenderingPipeline } from '@babylonjs/core'; // Import DefaultRenderingPipeline
import { AdvancedDynamicTexture, Rectangle, Image, Control } from '@babylonjs/gui';
import '@babylonjs/loaders/glTF';
import locationsData from '../data/locations.json';

const MODEL_PATH = '/assets/3d/mapnewb.glb';

// Defer GUI Texture creation AND Marker creation until model is loaded
const onSceneReady = (scene, onLocationSelect) => {
  console.log("onSceneReady function started.");

  const camera = new ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 2.5, 30, Vector3.Zero(), scene);
  camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
  camera.lowerRadiusLimit = 25; 
  camera.upperRadiusLimit = 50; 
  camera.upperBetaLimit = Math.PI / 2 - 0.1;
  camera.lowerBetaLimit = 0.1;

  const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
  light.intensity = 0.5;

  scene.clearColor = new Color3(0, 0, 0);

  // --- Add Default Rendering Pipeline with Bloom ---
  const pipeline = new DefaultRenderingPipeline(
      "defaultPipeline", // The name of the pipeline
      false, // HDR texture required for bloom
      scene, // The scene instance
      [camera] 
  );
  pipeline.bloomEnabled = false; // Disable bloom effect
  // Keep other settings, they won't apply if bloom is disabled
  pipeline.bloomWeight = 0.1; 
  pipeline.bloomThreshold = 0.7; 
  pipeline.bloomKernel = 64; 
  console.log("DefaultRenderingPipeline with Bloom enabled.");
  // --- End Pipeline Setup ---


  // Load the model, then create GUI texture AND markers in the success callback
  // Set rootUrl to the directory and sceneFilename to the file name
  SceneLoader.Append("/assets/3d/", "mapnewb.glb", scene, function (loadedScene) { 
    console.log("Model appended to scene!");
    console.log("Loaded mesh names:");
    loadedScene.meshes.forEach(mesh => console.log(`- ${mesh.name}`));

    // Create AdvancedDynamicTexture AFTER model is loaded
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    console.log("AdvancedDynamicTexture created AFTER model load.");

    // --- Create GUI Markers AFTER model is loaded and texture is created ---
    const linkMeshes = {}; // Store references to link nodes

    locationsData.forEach(location => {
      // Create link node and set its position immediately
      const linkMesh = new TransformNode(`link_${location.id}`, scene);
      linkMesh.position = new Vector3(location.position[0], location.position[1], location.position[2]); 
      linkMeshes[location.id] = linkMesh; 

      // --- Pre-calculate Sizes ---
      const baseWidthPx = 100; 
      const aspectRatio = 9 / 16; 
      const scaledImgHeightPx = baseWidthPx * aspectRatio;
      const borderThicknessPx = 2; 
      const arrowBaseSize = 20; 
      const totalFrameWidthPx = baseWidthPx + (borderThicknessPx * 2);
      const totalFrameHeightPx = scaledImgHeightPx + (borderThicknessPx * 2);
      const containerHeightPx = totalFrameHeightPx + arrowBaseSize - borderThicknessPx; 
      const containerWidthPx = totalFrameWidthPx;
      // --- End Pre-calculation ---

      const markerContainer = new Rectangle(`marker_container_${location.id}`);
      markerContainer.widthInPixels = containerWidthPx;
      markerContainer.heightInPixels = containerHeightPx;
      markerContainer.thickness = 0;
      markerContainer.background = "transparent";

      const arrowImage = new Image(`arrow_${location.id}`, "/assets/2d/Asset 2.png");
      arrowImage.widthInPixels = arrowBaseSize;
      arrowImage.heightInPixels = arrowBaseSize;
      arrowImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
      arrowImage.top = `-${borderThicknessPx}px`; 
      markerContainer.addControl(arrowImage); 

      const frame = new Rectangle(`frame_${location.id}`);
      frame.widthInPixels = totalFrameWidthPx;
      frame.heightInPixels = totalFrameHeightPx;
      frame.cornerRadius = 10;
      frame.color = "white";
      frame.thickness = borderThicknessPx;
      frame.background = "transparent"; 
      frame.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      markerContainer.addControl(frame);

      const img = new Image(`img_${location.id}`, location.markerImageUrl);
      img.widthInPixels = baseWidthPx;
      img.heightInPixels = scaledImgHeightPx;
      img.stretch = Image.STRETCH_UNIFORM;
      frame.addControl(img); 

      advancedTexture.addControl(markerContainer);

      markerContainer.linkWithMesh(linkMesh); // Link to node at correct position
      markerContainer.linkOffsetY = -(containerHeightPx / 2 + 10); 

      markerContainer.isPointerBlocker = true; 

      markerContainer.onPointerEnterObservable.add(() => {
        markerContainer.scaleX = 1.2; 
        markerContainer.scaleY = 1.2;
        markerContainer.zIndex = 1; 
      });

      markerContainer.onPointerOutObservable.add(() => { 
        // console.log(`Pointer Out: ${location.id}`); 
        markerContainer.scaleX = 1.0;
        markerContainer.scaleY = 1.0;
        markerContainer.zIndex = 0; 
      });

      markerContainer.onPointerClickObservable.add(() => {
        console.log(`Marker ${location.id} clicked (GUI)`);
        if (onLocationSelect) {
          onLocationSelect(location.id); 
        }
      });
    });
    // --- End GUI Marker Creation ---

  }, null, function (scene, message, exception) {
    console.error("Error loading model:", message, exception);
  });

  // console.log("SceneLoader.Append called for:", MODEL_PATH); // Logging the old constant is confusing now

  return scene;
};

const BabylonCanvas = ({ onLocationSelect }) => { 
  const reactCanvas = useRef(null);

  useEffect(() => {
    console.log("BabylonCanvas useEffect started.");
    const { current: canvas } = reactCanvas;

    if (!canvas) {
      console.log("Canvas ref not found yet.");
      return;
    }
    console.log("Canvas ref found.");

    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    console.log("Babylon Engine created.");
    const scene = new Scene(engine);
    console.log("Babylon Scene created.");

    const sceneReadyHandler = (readyScene) => onSceneReady(readyScene, onLocationSelect);

    if (scene.isReady()) {
      console.log("Scene is ready immediately.");
      sceneReadyHandler(scene);
    } else {
      console.log("Scene not ready immediately, adding observer.");
      scene.onReadyObservable.addOnce((readyScene) => {
        console.log("Scene ready observer triggered.");
        sceneReadyHandler(readyScene);
      });
    }

    engine.runRenderLoop(() => {
      if (scene && scene.activeCamera) {
        scene.render();
      }
    });

    const resize = () => {
      engine.resize();
    };
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (engine) { 
        engine.dispose();
        console.log("Babylon Engine disposed.");
      }
    };
  }, [onLocationSelect]); 

  return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%', outline: 'none' }} />;
};

export default memo(BabylonCanvas);
