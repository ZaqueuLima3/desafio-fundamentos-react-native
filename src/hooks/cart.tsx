import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem('@GoMarket:Products');

      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const existProductIn = products.find(pr => pr.id === product.id);

      if (existProductIn?.id) {
        setProducts(allProducts =>
          allProducts.map(
            (pr: Product): Product => {
              if (pr.id !== product.id) return pr;

              const quantity = pr.quantity + 1;

              return {
                ...pr,
                quantity,
              };
            },
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      AsyncStorage.setItem('@GoMarket:Products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const allProducts = products.map(product => {
        if (product.id !== id) return product;

        const quantity = product.quantity + 1;

        return {
          ...product,
          quantity,
        };
      });

      setProducts(allProducts);
      AsyncStorage.setItem('@GoMarket:Products', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      if (products[productIndex]?.quantity > 1) {
        setProducts(allProducts =>
          allProducts.map(product => {
            if (product.id !== id) return product;

            const quantity = product.quantity - 1;

            return {
              ...product,
              quantity,
            };
          }),
        );
      } else {
        setProducts(allProducts =>
          allProducts.filter(product => product.id !== id),
        );
      }

      AsyncStorage.setItem('@GoMarket:Products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
