import React, { useState } from 'react';
import './PeriodicTable.css';
import { ElementDetailModal } from './ElementDetailModal';

const elements = [
  { number: 1, symbol: 'H', name: 'Hydrogen', category: 'nonmetal' },
  { number: 2, symbol: 'He', name: 'Helium', category: 'noble-gas' },
  { number: 3, symbol: 'Li', name: 'Lithium', category: 'alkali-metal' },
  { number: 4, symbol: 'Be', name: 'Beryllium', category: 'alkaline-earth-metal' },
  { number: 5, symbol: 'B', name: 'Boron', category: 'metalloid' },
  { number: 6, symbol: 'C', name: 'Carbon', category: 'nonmetal' },
  { number: 7, symbol: 'N', name: 'Nitrogen', category: 'nonmetal' },
  { number: 8, symbol: 'O', name: 'Oxygen', category: 'nonmetal' },
  { number: 9, symbol: 'F', name: 'Fluorine', category: 'halogen' },
  { number: 10, symbol: 'Ne', name: 'Neon', category: 'noble-gas' },
  { number: 11, symbol: 'Na', name: 'Sodium', category: 'alkali-metal' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', category: 'alkaline-earth-metal' },
  { number: 13, symbol: 'Al', name: 'Aluminum', category: 'post-transition-metal' },
  { number: 14, symbol: 'Si', name: 'Silicon', category: 'metalloid' },
  { number: 15, symbol: 'P', name: 'Phosphorus', category: 'nonmetal' },
  { number: 16, symbol: 'S', name: 'Sulfur', category: 'nonmetal' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', category: 'halogen' },
  { number: 18, symbol: 'Ar', name: 'Argon', category: 'noble-gas' },
  { number: 19, symbol: 'K', name: 'Potassium', category: 'alkali-metal' },
  { number: 20, symbol: 'Ca', name: 'Calcium', category: 'alkaline-earth-metal' },
  { number: 21, symbol: 'Sc', name: 'Scandium', category: 'transition-metal' },
  { number: 22, symbol: 'Ti', name: 'Titanium', category: 'transition-metal' },
  { number: 23, symbol: 'V', name: 'Vanadium', category: 'transition-metal' },
  { number: 24, symbol: 'Cr', name: 'Chromium', category: 'transition-metal' },
  { number: 25, symbol: 'Mn', name: 'Manganese', category: 'transition-metal' },
  { number: 26, symbol: 'Fe', name: 'Iron', category: 'transition-metal' },
  { number: 27, symbol: 'Co', name: 'Cobalt', category: 'transition-metal' },
  { number: 28, symbol: 'Ni', name: 'Nickel', category: 'transition-metal' },
  { number: 29, symbol: 'Cu', name: 'Copper', category: 'transition-metal' },
  { number: 30, symbol: 'Zn', name: 'Zinc', category: 'transition-metal' },
  { number: 31, symbol: 'Ga', name: 'Gallium', category: 'post-transition-metal' },
  { number: 32, symbol: 'Ge', name: 'Germanium', category: 'metalloid' },
  { number: 33, symbol: 'As', name: 'Arsenic', category: 'metalloid' },
  { number: 34, symbol: 'Se', name: 'Selenium', category: 'nonmetal' },
  { number: 35, symbol: 'Br', name: 'Bromine', category: 'halogen' },
  { number: 36, symbol: 'Kr', name: 'Krypton', category: 'noble-gas' },
  { number: 37, symbol: 'Rb', name: 'Rubidium', category: 'alkali-metal' },
  { number: 38, symbol: 'Sr', name: 'Strontium', category: 'alkaline-earth-metal' },
  { number: 39, symbol: 'Y', name: 'Yttrium', category: 'transition-metal' },
  { number: 40, symbol: 'Zr', name: 'Zirconium', category: 'transition-metal' },
  { number: 41, symbol: 'Nb', name: 'Niobium', category: 'transition-metal' },
  { number: 42, symbol: 'Mo', name: 'Molybdenum', category: 'transition-metal' },
  { number: 43, symbol: 'Tc', name: 'Technetium', category: 'transition-metal' },
  { number: 44, symbol: 'Ru', name: 'Ruthenium', category: 'transition-metal' },
  { number: 45, symbol: 'Rh', name: 'Rhodium', category: 'transition-metal' },
  { number: 46, symbol: 'Pd', name: 'Palladium', category: 'transition-metal' },
  { number: 47, symbol: 'Ag', name: 'Silver', category: 'transition-metal' },
  { number: 48, symbol: 'Cd', name: 'Cadmium', category: 'transition-metal' },
  { number: 49, symbol: 'In', name: 'Indium', category: 'post-transition-metal' },
  { number: 50, symbol: 'Sn', name: 'Tin', category: 'post-transition-metal' },
  { number: 51, symbol: 'Sb', name: 'Antimony', category: 'metalloid' },
  { number: 52, symbol: 'Te', name: 'Tellurium', category: 'metalloid' },
  { number: 53, symbol: 'I', name: 'Iodine', category: 'halogen' },
  { number: 54, symbol: 'Xe', name: 'Xenon', category: 'noble-gas' },
  { number: 55, symbol: 'Cs', name: 'Cesium', category: 'alkali-metal' },
  { number: 56, symbol: 'Ba', name: 'Barium', category: 'alkaline-earth-metal' },
  { number: 57, symbol: 'La', name: 'Lanthanum', category: 'lanthanide' },
  { number: 58, symbol: 'Ce', name: 'Cerium', category: 'lanthanide' },
  { number: 59, symbol: 'Pr', name: 'Praseodymium', category: 'lanthanide' },
  { number: 60, symbol: 'Nd', name: 'Neodymium', category: 'lanthanide' },
  { number: 61, symbol: 'Pm', name: 'Promethium', category: 'lanthanide' },
  { number: 62, symbol: 'Sm', name: 'Samarium', category: 'lanthanide' },
  { number: 63, symbol: 'Eu', name: 'Europium', category: 'lanthanide' },
  { number: 64, symbol: 'Gd', name: 'Gadolinium', category: 'lanthanide' },
  { number: 65, symbol: 'Tb', name: 'Terbium', category: 'lanthanide' },
  { number: 66, symbol: 'Dy', name: 'Dysprosium', category: 'lanthanide' },
  { number: 67, symbol: 'Ho', name: 'Holmium', category: 'lanthanide' },
  { number: 68, symbol: 'Er', name: 'Erbium', category: 'lanthanide' },
  { number: 69, symbol: 'Tm', name: 'Thulium', category: 'lanthanide' },
  { number: 70, symbol: 'Yb', name: 'Ytterbium', category: 'lanthanide' },
  { number: 71, symbol: 'Lu', name: 'Lutetium', category: 'lanthanide' },
  { number: 72, symbol: 'Hf', name: 'Hafnium', category: 'transition-metal' },
  { number: 73, symbol: 'Ta', name: 'Tantalum', category: 'transition-metal' },
  { number: 74, symbol: 'W', name: 'Tungsten', category: 'transition-metal' },
  { number: 75, symbol: 'Re', name: 'Rhenium', category: 'transition-metal' },
  { number: 76, symbol: 'Os', name: 'Osmium', category: 'transition-metal' },
  { number: 77, symbol: 'Ir', name: 'Iridium', category: 'transition-metal' },
  { number: 78, symbol: 'Pt', name: 'Platinum', category: 'transition-metal' },
  { number: 79, symbol: 'Au', name: 'Gold', category: 'transition-metal' },
  { number: 80, symbol: 'Hg', name: 'Mercury', category: 'transition-metal' },
  { number: 81, symbol: 'Tl', name: 'Thallium', category: 'post-transition-metal' },
  { number: 82, symbol: 'Pb', name: 'Lead', category: 'post-transition-metal' },
  { number: 83, symbol: 'Bi', name: 'Bismuth', category: 'post-transition-metal' },
  { number: 84, symbol: 'Po', name: 'Polonium', category: 'post-transition-metal' },
  { number: 85, symbol: 'At', name: 'Astatine', category: 'halogen' },
  { number: 86, symbol: 'Rn', name: 'Radon', category: 'noble-gas' },
  { number: 87, symbol: 'Fr', name: 'Francium', category: 'alkali-metal' },
  { number: 88, symbol: 'Ra', name: 'Radium', category: 'alkaline-earth-metal' },
  { number: 89, symbol: 'Ac', name: 'Actinium', category: 'actinide' },
  { number: 90, symbol: 'Th', name: 'Thorium', category: 'actinide' },
  { number: 91, symbol: 'Pa', name: 'Protactinium', category: 'actinide' },
  { number: 92, symbol: 'U', name: 'Uranium', category: 'actinide' },
  { number: 93, symbol: 'Np', name: 'Neptunium', category: 'actinide' },
  { number: 94, symbol: 'Pu', name: 'Plutonium', category: 'actinide' },
  { number: 95, symbol: 'Am', name: 'Americium', category: 'actinide' },
  { number: 96, symbol: 'Cm', name: 'Curium', category: 'actinide' },
  { number: 97, symbol: 'Bk', name: 'Berkelium', category: 'actinide' },
  { number: 98, symbol: 'Cf', name: 'Californium', category: 'actinide' },
  { number: 99, symbol: 'Es', name: 'Einsteinium', category: 'actinide' },
  { number: 100, symbol: 'Fm', name: 'Fermium', category: 'actinide' },
  { number: 101, symbol: 'Md', name: 'Mendelevium', category: 'actinide' },
  { number: 102, symbol: 'No', name: 'Nobelium', category: 'actinide' },
  { number: 103, symbol: 'Lr', name: 'Lawrencium', category: 'actinide' },
  { number: 104, symbol: 'Rf', name: 'Rutherfordium', category: 'transition-metal' },
  { number: 105, symbol: 'Db', name: 'Dubnium', category: 'transition-metal' },
  { number: 106, symbol: 'Sg', name: 'Seaborgium', category: 'transition-metal' },
  { number: 107, symbol: 'Bh', name: 'Bohrium', category: 'transition-metal' },
  { number: 108, symbol: 'Hs', name: 'Hassium', category: 'transition-metal' },
  { number: 109, symbol: 'Mt', name: 'Meitnerium', category: 'transition-metal' },
  { number: 110, symbol: 'Ds', name: 'Darmstadtium', category: 'transition-metal' },
  { number: 111, symbol: 'Rg', name: 'Roentgenium', category: 'transition-metal' },
  { number: 112, symbol: 'Cn', name: 'Copernicium', category: 'transition-metal' },
  { number: 113, symbol: 'Nh', name: 'Nihonium', category: 'post-transition-metal' },
  { number: 114, symbol: 'Fl', name: 'Flerovium', category: 'post-transition-metal' },
  { number: 115, symbol: 'Mc', name: 'Moscovium', category: 'post-transition-metal' },
  { number: 116, symbol: 'Lv', name: 'Livermorium', category: 'post-transition-metal' },
  { number: 117, symbol: 'Ts', name: 'Tennessine', category: 'halogen' },
  { number: 118, symbol: 'Og', name: 'Oganesson', category: 'noble-gas' },
];

const generateFullTableData = () => {
  const fullTable = [];

  // Row 1
  fullTable.push(elements.find(e => e.number === 1));
  for (let i = 0; i < 16; i++) { fullTable.push({ number: NaN, category: 'placeholder' }); }
  fullTable.push(elements.find(e => e.number === 2));

  // Row 2
  fullTable.push(elements.find(e => e.number === 3));
  fullTable.push(elements.find(e => e.number === 4));
  for (let i = 0; i < 10; i++) { fullTable.push({ number: NaN, category: 'placeholder' }); }
  for (let i = 5; i <= 10; i++) { fullTable.push(elements.find(e => e.number === i)); }

  // Row 3
  fullTable.push(elements.find(e => e.number === 11));
  fullTable.push(elements.find(e => e.number === 12));
  for (let i = 0; i < 10; i++) { fullTable.push({ number: NaN, category: 'placeholder' }); }
  for (let i = 13; i <= 18; i++) { fullTable.push(elements.find(e => e.number === i)); }

  // Row 4
  for (let i = 19; i <= 36; i++) { fullTable.push(elements.find(e => e.number === i)); }

  // Row 5
  for (let i = 37; i <= 54; i++) { fullTable.push(elements.find(e => e.number === i)); }

  // Row 6
  fullTable.push(elements.find(e => e.number === 55));
  fullTable.push(elements.find(e => e.number === 56));
  fullTable.push({ number: '57-71', symbol: '*', name: 'Lanthanides', category: 'lanthanide-marker' });
  for (let i = 72; i <= 86; i++) { fullTable.push(elements.find(e => e.number === i)); }

  // Row 7
  fullTable.push(elements.find(e => e.number === 87));
  fullTable.push(elements.find(e => e.number === 88));
  fullTable.push({ number: '89-103', symbol: '**', name: 'Actinides', category: 'actinide-marker' });
  for (let i = 104; i <= 118; i++) { fullTable.push(elements.find(e => e.number === i)); }

  // Add spacing
  for (let i = 0; i < 18; i++) { fullTable.push({ number: NaN, category: 'gap-for-f-block' }); }

  // Lanthanides row
  fullTable.push({ number: NaN, category: 'placeholder' });
  fullTable.push({ number: NaN, category: 'placeholder' });
  fullTable.push({ number: NaN, category: 'placeholder' });
  for (let i = 57; i <= 71; i++) { fullTable.push(elements.find(e => e.number === i)); }

  // Actinides row
  fullTable.push({ number: NaN, category: 'placeholder' });
  fullTable.push({ number: NaN, category: 'placeholder' });
  fullTable.push({ number: NaN, category: 'placeholder' });
  for (let i = 89; i <= 103; i++) { fullTable.push(elements.find(e => e.number === i)); }

  return fullTable;
};

const ElementCell = ({ element, onClick }: { element: any; onClick?: () => void }) => {
  if (element.category === 'placeholder' || element.category === 'gap-for-f-block') {
    return <div className={`element-cell placeholder ${element.category}`}></div>;
  }

  return (
    <div className={`element-cell category-${element.category}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="element-number">{element.number}</div>
      <div className="element-symbol">{element.symbol}</div>
      <div className="element-name">{element.name}</div>
    </div>
  );
};

const PeriodicTable = () => {
  const tableData = generateFullTableData();
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleElementClick = (element: any) => {
    if (element.category !== 'placeholder' && element.category !== 'gap-for-f-block') {
      setSelectedElement(element);
      setModalOpen(true);
    }
  };

  return (
    <div className="periodic-table-container">
      <h1 className="text-foreground">Periodic Table of Elements</h1>
      <div className="periodic-table-grid">
        {tableData.map((element, index) => (
          <ElementCell 
            key={index} 
            element={element}
            onClick={() => handleElementClick(element)}
          />
        ))}
      </div>

      <ElementDetailModal
        element={selectedElement}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      <div className="legend">
        <h2>Category Legend</h2>
        <ul>
          <li className="category-alkali-metal">Alkali Metals</li>
          <li className="category-alkaline-earth-metal">Alkaline Earth Metals</li>
          <li className="category-transition-metal">Transition Metals</li>
          <li className="category-post-transition-metal">Post-Transition Metals</li>
          <li className="category-metalloid">Metalloids</li>
          <li className="category-nonmetal">Nonmetals</li>
          <li className="category-halogen">Halogens</li>
          <li className="category-noble-gas">Noble Gases</li>
          <li className="category-lanthanide">Lanthanides</li>
          <li className="category-actinide">Actinides</li>
        </ul>
      </div>
    </div>
  );
};

export default PeriodicTable;
