import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
    const { auth, apiFetch } = useAuth();
    const [data, setData] = useState({
        companies: [],
        tenders: [],
        contracts: [],
        tasks: [],
        contacts: [],
        followups: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load all data from server
    const loadAll = useCallback(async () => {
        if (!auth?.accessToken) return;

        setLoading(true);
        setError(null);

        try {
            const types = ['companies', 'tenders', 'contracts', 'tasks', 'contacts', 'followups'];
            const results = await Promise.all(
                types.map(async (type) => {
                    const res = await apiFetch(`/api/data/${type}`);
                    if (res.ok) {
                        const json = await res.json();
                        return { type, items: json[type] || [] };
                    }
                    return { type, items: [] };
                })
            );

            const newData = {};
            results.forEach(({ type, items }) => {
                // Convert snake_case to camelCase
                newData[type] = items.map(item => convertFromServer(type, item));
            });

            setData(newData);
            console.log('Data loaded from server:', newData);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [auth?.accessToken, apiFetch]);

    // Load data when auth changes
    useEffect(() => {
        if (auth?.accessToken) {
            loadAll();
        } else {
            setData({
                companies: [],
                tenders: [],
                contracts: [],
                tasks: [],
                contacts: [],
                followups: []
            });
        }
    }, [auth?.accessToken, loadAll]);

    // Save item to server
    const saveItem = async (type, item) => {
        if (!auth?.accessToken) return false;

        try {
            const serverData = convertToServer(type, item);
            const res = await apiFetch(`/api/data/${type}`, {
                method: 'POST',
                body: JSON.stringify(serverData)
            });

            if (res.ok) {
                console.log(`Saved ${type}:`, item.id);
                // Update local state
                setData(prev => ({
                    ...prev,
                    [type]: prev[type].some(x => x.id === item.id)
                        ? prev[type].map(x => x.id === item.id ? item : x)
                        : [...prev[type], item]
                }));
                return true;
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error(`Failed to save ${type}:`, res.status, errorData);
                const errorMsg = errorData.error || 'خطأ غير معروف';
                const details = errorData.details ? `\nالتفاصيل: ${errorData.details}` : '';
                alert(`فشل الحفظ: ${errorMsg} (${res.status})${details}`);
                return false;
            }
        } catch (err) {
            console.error(`Failed to save ${type}:`, err);
            alert(`فشل الاتصال بالسيرفر: ${err.message}`);
            return false;
        }
    };

    // Delete item from server
    const deleteItem = async (type, id) => {
        if (!auth?.accessToken) return false;

        try {
            const res = await apiFetch(`/api/data/${type}`, {
                method: 'DELETE',
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                console.log(`Deleted ${type}:`, id);
                setData(prev => ({
                    ...prev,
                    [type]: prev[type].filter(x => x.id !== id)
                }));
                return true;
            }
            return false;
        } catch (err) {
            console.error(`Failed to delete ${type}:`, err);
            return false;
        }
    };

    return (
        <DataContext.Provider value={{ data, loading, error, loadAll, saveItem, deleteItem }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
}

// Convert server format to client format
function convertFromServer(type, item) {
    const result = { id: item.id, createdAt: item.created_at };

    if (type === 'companies') {
        result.name = item.name;
        result.phone1 = item.phone || item.phone1;
        result.phone2 = item.phone2;
        result.email = item.email;
        result.address = item.address;
        result.notes = item.notes;
        result.sector = item.sector;
    } else if (type === 'tenders') {
        result.companyId = item.company_id;
        result.title = item.title;
        result.type = item.type;
        result.status = item.status;
        result.value = item.value;
        result.submissionDate = item.submission_date;
        result.notes = item.notes;
    } else if (type === 'contracts') {
        result.companyId = item.company_id;
        result.tenderId = item.tender_id;
        result.title = item.title;
        result.status = item.status;
        result.value = item.value;
        result.startDate = item.start_date;
        result.endDate = item.end_date;
        result.notes = item.notes;
    } else if (type === 'tasks') {
        result.relatedType = item.related_type;
        result.relatedId = item.related_id;
        result.title = item.title;
        result.priority = item.priority;
        result.status = item.status;
        result.dueDate = item.due_date;
        result.notes = item.notes;
    } else if (type === 'contacts') {
        result.companyId = item.company_id;
        result.name = item.name;
        result.position = item.position;
        result.phone = item.phone;
        result.email = item.email;
        result.notes = item.notes;
    } else if (type === 'followups') {
        result.relatedType = item.related_type;
        result.relatedId = item.related_id;
        result.type = item.type;
        result.date = item.date;
        result.notes = item.notes;
    }

    return result;
}

// Convert client format to server format
function convertToServer(type, item) {
    const result = { id: item.id };

    if (type === 'companies') {
        result.name = item.name;
        result.phone = item.phone1;
        result.phone1 = item.phone1;
        result.phone2 = item.phone2;
        result.email = item.email;
        result.address = item.address;
        result.notes = item.notes;
        result.sector = item.sector;
    } else if (type === 'tenders') {
        result.company_id = item.companyId;
        result.title = item.title;
        result.type = item.type;
        result.status = item.status;
        result.value = item.value;
        result.submission_date = item.submissionDate;
        result.notes = item.notes;
    } else if (type === 'contracts') {
        result.company_id = item.companyId;
        result.tender_id = item.tenderId;
        result.title = item.title;
        result.status = item.status;
        result.value = item.value;
        result.start_date = item.startDate;
        result.end_date = item.endDate;
        result.notes = item.notes;
    } else if (type === 'tasks') {
        result.related_type = item.relatedType;
        result.related_id = item.relatedId;
        result.title = item.title;
        result.priority = item.priority;
        result.status = item.status;
        result.due_date = item.dueDate;
        result.notes = item.notes;
    } else if (type === 'contacts') {
        result.company_id = item.companyId;
        result.name = item.name;
        result.position = item.position;
        result.phone = item.phone;
        result.email = item.email;
        result.notes = item.notes;
    } else if (type === 'followups') {
        result.related_type = item.relatedType;
        result.related_id = item.relatedId;
        result.type = item.type;
        result.date = item.date;
        result.notes = item.notes;
    }

    return result;
}
