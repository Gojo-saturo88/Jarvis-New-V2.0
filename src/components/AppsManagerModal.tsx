import React, { useState } from 'react';
import {
  X,
  Play,
  Plus,
  ExternalLink,
  ShieldCheck,
  Search,
  Check,
  Info,
  Smartphone,
} from 'lucide-react';
import { androidBridge } from '../services/androidBridge';
import { AppItem } from '../types';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface AppsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchApp: (app: AppItem) => void;
  isNativeCompanion: boolean;
}

export const AppsManagerModal: React.FC<AppsManagerModalProps> = ({
  isOpen,
  onClose,
  onLaunchApp,
  isNativeCompanion,
}) => {
  const [apps, setApps] = useState<AppItem[]>(() => androidBridge.getAllApps());
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // New Custom App Form
  const [newAppName, setNewAppName] = useState('');
  const [newPackageName, setNewPackageName] = useState('');
  const [newAliases, setNewAliases] = useState('');

  const categories = ['all', 'media', 'social', 'finance', 'communication', 'navigation', 'tools', 'utility'];

  const filteredApps = apps.filter((app) => {
    const matchesFilter =
      app.name.toLowerCase().includes(filter.toLowerCase()) ||
      (app.hindiName && app.hindiName.toLowerCase().includes(filter.toLowerCase())) ||
      app.packageName.toLowerCase().includes(filter.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesFilter && matchesCategory;
  });

  const handleSaveCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newPackageName.trim()) return;

    const aliasList = newAliases
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const customApp: AppItem = {
      id: `custom-${Date.now()}`,
      name: newAppName.trim(),
      packageName: newPackageName.trim(),
      aliases: [newAppName.trim().toLowerCase(), ...aliasList],
      category: 'tools',
      icon: 'Smartphone',
    };

    androidBridge.saveCustomApp(customApp);
    setApps(androidBridge.getAllApps());
    setIsAddingCustom(false);
    setNewAppName('');
    setNewPackageName('');
    setNewAliases('');
  };

  return (
    <HolographicModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      maxHeight="max-h-[88vh]"
      className="holo-panel rounded-2xl flex flex-col border border-amber-500/40 shadow-2xl"
      accentColor="amber"
    >
        {/* Header */}
        <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-stone-100 text-sm tracking-wider font-mono">
                ANDROID APPLICATION REGISTRY // LAUNCHER
              </h3>
              <p className="text-[11px] font-mono text-stone-400 flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isNativeCompanion ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span>
                  {isNativeCompanion
                    ? 'Connected to Native Android Companion Bridge'
                    : 'Running in Browser / PWA Mode (Deep-links & Intents active)'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Add Bar */}
        <div className="p-4 bg-stone-950/40 border-b border-stone-800 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search registered apps or packages..."
                className="w-full bg-stone-900/90 text-stone-100 pl-9 pr-4 py-2 rounded-xl border border-stone-700 focus:border-amber-400 focus:outline-none text-xs"
              />
            </div>
            <button
              onClick={() => setIsAddingCustom(!isAddingCustom)}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-amber-500/20 text-amber-300 border border-stone-700 hover:border-amber-400 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingCustom ? 'CANCEL' : 'ADD APP'}</span>
            </button>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-900/70 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Custom App Form */}
        {isAddingCustom && (
          <form
            onSubmit={handleSaveCustomApp}
            className="p-4 bg-amber-500/5 border-b border-amber-500/20 flex flex-col sm:flex-row gap-3 items-end"
          >
            <div className="flex-1 w-full space-y-1">
              <label className="text-[10px] font-mono text-amber-300">APP NAME</label>
              <input
                type="text"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                placeholder="e.g. JioCinema"
                className="w-full bg-stone-900 text-stone-200 px-3 py-1.5 rounded-lg border border-stone-700 text-xs"
                required
              />
            </div>
            <div className="flex-1 w-full space-y-1">
              <label className="text-[10px] font-mono text-amber-300">ANDROID PACKAGE NAME</label>
              <input
                type="text"
                value={newPackageName}
                onChange={(e) => setNewPackageName(e.target.value)}
                placeholder="com.jio.media.ondemand"
                className="w-full bg-stone-900 text-stone-200 px-3 py-1.5 rounded-lg border border-stone-700 text-xs font-mono"
                required
              />
            </div>
            <div className="flex-1 w-full space-y-1">
              <label className="text-[10px] font-mono text-amber-300">VOICE ALIASES (COMMA SEPARATED)</label>
              <input
                type="text"
                value={newAliases}
                onChange={(e) => setNewAliases(e.target.value)}
                placeholder="jiocinema, jio cinema, jio movie"
                className="w-full bg-stone-900 text-stone-200 px-3 py-1.5 rounded-lg border border-stone-700 text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs font-mono rounded-lg transition-colors cursor-pointer shrink-0"
            >
              SAVE APP
            </button>
          </form>
        )}

        {/* Apps Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-100 text-xs group-hover:text-amber-300 transition-colors">
                          {app.name}
                        </h4>
                        {app.hindiName && (
                          <span className="text-[10px] text-stone-400">
                            {app.hindiName}
                          </span>
                        )}
                      </div>
                    </div>

                    {app.isSensitive && (
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30"
                        title="Sensitive app: Requires safety confirmation"
                      >
                        PROTECTED
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] font-mono text-stone-400 mt-2 truncate">
                    {app.packageName}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-900 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-stone-400 uppercase">
                    {app.category}
                  </span>
                  <button
                    onClick={() => onLaunchApp(app)}
                    className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/30 text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>LAUNCH</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="py-12 text-center text-stone-500 text-xs font-mono">
              No matching apps found in local registry. You can add one using the "ADD APP" button.
            </div>
          )}
        </div>
    </HolographicModalWrapper>
  );
};
