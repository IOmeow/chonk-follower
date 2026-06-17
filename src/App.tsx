import { useEffect, useMemo, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  loadCatSettings,
  type CatSettings,
} from "./lib/cat-settings";
import "./App.css";

type Point = {
  x: number;
  y: number;
};

type CursorPosition = {
  x: number;
  y: number;
};

const DIRECTION_IMAGES = [
  "/cat/001.png",
  "/cat/002.png",
  "/cat/003.png",
  "/cat/004.png",
  "/cat/005.gif",
  "/cat/006.png",
  "/cat/007.png",
  "/cat/008.png",
];

const IDLE_IMAGE = "/cat/000.png";

function App() {
  const [cat, setCat] = useState<Point>(() => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }));
  const [catImage, setCatImage] = useState(DIRECTION_IMAGES[0]);
  const [settings, setSettings] = useState<CatSettings>(() => loadCatSettings());
  const windowOrigin = useRef<Point>({ x: 0, y: 0 });
  const lastCursor = useRef<Point | null>(null);
  const lastMove = useRef<Point>({ x: 0, y: -1 });
  const currentDirection = useRef(0);
  const pendingDirection = useRef(0);
  const pendingDirectionHits = useRef(0);
  const target = useRef<Point>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const catState = useRef<Point>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const lastMouseMoveTime = useRef(Date.now());
  const isIdle = useRef(false);

  const catStyle = useMemo(
    () => ({
      transform: `translate3d(${cat.x - settings.catSize / 2}px, ${
        cat.y - settings.catSize / 2
      }px, 0) scale(${isIdle.current ? 2.2 : 1})`,
      width: `${settings.catSize}px`,
      height: `${settings.catSize}px`,
    }),
    [cat.x, cat.y, settings.catSize, isIdle.current],
  );

  useEffect(() => {
    const appWindow = getCurrentWindow();
    let unlistenMouse: (() => void) | undefined;
    let unlistenSettings: (() => void) | undefined;

    const syncWindowBounds = async () => {
      try {
        const position = await appWindow.outerPosition();
        windowOrigin.current = { x: position.x, y: position.y };
      } catch {
        windowOrigin.current = { x: 0, y: 0 };
      }
    };

    const idleTimer = window.setInterval(() => {
      const idleTime = Date.now() - lastMouseMoveTime.current;

      if (!isIdle.current && idleTime >= 5000) {
        isIdle.current = true;
        setCatImage(IDLE_IMAGE);
      }
    }, 1000);

    void syncWindowBounds();
    void appWindow.setIgnoreCursorEvents(true);

    void listen<CursorPosition>("mouse-position", (event) => {
      const screenCursor = { x: event.payload.x, y: event.payload.y };
      const localCursor = {
        x: screenCursor.x - windowOrigin.current.x,
        y: screenCursor.y - windowOrigin.current.y,
      };

      const previousCursor = lastCursor.current;
      const dx = previousCursor ? localCursor.x - previousCursor.x : 0;
      const dy = previousCursor ? localCursor.y - previousCursor.y : 0;
      const speed = Math.hypot(dx, dy);

      lastCursor.current = localCursor;
      if (speed > 1.25) {
        lastMouseMoveTime.current = Date.now();

        if (isIdle.current) {
          isIdle.current = false;
          setCatImage(DIRECTION_IMAGES[currentDirection.current]);
        }

        const inverseLength = speed || 1;
        lastMove.current = {
          x: dx / inverseLength,
          y: dy / inverseLength,
        };

        const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
        const normalized = (angle + 360 + 22.5) % 360;
        const directionIndex = Math.floor(normalized / 45) % 8;
        if (pendingDirection.current === directionIndex) {
          pendingDirectionHits.current += 1;
        } else {
          pendingDirection.current = directionIndex;
          pendingDirectionHits.current = 1;
        }

        if (
          pendingDirectionHits.current >= 2 &&
          currentDirection.current !== directionIndex
        ) {
          currentDirection.current = directionIndex;
          setCatImage(DIRECTION_IMAGES[directionIndex]);
        }
      }

      target.current = {
        x: localCursor.x - lastMove.current.x * settings.followDistance,
        y: localCursor.y - lastMove.current.y * settings.followDistance,
      };
    }).then((dispose) => {
      unlistenMouse = dispose;
    });

    void listen<CatSettings>("cat-settings", (event) => {
      setSettings(event.payload);
    }).then((dispose) => {
      unlistenSettings = dispose;
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "chonk-cat-settings") {
        setSettings(loadCatSettings());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      unlistenMouse?.();
      unlistenSettings?.();
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(idleTimer);
    };
  }, [settings.followDistance]);

  useEffect(() => {
    let animationFrame = 0;

    const tick = () => {
      const current = catState.current;
      const next = {
        x: current.x + (target.current.x - current.x) * settings.smoothing,
        y: current.y + (target.current.y - current.y) * settings.smoothing,
      };

      catState.current = next;
      setCat(next);
      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [settings.smoothing]);

  return (
    <main className="scene scene--transparent">
      <div className="cat-shell" style={catStyle}>
        <img className={`cat-image ${isIdle.current ? "cat-image--idle" : ""}`} src={catImage} alt="Cat following the mouse" draggable={false} />
      </div>
    </main>
  );
}

export default App;
