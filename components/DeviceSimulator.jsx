
import React from 'react';

export default function DeviceSimulator({ deviceMode = 'mobile', children }) {
    return (
        <div
            className={`transition-all duration-500 ease-in-out bg-black overflow-hidden shadow-2xl mx-auto ${deviceMode === 'mobile'
                ? 'w-[375px] h-[812px] rounded-[40px] border-[8px] border-gray-900 relative'
                : 'w-[1280px] h-[720px] rounded-lg border border-gray-700 shadow-2xl bg-white'
                }`}
            style={{
                boxShadow: deviceMode === 'mobile' ? '0 0 50px rgba(0,0,0,0.5)' : 'none'
            }}
        >
            {/* Notch for Mobile */}
            {deviceMode === 'mobile' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-40 bg-gray-900 rounded-b-2xl z-50 pointer-events-none"></div>
            )}

            {/* Content */}
            <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {children}
            </div>
        </div>
    );
}
