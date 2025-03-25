import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { EmissionData, EmissionReport } from '../../types/emission';
import { RootState } from '../index';

interface EmissionsState {
    emissions: EmissionData[];
    reports: EmissionReport[];
    total: number;
    reportsTotal: number;
    selectedReport: EmissionReport | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: EmissionsState = {
    emissions: [],
    reports: [],
    total: 0,
    reportsTotal: 0,
    selectedReport: null,
    status: 'idle',
    error: null
};

export const fetchEmissions = createAsyncThunk(
    'emissions/fetchAll',
    async (params: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
    }, { rejectWithValue }) => {
        try {
            const response = await api.get('/emissions', { params });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取排放数据失败');
        }
    }
);

export const fetchReports = createAsyncThunk(
    'emissions/fetchReports',
    async (params: {
        page?: number;
        limit?: number;
    }, { rejectWithValue }) => {
        try {
            const response = await api.get('/emissions/reports', { params });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取报告列表失败');
        }
    }
);

export const fetchReportById = createAsyncThunk(
    'emissions/fetchReportById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/emissions/reports/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取报告详情失败');
        }
    }
);

export const createReport = createAsyncThunk(
    'emissions/createReport',
    async (data: {
        title: string;
        startDate: string;
        endDate: string;
        status: 'draft' | 'finalized';
    }, { rejectWithValue }) => {
        try {
            const response = await api.post('/emissions/reports', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '创建报告失败');
        }
    }
);

export const deleteReport = createAsyncThunk(
    'emissions/deleteReport',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/emissions/reports/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '删除报告失败');
        }
    }
);

const emissionSlice = createSlice({
    name: 'emissions',
    initialState,
    reducers: {
        clearSelectedReport: (state) => {
            state.selectedReport = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // 处理获取排放数据
            .addCase(fetchEmissions.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchEmissions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.emissions = action.payload.data;
                state.total = action.payload.total;
            })
            .addCase(fetchEmissions.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理获取报告列表
            .addCase(fetchReports.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchReports.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.reports = action.payload.data;
                state.reportsTotal = action.payload.total;
            })
            .addCase(fetchReports.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理获取单个报告
            .addCase(fetchReportById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchReportById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedReport = action.payload;
            })
            .addCase(fetchReportById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理创建报告
            .addCase(createReport.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createReport.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.reports.push(action.payload);
                state.reportsTotal += 1;
            })
            .addCase(createReport.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // 处理删除报告
            .addCase(deleteReport.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteReport.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.reports = state.reports.filter(report => report.id !== action.payload);
                state.reportsTotal -= 1;
                if (state.selectedReport?.id === action.payload) {
                    state.selectedReport = null;
                }
            })
            .addCase(deleteReport.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    }
});

export const { clearSelectedReport, clearError } = emissionSlice.actions;

// 选择器
export const selectAllEmissions = (state: RootState) => state.emissions.emissions;
export const selectEmissionsTotal = (state: RootState) => state.emissions.total;
export const selectAllReports = (state: RootState) => state.emissions.reports;
export const selectReportsTotal = (state: RootState) => state.emissions.reportsTotal;
export const selectSelectedReport = (state: RootState) => state.emissions.selectedReport;
export const selectEmissionsStatus = (state: RootState) => state.emissions.status;
export const selectEmissionsError = (state: RootState) => state.emissions.error;

export default emissionSlice.reducer; 