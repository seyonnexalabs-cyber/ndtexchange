
export type NDTCompany = {
    name: string;
    url: string;
    description?: string;
};

export type NDTTechnique = {
    id: string;
    title: string;
    description: string;
    isHighlighted: boolean;
    imageId: string;
    companies: NDTCompany[];
};

export const ndtTechniques: NDTTechnique[] = [
    {
        id: 'ae',
        title: 'Acoustic Emission (AE)',
        description: "Listening for the high-frequency energy waves that materials release when they undergo stress, cracking, or corrosion.",
        isHighlighted: true,
        imageId: 'tech-ae',
        companies: [
            { name: "MISTRAS Group", url: "https://www.mistrasgroup.com" },
            { name: "Vallen Systeme", url: "https://www.vallen.de/en/" },
            { name: "Physical Acoustics Corp (PAC)", url: "https://www.pacndt.com/" },
            { name: "Score Atlanta Inc.", url: "https://www.score-atl.com/" },
            { name: "DNV", url: "https://www.dnv.com/services/non-destructive-testing-ndt-3947" },
        ]
    },
    {
        id: 'apr',
        title: 'Acoustic Pulse Reflectometry (APR)',
        description: "A non-invasive method for detecting blockages and defects in tubes by analyzing reflected sound waves.",
        isHighlighted: true,
        imageId: 'tech-apr',
        companies: [
            { name: "Talcyon", url: "https://www.talcyon.com" },
        ]
    },
    {
        id: 'et',
        title: 'Electromagnetic Testing (ET)',
        description: "Using principles of electromagnetism to detect flaws, such as Eddy Current, Alternating Current Field Measurement (ACFM), and Remote Field Testing (RFT).",
        isHighlighted: true,
        imageId: 'tech-et',
        companies: [
            { name: "Evident Scientific (Olympus)", url: "https://www.evidentscientific.com" },
            { name: "Zetec", url: "https://www.zetec.com" },
            { name: "Foerster Instruments", url: "https://www.foerstergroup.com" },
            { name: "UniWest", url: "https://uniwest.com/" },
            { name: "Eddyfi Technologies", url: "https://www.eddyfitechnologies.com" },
            { name: "ibg NDT Systems", url: "https://www.ibg-ndt.com/" },
            { name: "SGS", url: "https://www.sgs.com/en/services/non-destructive-testing-ndt" },
        ]
    },
    {
        id: 'gwt',
        title: 'Guided Wave Testing (GWT)',
        description: "An advanced ultrasonic method for inspecting long lengths of pipes and structures from a single test location, ideal for corrosion screening.",
        isHighlighted: true,
        imageId: 'tech-ut',
        companies: [
            { name: "GUL (Guided Ultrasonics Ltd.)", url: "https://www.guided-ultrasonics.com/" },
            { name: "DNV", url: "https://www.dnv.com/services/non-destructive-testing-ndt-3947" },
        ]
    },
    {
        id: 'ir',
        title: 'Infrared & Thermal Testing (IR)',
        description: "Detecting variations in temperature to identify material defects, electrical issues, or insulation gaps.",
        isHighlighted: true,
        imageId: 'tech-ir',
        companies: [
            { name: "Teledyne FLIR", url: "https://www.flir.com" },
            { name: "Fluke Corporation", url: "https://www.fluke.com" },
            { name: "Testo", url: "https://www.testo.com" },
        ]
    },
    {
        id: 'lt',
        title: 'Leak Testing (LT)',
        description: "Detecting and locating leaks in pressure-containing components using methods like bubble testing, pressure change, or mass spectrometry.",
        isHighlighted: false,
        imageId: 'tech-lt',
        companies: [
            { name: "Inficon", url: "https://www.inficon.com" },
            { name: "Pfeiffer Vacuum", url: "https://www.pfeiffer-vacuum.com" },
            { name: "LACO Technologies", url: "https://www.lacotech.com" },
            { name: "ATEQ", url: "https://www.ateq-leak-testing.com/" },
            { name: "SGS", url: "https://www.sgs.com/en/services/non-destructive-testing-ndt" },
        ]
    },
    {
        id: 'mfl',
        title: 'Magnetic Flux Leakage (MFL)',
        description: "A fast, non-contact method for detecting corrosion and pitting in ferromagnetic materials, commonly used on tank floors and pipelines.",
        isHighlighted: true,
        imageId: 'tech-mt',
        companies: [
             { name: "Eddyfi Technologies", url: "https://www.eddyfitechnologies.com" },
        ]
    },
    {
        id: 'mt',
        title: 'Magnetic Particle Testing (MT)',
        description: "Detecting surface and near-surface flaws in ferromagnetic materials by creating a magnetic field.",
        isHighlighted: false,
        imageId: 'tech-mt',
        companies: [
            { name: "Magnaflux", url: "https://www.magnaflux.com" },
            { name: "Parker Research Corp", url: "https://www.parkerndt.com" },
            { name: "Chemetall", url: "https://www.chemetall.com/en/products/non-destructive-testing.php" },
            { name: "Karl Deutsch", url: "https://www.karldeutsch.de/en/" },
            { name: "SGS", url: "https://www.sgs.com/en/services/non-destructive-testing-ndt" },
            { name: "DNV", url: "https://www.dnv.com/services/non-destructive-testing-ndt-3947" },
        ]
    },
    {
        id: 'other',
        title: 'Other Advanced Methods',
        description: "Exploring specialized techniques like Shearography, Neutron Radiography, and other emerging NDT technologies for unique applications.",
        isHighlighted: true,
        imageId: 'tech-other',
        companies: [
            { name: "Dantec Dynamics", url: "https://www.dantecdynamics.com/", description: "Laser Shearography" },
            { name: "Phoenix|x-ray (Waygate)", url: "https://www.bakerhughes.com/waygate-technologies/x-ray-and-ct-solutions/phoenix-x-ray", description: "Neutron Radiography" },
        ]
    },
    {
        id: 'pt',
        title: 'Penetrant Testing (PT)',
        description: "Locating surface-breaking defects in non-porous materials using a liquid penetrant and developer.",
        isHighlighted: false,
        imageId: 'tech-pt',
        companies: [
            { name: "Magnaflux", url: "https://www.magnaflux.com" },
            { name: "Sherwin Inc.", url: "https://sherwininc.com/" },
            { name: "Chemetall", url: "https://www.chemetall.com/en/products/non-destructive-testing.php" },
            { name: "SGS", url: "https://www.sgs.com/en/services/non-destructive-testing-ndt" },
            { name: "DNV", url: "https://www.dnv.com/services/non-destructive-testing-ndt-3947" },
        ]
    },
    {
        id: 'rt',
        title: 'Radiographic Testing (RT)',
        description: "Viewing a component's internal structure with X-rays or gamma rays to reveal hidden defects and discontinuities.",
        isHighlighted: true,
        imageId: 'tech-rt',
        companies: [
            { name: "Fujifilm", url: "https://www.fujifilm.com/us/en/business/ndt" },
            { name: "Yxlon (Comet Group)", url: "https://www.yxlon.com" },
            { name: "Carestream NDT", url: "https://www.carestream.com/ndt" },
            { name: "VJ Technologies", url: "https://www.vjt.com" },
            { name: "Nikon Metrology", url: "https://www.nikonmetrology.com/en-gb/products/x-ray-ct-inspection" },
            { name: "Teledyne ICM", url: "https://www.teledyneicm.com/" },
            { name: "Rigaku", url: "https://www.rigaku.com/en/products/ct" },
            { name: "Vidisco", url: "https://www.vidisco.com/" },
            { name: "SGS", url: "https://www.sgs.com/en/services/non-destructive-testing-ndt" },
        ]
    },
    {
        id: 'ut',
        title: 'Ultrasonic Testing (UT)',
        description: "Using sound waves to detect internal flaws and measure thickness, including advanced Phased Array (PAUT) and TOFD methods.",
        isHighlighted: true,
        imageId: 'tech-ut',
        companies: [
            { name: "Evident Scientific (Olympus)", url: "https://www.evidentscientific.com" },
            { name: "Eddyfi Technologies", url: "https://www.eddyfitechnologies.com" },
            { name: "Sonatest", url: "https://www.sonatest.com" },
            { name: "Zetec", url: "https://www.zetec.com" },
            { name: "Baker Hughes (Waygate Technologies)", url: "https://www.bakerhughes.com/waygate-technologies" },
            { name: "Proceq (Screening Eagle)", url: "https://www.screeningeagle.com" },
            { name: "TPAC", url: "https://www.tpac-ndt.com/" },
            { name: "Imagilent", url: "https://www.imagilent.com/" },
            { name: "DolphiTech", url: "https://www.dolphitech.com/" },
            { name: "Karl Deutsch", url: "https://www.karldeutsch.de/en/" },
            { name: "SGS", url: "https://www.sgs.com/en/services/non-destructive-testing-ndt" },
            { name: "DNV", url: "https://www.dnv.com/services/non-destructive-testing-ndt-3947" },
        ]
    },
    {
        id: 'vt',
        title: 'Visual & Optical Testing (VT/RVI)',
        description: "A direct or remote visual examination, using tools like videoscopes and borescopes to access hard-to-reach areas.",
        isHighlighted: true,
        imageId: 'tech-vt',
        companies: [
            { name: "Evident Scientific (Olympus)", url: "https://www.evidentscientific.com" },
            { name: "Baker Hughes (Everest VIT)", url: "https://www.bakerhughes.com/waygate-technologies/remote-visual-inspection" },
            { name: "viZaar", url: "https://www.vizaar.com" },
            { name: "IT Concepts", url: "https://www.itc-ndt.com/" },
            { name: "Karl Storz", url: "https://www.karlstorz.com/industrial.htm" },
            { name: "Mitcorp", url: "https://www.mitcorp.com.tw/" },
            { name: "SGS", url: "https://www.sgs.com/en/services/non-destructive-testing-ndt" },
            { name: "DNV", url: "https://www.dnv.com/services/non-destructive-testing-ndt-3947" },
        ]
    }
];
