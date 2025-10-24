// JAD generator extracted from legacy and exported as ES functions

// CELL mapping based on ICAO prefix (first 2 letters)
const CELL_MAPPING = {
    // G16
    'EP': 'G16', 'EY': 'G16', 'EV': 'G16', 'EE': 'G16', 'LK': 'G16', 'LZ': 'G16', 'LH': 'G16',
    'UK': 'G16', 'UM': 'G16', 'LB': 'G16', 'BK': 'G16', 'LY': 'G16', 'LA': 'G16', 'LR': 'G16',
    'LD': 'G16', 'LJ': 'G16', 'LQ': 'G16', 'LW': 'G16', 'LU': 'G16',

    // G2
    'LV': 'G2', 'LT': 'G2', 'LL': 'G2', 'LG': 'G2', 'LC': 'G2', 'OA': 'G2', 'OB': 'G2', 'OE': 'G2',
    'OI': 'G2', 'OJ': 'G2', 'OK': 'G2', 'OL': 'G2', 'OM': 'G2', 'OO': 'G2', 'OP': 'G2', 'OR': 'G2',
    'OS': 'G2', 'OT': 'G2', 'OY': 'G2', 'UA': 'G2', 'UB': 'G2', 'UC': 'G2', 'UD': 'G2', 'UT': 'G2',
    'UZ': 'G2', 'UG': 'G2',

    // G7 (Y + others)
    'AG': 'G7', 'AN': 'G7', 'AY': 'G7', 'NC': 'G7', 'NF': 'G7', 'NG': 'G7', 'NI': 'G7', 'NL': 'G7',
    'NS': 'G7', 'NT': 'G7', 'NV': 'G7', 'NW': 'G7', 'NZ': 'G7', 'PC': 'G7', 'PK': 'G7', 'PL': 'G7',
    'PT': 'G7', 'WA': 'G7', 'WB': 'G7', 'WI': 'G7', 'WQ': 'G7', 'WR': 'G7', 'WS': 'G7',

    // G17
    'BG': 'G17', 'BI': 'G17', 'EB': 'G17', 'EG': 'G17', 'EH': 'G17', 'EI': 'G17', 'EK': 'G17',
    'EL': 'G17', 'EN': 'G17', 'ES': 'G17', 'EF': 'G17',

    // PAC
    'RJ': 'PAC', 'RK': 'PAC', 'RO': 'PAC', 'RP': 'PAC', 'VL': 'PAC', 'VD': 'PAC', 'VT': 'PAC',
    'VV': 'PAC', 'VY': 'PAC',

    // INTL1
    'SA': 'INTL1', 'SB': 'INTL1', 'SC': 'INTL1', 'SD': 'INTL1', 'SE': 'INTL1', 'SF': 'INTL1',
    'SG': 'INTL1', 'SH': 'INTL1', 'SI': 'INTL1', 'SJ': 'INTL1', 'SK': 'INTL1', 'SL': 'INTL1',
    'SM': 'INTL1', 'SN': 'INTL1', 'SO': 'INTL1', 'SP': 'INTL1', 'SS': 'INTL1', 'SU': 'INTL1',
    'SV': 'INTL1', 'SW': 'INTL1', 'SY': 'INTL1', 'TA': 'INTL1', 'TB': 'INTL1', 'TD': 'INTL1',
    'TF': 'INTL1', 'TG': 'INTL1', 'TI': 'INTL1', 'TJ': 'INTL1', 'TK': 'INTL1', 'TL': 'INTL1',
    'TN': 'INTL1', 'TQ': 'INTL1', 'TR': 'INTL1', 'TT': 'INTL1', 'TU': 'INTL1', 'TV': 'INTL1',
    'TX': 'INTL1', 'MB': 'INTL1', 'MD': 'INTL1', 'MG': 'INTL1', 'MH': 'INTL1', 'MK': 'INTL1',
    'MM': 'INTL1', 'MN': 'INTL1', 'MP': 'INTL1', 'MR': 'INTL1', 'MS': 'INTL1', 'MT': 'INTL1',
    'MU': 'INTL1', 'MW': 'INTL1', 'MY': 'INTL1', 'MZ': 'INTL1'
};

// AIRAC cycles - end dates for each cycle
const AIRAC_CYCLES = [
    { cycle: '2512', endDate: new Date('2025-11-07') },
    { cycle: '2513', endDate: new Date('2025-12-05') },
    { cycle: '2601', endDate: new Date('2026-01-22') },
    { cycle: '2602', endDate: new Date('2026-02-19') },
    { cycle: '2603', endDate: new Date('2026-03-19') },
    { cycle: '2604', endDate: new Date('2026-04-16') },
    { cycle: '2605', endDate: new Date('2026-05-14') },
    { cycle: '2606', endDate: new Date('2026-06-11') },
    { cycle: '2607', endDate: new Date('2026-07-09') },
    { cycle: '2608', endDate: new Date('2026-08-06') },
    { cycle: '2609', endDate: new Date('2026-09-03') },
    { cycle: '2610', endDate: new Date('2026-10-01') },
    { cycle: '2611', endDate: new Date('2026-10-29') },
    { cycle: '2612', endDate: new Date('2026-11-26') },
    { cycle: '2613', endDate: new Date('2026-12-24') },
    { cycle: '2701', endDate: new Date('2027-01-21') },
    { cycle: '2702', endDate: new Date('2027-02-18') },
    { cycle: '2703', endDate: new Date('2027-03-18') },
    { cycle: '2704', endDate: new Date('2027-04-15') },
    { cycle: '2705', endDate: new Date('2027-05-13') },
    { cycle: '2706', endDate: new Date('2027-06-10') },
    { cycle: '2707', endDate: new Date('2027-07-08') },
    { cycle: '2708', endDate: new Date('2027-08-05') },
    { cycle: '2709', endDate: new Date('2027-09-02') },
    { cycle: '2710', endDate: new Date('2027-09-30') },
    { cycle: '2711', endDate: new Date('2027-10-28') },
    { cycle: '2712', endDate: new Date('2027-11-25') },
    { cycle: '2713', endDate: new Date('2027-12-23') },
    { cycle: '2801', endDate: new Date('2028-01-20') },
    { cycle: '2802', endDate: new Date('2028-02-17') },
    { cycle: '2803', endDate: new Date('2028-03-16') },
    { cycle: '2804', endDate: new Date('2028-04-13') },
    { cycle: '2805', endDate: new Date('2028-05-11') },
    { cycle: '2806', endDate: new Date('2028-06-08') },
    { cycle: '2807', endDate: new Date('2028-07-06') },
    { cycle: '2808', endDate: new Date('2028-08-03') },
    { cycle: '2809', endDate: new Date('2028-08-31') },
    { cycle: '2810', endDate: new Date('2028-09-28') },
    { cycle: '2811', endDate: new Date('2028-10-26') },
    { cycle: '2812', endDate: new Date('2028-11-23') },
    { cycle: '2813', endDate: new Date('2028-12-21') }
];

export function getCELL(icao) {
    if (!icao || icao.length < 2) return 'CELL';
    const prefix = icao.substring(0, 2).toUpperCase();
    const firstLetter = icao.charAt(0).toUpperCase();
    if (firstLetter === 'C') return 'G11';
    if (firstLetter === 'Y') return 'G7';
    return CELL_MAPPING[prefix] || 'CELL';
}

export function getOFFICE(cell) {
    if (['G16', 'G17', 'G2', 'G11', 'INTL1', 'PAC', 'G7'].includes(cell)) return 'G';
    if (cell === 'K') return 'K';
    return 'D';
}

export function getCYCLE() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < AIRAC_CYCLES.length; i++) {
        const cycle = AIRAC_CYCLES[i];
        if (today <= cycle.endDate) return cycle.cycle;
    }
    return AIRAC_CYCLES[AIRAC_CYCLES.length - 1].cycle;
}

export function getENT(asset, mapName) {
    const name = (mapName || '').toUpperCase();
    switch(asset) {
        case 'DET': return 'RWY';
        case 'APP': {
            let letter = 'R';
            if (name.includes('RNP') || name.includes('RNAV')) letter = 'R';
            else if (name.includes('VOR')) letter = 'S';
            else if (name.includes('NDB')) letter = 'N';
            else if (name.includes('TACAN')) letter = 'T';
            else if (name.includes('ILS') || name.includes('LOC')) letter = 'I';
            const rwyMatch = name.match(/RWY\s*(\d{2})/);
            const digits = rwyMatch ? rwyMatch[1] : '00';
            return `${letter}${digits}`;
        }
        case 'SIDSTAR':
            if (name.includes('STAR')) return 'STAR';
            if (name.includes('SID')) return 'SID';
            return 'SIDSTAR';
        case 'ENR': return 'BNDR';
        case 'SAQ': return 'SAQ';
        default: return 'ENT';
    }
}

export function generateJADCode(getActivePair, getAssetValue) {
    let icao = 'ICAO';
    let mapName = '';
    if (typeof getActivePair === 'function') {
        const pair = getActivePair();
        if (pair) {
            if (pair.icao) icao = pair.icao;
            if (pair.name) mapName = pair.name;
        }
    }
    const asset = typeof getAssetValue === 'function' ? (getAssetValue() || 'DET') : 'DET';
    const cell = getCELL(icao);
    const office = getOFFICE(cell);
    const cycle = getCYCLE();
    const ent = getENT(asset, mapName);
    return `${office}-${cell}-${cycle}-${icao}-${asset}-${ent}-CHG-`;
}

export function updateJADCode(getActivePair, getAssetValue) {
    const el = document.getElementById('jadCode');
    if (!el) return;
    el.textContent = generateJADCode(getActivePair, getAssetValue);
}

export function copyJADCode(codeProducer) {
    const code = typeof codeProducer === 'function' ? codeProducer() : '';
    return navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.jad-copy-btn');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✓';
            btn.style.background = 'rgba(40, 167, 69, 0.8)';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = 'rgba(0, 86, 214, 0.8)';
            }, 1000);
        }
        return code;
    });
}
