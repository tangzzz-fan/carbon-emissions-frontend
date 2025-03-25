export interface PredictionModel {
    id: number;
    name: string;
    description: string;
    accuracy: number;
    lastTrainingDate: string;
    parameters: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface PredictionResult {
    id: number;
    modelId: number;
    startDate: string;
    endDate: string;
    interval: 'daily' | 'weekly' | 'monthly';
    results: Array<{
        date: string;
        predictedCo2: number;
        lowerBound?: number;
        upperBound?: number;
    }>;
    accuracy: number;
    createdAt: string;
}

export interface PredictionParameters {
    modelId: number;
    startDate: string;
    endDate: string;
    interval: 'daily' | 'weekly' | 'monthly';
    includeConfidenceInterval?: boolean;
    additionalParams?: Record<string, any>;
} 