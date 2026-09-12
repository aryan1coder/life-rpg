'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { AttributeName, QuestCategory, QuestDifficulty, QuestFrequency } from '@/lib/game/types';
import { X, Sparkles, Plus, AlertCircle } from 'lucide-react';

export function CreateQuestModal() {
  const { createQuestModalOpen, setCreateQuestModalOpen, createQuest } = useGame();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('Engineering');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('Normal');
  const [attribute, setAttribute] = useState<AttributeName>('Intellect');
  const [frequency, setFrequency] = useState<QuestFrequency>('Daily');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!createQuestModalOpen) return null;

  // Dynamic reward previews
  const calculateRewards = (diff: QuestDifficulty) => {
    switch (diff) {
      case 'Epic':
        return { xp: 300, gold: 150, attrGain: '+3' };
      case 'Hard':
        return { xp: 200, gold: 95, attrGain: '+2' };
      case 'Normal':
        return { xp: 120, gold: 65, attrGain: '+1' };
      case 'Easy':
      default:
        return { xp: 80, gold: 40, attrGain: '+1' };
    }
  };

  const preview = calculateRewards(difficulty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Protocol title is mandatory');
      return;
    }

    setSubmitting(true);
    setError(null);

    const success = await createQuest({
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      attribute,
      frequency,
      xp_reward: preview.xp,
      gold_reward: preview.gold,
    });

    setSubmitting(false);
    if (success) {
      setTitle('');
      setDescription('');
      setCreateQuestModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border-subtle shadow-2xl p-6 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary tracking-tight">
                Initialize Quest Protocol
              </h2>
              <p className="font-mono text-[11px] text-text-muted">
                Directive Engine // New Task
              </p>
            </div>
          </div>
          <button
            onClick={() => setCreateQuestModalOpen(false)}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-crimson-threat/10 border border-crimson-threat/20 flex items-center gap-2 text-xs text-crimson-threat">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="block font-mono text-xs text-text-muted mb-1 uppercase tracking-wider">
              Directive Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Zero-Knowledge Consensus Validator"
              className="w-full px-3.5 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-text-muted mb-1 uppercase tracking-wider">
              Tactical Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline specific milestones, acceptance criteria, or code targets..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Grid Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as QuestCategory)}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-primary"
              >
                <option value="Engineering">Engineering</option>
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Fitness">Fitness</option>
                <option value="Personal">Personal</option>
                <option value="Creative">Creative</option>
                <option value="Health">Health</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-text-muted mb-1 uppercase tracking-wider">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuestDifficulty)}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-primary"
              >
                <option value="Easy">Easy</option>
                <option value="Normal">Normal</option>
                <option value="Hard">Hard</option>
                <option value="Epic">Epic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1 uppercase tracking-wider">
                Target Capacity
              </label>
              <select
                value={attribute}
                onChange={(e) => setAttribute(e.target.value as AttributeName)}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-primary"
              >
                <option value="Intellect">Intellect (INT)</option>
                <option value="Discipline">Discipline (DIS)</option>
                <option value="Vitality">Vitality (VIT)</option>
                <option value="Strength">Strength (STR)</option>
                <option value="Creativity">Creativity (CRE)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-text-muted mb-1 uppercase tracking-wider">
                Cadence
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as QuestFrequency)}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-primary"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Once">Once</option>
                <option value="Campaign">Campaign</option>
              </select>
            </div>
          </div>

          {/* Live Calculated Yield Preview */}
          <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-text-secondary">Expected Yield:</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                +{preview.xp} XP
              </span>
              <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                +{preview.gold} G
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-complete/10 text-emerald-complete border border-emerald-complete/20">
                {preview.attrGain} {attribute}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateQuestModalOpen(false)}
              className="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Initializing...' : 'Deploy Protocol'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
