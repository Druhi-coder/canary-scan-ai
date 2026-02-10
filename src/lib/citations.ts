/**
 * Medical Citations & References
 * ===============================
 * 
 * All risk weights and factors in the CANary prediction engine are derived
 * from peer-reviewed epidemiological studies and clinical guidelines.
 * 
 * This module provides citation data for transparency and IEEE compliance.
 */

export interface Citation {
  id: string;
  authors: string;
  title: string;
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  relevance: string;
}

/**
 * Published studies used to calibrate risk weights.
 * Organized by cancer type.
 */
export const CITATIONS: Record<string, Citation[]> = {
  pancreatic: [
    {
      id: 'PC1',
      authors: 'Iodice S, Gandini S, Maisonneuve P, Lowenfels AB',
      title: 'Tobacco and the risk of pancreatic cancer: a review and meta-analysis',
      journal: 'Langenbecks Arch Surg',
      year: 2008,
      doi: '10.1007/s00423-007-0266-2',
      pmid: '18043937',
      relevance: 'Smoking OR 1.74 for current smokers — used to weight smoking_score at 0.74',
    },
    {
      id: 'PC2',
      authors: 'Bosetti C, Lucenteforte E, Silverman DT, et al.',
      title: 'Cigarette smoking and pancreatic cancer: an analysis from the International Pancreatic Cancer Case-Control Consortium (PanC4)',
      journal: 'Ann Oncol',
      year: 2012,
      doi: '10.1093/annonc/mdr541',
      pmid: '22219234',
      relevance: 'Confirmed dose-response relationship for smoking and pancreatic cancer risk',
    },
    {
      id: 'PC3',
      authors: 'Huxley R, Ansary-Moghaddam A, Berrington de González A, et al.',
      title: 'Type-II diabetes and pancreatic cancer: a meta-analysis of 36 studies',
      journal: 'Br J Cancer',
      year: 2005,
      doi: '10.1038/sj.bjc.6602619',
      pmid: '15928667',
      relevance: 'Diabetes RR 1.82 — used to weight diabetes_history at 0.65',
    },
    {
      id: 'PC4',
      authors: 'Sharma A, Kandlakunta H, Nagpal SJS, et al.',
      title: 'Model to Determine Risk of Pancreatic Cancer in Patients With New-Onset Diabetes',
      journal: 'Gastroenterology',
      year: 2018,
      doi: '10.1053/j.gastro.2018.05.023',
      pmid: '29775599',
      relevance: 'New-onset diabetes OR 5.38 for PDAC — heavily weighted new_diabetes factor',
    },
    {
      id: 'PC5',
      authors: 'Permuth-Wey J, Egan KM',
      title: 'Family history is a significant risk factor for pancreatic cancer: results from a systematic review and meta-analysis',
      journal: 'Fam Cancer',
      year: 2009,
      doi: '10.1007/s10689-008-9214-8',
      pmid: '18972069',
      relevance: 'Family history RR 1.80 — used for family_cancer weight',
    },
  ],
  colon: [
    {
      id: 'CC1',
      authors: 'Botteri E, Iodice S, Bagnardi V, et al.',
      title: 'Smoking and colorectal cancer: a meta-analysis',
      journal: 'JAMA',
      year: 2008,
      doi: '10.1001/jama.300.23.2765',
      pmid: '19088354',
      relevance: 'Smoking RR 1.18 for colorectal cancer incidence',
    },
    {
      id: 'CC2',
      authors: 'Johns LE, Houlston RS',
      title: 'A systematic review and meta-analysis of familial colorectal cancer risk',
      journal: 'Am J Gastroenterol',
      year: 2001,
      doi: '10.1111/j.1572-0241.2001.03874.x',
      pmid: '11467613',
      relevance: 'First-degree relative with CRC: RR 2.24 — family history weight calibration',
    },
    {
      id: 'CC3',
      authors: 'Jess T, Rungoe C, Peyrin-Biroulet L',
      title: 'Risk of colorectal cancer in patients with ulcerative colitis: a meta-analysis of population-based cohort studies',
      journal: 'Clin Gastroenterol Hepatol',
      year: 2012,
      doi: '10.1016/j.cgh.2012.01.010',
      pmid: '22343692',
      relevance: 'IBD SIR 2.4 for CRC — used for IBD weight at 0.70',
    },
    {
      id: 'CC4',
      authors: 'Wolin KY, Yan Y, Colditz GA, Lee IM',
      title: 'Physical activity and colon cancer prevention: a meta-analysis',
      journal: 'Br J Cancer',
      year: 2009,
      doi: '10.1038/sj.bjc.6604917',
      pmid: '19190637',
      relevance: 'Physical activity RR 0.76 (protective) — calibrated activity_score inverse weight',
    },
    {
      id: 'CC5',
      authors: 'Chan DSM, Lau R, Aune D, et al.',
      title: 'Red and processed meat and colorectal cancer incidence: meta-analysis of prospective studies',
      journal: 'PLoS One',
      year: 2011,
      doi: '10.1371/journal.pone.0020456',
      pmid: '21674008',
      relevance: 'Processed meat RR 1.17 per 50g/day — used for diet_score weight',
    },
  ],
  blood: [
    {
      id: 'BC1',
      authors: 'Metayer C, Milne E, Clavel J, et al.',
      title: 'The Childhood Leukemia International Consortium',
      journal: 'Cancer Epidemiol',
      year: 2013,
      doi: '10.1016/j.canep.2012.12.011',
      pmid: '23352915',
      relevance: 'Age distribution bimodality in leukemia — age risk curve calibration',
    },
    {
      id: 'BC2',
      authors: 'Linet MS, Schubauer-Berigan MK, Weisenburger DD, Richardson DB',
      title: 'Chronic lymphocytic leukaemia: an overview of aetiology in light of recent developments in classification and pathogenesis',
      journal: 'Br J Haematol',
      year: 2007,
      doi: '10.1111/j.1365-2141.2007.06575.x',
      pmid: '17451403',
      relevance: 'Family history OR 1.7-2.0 for blood cancers — family history weight',
    },
    {
      id: 'BC3',
      authors: 'Khoury JD, Solary E, Abla O, et al.',
      title: 'The 5th edition of the World Health Organization Classification of Haematolymphoid Tumours',
      journal: 'Leukemia',
      year: 2022,
      doi: '10.1038/s41375-022-01613-1',
      pmid: '35732831',
      relevance: 'WHO classification criteria — symptom weight calibration for lymph node enlargement, cytopenias',
    },
  ],
  methodology: [
    {
      id: 'M1',
      authors: 'USPSTF',
      title: 'Screening for Colorectal Cancer: US Preventive Services Task Force Recommendation Statement',
      journal: 'JAMA',
      year: 2021,
      doi: '10.1001/jama.2021.6238',
      pmid: '34003218',
      relevance: 'Age-based screening thresholds — used for age risk curve calibration',
    },
    {
      id: 'M2',
      authors: 'Croswell JM, Kramer BS, Kreimer AR, et al.',
      title: 'Cumulative incidence of false-positive results in repeated, multimodal cancer screening',
      journal: 'Ann Fam Med',
      year: 2009,
      doi: '10.1370/afm.942',
      pmid: '19273866',
      relevance: 'False-positive rates in screening — informed threshold calibration',
    },
  ],
};

/**
 * Get all citations as a flat sorted array
 */
export const getAllCitations = (): Citation[] => {
  return Object.values(CITATIONS)
    .flat()
    .sort((a, b) => a.id.localeCompare(b.id));
};

/**
 * Get citations relevant to a specific cancer type
 */
export const getCitationsForCancer = (type: 'pancreatic' | 'colon' | 'blood'): Citation[] => {
  return [...(CITATIONS[type] || []), ...(CITATIONS.methodology || [])];
};

/**
 * Format citation as APA-style string
 */
export const formatCitation = (c: Citation): string => {
  return `${c.authors} (${c.year}). ${c.title}. *${c.journal}*. ${c.doi ? `https://doi.org/${c.doi}` : ''}`;
};
