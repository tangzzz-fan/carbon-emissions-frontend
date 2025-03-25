export interface EmissionData {
    id: number;
    date: string;
    totalCo2: number;
    sourcesBreakdown: {
        electricity: number;
        fuel: number;
        heating: number;
        other: number;
    };
    comparisonWithTarget: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EmissionReport {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    generatedAt: string;
    totalEmission: number;
    reduction: number;
    status: 'draft' | 'finalized';
    createdBy: number;
    pdfUrl?: string;
}

export interface EmissionPolicy {
    id: number;
    name: string;
    description: string;
    targetReduction: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'draft' | 'completed';
    measures: string[];
    createdAt: string;
    updatedAt: string;
} 