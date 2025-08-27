// Configuração da API
const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Métodos de autenticação
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Métodos de unidades
  async getUnits() {
    return this.request('/units');
  }

  async createUnit(unit) {
    return this.request('/units', {
      method: 'POST',
      body: JSON.stringify(unit),
    });
  }

  // Métodos de guichês
  async getCounters(unitId = null) {
    const params = unitId ? `?unit_id=${unitId}` : '';
    return this.request(`/counters${params}`);
  }

  async createCounter(counter) {
    return this.request('/counters', {
      method: 'POST',
      body: JSON.stringify(counter),
    });
  }

  // Métodos de categorias
  async getCategories(unitId = null) {
    const params = unitId ? `?unit_id=${unitId}` : '';
    return this.request(`/categories${params}`);
  }

  async createCategory(category) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  // Métodos de senhas
  async generateTicket(categoryId) {
    return this.request('/tickets/generate', {
      method: 'POST',
      body: JSON.stringify({ category_id: categoryId }),
    });
  }

  async getQueue(unitId) {
    return this.request(`/tickets/queue?unit_id=${unitId}`);
  }

  async callNextTicket(counterId) {
    return this.request('/tickets/call-next', {
      method: 'POST',
      body: JSON.stringify({ counter_id: counterId }),
    });
  }

  async callTicket(ticketId, counterId) {
    return this.request(`/tickets/${ticketId}/call`, {
      method: 'POST',
      body: JSON.stringify({ counter_id: counterId }),
    });
  }

  async finishTicket(ticketId) {
    return this.request(`/tickets/${ticketId}/finish`, {
      method: 'POST',
    });
  }

  async getCurrentDisplay(unitId) {
    return this.request(`/tickets/current-display?unit_id=${unitId}`);
  }

  // Métodos de relatórios
  async getDashboardData(unitId) {
    return this.request(`/reports/dashboard?unit_id=${unitId}`);
  }

  async getPeriodReport(unitId, startDate, endDate) {
    return this.request(`/reports/period?unit_id=${unitId}&start_date=${startDate}&end_date=${endDate}`);
  }

  // Métodos de configurações do painel
  async getDisplaySettings(unitId) {
    return this.request(`/display/settings/${unitId}`);
  }

  async updateDisplaySettings(unitId, settings) {
    return this.request(`/display/settings/${unitId}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const apiClient = new ApiClient();

