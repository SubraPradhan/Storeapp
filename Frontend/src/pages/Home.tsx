import React, { useState, useMemo } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import useLangStore from '../store/langStore';
import SearchBar from '../components/SearchBar';
import CategoryPills from '../components/CategoryPills';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const Home: React.FC = () => {
  const { products, categories, loading, error, refetch } = useCatalog();
  const { t } = useLangStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === '' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="text-5xl">😞</span>
        <p className="text-text-secondary">{error}</p>
        <button onClick={refetch} className="btn-primary">
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 page-enter">
      <SearchBar value={search} onChange={setSearch} />
      <CategoryPills
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      {filteredProducts.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title={t('noProducts')}
          description=""
          showHomeButton={false}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;