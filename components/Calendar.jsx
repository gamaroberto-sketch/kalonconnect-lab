"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Video,
  Phone,
  MapPin
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const Calendar = ({ 
  appointments = [], 
  onDateSelect, 
  onAppointmentClick,
  onAddAppointment,
  userType = 'professional',
  selectedDate = null 
}) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(selectedDate);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        appointments: getAppointmentsForDate(prevDate)
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = isSameDay(date, new Date());
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        appointments: getAppointmentsForDate(date)
      });
    }

    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        appointments: getAppointmentsForDate(nextDate)
      });
    }

    return days;
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.date), date)
    );
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateClick = (day) => {
    setSelectedDay(day.date);
    if (onDateSelect) {
      onDateSelect(day.date);
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getAppointmentIcon = (type) => {
    switch (type) {
      case 'online': return <Video className="w-3 h-3" />;
      case 'phone': return <Phone className="w-3 h-3" />;
      case 'presencial': return <MapPin className="w-3 h-3" />;
      default: return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const formatTime = (time) => {
    return time.substring(0, 5); // HH:MM
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="kalon-card p-6">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <motion.button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <motion.button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
        </div>

        {userType === 'professional' && (
          <motion.button
            onClick={onAddAppointment}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200"
            style={{
              backgroundColor: themeColors.primary,
              color: 'white',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = themeColors.primaryDark;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = themeColors.primary;
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            <span>Nova Sessão</span>
          </motion.button>
        )}
      </div>

      {/* Dias da Semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Grade do Calendário */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <motion.div
            key={index}
            onClick={() => handleDateClick(day)}
            className={`p-3 min-h-[100px] border rounded-lg cursor-pointer transition-all duration-200 ${
              day.isCurrentMonth 
                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700' 
                : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-600'
            }`}
            style={{
              ...(day.isToday && {
                border: `3px solid ${themeColors.primary}`,
                backgroundColor: themeColors.primary + '30'
              }),
              ...(selectedDay && isSameDay(day.date, selectedDay) && {
                border: `2px solid ${themeColors.primaryLight}`,
                backgroundColor: themeColors.primaryLight + '20'
              })
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                day.isCurrentMonth 
                  ? 'text-gray-800 dark:text-white' 
                  : 'text-gray-400 dark:text-gray-600'
              }`}>
                {day.date.getDate()}
              </span>
              {day.appointments.length > 0 && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>

            {/* Lista de Agendamentos */}
            <div className="space-y-1">
              {day.appointments.slice(0, 2).map((appointment, idx) => (
                <motion.div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAppointmentClick) {
                      onAppointmentClick(appointment);
                    }
                  }}
                  className={`p-1 rounded text-xs flex items-center space-x-1 cursor-pointer transition-colors ${
                    getAppointmentStatusColor(appointment.status)
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getAppointmentIcon(appointment.type)}
                  <span className="truncate">{formatTime(appointment.time)}</span>
                </motion.div>
              ))}
              {day.appointments.length > 2 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  +{day.appointments.length - 2} mais
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-gray-600 dark:text-gray-400">Confirmado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span className="text-gray-600 dark:text-gray-400">Pendente</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-gray-600 dark:text-gray-400">Cancelado</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;


