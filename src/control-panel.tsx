import { useEffect, useState } from "react";
import { emit } from "@tauri-apps/api/event";
import {
  X,
  RotateCcw,
  DoorOpen,
} from "lucide-react";
import {
  DEFAULT_CAT_SETTINGS,
  loadCatSettings,
  saveCatSettings,
  type CatSettings,
} from "./lib/cat-settings";
import "./App.css";
import { Button } from "./components/ui/button";
import { invoke } from "@tauri-apps/api/core";

function ControlPanel() {
  const [settings, setSettings] = useState<CatSettings>(() => loadCatSettings());

  useEffect(() => {
    saveCatSettings(settings);
    void emit("cat-settings", settings);
  }, [settings]);

  return (
    <main className="min-h-screen bg-background p-4 text-foreground drag">
      <section className="flex min-h-[calc(100vh-2rem)] flex-col gap-2">
        {/* Header */}
        <header className="relative space-y-1">
          <div>
            <h1 className="text-xl font-semibold">Chonk Control</h1>
            <p className="text-sm text-muted-foreground">let chonk follow you</p>
          </div>
          <Button
            type="button"
            onClick={() => invoke("hide_window").catch(console.error)}
            className="absolute top-0 right-0"
          >
            <X className="size-4" />
          </Button>
        </header>

        <div className="grid grid-cols-3 gap-4">
        {/* Size */}
        <div className="grid gap-2 text-sm font-medium">
          <span>size</span>
          <div className="flex items-center h-10 rounded-md border px-3">
            <input
              className="flex-1 bg-transparent outline-none no-drag"
              type="number" min="30" max="220"
              value={settings.catSize}
              onChange={(event) => setSettings((current) => ({ ...current, catSize: Number(event.target.value),}))}
            />
            <span className="text-muted-foreground text-sm select-none">px</span>
          </div>
        </div>

        {/* Distance */}
        <div className="grid gap-2 text-sm font-medium">
          <span>distance</span>
          <div className="flex items-center h-10 rounded-md border px-3">
            <input
              className="flex-1 bg-transparent outline-none no-drag"
              type="number" min="0" max="300"
              value={settings.followDistance}
              onChange={(event) => setSettings((current) => ({ ...current, followDistance: Number(event.target.value),}))}
            />
            <span className="text-muted-foreground text-sm select-none">px</span>
          </div>
        </div>

        {/* Speed */}
        <div className="grid gap-2 text-sm font-medium">
          <span>speed</span>
          <input
            className="h-10 rounded-md border bg-background px-3 no-drag"
            type="number" min="5" max="20"
            value={settings.smoothing * 100}
            onChange={(event) => setSettings((current) => ({ ...current, smoothing: Number(event.target.value) / 100,}))}
          />
        </div>
        </div>

        {/* Actions */}
        <div className="mt-auto grid gap-2">

          <Button
            type="button"
            variant="outline"
            onClick={() => { setSettings(DEFAULT_CAT_SETTINGS) }}
          >
            <RotateCcw className="size-4" />
            reset
          </Button>

          <Button type="button" variant="outline" onClick={() => invoke("quit_app").catch(console.error)}>
            <DoorOpen className="size-4" />
            leave me alone
          </Button>
        </div>
      </section>
    </main>
  );
}

export default ControlPanel;
