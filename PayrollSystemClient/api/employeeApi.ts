import type { CalculatedPayroll, Employee, EmployeeDTO, PayrollDTO } from "../types/Employee";
import axiosInstance from "./axiosInstance";

export const getEmployee = async (): Promise<Employee[]> => {
    try {
        const response = await axiosInstance.get('/Employee');
        return response.data;
    } catch (error) {
        console.error('Error fetching Employee:', error);
        throw error;
    }
};

export const getEmployeeById = async (id: string): Promise<Employee> => {
    try {
        const response = await axiosInstance.get(`/Employee/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching employee with id ${id}:`, error);
        throw error;
    }
};

export const createEmployee = async (employeeData: EmployeeDTO): Promise<Employee> => {
    try {
        const response = await axiosInstance.post('/Employee', employeeData);
        return response.data;
    } catch (error) {
        console.error('Error creating employee:', error);
        throw error;
    }
};

export const updateEmployee = async (id: string, employeeData: Employee): Promise<Employee> => {
    try {
        const response = await axiosInstance.put(`/Employee/${id}`, employeeData);
        return response.data;
    } catch (error) {
        console.error(`Error updating employee with id ${id}:`, error);
        throw error;
    }
};

export const deleteEmployee = async (id: string): Promise<void> => {
    try {
        await axiosInstance.delete(`/Employee/${id}`);
    } catch (error) {
        console.error(`Error deleting employee with id ${id}:`, error);
        throw error;
    }
};

export const calculatePayroll = async (payrollData: PayrollDTO): Promise<CalculatedPayroll> => {
    try {
        const response = await axiosInstance.post('/Employee/calculate', payrollData);
        return response.data;
    } catch (error) {
        console.error('Error calculating payroll:', error);
        throw error;
    }
};

