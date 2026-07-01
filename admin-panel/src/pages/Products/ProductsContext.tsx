import React, { createContext, useContext, useState, useEffect } from 'react';
import { CATEGORIES_CONFIG, PRODUCT_MOVEMENTS, PRODUCT_ACTIVITIES, formatCurrency } from '../../data/mockDb';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com/api' : 'http://localhost:5000/api');

const getHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reserved: number;
  reorderLevel: number;
  status: 'Live' | 'Draft';
  image: string;
  description: string;
  variants: ProductVariant[];
  createdDate: string;
  updatedDate: string;
  seoTitle: string;
  seoDescription: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Disabled' | 'Archived';
  createdDate: string;
  updatedDate: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'In' | 'Out' | 'Adjustment';
  changeQuantity: number;
  resultingQuantity: number;
  timestamp: string;
  reason: string;
  user: string;
}

export interface ProductActivity {
  id: string;
  productId: string;
  productName: string;
  action: string;
  timestamp: string;
  user: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface ProductsContextType {
  products: Product[];
  categories: Category[];
  movements: InventoryMovement[];
  activities: ProductActivity[];
  toasts: Toast[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdDate' | 'updatedDate'>) => Promise<boolean>;
  updateProduct: (id: string, updatedFields: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  toggleProductVisibility: (id: string) => Promise<void>;
  bulkUpdateVisibility: (ids: string[], status: 'Live' | 'Draft') => Promise<void>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
  
  addCategory: (category: Omit<Category, 'id' | 'createdDate' | 'updatedDate'>) => void;
  updateCategory: (id: string, updatedFields: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  adjustStock: (productId: string, change: number, type: 'In' | 'Out' | 'Adjustment', reason: string) => Promise<void>;
  
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  fetchProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const initialCategories: Category[] = CATEGORIES_CONFIG as Category[];
const initialMovements: InventoryMovement[] = PRODUCT_MOVEMENTS as InventoryMovement[];
const initialActivities: ProductActivity[] = PRODUCT_ACTIVITIES as ProductActivity[];

export const ProductsProvider: React.FC<{ children: React.ReactNode; isLoggedIn?: boolean }> = ({ children, isLoggedIn }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [categories, setCategories] = useState<Category[]>([]);

  const [movements, setMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem('products_movements');
    return saved ? JSON.parse(saved) : initialMovements;
  });

  const [activities, setActivities] = useState<ProductActivity[]>(() => {
    const saved = localStorage.getItem('products_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);



  useEffect(() => {
    localStorage.setItem('products_movements', JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem('products_activities', JSON.stringify(activities));
  }, [activities]);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logActivity = (productId: string, productName: string, action: string, user: string = 'Admin User') => {
    const newAct: ProductActivity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      productName,
      action,
      timestamp: new Date().toISOString(),
      user
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      addToast('Failed to fetch products from server.', 'error');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      addToast('Failed to fetch categories from server.', 'error');
    }
  };

  useEffect(() => {
    const loggedIn = isLoggedIn || localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) {
      setLoading(true);
      Promise.all([fetchProducts(), fetchCategories()]).finally(() => setLoading(false));
    }
  }, [isLoggedIn]);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdDate' | 'updatedDate'>): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        logActivity(data.product.id, data.product.name, `Created product "${data.product.name}" (SKU: ${data.product.sku})`);
        
        // Log movement
        if (data.product.stock > 0) {
          const newMov: InventoryMovement = {
            id: `mov-${Date.now()}`,
            productId: data.product.id,
            productName: data.product.name,
            sku: data.product.sku,
            type: 'In',
            changeQuantity: data.product.stock,
            resultingQuantity: data.product.stock,
            timestamp: new Date().toISOString(),
            reason: 'Initial inventory load',
            user: 'Admin User'
          };
          setMovements(prev => [newMov, ...prev]);
        }
        
        addToast(`Product "${data.product.name}" added successfully.`);
        return true;
      } else {
        addToast(data.message || 'Failed to add product.', 'error');
        return false;
      }
    } catch (err) {
      console.error('Error creating product:', err);
      addToast('Server error creating product.', 'error');
      return false;
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>): Promise<boolean> => {
    try {
      const p = products.find(prod => prod.id === id);
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        if (p) {
          if (updatedFields.price !== undefined && updatedFields.price !== p.price) {
            logActivity(id, p.name, `Price updated from ${formatCurrency(p.price)} to ${formatCurrency(updatedFields.price)}`);
          }
          if (updatedFields.status !== undefined && updatedFields.status !== p.status) {
            logActivity(id, p.name, `Visibility status changed to ${updatedFields.status}`);
          }
          if (updatedFields.name !== undefined && updatedFields.name !== p.name) {
            logActivity(id, p.name, `Renamed product from "${p.name}" to "${updatedFields.name}"`);
          }
        }
        addToast('Product updated successfully.');
        return true;
      } else {
        addToast(data.message || 'Failed to update product.', 'error');
        return false;
      }
    } catch (err) {
      console.error('Error updating product:', err);
      addToast('Server error updating product.', 'error');
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const product = products.find(p => p.id === id);
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        if (product) {
          logActivity(id, product.name, `Deleted product permanently`);
          addToast(`Product "${product.name}" deleted.`, 'info');
        }
        return true;
      } else {
        addToast(data.message || 'Failed to delete product.', 'error');
        return false;
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      addToast('Server error deleting product.', 'error');
      return false;
    }
  };

  const toggleProductVisibility = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newStatus: Product['status'] = product.status === 'Live' ? 'Draft' : 'Live';
    await updateProduct(id, { status: newStatus });
  };

  const bulkUpdateVisibility = async (ids: string[], status: 'Live' | 'Draft') => {
    try {
      setLoading(true);
      await Promise.all(ids.map(id => 
        fetch(`${API_URL}/products/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ status })
        })
      ));
      await fetchProducts();
      ids.forEach(id => {
        const p = products.find(prod => prod.id === id);
        if (p) logActivity(id, p.name, `Bulk status set to ${status}`);
      });
      addToast(`Bulk updated ${ids.length} products to ${status === 'Live' ? 'visible' : 'hidden'}.`);
    } catch (err) {
      console.error('Error in bulk update:', err);
      addToast('Failed to update some products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const bulkDeleteProducts = async (ids: string[]) => {
    try {
      setLoading(true);
      await Promise.all(ids.map(id => 
        fetch(`${API_URL}/products/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        })
      ));
      await fetchProducts();
      addToast(`Successfully deleted ${ids.length} products.`, 'info');
    } catch (err) {
      console.error('Error in bulk delete:', err);
      addToast('Failed to delete some products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdDate' | 'updatedDate'>) => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(categoryData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        addToast(`Category "${data.category.name}" created.`);
      } else {
        addToast(data.message || 'Failed to create category.', 'error');
      }
    } catch (err) {
      console.error('Error creating category:', err);
      addToast('Server error creating category.', 'error');
    }
  };

  const updateCategory = async (id: string, updatedFields: Partial<Category>) => {
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        addToast('Category updated successfully.');
      } else {
        addToast(data.message || 'Failed to update category.', 'error');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      addToast('Server error updating category.', 'error');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        addToast('Category deleted successfully.', 'info');
      } else {
        addToast(data.message || 'Failed to delete category.', 'error');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      addToast('Server error deleting category.', 'error');
    }
  };

  const adjustStock = async (productId: string, change: number, type: 'In' | 'Out' | 'Adjustment', reason: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    let newStock = p.stock;
    if (type === 'In') {
      newStock += change;
    } else if (type === 'Out') {
      newStock = Math.max(0, newStock - change);
    } else if (type === 'Adjustment') {
      newStock = change;
    }

    const success = await updateProduct(productId, { stock: newStock });
    if (success) {
      logActivity(productId, p.name, `Stock adjusted to ${newStock} (${type === 'Adjustment' ? 'Set' : type === 'In' ? '+' : '-'}${Math.abs(change)})`);

      const newMov: InventoryMovement = {
        id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId,
        productName: p.name,
        sku: p.sku,
        type,
        changeQuantity: type === 'Out' ? -Math.abs(change) : change,
        resultingQuantity: newStock,
        timestamp: new Date().toISOString(),
        reason,
        user: 'Admin User'
      };
      setMovements(prev => [newMov, ...prev]);
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        movements,
        activities,
        toasts,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductVisibility,
        bulkUpdateVisibility,
        bulkDeleteProducts,
        addCategory,
        updateCategory,
        deleteCategory,
        adjustStock,
        addToast,
        removeToast,
        fetchProducts
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
