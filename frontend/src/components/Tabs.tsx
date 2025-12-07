import { ReactNode, useState } from 'react';

export interface TabItem {
    id: string;
    label: string;
    content: ReactNode;
}

interface TabsProps {
    tabs: TabItem[];
    defaultTab?: string;
    onChange?: (tabId: string) => void;
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        onChange?.(tabId);
    };

    const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

    return (
        <div className="w-full">
            {/* Tab Buttons */}
            <div className="flex gap-2 border-b border-gray-600 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-4 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab.id
                                ? 'text-accent border-accent'
                                : 'text-gray-400 border-transparent hover:text-light'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="w-full">{activeTabContent}</div>
        </div>
    );
}
