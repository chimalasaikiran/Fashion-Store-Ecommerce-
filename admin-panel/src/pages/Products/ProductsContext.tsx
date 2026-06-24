import React, { createContext, useContext, useState, useEffect } from 'react';
import { CATEGORIES_CONFIG, PRODUCTS_CONFIG, PRODUCT_MOVEMENTS, PRODUCT_ACTIVITIES, formatCurrency } from '../../data/mockDb';

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
  addProduct: (product: Omit<Product, 'id' | 'createdDate' | 'updatedDate'>) => void;
  updateProduct: (id: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductVisibility: (id: string) => void;
  bulkUpdateVisibility: (ids: string[], status: 'Live' | 'Draft') => void;
  bulkDeleteProducts: (ids: string[]) => void;
  
  addCategory: (category: Omit<Category, 'id' | 'createdDate' | 'updatedDate'>) => void;
  updateCategory: (id: string, updatedFields: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  adjustStock: (productId: string, change: number, type: 'In' | 'Out' | 'Adjustment', reason: string) => void;
  
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const initialCategories: Category[] = CATEGORIES_CONFIG as Category[];
const initialProducts: Product[] = PRODUCTS_CONFIG as Product[];
const initialMovements: InventoryMovement[] = PRODUCT_MOVEMENTS as InventoryMovement[];
const initialActivities: ProductActivity[] = PRODUCT_ACTIVITIES as ProductActivity[];

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products_catalog');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories_catalog');
    return saved ? JSON.parse(saved) : initialCategories;
  });

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
    localStorage.setItem('products_catalog', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('categories_catalog', JSON.stringify(categories));
  }, [categories]);

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

  
  const addProduct = (productData: Omit<Product, 'id' | 'createdDate' | 'updatedDate'>) => {
    const newId = `prd-${Math.floor(8200 + Math.random() * 800)}`;
    const today = new Date().toISOString().split('T')[0];
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdDate: today,
      updatedDate: today
    };

    setProducts(prev => [newProduct, ...prev]);
    logActivity(newId, newProduct.name, `Created product "${newProduct.name}" (SKU: ${newProduct.sku})`);
    
    
    if (newProduct.stock > 0) {
      const newMov: InventoryMovement = {
        id: `mov-${Date.now()}`,
        productId: newId,
        productName: newProduct.name,
        sku: newProduct.sku,
        type: 'In',
        changeQuantity: newProduct.stock,
        resultingQuantity: newProduct.stock,
        timestamp: new Date().toISOString(),
        reason: 'Initial inventory load',
        user: 'Admin User'
      };
      setMovements(prev => [newMov, ...prev]);
    }
    
    addToast(`Product "${newProduct.name}" added successfully.`);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    const p = products.find(prod => prod.id === id);
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

    setProducts(prev =>
      prev.map(prod => {
        if (prod.id === id) {
          return {
            ...prod,
            ...updatedFields,
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return prod;
      })
    );
    addToast('Product updated successfully.');
  };

  const deleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setProducts(prev => prev.filter(p => p.id !== id));
      logActivity(id, product.name, `Deleted product permanently`);
      addToast(`Product "${product.name}" deleted.`, 'info');
    }
  };

  const toggleProductVisibility = (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newStatus: Product['status'] = product.status === 'Live' ? 'Draft' : 'Live';

    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            status: newStatus,
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      })
    );

    logActivity(id, product.name, `Toggled visibility to ${newStatus}`);
    addToast(`"${product.name}" is now ${newStatus === 'Live' ? 'visible' : 'hidden'}.`);
  };

  const bulkUpdateVisibility = (ids: string[], status: 'Live' | 'Draft') => {
    const changedProducts = products.filter(p => ids.includes(p.id) && p.status !== status);

    setProducts(prev =>
      prev.map(p => {
        if (ids.includes(p.id)) {
          return {
            ...p,
            status,
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      })
    );

    changedProducts.forEach(p => {
      logActivity(p.id, p.name, `Bulk status set to ${status}`);
    });

    addToast(`Bulk updated ${ids.length} products to ${status === 'Live' ? 'visible' : 'hidden'}.`);
  };

  const bulkDeleteProducts = (ids: string[]) => {
    const selected = products.filter(p => ids.includes(p.id));
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
    selected.forEach(p => {
      logActivity(p.id, p.name, 'Deleted product via bulk operation');
    });
    addToast(`Successfully deleted ${ids.length} products.`, 'info');
  };

  
  const addCategory = (categoryData: Omit<Category, 'id' | 'createdDate' | 'updatedDate'>) => {
    const newId = `cat-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];
    const newCategory: Category = {
      ...categoryData,
      id: newId,
      createdDate: today,
      updatedDate: today
    };
    setCategories(prev => [...prev, newCategory]);
    addToast(`Category "${newCategory.name}" created.`);
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            ...updatedFields,
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return c;
      })
    );
    addToast('Category updated successfully.');
  };

  const deleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setCategories(prev =>
        prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              status: 'Archived',
              updatedDate: new Date().toISOString().split('T')[0]
            };
          }
          return c;
        })
      );
      addToast(`Category "${category.name}" soft deleted.`, 'info');
    }
  };

  
  const adjustStock = (productId: string, change: number, type: 'In' | 'Out' | 'Adjustment', reason: string) => {
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

    setProducts(prev =>
      prev.map(prod => {
        if (prod.id === productId) {
          return {
            ...prod,
            stock: newStock,
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return prod;
      })
    );

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
    addToast(`Stock level adjusted for "${p.name}".`);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        movements,
        activities,
        toasts,
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
        removeToast
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
