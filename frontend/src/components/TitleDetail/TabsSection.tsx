interface TabsSectionProps {
  activeTab: 'info' | 'cast';
  onTabChange: (tab: 'info' | 'cast') => void;
}

export function TabsSection({ activeTab, onTabChange }: TabsSectionProps) {
  return (
    <div className="flex gap-8 border-b border-gray-600">
      <button
        onClick={() => onTabChange('info')}
        className={`py-4 px-2 font-semibold transition-colors ${
          activeTab === 'info'
            ? 'text-accent border-b-2 border-accent -mb-px'
            : 'text-gray-400 hover:text-light'
        }`}
      >
        Info
      </button>
      <button
        onClick={() => onTabChange('cast')}
        className={`py-4 px-2 font-semibold transition-colors ${
          activeTab === 'cast'
            ? 'text-accent border-b-2 border-accent -mb-px'
            : 'text-gray-400 hover:text-light'
        }`}
      >
        Cast & Crew
      </button>
    </div>
  );
}
