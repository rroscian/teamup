'use client';

import React from 'react';
import { useEvents } from '@/frontend/contexts/EventsContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export function EventsPagination() {
  const { 
    filteredEvents, 
    currentPage, 
    viewOptions, 
    setCurrentPage, 
    setViewOptions 
  } = useEvents();

  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / viewOptions.itemsPerPage);
  const startIndex = (currentPage - 1) * viewOptions.itemsPerPage + 1;
  const endIndex = Math.min(currentPage * viewOptions.itemsPerPage, totalItems);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const changeItemsPerPage = (newItemsPerPage: number) => {
    const currentFirstItem = (currentPage - 1) * viewOptions.itemsPerPage + 1;
    const newPage = Math.ceil(currentFirstItem / newItemsPerPage);
    
    setViewOptions({
      ...viewOptions,
      itemsPerPage: newItemsPerPage
    });
    
    setCurrentPage(newPage);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si peu nombreuses
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour les grandes quantités de pages
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(currentPage - halfVisible, 1);
      let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
      
      // Ajuster si on est près de la fin
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }
      
      // Ajouter les pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Ajouter "..." et première/dernière page si nécessaire
      if (startPage > 1) {
        if (startPage > 2) {
          pages.unshift('...');
        }
        pages.unshift(1);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Informations sur les éléments */}
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700">
            Affichage de <span className="font-medium">{startIndex}</span> à{' '}
            <span className="font-medium">{endIndex}</span> sur{' '}
            <span className="font-medium">{totalItems}</span> résultat{totalItems > 1 ? 's' : ''}
          </p>
          
          {/* Sélecteur d'éléments par page */}
          <div className="flex items-center gap-2">
            <label htmlFor="items-per-page" className="text-sm text-gray-600">
              Éléments par page:
            </label>
            <select
              id="items-per-page"
              value={viewOptions.itemsPerPage}
              onChange={(e) => changeItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={96}>96</option>
            </select>
          </div>
        </div>

        {/* Navigation des pages */}
        <div className="flex items-center gap-2">
          {/* Bouton page précédente */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`inline-flex items-center px-2 py-2 border rounded-md text-sm font-medium ${
              currentPage <= 1
                ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <ChevronLeftIcon className="h-5 w-5" />
            <span className="sr-only">Page précédente</span>
          </button>

          {/* Numéros de page */}
          <div className="flex items-center gap-1">
            {generatePageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => goToPage(page as number)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border border-blue-600'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Bouton page suivante */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`inline-flex items-center px-2 py-2 border rounded-md text-sm font-medium ${
              currentPage >= totalPages
                ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <ChevronRightIcon className="h-5 w-5" />
            <span className="sr-only">Page suivante</span>
          </button>
        </div>
      </div>

      {/* Navigation rapide sur mobile */}
      <div className="sm:hidden mt-4">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage <= 1}
            className={`px-3 py-1 text-xs rounded ${
              currentPage <= 1
                ? 'text-gray-400'
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            Premier
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage >= totalPages}
            className={`px-3 py-1 text-xs rounded ${
              currentPage >= totalPages
                ? 'text-gray-400'
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            Dernier
          </button>
        </div>
      </div>
    </div>
  );
}
