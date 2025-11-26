import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface Element {
  number: number;
  symbol: string;
  name: string;
  category: string;
  atomicMass?: number;
  electronConfiguration?: string;
  electronegativity?: number;
  meltingPoint?: number;
  boilingPoint?: number;
  density?: number;
  uses?: string[];
  discoveredBy?: string;
  discoveryYear?: number;
}

interface ElementDetailModalProps {
  element: Element | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const elementData: Record<number, Partial<Element>> = {
  1: { atomicMass: 1.008, electronConfiguration: '1s¹', electronegativity: 2.20, meltingPoint: -259.16, boilingPoint: -252.87, density: 0.0899, discoveredBy: 'Henry Cavendish', discoveryYear: 1766, uses: ['Fuel cells', 'Rocket fuel', 'Ammonia production', 'Oil refining'] },
  2: { atomicMass: 4.003, electronConfiguration: '1s²', electronegativity: undefined, meltingPoint: -272.2, boilingPoint: -268.93, density: 0.1785, discoveredBy: 'Pierre Janssen', discoveryYear: 1868, uses: ['Balloons', 'Cryogenics', 'Arc welding', 'Diving mixtures'] },
  3: { atomicMass: 6.941, electronConfiguration: '[He] 2s¹', electronegativity: 0.98, meltingPoint: 180.5, boilingPoint: 1342, density: 0.534, discoveredBy: 'Johan August Arfwedson', discoveryYear: 1817, uses: ['Batteries', 'Ceramics', 'Lubricants', 'Psychiatric medication'] },
  4: { atomicMass: 9.012, electronConfiguration: '[He] 2s²', electronegativity: 1.57, meltingPoint: 1287, boilingPoint: 2470, density: 1.85, discoveredBy: 'Louis Nicolas Vauquelin', discoveryYear: 1798, uses: ['Aerospace alloys', 'X-ray windows', 'Nuclear reactors', 'Electronics'] },
  5: { atomicMass: 10.811, electronConfiguration: '[He] 2s² 2p¹', electronegativity: 2.04, meltingPoint: 2075, boilingPoint: 4000, density: 2.34, discoveredBy: 'Joseph Louis Gay-Lussac', discoveryYear: 1808, uses: ['Fiberglass', 'Borosilicate glass', 'Detergents', 'Fire retardants'] },
  6: { atomicMass: 12.011, electronConfiguration: '[He] 2s² 2p²', electronegativity: 2.55, meltingPoint: 3550, boilingPoint: 4027, density: 2.267, discoveredBy: 'Known since ancient times', discoveryYear: undefined, uses: ['Steel production', 'Organic chemistry', 'Graphite', 'Diamonds'] },
  7: { atomicMass: 14.007, electronConfiguration: '[He] 2s² 2p³', electronegativity: 3.04, meltingPoint: -210.0, boilingPoint: -195.79, density: 1.2506, discoveredBy: 'Daniel Rutherford', discoveryYear: 1772, uses: ['Fertilizers', 'Explosives', 'Food preservation', 'Liquid nitrogen cooling'] },
  8: { atomicMass: 15.999, electronConfiguration: '[He] 2s² 2p⁴', electronegativity: 3.44, meltingPoint: -218.79, boilingPoint: -182.96, density: 1.429, discoveredBy: 'Joseph Priestley', discoveryYear: 1774, uses: ['Respiration', 'Steel production', 'Chemical manufacturing', 'Water treatment'] },
  9: { atomicMass: 18.998, electronConfiguration: '[He] 2s² 2p⁵', electronegativity: 3.98, meltingPoint: -219.67, boilingPoint: -188.11, density: 1.696, discoveredBy: 'Henri Moissan', discoveryYear: 1886, uses: ['Toothpaste', 'Teflon', 'Refrigerants', 'Uranium enrichment'] },
  10: { atomicMass: 20.180, electronConfiguration: '[He] 2s² 2p⁶', electronegativity: undefined, meltingPoint: -248.59, boilingPoint: -246.08, density: 0.8999, discoveredBy: 'William Ramsay', discoveryYear: 1898, uses: ['Neon signs', 'Lasers', 'Cryogenic refrigerant', 'Lighting'] },
  11: { atomicMass: 22.990, electronConfiguration: '[Ne] 3s¹', electronegativity: 0.93, meltingPoint: 97.72, boilingPoint: 883, density: 0.971, discoveredBy: 'Humphry Davy', discoveryYear: 1807, uses: ['Table salt', 'Street lights', 'Coolant', 'Chemical production'] },
  12: { atomicMass: 24.305, electronConfiguration: '[Ne] 3s²', electronegativity: 1.31, meltingPoint: 650, boilingPoint: 1090, density: 1.738, discoveredBy: 'Joseph Black', discoveryYear: 1755, uses: ['Alloys', 'Fireworks', 'Flares', 'Automotive parts'] },
  13: { atomicMass: 26.982, electronConfiguration: '[Ne] 3s² 3p¹', electronegativity: 1.61, meltingPoint: 660.32, boilingPoint: 2519, density: 2.698, discoveredBy: 'Hans Christian Ørsted', discoveryYear: 1825, uses: ['Aircraft', 'Beverage cans', 'Foil', 'Construction'] },
  14: { atomicMass: 28.086, electronConfiguration: '[Ne] 3s² 3p²', electronegativity: 1.90, meltingPoint: 1414, boilingPoint: 3265, density: 2.329, discoveredBy: 'Jöns Jacob Berzelius', discoveryYear: 1824, uses: ['Semiconductors', 'Solar cells', 'Glass', 'Ceramics'] },
  15: { atomicMass: 30.974, electronConfiguration: '[Ne] 3s² 3p³', electronegativity: 2.19, meltingPoint: 44.15, boilingPoint: 280.5, density: 1.82, discoveredBy: 'Hennig Brand', discoveryYear: 1669, uses: ['Fertilizers', 'Detergents', 'Matches', 'Pesticides'] },
  16: { atomicMass: 32.065, electronConfiguration: '[Ne] 3s² 3p⁴', electronegativity: 2.58, meltingPoint: 115.21, boilingPoint: 444.72, density: 2.067, discoveredBy: 'Known since ancient times', discoveryYear: undefined, uses: ['Sulfuric acid', 'Gunpowder', 'Matches', 'Vulcanizing rubber'] },
  17: { atomicMass: 35.453, electronConfiguration: '[Ne] 3s² 3p⁵', electronegativity: 3.16, meltingPoint: -101.5, boilingPoint: -34.04, density: 3.214, discoveredBy: 'Carl Wilhelm Scheele', discoveryYear: 1774, uses: ['Water purification', 'Bleach', 'PVC', 'Disinfectants'] },
  18: { atomicMass: 39.948, electronConfiguration: '[Ne] 3s² 3p⁶', electronegativity: undefined, meltingPoint: -189.35, boilingPoint: -185.85, density: 1.7837, discoveredBy: 'Lord Rayleigh', discoveryYear: 1894, uses: ['Welding', 'Light bulbs', 'Insulation', 'Lasers'] },
  19: { atomicMass: 39.098, electronConfiguration: '[Ar] 4s¹', electronegativity: 0.82, meltingPoint: 63.5, boilingPoint: 759, density: 0.862, discoveredBy: 'Humphry Davy', discoveryYear: 1807, uses: ['Fertilizers', 'Soap', 'Glass', 'Detergents'] },
  20: { atomicMass: 40.078, electronConfiguration: '[Ar] 4s²', electronegativity: 1.00, meltingPoint: 842, boilingPoint: 1484, density: 1.54, discoveredBy: 'Humphry Davy', discoveryYear: 1808, uses: ['Cement', 'Plaster', 'Bones and teeth', 'Steel production'] },
  21: { atomicMass: 44.956, electronConfiguration: '[Ar] 3d¹ 4s²', electronegativity: 1.36, meltingPoint: 1541, boilingPoint: 2836, density: 2.989, discoveredBy: 'Lars Fredrik Nilson', discoveryYear: 1879, uses: ['Aluminum-scandium alloys', 'Light metal alloys', 'Mercury lamps', 'Radioactive tracers'] },
  22: { atomicMass: 47.867, electronConfiguration: '[Ar] 3d² 4s²', electronegativity: 1.54, meltingPoint: 1668, boilingPoint: 3287, density: 4.506, discoveredBy: 'William Gregor', discoveryYear: 1791, uses: ['Aircraft', 'Spacecraft', 'Medical implants', 'White pigment'] },
  23: { atomicMass: 50.942, electronConfiguration: '[Ar] 3d³ 4s²', electronegativity: 1.63, meltingPoint: 1910, boilingPoint: 3407, density: 6.11, discoveredBy: 'Andrés Manuel del Río', discoveryYear: 1801, uses: ['Steel alloys', 'Tools', 'Springs', 'Nuclear reactors'] },
  24: { atomicMass: 51.996, electronConfiguration: '[Ar] 3d⁵ 4s¹', electronegativity: 1.66, meltingPoint: 1907, boilingPoint: 2671, density: 7.15, discoveredBy: 'Louis Nicolas Vauquelin', discoveryYear: 1797, uses: ['Stainless steel', 'Chrome plating', 'Pigments', 'Wood preservatives'] },
  25: { atomicMass: 54.938, electronConfiguration: '[Ar] 3d⁵ 4s²', electronegativity: 1.55, meltingPoint: 1246, boilingPoint: 2061, density: 7.44, discoveredBy: 'Johan Gottlieb Gahn', discoveryYear: 1774, uses: ['Steel production', 'Batteries', 'Ceramics', 'Fertilizers'] },
  26: { atomicMass: 55.845, electronConfiguration: '[Ar] 3d⁶ 4s²', electronegativity: 1.83, meltingPoint: 1538, boilingPoint: 2862, density: 7.874, discoveredBy: 'Known since ancient times', discoveryYear: undefined, uses: ['Construction', 'Machinery', 'Tools', 'Vehicles'] },
  27: { atomicMass: 58.933, electronConfiguration: '[Ar] 3d⁷ 4s²', electronegativity: 1.88, meltingPoint: 1495, boilingPoint: 2927, density: 8.86, discoveredBy: 'Georg Brandt', discoveryYear: 1735, uses: ['Superalloys', 'Magnets', 'Batteries', 'Blue pigments'] },
  28: { atomicMass: 58.693, electronConfiguration: '[Ar] 3d⁸ 4s²', electronegativity: 1.91, meltingPoint: 1455, boilingPoint: 2913, density: 8.912, discoveredBy: 'Axel Fredrik Cronstedt', discoveryYear: 1751, uses: ['Stainless steel', 'Batteries', 'Coins', 'Catalysts'] },
  29: { atomicMass: 63.546, electronConfiguration: '[Ar] 3d¹⁰ 4s¹', electronegativity: 1.90, meltingPoint: 1084.62, boilingPoint: 2562, density: 8.96, discoveredBy: 'Known since ancient times', discoveryYear: undefined, uses: ['Electrical wiring', 'Plumbing', 'Electronics', 'Coins'] },
  30: { atomicMass: 65.38, electronConfiguration: '[Ar] 3d¹⁰ 4s²', electronegativity: 1.65, meltingPoint: 419.53, boilingPoint: 907, density: 7.134, discoveredBy: 'Known since ancient times', discoveryYear: undefined, uses: ['Galvanizing', 'Batteries', 'Alloys', 'Dietary supplement'] },
  31: { atomicMass: 69.723, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p¹', electronegativity: 1.81, meltingPoint: 29.76, boilingPoint: 2204, density: 5.907, discoveredBy: 'Paul-Émile Lecoq de Boisbaudran', discoveryYear: 1875, uses: ['Semiconductors', 'LEDs', 'Solar cells', 'Alloys'] },
  32: { atomicMass: 72.64, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p²', electronegativity: 2.01, meltingPoint: 938.25, boilingPoint: 2833, density: 5.323, discoveredBy: 'Clemens Winkler', discoveryYear: 1886, uses: ['Fiber optics', 'Infrared optics', 'Semiconductors', 'Transistors'] },
  33: { atomicMass: 74.922, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p³', electronegativity: 2.18, meltingPoint: 817, boilingPoint: 614, density: 5.776, discoveredBy: 'Albertus Magnus', discoveryYear: 1250, uses: ['Wood preservatives', 'Semiconductors', 'Alloys', 'Pesticides'] },
  34: { atomicMass: 78.96, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p⁴', electronegativity: 2.55, meltingPoint: 221, boilingPoint: 685, density: 4.809, discoveredBy: 'Jöns Jacob Berzelius', discoveryYear: 1817, uses: ['Electronics', 'Glass production', 'Pigments', 'Photocells'] },
  35: { atomicMass: 79.904, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p⁵', electronegativity: 2.96, meltingPoint: -7.2, boilingPoint: 58.8, density: 3.122, discoveredBy: 'Antoine Jérôme Balard', discoveryYear: 1826, uses: ['Flame retardants', 'Photography', 'Water purification', 'Dyes'] },
  36: { atomicMass: 83.798, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p⁶', electronegativity: 3.00, meltingPoint: -157.36, boilingPoint: -153.22, density: 3.733, discoveredBy: 'William Ramsay', discoveryYear: 1898, uses: ['Lasers', 'Lighting', 'Insulation', 'Anesthesia'] },
  37: { atomicMass: 85.468, electronConfiguration: '[Kr] 5s¹', electronegativity: 0.82, meltingPoint: 39.31, boilingPoint: 688, density: 1.532, discoveredBy: 'Robert Bunsen', discoveryYear: 1861, uses: ['Photocells', 'Atomic clocks', 'Medical imaging', 'Glass production'] },
  38: { atomicMass: 87.62, electronConfiguration: '[Kr] 5s²', electronegativity: 0.95, meltingPoint: 777, boilingPoint: 1382, density: 2.64, discoveredBy: 'Adair Crawford', discoveryYear: 1790, uses: ['Fireworks', 'Magnets', 'Zinc refining', 'Sugar refining'] },
  39: { atomicMass: 88.906, electronConfiguration: '[Kr] 4d¹ 5s²', electronegativity: 1.22, meltingPoint: 1526, boilingPoint: 3345, density: 4.469, discoveredBy: 'Johan Gadolin', discoveryYear: 1794, uses: ['LEDs', 'Lasers', 'Camera lenses', 'Superconductors'] },
  40: { atomicMass: 91.224, electronConfiguration: '[Kr] 4d² 5s²', electronegativity: 1.33, meltingPoint: 1855, boilingPoint: 4409, density: 6.506, discoveredBy: 'Martin Heinrich Klaproth', discoveryYear: 1789, uses: ['Nuclear reactors', 'Alloys', 'Ceramics', 'Surgical instruments'] },
  41: { atomicMass: 92.906, electronConfiguration: '[Kr] 4d⁴ 5s¹', electronegativity: 1.6, meltingPoint: 2477, boilingPoint: 4744, density: 8.57, discoveredBy: 'Charles Hatchett', discoveryYear: 1801, uses: ['Steel alloys', 'Superconductors', 'Jet engines', 'Capacitors'] },
  42: { atomicMass: 95.96, electronConfiguration: '[Kr] 4d⁵ 5s¹', electronegativity: 2.16, meltingPoint: 2623, boilingPoint: 4639, density: 10.22, discoveredBy: 'Carl Wilhelm Scheele', discoveryYear: 1778, uses: ['Steel alloys', 'Lubricants', 'Catalysts', 'Electrodes'] },
  43: { atomicMass: 98, electronConfiguration: '[Kr] 4d⁵ 5s²', electronegativity: 1.9, meltingPoint: 2157, boilingPoint: 4265, density: 11.5, discoveredBy: 'Emilio Segrè', discoveryYear: 1937, uses: ['Medical imaging', 'Cancer treatment', 'Corrosion prevention', 'Superconductors'] },
  44: { atomicMass: 101.07, electronConfiguration: '[Kr] 4d⁷ 5s¹', electronegativity: 2.2, meltingPoint: 2334, boilingPoint: 4150, density: 12.37, discoveredBy: 'Karl Ernst Claus', discoveryYear: 1844, uses: ['Electrical contacts', 'Chip resistors', 'Electrodes', 'Jewelry'] },
  45: { atomicMass: 102.91, electronConfiguration: '[Kr] 4d⁸ 5s¹', electronegativity: 2.28, meltingPoint: 1964, boilingPoint: 3695, density: 12.41, discoveredBy: 'William Hyde Wollaston', discoveryYear: 1803, uses: ['Catalytic converters', 'Jewelry', 'Electrical contacts', 'Thermocouples'] },
  46: { atomicMass: 106.42, electronConfiguration: '[Kr] 4d¹⁰', electronegativity: 2.20, meltingPoint: 1554.9, boilingPoint: 2963, density: 12.02, discoveredBy: 'William Hyde Wollaston', discoveryYear: 1803, uses: ['Catalytic converters', 'Electronics', 'Dentistry', 'Jewelry'] },
  47: { atomicMass: 107.87, electronConfiguration: '[Kr] 4d¹⁰ 5s¹', electronegativity: 1.93, meltingPoint: 961.78, boilingPoint: 2162, density: 10.501, discoveredBy: 'Known since ancient times', discoveryYear: undefined, uses: ['Jewelry', 'Coins', 'Electronics', 'Photography'] },
  48: { atomicMass: 112.41, electronConfiguration: '[Kr] 4d¹⁰ 5s²', electronegativity: 1.69, meltingPoint: 321.07, boilingPoint: 767, density: 8.69, discoveredBy: 'Karl Samuel Leberecht Hermann', discoveryYear: 1817, uses: ['Batteries', 'Pigments', 'Coatings', 'Solar cells'] },
  49: { atomicMass: 114.82, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p¹', electronegativity: 1.78, meltingPoint: 156.6, boilingPoint: 2072, density: 7.31, discoveredBy: 'Ferdinand Reich', discoveryYear: 1863, uses: ['LCD screens', 'Semiconductors', 'Alloys', 'Solders'] },
  50: { atomicMass: 118.71, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p²', electronegativity: 1.96, meltingPoint: 231.93, boilingPoint: 2602, density: 7.287, discoveredBy: 'Known since ancient times', discoveryYear: undefined, uses: ['Tin cans', 'Solders', 'Bronze', 'Organ pipes'] },
  51: { atomicMass: 121.76, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p³', electronegativity: 2.05, meltingPoint: 630.63, boilingPoint: 1587, density: 6.685, discoveredBy: 'Known since ancient times', discoveryYear: undefined, uses: ['Flame retardants', 'Semiconductors', 'Alloys', 'Batteries'] },
  52: { atomicMass: 127.60, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p⁴', electronegativity: 2.1, meltingPoint: 449.51, boilingPoint: 988, density: 6.232, discoveredBy: 'Franz-Joseph Müller von Reichenstein', discoveryYear: 1782, uses: ['Solar cells', 'Thermoelectric devices', 'Alloys', 'Rubber vulcanization'] },
  53: { atomicMass: 126.90, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p⁵', electronegativity: 2.66, meltingPoint: 113.7, boilingPoint: 184.3, density: 4.93, discoveredBy: 'Bernard Courtois', discoveryYear: 1811, uses: ['Disinfectants', 'X-ray contrast media', 'Photography', 'Pharmaceuticals'] },
  54: { atomicMass: 131.29, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p⁶', electronegativity: 2.60, meltingPoint: -111.8, boilingPoint: -108.1, density: 5.887, discoveredBy: 'William Ramsay', discoveryYear: 1898, uses: ['Lighting', 'Medical imaging', 'Ion propulsion', 'Anesthesia'] },
  55: { atomicMass: 132.91, electronConfiguration: '[Xe] 6s¹', electronegativity: 0.79, meltingPoint: 28.44, boilingPoint: 671, density: 1.873, discoveredBy: 'Robert Bunsen', discoveryYear: 1860, uses: ['Atomic clocks', 'Photoelectric cells', 'Ion propulsion', 'Catalysts'] },
  56: { atomicMass: 137.33, electronConfiguration: '[Xe] 6s²', electronegativity: 0.89, meltingPoint: 727, boilingPoint: 1897, density: 3.594, discoveredBy: 'Carl Wilhelm Scheele', discoveryYear: 1772, uses: ['Drilling fluids', 'X-ray imaging', 'Fireworks', 'Vacuum tubes'] },
  57: { atomicMass: 138.91, electronConfiguration: '[Xe] 5d¹ 6s²', electronegativity: 1.10, meltingPoint: 920, boilingPoint: 3464, density: 6.145, discoveredBy: 'Carl Gustaf Mosander', discoveryYear: 1839, uses: ['Camera lenses', 'Studio lighting', 'Carbon arc lights', 'Alloys'] },
  58: { atomicMass: 140.12, electronConfiguration: '[Xe] 4f¹ 5d¹ 6s²', electronegativity: 1.12, meltingPoint: 798, boilingPoint: 3443, density: 6.770, discoveredBy: 'Martin Heinrich Klaproth', discoveryYear: 1803, uses: ['Catalytic converters', 'Self-cleaning ovens', 'Glass polishing', 'Lighter flints'] },
  59: { atomicMass: 140.91, electronConfiguration: '[Xe] 4f³ 6s²', electronegativity: 1.13, meltingPoint: 931, boilingPoint: 3520, density: 6.773, discoveredBy: 'Carl Auer von Welsbach', discoveryYear: 1885, uses: ['Aircraft engines', 'Welding goggles', 'Lighter flints', 'Magnets'] },
  60: { atomicMass: 144.24, electronConfiguration: '[Xe] 4f⁴ 6s²', electronegativity: 1.14, meltingPoint: 1016, boilingPoint: 3074, density: 7.007, discoveredBy: 'Carl Auer von Welsbach', discoveryYear: 1885, uses: ['Magnets', 'Lasers', 'Capacitors', 'Glass coloring'] },
  61: { atomicMass: 145, electronConfiguration: '[Xe] 4f⁵ 6s²', electronegativity: 1.13, meltingPoint: 1042, boilingPoint: 3000, density: 7.26, discoveredBy: 'Jacob A. Marinsky', discoveryYear: 1945, uses: ['Nuclear batteries', 'Luminous paint', 'Research', 'Atomic batteries'] },
  62: { atomicMass: 150.36, electronConfiguration: '[Xe] 4f⁶ 6s²', electronegativity: 1.17, meltingPoint: 1072, boilingPoint: 1794, density: 7.52, discoveredBy: 'Paul-Émile Lecoq de Boisbaudran', discoveryYear: 1879, uses: ['Magnets', 'Nuclear reactors', 'Cancer treatment', 'Masers'] },
  63: { atomicMass: 151.96, electronConfiguration: '[Xe] 4f⁷ 6s²', electronegativity: 1.2, meltingPoint: 822, boilingPoint: 1596, density: 5.243, discoveredBy: 'Eugène-Anatole Demarçay', discoveryYear: 1901, uses: ['Control rods', 'TV phosphors', 'Lasers', 'Nuclear shielding'] },
  64: { atomicMass: 157.25, electronConfiguration: '[Xe] 4f⁷ 5d¹ 6s²', electronegativity: 1.20, meltingPoint: 1313, boilingPoint: 3273, density: 7.895, discoveredBy: 'Jean Charles Galissard de Marignac', discoveryYear: 1880, uses: ['MRI contrast agents', 'Magnets', 'Microwave applications', 'Phosphors'] },
  65: { atomicMass: 158.93, electronConfiguration: '[Xe] 4f⁹ 6s²', electronegativity: 1.2, meltingPoint: 1356, boilingPoint: 3230, density: 8.229, discoveredBy: 'Carl Gustaf Mosander', discoveryYear: 1843, uses: ['Magnetostrictive alloys', 'Solid-state devices', 'Green phosphors', 'Lasers'] },
  66: { atomicMass: 162.50, electronConfiguration: '[Xe] 4f¹⁰ 6s²', electronegativity: 1.22, meltingPoint: 1412, boilingPoint: 2567, density: 8.55, discoveredBy: 'Paul-Émile Lecoq de Boisbaudran', discoveryYear: 1886, uses: ['Lasers', 'Commercial lighting', 'Magnetic materials', 'Dosimeters'] },
  67: { atomicMass: 164.93, electronConfiguration: '[Xe] 4f¹¹ 6s²', electronegativity: 1.23, meltingPoint: 1474, boilingPoint: 2700, density: 8.795, discoveredBy: 'Marc Delafontaine', discoveryYear: 1878, uses: ['Lasers', 'Magnets', 'Nuclear reactors', 'Calibration'] },
  68: { atomicMass: 167.26, electronConfiguration: '[Xe] 4f¹² 6s²', electronegativity: 1.24, meltingPoint: 1529, boilingPoint: 2868, density: 9.066, discoveredBy: 'Carl Gustaf Mosander', discoveryYear: 1843, uses: ['Lasers', 'Nuclear technology', 'Vanadium alloys', 'Optical fibers'] },
  69: { atomicMass: 168.93, electronConfiguration: '[Xe] 4f¹³ 6s²', electronegativity: 1.25, meltingPoint: 1545, boilingPoint: 1950, density: 9.321, discoveredBy: 'Per Teodor Cleve', discoveryYear: 1879, uses: ['Portable X-ray devices', 'Lasers', 'Solid-state lasers', 'Euro banknote authentication'] },
  70: { atomicMass: 173.05, electronConfiguration: '[Xe] 4f¹⁴ 6s²', electronegativity: 1.1, meltingPoint: 819, boilingPoint: 1196, density: 6.965, discoveredBy: 'Jean Charles Galissard de Marignac', discoveryYear: 1878, uses: ['Stainless steel', 'Lasers', 'Chemical reducing agent', 'Memory devices'] },
  71: { atomicMass: 174.97, electronConfiguration: '[Xe] 4f¹⁴ 5d¹ 6s²', electronegativity: 1.27, meltingPoint: 1663, boilingPoint: 3402, density: 9.84, discoveredBy: 'Georges Urbain', discoveryYear: 1907, uses: ['Catalysts', 'Phosphors', 'LEDs', 'Scintillators'] },
  72: { atomicMass: 178.49, electronConfiguration: '[Xe] 4f¹⁴ 5d² 6s²', electronegativity: 1.3, meltingPoint: 2233, boilingPoint: 4603, density: 13.31, discoveredBy: 'Dirk Coster', discoveryYear: 1923, uses: ['Superalloys', 'Control rods', 'Plasma cutting', 'Microprocessors'] },
  73: { atomicMass: 180.95, electronConfiguration: '[Xe] 4f¹⁴ 5d³ 6s²', electronegativity: 1.5, meltingPoint: 3017, boilingPoint: 5458, density: 16.654, discoveredBy: 'Anders Gustaf Ekeberg', discoveryYear: 1802, uses: ['Superalloys', 'Capacitors', 'Surgical implants', 'Rocket nozzles'] },
  74: { atomicMass: 183.84, electronConfiguration: '[Xe] 4f¹⁴ 5d⁴ 6s²', electronegativity: 2.36, meltingPoint: 3422, boilingPoint: 5555, density: 19.25, discoveredBy: 'Carl Wilhelm Scheele', discoveryYear: 1781, uses: ['Light bulb filaments', 'X-ray tubes', 'Electrodes', 'Superalloys'] },
  75: { atomicMass: 186.21, electronConfiguration: '[Xe] 4f¹⁴ 5d⁵ 6s²', electronegativity: 1.9, meltingPoint: 3186, boilingPoint: 5596, density: 21.02, discoveredBy: 'Masataka Ogawa', discoveryYear: 1908, uses: ['Superalloys', 'Catalysts', 'Thermocouples', 'X-ray tubes'] },
  76: { atomicMass: 190.23, electronConfiguration: '[Xe] 4f¹⁴ 5d⁶ 6s²', electronegativity: 2.2, meltingPoint: 3033, boilingPoint: 5012, density: 22.61, discoveredBy: 'Smithson Tennant', discoveryYear: 1803, uses: ['Fountain pen tips', 'Electrical contacts', 'Electrodes', 'Hardening alloys'] },
  77: { atomicMass: 192.22, electronConfiguration: '[Xe] 4f¹⁴ 5d⁷ 6s²', electronegativity: 2.20, meltingPoint: 2446, boilingPoint: 4428, density: 22.56, discoveredBy: 'Smithson Tennant', discoveryYear: 1803, uses: ['Spark plugs', 'Crucibles', 'Electrodes', 'Compass bearings'] },
  78: { atomicMass: 195.08, electronConfiguration: '[Xe] 4f¹⁴ 5d⁹ 6s¹', electronegativity: 2.28, meltingPoint: 1768.3, boilingPoint: 3825, density: 21.46, discoveredBy: 'Antonio de Ulloa', discoveryYear: 1735, uses: ['Catalytic converters', 'Jewelry', 'Electrodes', 'Thermocouples'] },
  79: { atomicMass: 196.97, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', electronegativity: 2.54, meltingPoint: 1064.18, boilingPoint: 2856, density: 19.32, discoveredBy: 'Known since ancient times', discoveryYear: undefined, uses: ['Jewelry', 'Electronics', 'Dentistry', 'Investment'] },
  80: { atomicMass: 200.59, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', electronegativity: 2.00, meltingPoint: -38.83, boilingPoint: 356.73, density: 13.534, discoveredBy: 'Known since ancient times', discoveryYear: undefined, uses: ['Thermometers', 'Barometers', 'Dental amalgams', 'Fluorescent lamps'] },
  81: { atomicMass: 204.38, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', electronegativity: 1.62, meltingPoint: 304, boilingPoint: 1473, density: 11.85, discoveredBy: 'William Crookes', discoveryYear: 1861, uses: ['Electronics', 'Infrared detectors', 'Low-melting alloys', 'Scintillation counters'] },
  82: { atomicMass: 207.2, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', electronegativity: 2.33, meltingPoint: 327.46, boilingPoint: 1749, density: 11.342, discoveredBy: 'Known since ancient times', discoveryYear: undefined, uses: ['Batteries', 'Radiation shielding', 'Ammunition', 'Construction'] },
  83: { atomicMass: 208.98, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', electronegativity: 2.02, meltingPoint: 271.4, boilingPoint: 1564, density: 9.807, discoveredBy: 'Claude François Geoffroy', discoveryYear: 1753, uses: ['Pharmaceuticals', 'Cosmetics', 'Pigments', 'Fire detection'] },
  84: { atomicMass: 209, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', electronegativity: 2.0, meltingPoint: 254, boilingPoint: 962, density: 9.32, discoveredBy: 'Marie Curie', discoveryYear: 1898, uses: ['Thermoelectric power', 'Atomic batteries', 'Anti-static brushes', 'Neutron sources'] },
  85: { atomicMass: 210, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', electronegativity: 2.2, meltingPoint: 302, boilingPoint: 337, density: 7, discoveredBy: 'Dale R. Corson', discoveryYear: 1940, uses: ['Cancer treatment', 'Radiotherapy', 'Tracer studies', 'Research only'] },
  86: { atomicMass: 222, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', electronegativity: undefined, meltingPoint: -71, boilingPoint: -61.7, density: 9.73, discoveredBy: 'Friedrich Ernst Dorn', discoveryYear: 1900, uses: ['Earthquake prediction', 'Radiotherapy', 'Leak detection', 'Environmental monitoring'] },
  87: { atomicMass: 223, electronConfiguration: '[Rn] 7s¹', electronegativity: 0.7, meltingPoint: 27, boilingPoint: 677, density: 1.87, discoveredBy: 'Marguerite Perey', discoveryYear: 1939, uses: ['Research', 'Medical diagnostics', 'Atomic clocks', 'Scientific studies'] },
  88: { atomicMass: 226, electronConfiguration: '[Rn] 7s²', electronegativity: 0.9, meltingPoint: 700, boilingPoint: 1737, density: 5.5, discoveredBy: 'Marie Curie', discoveryYear: 1898, uses: ['Cancer treatment', 'Industrial radiography', 'Luminous paints', 'Neutron sources'] },
  89: { atomicMass: 227, electronConfiguration: '[Rn] 6d¹ 7s²', electronegativity: 1.1, meltingPoint: 1050, boilingPoint: 3200, density: 10.07, discoveredBy: 'André-Louis Debierne', discoveryYear: 1899, uses: ['Neutron sources', 'Thermoelectric generators', 'Research', 'Nuclear technology'] },
  90: { atomicMass: 232.04, electronConfiguration: '[Rn] 6d² 7s²', electronegativity: 1.3, meltingPoint: 1750, boilingPoint: 4788, density: 11.72, discoveredBy: 'Jöns Jacob Berzelius', discoveryYear: 1828, uses: ['Nuclear reactors', 'Gas mantles', 'Ceramics', 'Aerospace'] },
  91: { atomicMass: 231.04, electronConfiguration: '[Rn] 5f² 6d¹ 7s²', electronegativity: 1.5, meltingPoint: 1572, boilingPoint: 4027, density: 15.37, discoveredBy: 'Kasimir Fajans', discoveryYear: 1913, uses: ['Nuclear research', 'Uranium dating', 'Scientific studies', 'Isotope production'] },
  92: { atomicMass: 238.03, electronConfiguration: '[Rn] 5f³ 6d¹ 7s²', electronegativity: 1.38, meltingPoint: 1135, boilingPoint: 4131, density: 18.95, discoveredBy: 'Martin Heinrich Klaproth', discoveryYear: 1789, uses: ['Nuclear fuel', 'Nuclear weapons', 'Dating rocks', 'Ship propulsion'] },
  93: { atomicMass: 237, electronConfiguration: '[Rn] 5f⁴ 6d¹ 7s²', electronegativity: 1.36, meltingPoint: 644, boilingPoint: 3902, density: 20.25, discoveredBy: 'Edwin McMillan', discoveryYear: 1940, uses: ['Neutron detection', 'Nuclear research', 'Plutonium production', 'Scientific studies'] },
  94: { atomicMass: 244, electronConfiguration: '[Rn] 5f⁶ 7s²', electronegativity: 1.28, meltingPoint: 640, boilingPoint: 3228, density: 19.84, discoveredBy: 'Glenn T. Seaborg', discoveryYear: 1940, uses: ['Nuclear weapons', 'Nuclear reactors', 'Spacecraft power', 'Pacemakers'] },
  95: { atomicMass: 243, electronConfiguration: '[Rn] 5f⁷ 7s²', electronegativity: 1.3, meltingPoint: 1176, boilingPoint: 2011, density: 13.69, discoveredBy: 'Glenn T. Seaborg', discoveryYear: 1944, uses: ['Smoke detectors', 'Research', 'Nuclear reactors', 'Portable X-ray'] },
  96: { atomicMass: 247, electronConfiguration: '[Rn] 5f⁷ 6d¹ 7s²', electronegativity: 1.3, meltingPoint: 1345, boilingPoint: 3110, density: 13.51, discoveredBy: 'Glenn T. Seaborg', discoveryYear: 1944, uses: ['Alpha particle sources', 'Thermoelectric generators', 'Research', 'Nuclear batteries'] },
  97: { atomicMass: 247, electronConfiguration: '[Rn] 5f⁹ 7s²', electronegativity: 1.3, meltingPoint: 986, boilingPoint: 2627, density: 14.79, discoveredBy: 'Glenn T. Seaborg', discoveryYear: 1949, uses: ['Research only', 'Scientific studies', 'Nuclear physics', 'Isotope production'] },
  98: { atomicMass: 251, electronConfiguration: '[Rn] 5f¹⁰ 7s²', electronegativity: 1.3, meltingPoint: 900, boilingPoint: 1470, density: 15.1, discoveredBy: 'Glenn T. Seaborg', discoveryYear: 1950, uses: ['Research only', 'Scientific studies', 'Heavy element synthesis', 'Nuclear studies'] },
  99: { atomicMass: 252, electronConfiguration: '[Rn] 5f¹¹ 7s²', electronegativity: 1.3, meltingPoint: 860, boilingPoint: 996, density: 8.84, discoveredBy: 'Albert Ghiorso', discoveryYear: 1952, uses: ['Research only', 'Scientific studies', 'Heavy element production', 'Nuclear experiments'] },
  100: { atomicMass: 257, electronConfiguration: '[Rn] 5f¹² 7s²', electronegativity: 1.3, meltingPoint: 1527, boilingPoint: undefined, density: undefined, discoveredBy: 'Albert Ghiorso', discoveryYear: 1952, uses: ['Research only', 'Scientific studies', 'Nuclear physics', 'Element synthesis'] },
  101: { atomicMass: 258, electronConfiguration: '[Rn] 5f¹³ 7s²', electronegativity: 1.3, meltingPoint: 1527, boilingPoint: undefined, density: undefined, discoveredBy: 'Albert Ghiorso', discoveryYear: 1955, uses: ['Research only', 'Scientific studies', 'Nuclear research', 'Atomic studies'] },
  102: { atomicMass: 259, electronConfiguration: '[Rn] 5f¹⁴ 7s²', electronegativity: 1.3, meltingPoint: 827, boilingPoint: undefined, density: undefined, discoveredBy: 'Albert Ghiorso', discoveryYear: 1958, uses: ['Research only', 'Scientific studies', 'Nuclear chemistry', 'Heavy elements'] },
  103: { atomicMass: 262, electronConfiguration: '[Rn] 5f¹⁴ 6d¹ 7s²', electronegativity: 1.3, meltingPoint: 1627, boilingPoint: undefined, density: undefined, discoveredBy: 'Albert Ghiorso', discoveryYear: 1961, uses: ['Research only', 'Scientific studies', 'Nuclear physics', 'Element research'] },
  104: { atomicMass: 267, electronConfiguration: '[Rn] 5f¹⁴ 6d² 7s²', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Albert Ghiorso', discoveryYear: 1969, uses: ['Research only', 'Scientific studies', 'Nuclear research', 'Synthetic element'] },
  105: { atomicMass: 268, electronConfiguration: '[Rn] 5f¹⁴ 6d³ 7s²', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Albert Ghiorso', discoveryYear: 1970, uses: ['Research only', 'Scientific studies', 'Nuclear experiments', 'Synthetic element'] },
  106: { atomicMass: 271, electronConfiguration: '[Rn] 5f¹⁴ 6d⁴ 7s²', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Albert Ghiorso', discoveryYear: 1974, uses: ['Research only', 'Scientific studies', 'Nuclear physics', 'Synthetic element'] },
  107: { atomicMass: 272, electronConfiguration: '[Rn] 5f¹⁴ 6d⁵ 7s²', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Peter Armbruster', discoveryYear: 1981, uses: ['Research only', 'Scientific studies', 'Nuclear research', 'Synthetic element'] },
  108: { atomicMass: 270, electronConfiguration: '[Rn] 5f¹⁴ 5d⁶ 7s²', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Peter Armbruster', discoveryYear: 1984, uses: ['Research only', 'Scientific studies', 'Nuclear chemistry', 'Synthetic element'] },
  109: { atomicMass: 276, electronConfiguration: '[Rn] 5f¹⁴ 6d⁷ 7s²', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Peter Armbruster', discoveryYear: 1982, uses: ['Research only', 'Scientific studies', 'Nuclear physics', 'Synthetic element'] },
  110: { atomicMass: 281, electronConfiguration: '[Rn] 5f¹⁴ 6d⁸ 7s²', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Sigurd Hofmann', discoveryYear: 1994, uses: ['Research only', 'Scientific studies', 'Nuclear experiments', 'Synthetic element'] },
  111: { atomicMass: 280, electronConfiguration: '[Rn] 5f¹⁴ 6d⁹ 7s²', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Sigurd Hofmann', discoveryYear: 1994, uses: ['Research only', 'Scientific studies', 'Nuclear research', 'Synthetic element'] },
  112: { atomicMass: 285, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Sigurd Hofmann', discoveryYear: 1996, uses: ['Research only', 'Scientific studies', 'Nuclear physics', 'Synthetic element'] },
  113: { atomicMass: 284, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Kosuke Morita', discoveryYear: 2003, uses: ['Research only', 'Scientific studies', 'Nuclear chemistry', 'Synthetic element'] },
  114: { atomicMass: 289, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Yuri Oganessian', discoveryYear: 1999, uses: ['Research only', 'Scientific studies', 'Nuclear research', 'Synthetic element'] },
  115: { atomicMass: 288, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Yuri Oganessian', discoveryYear: 2003, uses: ['Research only', 'Scientific studies', 'Nuclear physics', 'Synthetic element'] },
  116: { atomicMass: 293, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Yuri Oganessian', discoveryYear: 2000, uses: ['Research only', 'Scientific studies', 'Nuclear experiments', 'Synthetic element'] },
  117: { atomicMass: 294, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Yuri Oganessian', discoveryYear: 2010, uses: ['Research only', 'Scientific studies', 'Nuclear research', 'Synthetic element'] },
  118: { atomicMass: 294, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', electronegativity: undefined, meltingPoint: undefined, boilingPoint: undefined, density: undefined, discoveredBy: 'Yuri Oganessian', discoveryYear: 2002, uses: ['Research only', 'Scientific studies', 'Nuclear physics', 'Synthetic element'] },
};

export function ElementDetailModal({ element, open, onOpenChange }: ElementDetailModalProps) {
  if (!element) return null;

  const details = elementData[element.number] || {};
  const combinedElement = { ...element, ...details };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'alkali-metal': 'bg-orange-500',
      'alkaline-earth-metal': 'bg-orange-400',
      'transition-metal': 'bg-green-500',
      'post-transition-metal': 'bg-green-400',
      'metalloid': 'bg-purple-500',
      'nonmetal': 'bg-blue-500',
      'halogen': 'bg-blue-400',
      'noble-gas': 'bg-purple-600',
      'lanthanide': 'bg-yellow-400',
      'actinide': 'bg-yellow-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-lg ${getCategoryColor(element.category)} flex items-center justify-center text-white`}>
              <div className="text-center">
                <div className="text-xs">{element.number}</div>
                <div className="text-3xl font-bold">{element.symbol}</div>
              </div>
            </div>
            <div>
              <DialogTitle className="text-3xl">{element.name}</DialogTitle>
              <DialogDescription className="text-lg">
                {element.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="uses">Uses</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                {combinedElement.atomicMass && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Atomic Mass:</span>
                    <span>{combinedElement.atomicMass} u</span>
                  </div>
                )}
                {combinedElement.electronConfiguration && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Electron Configuration:</span>
                    <span className="font-mono text-sm">{combinedElement.electronConfiguration}</span>
                  </div>
                )}
                {combinedElement.electronegativity && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Electronegativity:</span>
                    <span>{combinedElement.electronegativity}</span>
                  </div>
                )}
                {combinedElement.meltingPoint !== undefined && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Melting Point:</span>
                    <span>{combinedElement.meltingPoint}°C</span>
                  </div>
                )}
                {combinedElement.boilingPoint !== undefined && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Boiling Point:</span>
                    <span>{combinedElement.boilingPoint}°C</span>
                  </div>
                )}
                {combinedElement.density && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Density:</span>
                    <span>{combinedElement.density} g/cm³</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {(combinedElement.discoveredBy || combinedElement.discoveryYear) && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Discovery</h3>
                  {combinedElement.discoveredBy && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Discovered by:</strong> {combinedElement.discoveredBy}
                    </p>
                  )}
                  {combinedElement.discoveryYear && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Year:</strong> {combinedElement.discoveryYear}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="structure">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-64 h-64 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary rounded-full animate-pulse" />
                  </div>
                  {[...Array(Math.min(element.number, 7))].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-4 h-4 bg-secondary rounded-full"
                      style={{
                        top: `${50 + 35 * Math.cos((i * 2 * Math.PI) / Math.min(element.number, 7))}%`,
                        left: `${50 + 35 * Math.sin((i * 2 * Math.PI) / Math.min(element.number, 7))}%`,
                        animation: `orbit ${3 + i}s linear infinite`,
                      }}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Simplified atomic structure visualization
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Nucleus with {element.number} proton{element.number !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uses">
            <Card>
              <CardContent className="pt-6">
                {combinedElement.uses && combinedElement.uses.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold mb-3">Common Uses & Applications:</h3>
                    <div className="flex flex-wrap gap-2">
                      {combinedElement.uses.map((use, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Detailed usage information not available for this element.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
