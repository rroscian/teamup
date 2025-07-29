'use client';

import React, { useState, useMemo } from 'react';
import { useEvents } from '@/frontend/contexts/EventsContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export function EventsCalendarView() {
  const { filteredEvents } = useEvents();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calcul des dates du mois
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // Grouper les événements par date
    const eventsByDate = new Map<string, typeof filteredEvents>();
    filteredEvents.forEach(event => {
      const eventDate = event.date;
      if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
        const dateKey = eventDate.getDate().toString();
        if (!eventsByDate.has(dateKey)) {
          eventsByDate.set(dateKey, []);
        }
        eventsByDate.get(dateKey)!.push(event);
      }
    });

    return {
      year,
      month,
      firstDayOfWeek,
      daysInMonth,
      eventsByDate
    };
  }, [currentDate, filteredEvents]);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === monthData.year && today.getMonth() === monthData.month;
    const todayDate = today.getDate();

    // Jours vides du début du mois
    for (let i = 0; i < monthData.firstDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-24 bg-gray-50 border border-gray-200"></div>
      );
    }

    // Jours du mois
    for (let day = 1; day <= monthData.daysInMonth; day++) {
      const dayEvents = monthData.eventsByDate.get(day.toString()) || [];
      const isToday = isCurrentMonth && day === todayDate;

      days.push(
        <div
          key={day}
          className={`min-h-24 border border-gray-200 p-2 ${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {day}
          </div>
          
          {dayEvents.length > 0 && (
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event, index) => (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded truncate cursor-pointer ${
                    event.category === 'sports' ? 'bg-green-100 text-green-800' :
                    event.category === 'social' ? 'bg-blue-100 text-blue-800' :
                    event.category === 'corporate' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                  title={`${event.title} - ${event.location}`}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{dayEvents.length - 3} événement{dayEvents.length - 3 > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (filteredEvents.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-lg font-medium mb-2">Aucun événement dans le calendrier</h3>
        <p>Essayez d'ajuster vos filtres ou créez un nouvel événement.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[monthData.month]} {monthData.year}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Aujourd'hui
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 bg-gray-50">
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Légende */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span className="text-gray-600">Sports</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span className="text-gray-600">Social</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-100 rounded"></div>
          <span className="text-gray-600">Corporate</span>
        </div>
      </div>

      {/* Statistiques du mois */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {Array.from(monthData.eventsByDate.values()).flat().length}
          </div>
          <div className="text-sm text-gray-600">Événements ce mois</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {monthData.eventsByDate.size}
          </div>
          <div className="text-sm text-gray-600">Jours avec événements</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round((monthData.eventsByDate.size / monthData.daysInMonth) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Taux d'occupation</div>
        </div>
      </div>
    </div>
  );
}
