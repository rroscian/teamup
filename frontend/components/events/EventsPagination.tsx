'use client';

import React from 'react';
import { useEvents } from '@/frontend/contexts/EventsContext';
import { useIsMobile } from '@/frontend/hooks/useIsMobile';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export function EventsPagination() {
  const { 
    filteredEvents, 
    currentPage, 
    viewOptions, 
    setCurrentPage, 
    setViewOptions 
  } = useEvents();
  const isMobile = useIsMobile();

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

  // Options de pagination selon la plateforme
  const getItemsPerPageOptions = () => {
    if (isMobile) {
      return [3, 6, 9];
    }
    return [25, 50, 75, 100];
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    
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
    <div className={`bg-white border-t border-gray-200 ${
      isMobile ? 'px-4 py-4' : 'px-4 py-3 sm:px-6'
    }`}>
      <div className={`flex items-center justify-between ${
        isMobile ? 'flex-col gap-4' : 'flex-col sm:flex-row gap-4'
      }`}>
        {/* Informations sur les éléments */}
        <div className={`flex items-center ${
          isMobile ? 'flex-col gap-3 text-center' : 'gap-4'
        }`}>
          <p className={`text-gray-700 ${
            isMobile ? 'text-sm' : 'text-sm'
          }`}>
            Affichage de <span className="font-medium">{startIndex}</span> à{' '}
            <span className="font-medium">{endIndex}</span> sur{' '}
            <span className="font-medium">{totalItems}</span> résultat{totalItems > 1 ? 's' : ''}
          </p>
        </div>

        {/* Navigation des pages */}
        <div className={`flex items-center ${
          isMobile ? 'justify-center gap-1' : 'gap-2'
        }`}>
          {/* Bouton page précédente */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`inline-flex items-center border rounded-xl font-medium transition-all ${
              currentPage <= 1
                ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700'
            } ${
              isMobile ? 'px-3 py-2 text-sm' : 'px-2 py-2 text-sm'
            }`}
          >
            <ChevronLeftIcon className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
            {isMobile && <span className="ml-1">Préc.</span>}
            <span className="sr-only">Page précédente</span>
          </button>

          {/* Numéros de page */}
          <div className={`flex items-center ${
            isMobile ? 'gap-1' : 'gap-1'
          }`}>
            {generatePageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className={`text-gray-500 ${
                    isMobile ? 'px-2 py-1' : 'px-3 py-2'
                  }`}>...</span>
                ) : (
                  <button
                    onClick={() => goToPage(page as number)}
                    className={`font-medium rounded-xl transition-all ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border border-blue-600 shadow-lg'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    } ${
                      isMobile ? 'px-3 py-2 text-sm' : 'px-3 py-2 text-sm'
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
            className={`inline-flex items-center border rounded-xl font-medium transition-all ${
              currentPage >= totalPages
                ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700'
            } ${
              isMobile ? 'px-3 py-2 text-sm' : 'px-2 py-2 text-sm'
            }`}
          >
            {isMobile && <span className="mr-1">Suiv.</span>}
            <ChevronRightIcon className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
            <span className="sr-only">Page suivante</span>
          </button>
        </div>
      </div>
      
      {/* Navigation rapide sur mobile */}
      {isMobile && totalPages > 5 && (
        <div className="mt-3">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage <= 1}
              className={`px-3 py-2 text-sm rounded-xl transition-colors ${
                currentPage <= 1
                  ? 'text-gray-400 bg-gray-100'
                  : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              }`}
            >
              Premier
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage >= totalPages}
              className={`px-3 py-2 text-sm rounded-xl transition-colors ${
                currentPage >= totalPages
                  ? 'text-gray-400 bg-gray-100'
                  : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              }`}
            >
              Dernier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
