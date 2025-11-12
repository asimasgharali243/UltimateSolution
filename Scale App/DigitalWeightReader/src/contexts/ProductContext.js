import React, { createContext, useContext, useState, useCallback } from 'react';

const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductCode, setSelectedProductCode] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const clearProduct = useCallback(() => {
    setSelectedProduct(null);
    setSelectedProductCode(null);
    setSelectedProductId(null);
  }, []);

  const selectProduct = useCallback((product) => {
    setSelectedProduct(product);
    setSelectedProductCode(product.code);
    setSelectedProductId(product.id);
  }, []);

  const value = {
    selectedProduct,
    selectedProductCode,
    selectedProductId,
    selectProduct,
    clearProduct,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};