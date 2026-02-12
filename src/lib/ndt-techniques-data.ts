import { NDTTechnique } from '@/lib/types';

export const NDTTechniques: NDTTechnique[] = [
  { id: 'UT', acronym: 'UT', title: 'Ultrasonic Testing', isHighlighted: true, imageId: 'tech-ut', description: "Uses high-frequency sound waves to detect cracks and flaws in or on the surface of materials." },
  { id: 'RT', acronym: 'RT', title: 'Radiographic Testing', isHighlighted: true, imageId: 'tech-rt', description: "Uses X-rays or gamma rays to see inside materials and identify imperfections." },
  { id: 'MT', acronym: 'MT', title: 'Magnetic Particle Testing', isHighlighted: true, imageId: 'tech-mt', description: "Detects surface and near-surface flaws in ferromagnetic materials using magnetic fields." },
  { id: 'PT', acronym: 'PT', title: 'Liquid Penetrant Testing', isHighlighted: true, imageId: 'tech-pt', description: "Reveals surface-breaking defects by bleedout of a colored or fluorescent dye from the flaw." },
  { id: 'VT', acronym: 'VT', title: 'Visual Testing', isHighlighted: true, imageId: 'tech-vt', description: "Involves the visual observation of the surface of a test object to evaluate the presence of surface discontinuities." },
  { id: 'AE', acronym: 'AE', title: 'Acoustic Emission Testing', isHighlighted: true, imageId: 'tech-ae', description: "Listens for the 'sounds' of cracks growing and materials changing under stress." },
  { id: 'ET', acronym: 'ET', title: 'Eddy Current Testing', isHighlighted: false, imageId: 'tech-et', description: "Uses electromagnetic induction to detect surface and sub-surface flaws in conductive materials." },
  { id: 'LT', acronym: 'LT', title: 'Leak Testing', isHighlighted: false, imageId: 'tech-lt', description: "Detects leaks in pressure-containing components using various methods like bubble or pressure change tests." },
  { id: 'IR', acronym: 'IR', title: 'Infrared Testing', isHighlighted: false, imageId: 'tech-ir', description: "Uses thermal imaging cameras to detect temperature anomalies, indicating potential defects or failures." },
  { id: 'PAUT', acronym: 'PAUT', title: 'Phased Array Ultrasonic Testing', isHighlighted: false, imageId: 'tech-ut', description: 'An advanced method of ultrasonic testing that uses multiple ultrasonic elements and electronic time delays to generate beams that can be steered, scanned, and focused electronically.' },
  { id: 'TOFD', acronym: 'TOFD', title: 'Time-of-Flight Diffraction', isHighlighted: false, imageId: 'tech-ut', description: 'An ultrasonic technique that measures the time-of-flight of an ultrasonic pulse to determine the size of a reflector.' },
  { id: 'CR', acronym: 'CR', title: 'Computed Radiography', isHighlighted: false, imageId: 'tech-rt', description: 'A digital radiographic inspection method that uses imaging plates to capture X-ray images, which are then digitized.' },
  { id: 'DR', acronym: 'DR', title: 'Digital Radiography', isHighlighted: false, imageId: 'tech-rt', description: 'A form of X-ray imaging where digital X-ray sensors are used instead of traditional photographic film.' },
  { id: 'RVI', acronym: 'RVI', title: 'Remote Visual Inspection', isHighlighted: false, imageId: 'tech-vt', description: 'The use of borescopes, fiberscopes, and video probes to visually inspect areas that are otherwise inaccessible.' },
  { id: 'GWT', acronym: 'GWT', title: 'Guided Wave Testing', isHighlighted: false, imageId: 'tech-other', description: 'A method for testing large structures such as pipelines, using ultrasonic waves that are guided along the structure.' },
  { id: 'MFL', acronym: 'MFL', title: 'Magnetic Flux Leakage', isHighlighted: false, imageId: 'tech-other', description: 'A magnetic method of nondestructive testing that is used to detect corrosion and pitting in steel structures, most commonly pipelines and storage tanks.' },
  { id: 'APR', acronym: 'APR', title: 'Acoustic Pulse Reflectometry', isHighlighted: false, imageId: 'tech-apr', description: 'An NDT technique for tubes that uses sound waves to detect blockages and leaks.' },
  { id: 'ACFM', acronym: 'ACFM', title: 'Alternating Current Field Measurement', isHighlighted: false, imageId: 'tech-et', description: 'An electromagnetic technique for detecting and sizing surface-breaking cracks in metallic components.' },
];
