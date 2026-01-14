export function LegionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/40">
            The Legion
          </div>
          <div className="text-lg text-white/90">
            Squads, leaderboards, and real-time grind status.
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4 lg:col-span-2">
          <div className="text-sm font-medium text-white/80 mb-2">Study Squads</div>
          <div className="text-xs text-white/50">
            Squad creation, membership, and leaderboards can be backed by Supabase
            Realtime. This panel is reserved for shared stats like hours this week,
            win streaks, and squad rank.
          </div>
        </div>
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm font-medium text-white/80 mb-2">
              Who&apos;s Grinding
            </div>
            <div className="text-xs text-white/50">
              Realtime presence from Supabase can show who is in study mode now.
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm font-medium text-white/80 mb-2">
              Voice Channels
            </div>
            <div className="text-xs text-white/50">
              WebRTC rooms for Silent Study and Peer Review can be wired here. UI
              hooks into a signaling backend of your choice.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

