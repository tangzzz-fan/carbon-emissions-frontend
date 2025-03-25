import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { PredictionModel, PredictionResult, PredictionParameters } from '../../types/prediction';
import { RootState } from '../index';

interface PredictionsState {
    models: PredictionModel[];
    results: PredictionResult[];
    currentResult: PredictionResult | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: PredictionsState = {
    models: [],
    results: [],
    currentResult: null,
    status: 'idle',
    error: null
};

export const fetchPredictionModels = createAsyncThunk(
    'predictions/fetchModels',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/predictions/models');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取预测模型失败');
        }
    }
);

export const analyzePrediction = createAsyncThunk(
    'predictions/analyze',
    async (params: PredictionParameters, { rejectWithValue }) => {
        try {
            const response = await api.post('/predictions/analyze', params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '预测分析失败');
        }
    }
);

export const fetchPredictionById = createAsyncThunk(
    'predictions/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/predictions/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取预测结果失败');
        }
    }
);

export const fetchPredictionHistory = createAsyncThunk(
    'predictions/fetchHistory',
    async (params: {
        page?: number;
        limit?: number;
    }, { rejectWithValue }) => {
        try {
            const response = await api.get('/predictions/history', { params });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取预测历史失败');
        }
    }
);

const predictionSlice = createSlice({
    name: 'predictions',
    initialState,
    reducers: {
        clearCurrentResult: (state) => {
            state.currentResult = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // 处理获取预测模型
            .addCase(fetchPredictionModels.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPredictionModels.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.models = action.payload;
            })
            .addCase(fetchPredictionModels.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理预测分析
            .addCase(analyzePrediction.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(analyzePrediction.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentResult = action.payload;
                state.results.unshift(action.payload);
            })
            .addCase(analyzePrediction.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理获取单个预测结果
            .addCase(fetchPredictionById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPredictionById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentResult = action.payload;
            })
            .addCase(fetchPredictionById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理获取预测历史
            .addCase(fetchPredictionHistory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPredictionHistory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.results = action.payload.data;
            })
            .addCase(fetchPredictionHistory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    }
});

export const { clearCurrentResult, clearError } = predictionSlice.actions;

// 选择器
export const selectPredictionModels = (state: RootState) => state.predictions.models;
export const selectPredictionResults = (state: RootState) => state.predictions.results;
export const selectCurrentResult = (state: RootState) => state.predictions.currentResult;
export const selectPredictionsStatus = (state: RootState) => state.predictions.status;
export const selectPredictionsError = (state: RootState) => state.predictions.error;

export default predictionSlice.reducer; 