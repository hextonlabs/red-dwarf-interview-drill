import React from 'react';

interface CharacterPanelProps {
  name: string;
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({ name }) => {
  // Deterministic images based on name (simulated)
  let imageSeed = 100;
  if (name.includes("Rimmer")) imageSeed = 101;
  else if (name.includes("Lister")) imageSeed = 102;
  else if (name.includes("Cat")) imageSeed = 103;
  else if (name.includes("Kryten")) imageSeed = 104;
  else if (name.includes("Holly")) imageSeed = 105;

  const imageUrl = `https://picsum.photos/seed/${imageSeed}/300/300`;

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 border-4 border-red-900 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] max-w-xs mx-auto mb-6 transform rotate-1">
      <div className="relative w-48 h-48 mb-2 overflow-hidden border-2 border-red-500 rounded bg-black">
        <img 
          src={imageUrl} 
          alt={name} 
          className="object-cover w-full h-full opacity-80 mix-blend-screen grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-red-900/20 pointer-events-none" />
        <div className="absolute bottom-0 w-full text-[10px] text-center bg-red-800 text-black uppercase tracking-widest font-bold">
          Live Feed
        </div>
      </div>
      <div className="w-full text-center">
        <h3 className="text-xl font-bold text-red-500 tracking-widest uppercase truncate">{name}</h3>
        <p className="text-xs text-red-700 uppercase">Interviewer ID: {Math.floor(Math.random() * 9999)}</p>
      </div>
    </div>
  );
};

export default CharacterPanel;
